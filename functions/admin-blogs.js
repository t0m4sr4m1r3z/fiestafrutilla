const { Pool } = require('pg');
const jwt = require('jsonwebtoken');

exports.handler = async (event, context) => {
  // Verificar autenticación
  const authHeader = event.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { statusCode: 401, body: 'No autorizado' };
  }

  const token = authHeader.split(' ')[1];
  let decoded;
  
  try {
    decoded = jwt.verify(token, process.env.ADMIN_SECRET || 'fallback-secret');
  } catch (error) {
    return { statusCode: 401, body: 'Token inválido' };
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    switch (event.httpMethod) {
      case 'GET':
        const result = await pool.query(
          'SELECT * FROM blogs ORDER BY fecha_publicacion DESC'
        );
        return {
          statusCode: 200,
          body: JSON.stringify(result.rows)
        };

      case 'POST':
        const { titulo, contenido, autor, imagen_url } = JSON.parse(event.body);
        const newPost = await pool.query(
          'INSERT INTO blogs (titulo, contenido, autor, imagen_url) VALUES ($1, $2, $3, $4) RETURNING *',
          [titulo, contenido, autor, imagen_url]
        );
        return {
          statusCode: 201,
          body: JSON.stringify(newPost.rows[0])
        };

      case 'PUT':
        const { id, titulo: updateTitulo, contenido: updateContenido, imagen_url: updateImagenUrl } = JSON.parse(event.body);
        const updatedPost = await pool.query(
          'UPDATE blogs SET titulo = $1, contenido = $2, imagen_url = $3 WHERE id = $4 RETURNING *',
          [updateTitulo, updateContenido, updateImagenUrl, id]
        );
        return {
          statusCode: 200,
          body: JSON.stringify(updatedPost.rows[0])
        };

      case 'DELETE':
        const { id: deleteId } = JSON.parse(event.body);
        await pool.query('DELETE FROM blogs WHERE id = $1', [deleteId]);
        return {
          statusCode: 200,
          body: JSON.stringify({ message: 'Blog eliminado correctamente' })
        };

      default:
        return { statusCode: 405, body: 'Method Not Allowed' };
    }
  } catch (error) {
    console.error('Error en blogs:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error interno del servidor' })
    };
  } finally {
    await pool.end();
  }
};