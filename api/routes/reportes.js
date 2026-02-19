module.exports = (pool) => {
  const express = require('express');
  const router = express.Router();
  const auth = require('../middleware/auth');

  // Exportar contactos a CSV
  router.get('/contactos/csv', auth, async (req, res) => {
    try {
      const connection = await pool.getConnection();
      const [contactos] = await connection.execute(
        'SELECT id, nombre, email, mensaje, leido, fecha_creacion FROM contactos ORDER BY fecha_creacion DESC'
      );
      connection.release();

      // Generar CSV
      const headers = ['ID', 'Nombre', 'Email', 'Mensaje', 'Leído', 'Fecha'];
      const rows = contactos.map(c => [
        c.id,
        c.nombre,
        c.email,
        c.mensaje.replace(/,/g, ';'),
        c.leido ? 'Sí' : 'No',
        new Date(c.fecha_creacion).toLocaleDateString('es-MX')
      ]);

      const csv = [headers, ...rows].map(r => r.join(',')).join('\n');

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename=contactos.csv');
      res.send('\uFEFF' + csv); // BOM para Excel
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al exportar' });
    }
  });

  // Exportar servicios a CSV
  router.get('/servicios/csv', auth, async (req, res) => {
    try {
      const connection = await pool.getConnection();
      const [servicios] = await connection.execute(
        'SELECT id, nombre, descripcion, orden, estado, fecha_creacion FROM servicios ORDER BY orden ASC'
      );
      connection.release();

      const headers = ['ID', 'Nombre', 'Descripción', 'Orden', 'Estado', 'Fecha'];
      const rows = servicios.map(s => [
        s.id,
        s.nombre,
        s.descripcion.substring(0, 100).replace(/,/g, ';'),
        s.orden,
        s.estado ? 'Activo' : 'Inactivo',
        new Date(s.fecha_creacion).toLocaleDateString('es-MX')
      ]);

      const csv = [headers, ...rows].map(r => r.join(',')).join('\n');

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename=servicios.csv');
      res.send('\uFEFF' + csv);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al exportar' });
    }
  });

  // Exportar estadísticas mensual
  router.get('/estadisticas/csv', auth, async (req, res) => {
    try {
      const connection = await pool.getConnection();
      const [stats] = await connection.execute(`
        SELECT 
          DATE_FORMAT(fecha_creacion, '%Y-%m') as mes,
          COUNT(*) as contactos,
          SUM(CASE WHEN leido=true THEN 1 ELSE 0 END) as leidos
        FROM contactos
        WHERE fecha_creacion >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
        GROUP BY DATE_FORMAT(fecha_creacion, '%Y-%m')
        ORDER BY mes DESC
      `);
      connection.release();

      const headers = ['Mes', 'Total Contactos', 'Leídos'];
      const rows = stats.map(s => [s.mes, s.contactos, s.leidos]);
      const csv = [headers, ...rows].map(r => r.join(',')).join('\n');

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename=estadisticas.csv');
      res.send('\uFEFF' + csv);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al exportar' });
    }
  });

  return router;
};
