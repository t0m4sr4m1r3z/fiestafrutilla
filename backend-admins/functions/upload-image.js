const cloudinary = require('cloudinary').v2;

// Configurar Cloudinary con las variables de entorno
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.handler = async (event, context) => {
  // Verificar autenticación
  const authHeader = event.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      statusCode: 401,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'No autorizado' })
    };
  }

  try {
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ADMIN_SECRET);
  } catch (error) {
    return {
      statusCode: 401,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Token inválido' })
    };
  }

  // Si el método no es POST, retornar error
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Método no permitido' })
    };
  }

  try {
    // Parsear el body de la solicitud
    const { image } = JSON.parse(event.body);
    
    // Si no hay imagen, retornar error
    if (!image) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'No se proporcionó ninguna imagen' })
      };
    }

    // Subir la imagen a Cloudinary
    const result = await cloudinary.uploader.upload(image, {
      folder: 'fiesta-frutilla-blogs', // Opcional: para organizar las imágenes en una carpeta
      transformation: [{ width: 800, height: 400, crop: 'limit' }] // Opcional: transformaciones
    });

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        imageUrl: result.secure_url,
        message: 'Imagen subida correctamente'
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        error: 'Error al subir la imagen',
        details: error.message
      })
    };
  }
};