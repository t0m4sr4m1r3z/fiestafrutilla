const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

const port = process.env.PORT || 3000;

// Middlewares
server.use(middlewares);
server.use(jsonServer.bodyParser);

// Configurar CORS para permitir solicitudes desde Netlify y localhost
server.use((req, res, next) => {
  const allowedOrigins = [
    'https://fiestadelafrutilla.netlify.app/', // Reemplaza con tu URL de Netlify
    'http://localhost:8000',
    'http://localhost:3000',
    'http://127.0.0.1:3000'
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Credentials', true);
  
  // Para solicitudes preflight OPTIONS
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// Ruta personalizada para recibir pedidos
server.post('/pedidos', (req, res, next) => {
  // Agregar fecha y estado automáticamente
  req.body.fecha = new Date().toISOString();
  req.body.estado = 'pendiente';
  next();
});

// Ruta de salud para verificar que el servidor funciona
server.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Servidor de la Fiesta de la Frutilla funcionando',
    timestamp: new Date().toISOString()
  });
});

// Ruta principal
server.get('/', (req, res) => {
  res.json({
    message: 'Bienvenido a la API de la Fiesta de la Frutilla',
    endpoints: {
      pedidos: '/pedidos',
      health: '/health'
    },
    documentation: 'Usa /pedidos para gestionar pedidos de frutillas'
  });
});

// Usar el router de json-server
server.use(router);

// Manejo de errores
server.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo salió mal en el servidor' });
});

// Iniciar servidor
server.listen(port, () => {
  console.log(`✅ JSON Server is running on port ${port}`);
  console.log(`🌐 Health check disponible en: http://localhost:${port}/health`);
  console.log(`📦 API de pedidos disponible en: http://localhost:${port}/pedidos`);
});
// server.js
const express = require('express');
const { sendEmailNotification } = require('./services/emailService'); // ← Importación

const app = express();
app.use(express.json());

// Usar la función en tus endpoints
app.post('/webhook', async (req, res) => {
  try {
    const { nombre, producto } = req.body;
    
    await sendEmailNotification(
      'Nuevo Pedido',
      `Cliente: ${nombre}\nProducto: ${producto}`,
      req.body
    );
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint de prueba
app.get('/test-email', async (req, res) => {
  await sendEmailNotification('Test', 'Funciona correctamente');
  res.send('Email enviado!');
});