module.exports = (pool) => {
  const express = require('express');
  const router = express.Router();
  const auth = require('../middleware/auth');

  // GET - Listar tickets (admin only)
  router.get('/', auth, async (req, res) => {
    try {
      const connection = await pool.getConnection();
      const [tickets] = await connection.execute(`
        SELECT t.*, c.nombre as contacto_nombre, c.email, s.nombre as servicio_nombre
        FROM tickets t
        LEFT JOIN contactos c ON t.contacto_id = c.id
        LEFT JOIN servicios s ON t.servicio_id = s.id
        ORDER BY t.fecha_creacion DESC
      `);
      connection.release();
      res.json(tickets);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener tickets' });
    }
  });

  // POST - Crear ticket desde contacto
  router.post('/', async (req, res) => {
    try {
      const { contacto_id, titulo, descripcion, servicio_id, prioridad } = req.body;
      
      if (!contacto_id || !titulo || !descripcion) {
        return res.status(400).json({ error: 'Campos requeridos' });
      }

      const connection = await pool.getConnection();
      await connection.execute(
        'INSERT INTO tickets (contacto_id, titulo, descripcion, servicio_id, prioridad) VALUES (?, ?, ?, ?, ?)',
        [contacto_id, titulo, descripcion, servicio_id || null, prioridad || 'media']
      );
      connection.release();
      res.status(201).json({ message: 'Ticket creado' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al crear ticket' });
    }
  });

  // PUT - Actualizar ticket
  router.put('/:id', auth, async (req, res) => {
    try {
      const { estado, prioridad, descripcion } = req.body;
      const connection = await pool.getConnection();
      await connection.execute(
        'UPDATE tickets SET estado=?, prioridad=?, descripcion=?, fecha_actualizacion=NOW() WHERE id=?',
        [estado || null, prioridad || null, descripcion || null, req.params.id]
      );
      connection.release();
      res.json({ message: 'Ticket actualizado' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al actualizar' });
    }
  });

  // DELETE - Cerrar ticket
  router.delete('/:id', auth, async (req, res) => {
    try {
      const connection = await pool.getConnection();
      await connection.execute(
        'UPDATE tickets SET estado="cerrado", fecha_cierre=NOW() WHERE id=?',
        [req.params.id]
      );
      connection.release();
      res.json({ message: 'Ticket cerrado' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al cerrar ticket' });
    }
  });

  return router;
};
