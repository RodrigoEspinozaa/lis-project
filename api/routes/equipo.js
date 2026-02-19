module.exports = function(pool) {
  const express = require('express');
  const router = express.Router();

  // GET all team members - public endpoint
  router.get('/', async (req, res) => {
    try {
      const [rows] = await pool.execute(
        'SELECT id, nombre, cargo, bio, foto_url, linkedin, email, orden FROM equipo WHERE estado = TRUE ORDER BY orden ASC, id ASC'
      );
      res.json(rows);
    } catch (error) {
      console.error('Error fetching team:', error);
      res.status(500).json({ error: 'Error al obtener equipo' });
    }
  });

  // GET single team member - public endpoint
  router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const [rows] = await pool.execute('SELECT * FROM equipo WHERE id = ? AND estado = TRUE', [id]);
      
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Miembro del equipo no encontrado' });
      }
      
      res.json(rows[0]);
    } catch (error) {
      console.error('Error fetching team member:', error);
      res.status(500).json({ error: 'Error al obtener miembro del equipo' });
    }
  });

  // POST create team member - admin only
  router.post('/', async (req, res) => {
    try {
      const { nombre, cargo, bio, foto_url, linkedin, email, orden } = req.body;
      
      if (!nombre || !cargo) {
        return res.status(400).json({ error: 'Nombre y cargo son requeridos' });
      }
      
      await pool.execute(
        `INSERT INTO equipo (nombre, cargo, bio, foto_url, linkedin, email, orden) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [nombre, cargo, bio || null, foto_url || null, linkedin || null, email || null, orden || 0]
      );
      
      res.status(201).json({ success: true, message: 'Miembro del equipo creado correctamente' });
    } catch (error) {
      console.error('Error creating team member:', error);
      res.status(500).json({ error: 'Error al crear miembro del equipo' });
    }
  });

  // PUT update team member - admin only
  router.put('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { nombre, cargo, bio, foto_url, linkedin, email, orden, estado } = req.body;
      
      const [existing] = await pool.execute('SELECT id FROM equipo WHERE id = ?', [id]);
      if (existing.length === 0) {
        return res.status(404).json({ error: 'Miembro del equipo no encontrado' });
      }
      
      await pool.execute(
        `UPDATE equipo SET 
          nombre = COALESCE(?, nombre),
          cargo = COALESCE(?, cargo),
          bio = COALESCE(?, bio),
          foto_url = COALESCE(?, foto_url),
          linkedin = COALESCE(?, linkedin),
          email = COALESCE(?, email),
          orden = COALESCE(?, orden),
          estado = COALESCE(?, estado)
        WHERE id = ?`,
        [nombre, cargo, bio, foto_url, linkedin, email, orden, estado, id]
      );
      
      res.json({ success: true, message: 'Miembro del equipo actualizado correctamente' });
    } catch (error) {
      console.error('Error updating team member:', error);
      res.status(500).json({ error: 'Error al actualizar miembro del equipo' });
    }
  });

  // DELETE team member - admin only
  router.delete('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      
      const [existing] = await pool.execute('SELECT id FROM equipo WHERE id = ?', [id]);
      if (existing.length === 0) {
        return res.status(404).json({ error: 'Miembro del equipo no encontrado' });
      }
      
      await pool.execute('DELETE FROM equipo WHERE id = ?', [id]);
      res.json({ success: true, message: 'Miembro del equipo eliminado correctamente' });
    } catch (error) {
      console.error('Error deleting team member:', error);
      res.status(500).json({ error: 'Error al eliminar miembro del equipo' });
    }
  });

  return router;
};
