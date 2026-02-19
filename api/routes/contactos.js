const express = require('express');
const authenticateToken = require('../middleware/auth');

module.exports = (pool) => {
  const router = express.Router();

  // GET /api/contactos - listar todos (solo admin)
  router.get('/', authenticateToken, async (req, res) => {
    try {
      const connection = await pool.getConnection();
      const [rows] = await connection.execute(
        'SELECT id, nombre, email, mensaje, fecha_creacion FROM contactos ORDER BY fecha_creacion DESC'
      );
      connection.release();
      res.json(rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener contactos' });
    }
  });

  // POST /api/contactos - crear nuevo contacto
  router.post('/', async (req, res) => {
    try {
      const { nombre, email, mensaje } = req.body;
      
      if (!nombre || !email || !mensaje) {
        return res.status(400).json({ error: 'Campos requeridos: nombre, email, mensaje' });
      }

      const connection = await pool.getConnection();
      await connection.execute(
        'INSERT INTO contactos (nombre, email, mensaje) VALUES (?, ?, ?)',
        [nombre, email, mensaje]
      );
      connection.release();

      res.status(201).json({ message: 'Contacto guardado exitosamente' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al guardar contacto' });
    }
  });

  // DELETE /api/contactos/:id - eliminar contacto (solo admin)
  router.delete('/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const connection = await pool.getConnection();
      await connection.execute('DELETE FROM contactos WHERE id = ?', [id]);
      connection.release();
      res.json({ message: 'Contacto eliminado' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al eliminar' });
    }
  });

  return router;
};
