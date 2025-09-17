const cloudinary = require('cloudinary').v2;
const jwt = require('jsonwebtoken');

// Configurar Cloudinary solo si las variables existen
if (process.env.CLOUDINARY_CLOUD_NAME && 
    process.env.CLOUDINARY_API_KEY && 
    process.env.CLOUDINARY_API_SECRET) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });
}

exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    // Verificar autenticación
    const authHeader = event.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return { statusCode: 401, headers, body: JSON.stringify({ error: 'No autorizado' }) };
    }

    try {
        const token = authHeader.split(' ')[1];
        jwt.verify(token, process.env.ADMIN_SECRET || 'fallback-secret');
    } catch (error) {
        return { statusCode: 401, headers, body: JSON.stringify({ error: 'Token inválido' }) };
    }

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Método no permitido' }) };
    }

    try {
        const { image } = JSON.parse(event.body);
        
        if (!image) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'No se proporcionó ninguna imagen' })
            };
        }

        // Verificar que Cloudinary esté configurado
        if (!process.env.CLOUDINARY_CLOUD_NAME || 
            !process.env.CLOUDINARY_API_KEY || 
            !process.env.CLOUDINARY_API_SECRET) {
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ error: 'Cloudinary no está configurado correctamente' })
            };
        }

        // Subir imagen a Cloudinary
        const result = await cloudinary.uploader.upload(image, {
            folder: 'fiesta-frutilla-blogs',
            transformation: [{ width: 800, height: 400, crop: 'limit' }]
        });

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                imageUrl: result.secure_url,
                publicId: result.public_id
            })
        };

    } catch (error) {
        console.error('Error al subir imagen:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Error al subir la imagen: ' + error.message })
        };
    }
};