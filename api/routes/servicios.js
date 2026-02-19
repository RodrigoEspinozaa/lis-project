const express = require('express');
const authenticateToken = require('../middleware/auth');

module.exports = (pool) => {
  const router = express.Router();

  // GET /api/servicios - listar todos
  router.get('/', async (req, res) => {
    try {
      const connection = await pool.getConnection();
      const [rows] = await connection.execute(
        'SELECT id, nombre, descripcion, estado FROM servicios WHERE estado = 1 ORDER BY orden ASC'
      );
      connection.release();
      res.json(rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener servicios' });
    }
  });

  // GET /api/servicios/:id - obtener un servicio
  router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const connection = await pool.getConnection();
      const [rows] = await connection.execute(
        'SELECT * FROM servicios WHERE id = ?',
        [id]
      );
      connection.release();
      
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Servicio no encontrado' });
      }
      
      res.json(rows[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener servicio' });
    }
  });

  // POST /api/servicios - crear (solo admin)
  router.post('/', authenticateToken, async (req, res) => {
    try {
      const { nombre, descripcion, orden } = req.body;
      
      if (!nombre || !descripcion) {
        return res.status(400).json({ error: 'Nombre y descripción requeridos' });
      }

      const connection = await pool.getConnection();
      await connection.execute(
        'INSERT INTO servicios (nombre, descripcion, orden, estado) VALUES (?, ?, ?, 1)',
        [nombre, descripcion, orden || 0]
      );
      connection.release();

      res.status(201).json({ message: 'Servicio creado' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al crear servicio' });
    }
  });

  // PUT /api/servicios/:id - actualizar (solo admin)
  router.put('/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const { nombre, descripcion, orden, estado } = req.body;

      const connection = await pool.getConnection();
      await connection.execute(
        'UPDATE servicios SET nombre = ?, descripcion = ?, orden = ?, estado = ? WHERE id = ?',
        [nombre, descripcion, orden || 0, estado || 1, id]
      );
      connection.release();

      res.json({ message: 'Servicio actualizado' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al actualizar' });
    }
  });

  // DELETE /api/servicios/:id (solo admin)
  router.delete('/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const connection = await pool.getConnection();
      await connection.execute('DELETE FROM servicios WHERE id = ?', [id]);
      connection.release();
      res.json({ message: 'Servicio eliminado' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al eliminar' });
    }
  });

  return router;
};
