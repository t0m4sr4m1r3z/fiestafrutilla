const { Pool } = require('pg');

exports.handler = async (event, context) => {
  // Solo permitir métodos GET
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    // Ejemplo: Obtener conteo de blogs, comentarios, etc.
    // Ajusta según tus tablas
    const blogsCount = await pool.query('SELECT COUNT(*) FROM blogs');
    // ... otras consultas

    return {
      statusCode: 200,
      body: JSON.stringify({
        blogs: parseInt(blogsCount.rows[0].count),
        // ... otros datos
      }),
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  } finally {
    await pool.end();
  }
};