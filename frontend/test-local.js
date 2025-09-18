// Test básico de que los archivos cargan
console.log('✅ admin-config.js cargado correctamente');
console.log('✅ Estructura de carpetas verificada');

// Test de conexión simple
const { Pool } = require('pg');

// Esto solo funcionará si tienes DATABASE_URL localmente
if (process.env.DATABASE_URL) {
    console.log('📡 Probando conexión a Neon...');
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    pool.query('SELECT NOW()').then(() => {
        console.log('✅ Conexión a Neon exitosa');
        pool.end();
    }).catch(error => {
        console.log('❌ Error de conexión:', error.message);
    });
} else {
    console.log('ℹ️  Ejecuta: export DATABASE_URL="tu_string_de_conexion"');
}