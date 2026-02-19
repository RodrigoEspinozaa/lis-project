module.exports = (pool) => {
  const express = require('express');
  const router = express.Router();
  const auth = require('../middleware/auth');

  // GET - Listar casos de éxito
  router.get('/', async (req, res) => {
    try {
      const connection = await pool.getConnection();
      const [casos] = await connection.execute(
        'SELECT * FROM casos_exito WHERE estado=true ORDER BY fecha_creacion DESC'
      );
      connection.release();
      res.json(casos);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener casos' });
    }
  });

  // POST - Crear caso de éxito
  router.post('/', auth, async (req, res) => {
    try {
      const { titulo, descripcion, cliente, logo_url, imagen_url, resultados, testimonio_id } = req.body;
      
      if (!titulo || !descripcion || !cliente) {
        return res.status(400).json({ error: 'Campos requeridos' });
      }

      const connection = await pool.getConnection();
      const [result] = await connection.execute(
        'INSERT INTO casos_exito (titulo, descripcion, cliente, logo_url, imagen_url, resultados, testimonio_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [titulo, descripcion, cliente, logo_url || null, imagen_url || null, resultados || null, testimonio_id || null]
      );
      connection.release();
      res.status(201).json({ id: result.insertId, message: 'Caso creado' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al crear caso' });
    }
  });

  // PUT - Actualizar caso
  router.put('/:id', auth, async (req, res) => {
    try {
      const { titulo, descripcion, cliente, logo_url, imagen_url, resultados } = req.body;
      const connection = await pool.getConnection();
      await connection.execute(
        'UPDATE casos_exito SET titulo=?, descripcion=?, cliente=?, logo_url=?, imagen_url=?, resultados=? WHERE id=?',
        [titulo, descripcion, cliente, logo_url, imagen_url, resultados, req.params.id]
      );
      connection.release();
      res.json({ message: 'Caso actualizado' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al actualizar' });
    }
  });

  // DELETE - Eliminar caso
  router.delete('/:id', auth, async (req, res) => {
    try {
      const connection = await pool.getConnection();
      await connection.execute('DELETE FROM casos_exito WHERE id=?', [req.params.id]);
      connection.release();
      res.json({ message: 'Caso eliminado' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al eliminar' });
    }
  });

  return router;
};
