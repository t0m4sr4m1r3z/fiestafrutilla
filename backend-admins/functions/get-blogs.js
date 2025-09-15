const { Pool } = require('pg');

exports.handler = async (event, context) => {
  const pool = new Pool({
    connectionString: process.env.NETLIFY_DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const result = await pool.query(`
      SELECT * FROM blogs 
      WHERE estado = 'activo' OR estado IS NULL
      ORDER BY fecha_publicacion DESC
    `);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(result.rows)
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: 'Error al obtener blogs' })
    };
  } finally {
    await pool.end();
  }
};