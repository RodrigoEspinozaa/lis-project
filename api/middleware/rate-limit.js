// Rate limiting middleware
module.exports = async (pool) => {
  return async (req, res, next) => {
    try {
      const ip = req.ip || req.connection.remoteAddress;
      const connection = await pool.getConnection();

      // Obtener logs de esta IP
      const [logs] = await connection.execute(
        'SELECT * FROM contacto_logs WHERE ip_address=? AND DATE(fecha_primer_intento)=CURDATE()',
        [ip]
      );

      if (logs.length > 0) {
        const log = logs[0];
        
        // Si está bloqueado
        if (log.bloqueado) {
          connection.release();
          return res.status(429).json({ error: 'Demasiados intentos. Intenta más tarde.' });
        }

        // Si llegó a 5 intentos
        if (log.intentos >= 5) {
          await connection.execute(
            'UPDATE contacto_logs SET bloqueado=true WHERE id=?',
            [log.id]
          );
          connection.release();
          return res.status(429).json({ error: 'Bloqueado por demasiados intentos' });
        }

        // Incrementar intento
        await connection.execute(
          'UPDATE contacto_logs SET intentos=intentos+1, fecha_ultimo_intento=NOW() WHERE id=?',
          [log.id]
        );
      } else {
        // Crear nuevo registro
        await connection.execute(
          'INSERT INTO contacto_logs (ip_address, email) VALUES (?, ?)',
          [ip, req.body?.email || null]
        );
      }

      connection.release();
      next();
    } catch (error) {
      console.error(error);
      next(); // Continuar aunque falle el middleware
    }
  };
};
