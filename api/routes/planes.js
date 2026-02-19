module.exports = (pool) => {
  const express = require('express');
  const router = express.Router();
  const auth = require('../middleware/auth');

  // GET - Listar planes
  router.get('/', async (req, res) => {
    try {
      const connection = await pool.getConnection();
      const [planes] = await connection.execute(
        'SELECT * FROM planes WHERE estado=true ORDER BY orden ASC'
      );
      connection.release();
      res.json(planes.map(p => ({
        ...p,
        features: JSON.parse(p.features)
      })));
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener planes' });
    }
  });

  // POST - Crear plan
  router.post('/', auth, async (req, res) => {
    try {
      const { nombre, descripcion, precio, features, es_popular } = req.body;
      
      if (!nombre || !precio || !features) {
        return res.status(400).json({ error: 'Campos requeridos' });
      }

      const connection = await pool.getConnection();
      const [result] = await connection.execute(
        'INSERT INTO planes (nombre, descripcion, precio, features, es_popular) VALUES (?, ?, ?, ?, ?)',
        [nombre, descripcion || null, precio, JSON.stringify(features), es_popular || false]
      );
      connection.release();
      res.status(201).json({ id: result.insertId });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al crear plan' });
    }
  });

  // PUT - Actualizar plan
  router.put('/:id', auth, async (req, res) => {
    try {
      const { nombre, descripcion, precio, features, es_popular } = req.body;
      const connection = await pool.getConnection();
      await connection.execute(
        'UPDATE planes SET nombre=?, descripcion=?, precio=?, features=?, es_popular=? WHERE id=?',
        [nombre, descripcion, precio, JSON.stringify(features), es_popular, req.params.id]
      );
      connection.release();
      res.json({ message: 'Plan actualizado' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al actualizar' });
    }
  });

  // DELETE
  router.delete('/:id', auth, async (req, res) => {
    try {
      const connection = await pool.getConnection();
      await connection.execute('DELETE FROM planes WHERE id=?', [req.params.id]);
      connection.release();
      res.json({ message: 'Plan eliminado' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al eliminar' });
    }
  });

  return router;
};
