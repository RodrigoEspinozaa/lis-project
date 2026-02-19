module.exports = function(pool) {
  const express = require('express');
  const router = express.Router();

  // POST subscribe - public endpoint
  router.post('/suscribir', async (req, res) => {
    try {
      const { email, nombre } = req.body;
      
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ error: 'Email válido requerido' });
      }
      
      // Check if already subscribed
      const [existing] = await pool.execute(
        'SELECT id FROM newsletter WHERE email = ?',
        [email]
      );
      
      if (existing.length > 0) {
        // Reactivate if previously unsubscribed
        await pool.execute(
          'UPDATE newsletter SET activo = TRUE, fecha_baja = NULL WHERE email = ?',
          [email]
        );
        return res.json({ success: true, message: 'Ya estás suscrito. ¡Bienvenido de nuevo!' });
      }
      
      await pool.execute(
        `INSERT INTO newsletter (email, nombre, fuente) VALUES (?, ?, ?)`,
        [email, nombre || null, 'web']
      );
      
      res.status(201).json({ success: true, message: '¡Suscripción exitosa! Gracias por suscribirte.' });
    } catch (error) {
      console.error('Error subscribing:', error);
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: 'Este email ya está suscrito' });
      }
      res.status(500).json({ error: 'Error al procesar suscripción' });
    }
  });

  // POST unsubscribe - public endpoint  
  router.post('/desuscribir', async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: 'Email requerido' });
      }
      await pool.execute(
        'UPDATE newsletter SET activo = FALSE, fecha_baja = NOW() WHERE email = ?',
        [email]
      );
      res.json({ success: true, message: 'Suscripción cancelada correctamente' });
    } catch (error) {
      console.error('Error unsubscribing:', error);
      res.status(500).json({ error: 'Error al cancelar suscripción' });
    }
  });

  // GET all subscribers - admin only 
  router.get('/', async (req, res) => {
    try {
      const [rows] = await pool.execute('SELECT * FROM newsletter ORDER BY fecha_suscripcion DESC');
      res.json(rows);
    } catch (error) {
      console.error('Error fetching subscribers:', error);
      res.status(500).json({ error: 'Error al obtener suscriptores' });
    }
  });

  // PUT update subscriber - admin only  
  router.put('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { activo, nombre } = req.body;
      
      await pool.execute(
        'UPDATE newsletter SET activo = COALESCE(?, activo), nombre = COALESCE(?, nombre) WHERE id = ?',
        [activo, nombre, id]
      );
      
      res.json({ success: true, message: 'Suscriptor actualizado correctamente' });
    } catch (error) {
      console.error('Error updating subscriber:', error);
      res.status(500).json({ error: 'Error al actualizar suscriptor' });
    }
  });

  // DELETE subscriber - admin only
  router.delete('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await pool.execute('DELETE FROM newsletter WHERE id = ?', [id]);
      res.json({ success: true, message: 'Suscriptor eliminado correctamente' });
    } catch (error) {
      console.error('Error deleting subscriber:', error);
      res.status(500).json({ error: 'Error al eliminar suscriptor' });
    }
  });

  return router;
};
