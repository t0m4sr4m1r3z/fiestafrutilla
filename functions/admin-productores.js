const { Pool } = require('pg');
const jwt = require('jsonwebtoken');

exports.handler = async (event, context) => {
  // Configurar CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Verificar autenticación con JWT
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

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    // GET - Obtener productores
    if (event.httpMethod === 'GET') {
      const result = await pool.query(
        'SELECT * FROM productores ORDER BY fecha_registro DESC'
      );
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(result.rows)
      };
    }

    // POST - Crear productor
    if (event.httpMethod === 'POST') {
      const { nombre, descripcion, contacto, productos, ubicacion, imagen_url } = JSON.parse(event.body);
      
      const result = await pool.query(
        'INSERT INTO productores (nombre, descripcion, contacto, productos, ubicacion, imagen_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [nombre, descripcion, contacto, productos, ubicacion, imagen_url]
      );
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(result.rows[0])
      };
    }

    // DELETE - Eliminar productor
    if (event.httpMethod === 'DELETE') {
      const { id } = JSON.parse(event.body);
      await pool.query('DELETE FROM productores WHERE id = $1', [id]);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true })
      };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Método no permitido' }) };
  } catch (error) {
    console.error('Error en productores:', error);
    return { 
      statusCode: 500, 
      headers,
      body: JSON.stringify({ error: 'Error interno del servidor' }) 
    };
  } finally {
    await pool.end();
  }
};