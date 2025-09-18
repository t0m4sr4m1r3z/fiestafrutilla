const { Pool } = require('pg');

exports.handler = async (event, context) => {
  // Configurar CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Manejar preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  const { id } = event.queryStringParameters || {};
  
  // Verificar conexión a la base de datos
  if (!process.env.DATABASE_URL) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Configuración de base de datos no encontrada' })
    };
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    if (id) {
      // Get single blog
      const result = await pool.query(
        'SELECT * FROM blogs WHERE id = $1 AND estado = $2',
        [id, 'activo']
      );

      if (result.rows.length === 0) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Blog no encontrado' })
        };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(result.rows[0])
      };
    } else {
      // Get all blogs
      const result = await pool.query(
        'SELECT * FROM blogs WHERE estado = $1 ORDER BY fecha_publicacion DESC',
        ['activo']
      );

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(result.rows)
      };
    }
  } catch (error) {
    console.error('Error obteniendo blogs:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Error interno del servidor',
        details: process.env.NODE_ENV === 'development' ? error.message : 'Contacte al administrador'
      })
    };
  } finally {
    await pool.end();
  }
};