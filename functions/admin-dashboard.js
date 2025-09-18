const { Pool } = require('pg');
const jwt = require('jsonwebtoken');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
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

  const token = authHeader.split(' ')[1];
  try {
    jwt.verify(token, process.env.ADMIN_SECRET || 'fallback-secret');
  } catch (error) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: 'Token inválido' }) };
  }

  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    const blogsCount = await pool.query('SELECT COUNT(*) FROM blogs');
    const activeBlogsCount = await pool.query('SELECT COUNT(*) FROM blogs WHERE estado = $1', ['activo']);
    const recentBlogs = await pool.query(
      'SELECT * FROM blogs ORDER BY fecha_publicacion DESC LIMIT 5'
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        totalBlogs: parseInt(blogsCount.rows[0].count),
        activeBlogs: parseInt(activeBlogsCount.rows[0].count),
        recentBlogs: recentBlogs.rows
      })
    };
  } catch (error) {
    console.error('Error en dashboard:', error);
    return { 
      statusCode: 500, 
      headers,
      body: JSON.stringify({ error: 'Error interno del servidor' }) 
    };
  } finally {
    await pool.end();
  }
};