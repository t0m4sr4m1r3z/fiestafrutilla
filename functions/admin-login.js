const { Pool } = require('pg');
const jwt = require('jsonwebtoken');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  const { username, password } = JSON.parse(event.body);
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    const result = await pool.query(
      'SELECT * FROM administradores WHERE username = $1 AND password = $2',
      [username, password]
    );

    if (result.rows.length > 0) {
      const user = result.rows[0];
      
      const token = jwt.sign(
        { id: user.id, username: user.username },
        process.env.ADMIN_SECRET || 'fallback-secret',
        { expiresIn: '24h' }
      );

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: true, 
          user: {
            id: user.id,
            username: user.username,
            email: user.email
          },
          token: token
        })
      };
    } else {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ 
          success: false, 
          message: 'Credenciales inválidas' 
        })
      };
    }
  } catch (error) {
    console.error('Error en login:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Error interno del servidor' })
    };
  } finally {
    await pool.end();
  }
};