const { Pool } = require('pg');
const jwt = require('jsonwebtoken');

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

  // Para subida real de imágenes, usarías un servicio como Cloudinary o S3
  // Por ahora, simulamos la subida y retornamos una URL ficticia
  
  const { imageUrl } = JSON.parse(event.body);
  
  return {
    statusCode: 200,
    headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      success: true,
      imageUrl: imageUrl || 'https://via.placeholder.com/800x400?text=Imagen+del+Blog'
    })
  };
};