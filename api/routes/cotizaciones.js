module.exports = function(pool) {
  const express = require('express');
  const router = express.Router();

  // POST create quote request - public endpoint
  router.post('/', async (req, res) => {
    try {
      const { nombre, empresa, email, telefono, servicio_id, mensaje, presupuesto } = req.body;
      
      if (!nombre || !email) {
        return res.status(400).json({ error: 'Nombre y email son requeridos' });
      }
      
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ error: 'Email válido requerido' });
      }
      
      await pool.execute(
        `INSERT INTO cotizaciones (nombre, empresa, email, telefono, servicio_id, mensaje, presupuesto) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [nombre, empresa || null, email, telefono || null, servicio_id || null, mensaje || null, presupuesto || null]
      );
      
      res.status(201).json({ success: true, message: 'Solicitud de cotización enviada correctamente. Te contactaremos pronto.' });
    } catch (error) {
      console.error('Error creating quote:', error);
      res.status(500).json({ error: 'Error al enviar solicitud de cotización' });
    }
  });

  // GET all quotes - admin only
  router.get('/', async (req, res) => {
    try {
      const { estado } = req.query;
      let sql = `SELECT c.*, s.nombre as servicio_nombre 
                 FROM cotizaciones c 
                 LEFT JOIN servicios s ON c.servicio_id = s.id`;
      let params = [];
      
      if (estado) {
        sql += ' WHERE c.estado = ?';
        params.push(estado);
      }
      
      sql += ' ORDER BY c.fecha_creacion DESC';
      
      const [rows] = await pool.execute(sql, params);
      res.json(rows);
    } catch (error) {
      console.error('Error fetching quotes:', error);
      res.status(500).json({ error: 'Error al obtener cotizaciones' });
    }
  });

  // GET single quote - admin only
  router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const [rows] = await pool.execute(
        `SELECT c.*, s.nombre as servicio_nombre 
         FROM cotizaciones c 
         LEFT JOIN servicios s ON c.servicio_id = s.id 
         WHERE c.id = ?`, 
        [id]
      );
      
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Cotización no encontrada' });
      }
      
      res.json(rows[0]);
    } catch (error) {
      console.error('Error fetching quote:', error);
      res.status(500).json({ error: 'Error al obtener cotización' });
    }
  });

  // PUT update quote status - admin only
  router.put('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { estado, notas_admin, fecha_contacto, fecha_cierre } = req.body;
      
      const [existing] = await pool.execute('SELECT id FROM cotizaciones WHERE id = ?', [id]);
      if (existing.length === 0) {
        return res.status(404).json({ error: 'Cotización no encontrada' });
      }
      
      let sql = 'UPDATE cotizaciones SET ';
      const updates = [];
      const params = [];
      
      if (estado !== undefined) {
        updates.push('estado = ?');
        params.push(estado);
        if (estado === 'cerrada' || estado === 'aceptada' || estado === 'rechazada') {
          updates.push('fecha_cierre = NOW()');
        }
      }
      if (notas_admin !== undefined) {
        updates.push('notas_admin = ?');
        params.push(notas_admin);
      }
      if (fecha_contacto !== undefined) {
        updates.push('fecha_contacto = ?');
        params.push(fecha_contacto);
      }
      
      if (updates.length === 0) {
        return res.status(400).json({ error: 'No hay campos para actualizar' });
      }
      
      sql += updates.join(', ');
      sql += ' WHERE id = ?';
      params.push(id);
      
      await pool.execute(sql, params);
      
      res.json({ success: true, message: 'Cotización actualizada correctamente' });
    } catch (error) {
      console.error('Error updating quote:', error);
      res.status(500).json({ error: 'Error al actualizar cotización' });
    }
  });

  // DELETE quote - admin only
  router.delete('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      
      const [existing] = await pool.execute('SELECT id FROM cotizaciones WHERE id = ?', [id]);
      if (existing.length === 0) {
        return res.status(404).json({ error: 'Cotización no encontrada' });
      }
      
      await pool.execute('DELETE FROM cotizaciones WHERE id = ?', [id]);
      res.json({ success: true, message: 'Cotización eliminada correctamente' });
    } catch (error) {
      console.error('Error deleting quote:', error);
      res.status(500).json({ error: 'Error al eliminar cotización' });
    }
  });

  // GET statistics - admin only
  router.get('/stats/resumen', async (req, res) => {
    try {
      const [[total]] = await pool.execute('SELECT COUNT(*) as total FROM cotizaciones');
      const [[pendientes]] = await pool.execute("SELECT COUNT(*) as total FROM cotizaciones WHERE estado = 'nueva'");
      const [[contactadas]] = await pool.execute("SELECT COUNT(*) as total FROM cotizaciones WHERE estado = 'contactada'");
      const [[aceptadas]] = await pool.execute("SELECT COUNT(*) as total FROM cotizaciones WHERE estado = 'aceptada'");
      
      res.json({
        total: total.total,
        pendientes: pendientes.total,
        contactadas: contactadas.total,
        aceptadas: aceptadas.total
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
  });

  return router;
};
