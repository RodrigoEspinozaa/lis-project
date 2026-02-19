module.exports = function(pool) {
  const express = require('express');
  const router = express.Router();

  // GET all FAQs - public endpoint
  router.get('/', async (req, res) => {
    try {
      const { categoria } = req.query;
      let sql = 'SELECT id, pregunta, respuesta, categoria, orden FROM faq WHERE estado = TRUE';
      let params = [];
      
      if (categoria) {
        sql += ' AND categoria = ?';
        params.push(categoria);
      }
      
      sql += ' ORDER BY orden ASC, id ASC';
      
      const [rows] = await pool.execute(sql, params);
      res.json(rows);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      res.status(500).json({ error: 'Error al obtener preguntas frecuentes' });
    }
  });

  // GET single FAQ - public endpoint
  router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const [rows] = await pool.execute('SELECT * FROM faq WHERE id = ? AND estado = TRUE', [id]);
      
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Pregunta no encontrada' });
      }
      
      res.json(rows[0]);
    } catch (error) {
      console.error('Error fetching FAQ:', error);
      res.status(500).json({ error: 'Error al obtener pregunta' });
    }
  });

  // POST create FAQ - admin only
  router.post('/', async (req, res) => {
    try {
      const { pregunta, respuesta, categoria, orden } = req.body;
      
      if (!pregunta || !respuesta) {
        return res.status(400).json({ error: 'Pregunta y respuesta son requeridos' });
      }
      
      await pool.execute(
        `INSERT INTO faq (pregunta, respuesta, categoria, orden) VALUES (?, ?, ?, ?)`,
        [pregunta, respuesta, categoria || null, orden || 0]
      );
      
      res.status(201).json({ success: true, message: 'Pregunta creada correctamente' });
    } catch (error) {
      console.error('Error creating FAQ:', error);
      res.status(500).json({ error: 'Error al crear pregunta' });
    }
  });

  // PUT update FAQ - admin only
  router.put('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { pregunta, respuesta, categoria, orden, estado } = req.body;
      
      const [existing] = await pool.execute('SELECT id FROM faq WHERE id = ?', [id]);
      if (existing.length === 0) {
        return res.status(404).json({ error: 'Pregunta no encontrada' });
      }
      
      await pool.execute(
        `UPDATE faq SET 
          pregunta = COALESCE(?, pregunta),
          respuesta = COALESCE(?, respuesta),
          categoria = COALESCE(?, categoria),
          orden = COALESCE(?, orden),
          estado = COALESCE(?, estado)
        WHERE id = ?`,
        [pregunta, respuesta, categoria, orden, estado, id]
      );
      
      res.json({ success: true, message: 'Pregunta actualizada correctamente' });
    } catch (error) {
      console.error('Error updating FAQ:', error);
      res.status(500).json({ error: 'Error al actualizar pregunta' });
    }
  });

  // DELETE FAQ - admin only
  router.delete('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      
      const [existing] = await pool.execute('SELECT id FROM faq WHERE id = ?', [id]);
      if (existing.length === 0) {
        return res.status(404).json({ error: 'Pregunta no encontrada' });
      }
      
      await pool.execute('DELETE FROM faq WHERE id = ?', [id]);
      res.json({ success: true, message: 'Pregunta eliminada correctamente' });
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      res.status(500).json({ error: 'Error al eliminar pregunta' });
    }
  });

  // GET categories - public
  router.get('/meta/categorias', async (req, res) => {
    try {
      const [rows] = await pool.execute(
        'SELECT DISTINCT categoria FROM faq WHERE estado = TRUE AND categoria IS NOT NULL ORDER BY categoria'
      );
      res.json(rows.map(r => r.categoria));
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({ error: 'Error al obtener categorías' });
    }
  });

  return router;
};
