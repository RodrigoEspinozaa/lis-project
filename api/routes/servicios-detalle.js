module.exports = (pool) => {
  const express = require('express');
  const router = express.Router();
  const auth = require('../middleware/auth');

  // GET - Obtener detalle de un servicio por slug o ID
  router.get('/:id', async (req, res) => {
    try {
      const connection = await pool.getConnection();
      const [detalle] = await connection.execute(
        'SELECT sd.*, s.nombre, s.descripcion FROM servicios_detalle sd JOIN servicios s ON sd.servicio_id=s.id WHERE sd.slug=? OR sd.id=?',
        [req.params.id, req.params.id]
      );
      connection.release();
      
      if (detalle.length === 0) {
        return res.status(404).json({ error: 'Servicio no encontrado' });
      }

      const item = detalle[0];
      if (item.beneficios) {
        item.beneficios = JSON.parse(item.beneficios);
      }
      res.json(item);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener servicio' });
    }
  });

  // POST - Crear detalle de servicio
  router.post('/', auth, async (req, res) => {
    try {
      const { servicio_id, contenido_largo, beneficios, precio, duracion, slug } = req.body;
      
      if (!servicio_id || !contenido_largo) {
        return res.status(400).json({ error: 'Campos requeridos' });
      }

      const connection = await pool.getConnection();
      const [result] = await connection.execute(
        'INSERT INTO servicios_detalle (servicio_id, contenido_largo, beneficios, precio, duracion, slug) VALUES (?, ?, ?, ?, ?, ?)',
        [servicio_id, contenido_largo, JSON.stringify(beneficios || []), precio || null, duracion || null, slug || null]
      );
      connection.release();
      res.status(201).json({ id: result.insertId });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al crear detalle' });
    }
  });

  // PUT - Actualizar detalle
  router.put('/:id', auth, async (req, res) => {
    try {
      const { contenido_largo, beneficios, precio, duracion } = req.body;
      const connection = await pool.getConnection();
      await connection.execute(
        'UPDATE servicios_detalle SET contenido_largo=?, beneficios=?, precio=?, duracion=? WHERE id=?',
        [contenido_largo, JSON.stringify(beneficios || []), precio, duracion, req.params.id]
      );
      connection.release();
      res.json({ message: 'Detalle actualizado' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al actualizar' });
    }
  });

  return router;
};
