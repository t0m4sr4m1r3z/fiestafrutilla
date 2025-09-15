const { Pool } = require('pg');
const jwt = require('jsonwebtoken');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { username, password } = JSON.parse(event.body);
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    const result = await pool.query(
      'SELECT * FROM administradores WHERE username = $1 AND password = $2',
      [username, password]
    );

    if (result.rows.length > 0) {
      const user = result.rows[0];
      
      // Generar JWT token
      const token = jwt.sign(
        { id: user.id, username: user.username },
        process.env.ADMIN_SECRET || 'fallback-secret',
        { expiresIn: '24h' }
      );

      return {
        statusCode: 200,
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
      body: JSON.stringify({ error: 'Error interno del servidor' })
    };
  } finally {
    await pool.end();
  }
};