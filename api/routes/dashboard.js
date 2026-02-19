module.exports = (pool) => {
  const express = require('express');
  const router = express.Router();
  const auth = require('../middleware/auth');

  // Dashboard estadísticas (admin only)
  router.get('/stats', auth, async (req, res) => {
    try {
      const connection = await pool.getConnection();

      // Total contactos
      const [[{ total_contactos }]] = await connection.execute(
        'SELECT COUNT(*) as total_contactos FROM contactos'
      );

      // Total servicios
      const [[{ total_servicios }]] = await connection.execute(
        'SELECT COUNT(*) as total_servicios FROM servicios WHERE estado=true'
      );

      // Contactos este mes
      const [[{ contactos_mes }]] = await connection.execute(
        'SELECT COUNT(*) as contactos_mes FROM contactos WHERE MONTH(fecha_creacion)=MONTH(NOW())'
      );

      // Tickets abiertos
      const [[{ tickets_abiertos }]] = await connection.execute(
        "SELECT COUNT(*) as tickets_abiertos FROM tickets WHERE estado='abierto'"
      );

      // Últimos contactos
      const [ultimos_contactos] = await connection.execute(
        'SELECT id, nombre, email, fecha_creacion FROM contactos ORDER BY fecha_creacion DESC LIMIT 5'
      );

      // Contactos por mes (últimos 6 meses)
      const [contactos_por_mes] = await connection.execute(`
        SELECT 
          DATE_FORMAT(fecha_creacion, '%Y-%m') as mes,
          COUNT(*) as cantidad
        FROM contactos
        WHERE fecha_creacion >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
        GROUP BY DATE_FORMAT(fecha_creacion, '%Y-%m')
        ORDER BY mes DESC
      `);

      // Servicios más consultados
      const [servicios_populares] = await connection.execute(`
        SELECT 
          s.id,
          s.nombre,
          COUNT(t.id) as tickets_count
        FROM servicios s
        LEFT JOIN tickets t ON s.id = t.servicio_id
        GROUP BY s.id
        ORDER BY tickets_count DESC
        LIMIT 5
      `);

      connection.release();

      res.json({
        total_contactos,
        total_servicios,
        contactos_mes,
        tickets_abiertos,
        ultimos_contactos,
        contactos_por_mes,
        servicios_populares
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
  });

  return router;
};
