const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

exports.handler = async (event, context) => {
  // Verificar autenticación
  const token = event.headers.authorization?.replace('Bearer ', '');
  if (!token || token !== process.env.ADMIN_TOKEN) {
    return { statusCode: 401, body: JSON.stringify({ error: 'No autorizado' }) };
  }

  try {
    // GET - Obtener historias
    if (event.httpMethod === 'GET') {
      const result = await pool.query(
        'SELECT * FROM historias ORDER BY fecha_publicacion DESC'
      );
      return {
        statusCode: 200,
        body: JSON.stringify(result.rows)
      };
    }

    // POST - Crear historia
    if (event.httpMethod === 'POST') {
      const { titulo, contenido, autor, imagen_url } = JSON.parse(event.body);
      
      const result = await pool.query(
        'INSERT INTO historias (titulo, contenido, autor, imagen_url) VALUES ($1, $2, $3, $4) RETURNING *',
        [titulo, contenido, autor, imagen_url]
      );
      
      return {
        statusCode: 200,
        body: JSON.stringify(result.rows[0])
      };
    }

    // DELETE - Eliminar historia
    if (event.httpMethod === 'DELETE') {
      const { id } = JSON.parse(event.body);
      await pool.query('DELETE FROM historias WHERE id = $1', [id]);
      
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true })
      };
    }

    return { statusCode: 405, body: JSON.stringify({ error: 'Método no permitido' }) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};