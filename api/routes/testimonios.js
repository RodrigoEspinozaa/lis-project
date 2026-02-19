const express = require('express');
const authenticateToken = require('../middleware/auth');

module.exports = (pool) => {
  const router = express.Router();

  // GET /api/testimonios - listar todos públicos
  router.get('/', async (req, res) => {
    try {
      const connection = await pool.getConnection();
      const [rows] = await connection.execute(
        'SELECT id, nombre, cargo, empresa, testimonio, avatar_url FROM testimonios WHERE estado = 1 ORDER BY fecha_creacion DESC'
      );
      connection.release();
      res.json(rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener testimonios' });
    }
  });

  // POST /api/testimonios - crear (solo admin)
  router.post('/', authenticateToken, async (req, res) => {
    try {
      const { nombre, cargo, empresa, testimonio, avatar_url } = req.body;
      
      if (!nombre || !testimonio) {
        return res.status(400).json({ error: 'Nombre y testimonio requeridos' });
      }

      const connection = await pool.getConnection();
      await connection.execute(
        'INSERT INTO testimonios (nombre, cargo, empresa, testimonio, avatar_url, estado) VALUES (?, ?, ?, ?, ?, 1)',
        [nombre, cargo || '', empresa || '', testimonio, avatar_url || '']
      );
      connection.release();

      res.status(201).json({ message: 'Testimonio creado' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al crear testimonio' });
    }
  });

  // PUT /api/testimonios/:id - actualizar (solo admin)
  router.put('/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const { nombre, cargo, empresa, testimonio, avatar_url, estado } = req.body;

      const connection = await pool.getConnection();
      await connection.execute(
        'UPDATE testimonios SET nombre = ?, cargo = ?, empresa = ?, testimonio = ?, avatar_url = ?, estado = ? WHERE id = ?',
        [nombre, cargo || '', empresa || '', testimonio, avatar_url || '', estado || 1, id]
      );
      connection.release();

      res.json({ message: 'Testimonio actualizado' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al actualizar' });
    }
  });

  // DELETE /api/testimonios/:id (solo admin)
  router.delete('/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const connection = await pool.getConnection();
      await connection.execute('DELETE FROM testimonios WHERE id = ?', [id]);
      connection.release();
      res.json({ message: 'Testimonio eliminado' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al eliminar' });
    }
  });

  return router;
};
