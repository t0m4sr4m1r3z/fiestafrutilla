// test-email.js
require('dotenv').config({ path: 'sendgrid.env' });  // ← Especifica la ruta

console.log('🔍 Variables de entorno:');
console.log('SENDGRID_API_KEY:', process.env.SENDGRID_API_KEY ? '✅ Definida' : '❌ Undefined');
console.log('EMAIL_FROM:', process.env.EMAIL_FROM || '❌ Undefined');
console.log('EMAIL_TO:', process.env.EMAIL_TO || '❌ Undefined');

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// ... resto del código igual

const msg = {
  to: process.env.EMAIL_TO,      // Desde variables de entorno
  from: process.env.EMAIL_FROM,  // Desde variables de entorno  
  subject: 'Prueba de SendGrid',
  text: 'Esta es una prueba del sistema de notificaciones',
  html: '<strong>✅ Prueba exitosa de SendGrid</strong>',
};

sgMail
  .send(msg)
  .then(() => {
    console.log('✅ Email enviado correctamente');
  })
  .catch((error) => {
    console.error('❌ Error:', error.response?.body || error.message);
  });