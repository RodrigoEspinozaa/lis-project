// Email service mock (para desarrollo)
// En producción, implementar con nodemailer

module.exports = {
  enviarConfirmacion: async (email, nombre) => {
    console.log(`📧 Email de confirmación enviado a ${email}`);
    // TODO: Implementar con nodemailer para producción
    return { success: true };
  },

  enviarNotificacion: async (asunto, contenido, destinatarios) => {
    console.log(`📧 Notificación enviada: ${asunto}`);
    // TODO: Enviar a admin
    return { success: true };
  },

  registrarEmail: async (pool, email, asunto, tipo = 'contacto') => {
    try {
      const connection = await pool.getConnection();
      await connection.execute(
        'INSERT INTO email_logs (destinatario, asunto, tipo, estado) VALUES (?, ?, ?, ?)',
        [email, asunto, tipo, 'pendiente']
      );
      connection.release();
    } catch (error) {
      console.error('Error registrando email:', error);
    }
  }
};
