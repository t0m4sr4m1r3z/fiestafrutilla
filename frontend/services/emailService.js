// services/emailService.js
const sgMail = require('@sendgrid/mail');

// Configurar SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmailNotification = async (subject, message, data = {}) => {
  try {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>body { font-family: Arial, sans-serif; }</style>
      </head>
      <body>
        <h2>🚀 ${subject}</h2>
        <p>${message}</p>
        ${Object.keys(data).length > 0 ? `
        <h3>📊 Detalles:</h3>
        <pre>${JSON.stringify(data, null, 2)}</pre>
        ` : ''}
        <hr>
        <p><small>🕐 ${new Date().toLocaleString('es-ES')}</small></p>
      </body>
      </html>
    `;

    const msg = {
      to: process.env.EMAIL_TO,
      from: process.env.EMAIL_FROM,
      subject: `🚀 ${subject}`,
      html: htmlContent,
      text: `${subject}\n\n${message}\n\n${JSON.stringify(data, null, 2)}`
    };

    console.log('📧 Enviando email...');
    const result = await sgMail.send(msg);
    console.log('✅ Email enviado');
    return result;
  } catch (error) {
    console.error('❌ Error:', error.response?.body || error.message);
    throw error;
  }
};

module.exports = { sendEmailNotification };