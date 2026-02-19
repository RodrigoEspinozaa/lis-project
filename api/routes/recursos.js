module.exports = function(pool) {
  const express = require('express');
  const router = express.Router();

  // GET all resources - public endpoint
  router.get('/', async (req, res) => {
    try {
      const { tipo, categoria } = req.query;
      let sql = 'SELECT id, titulo, descripcion, tipo, archivo_url, imagen_url, categoria FROM recursos WHERE estado = TRUE';
      let params = [];
      
      if (tipo) {
        sql += ' AND tipo = ?';
        params.push(tipo);
      }
      
      if (categoria) {
        sql += ' AND categoria = ?';
        params.push(categoria);
      }
      
      sql += ' ORDER BY orden ASC, id DESC';
      
      const [rows] = await pool.execute(sql, params);
      res.json(rows);
    } catch (error) {
      console.error('Error fetching resources:', error);
      res.status(500).json({ error: 'Error al obtener recursos' });
    }
  });

  // GET single resource - public endpoint
  router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const [rows] = await pool.execute('SELECT * FROM recursos WHERE id = ? AND estado = TRUE', [id]);
      
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Recurso no encontrado' });
      }
      
      res.json(rows[0]);
    } catch (error) {
      console.error('Error fetching resource:', error);
      res.status(500).json({ error: 'Error al obtener recurso' });
    }
  });

  // POST create resource - admin only
  router.post('/', async (req, res) => {
    try {
      const { titulo, descripcion, tipo, archivo_url, imagen_url, categoria, orden } = req.body;
      
      if (!titulo || !archivo_url) {
        return res.status(400).json({ error: 'Título y URL del archivo son requeridos' });
      }
      
      await pool.execute(
        `INSERT INTO recursos (titulo, descripcion, tipo, archivo_url, imagen_url, categoria, orden) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [titulo, descripcion || null, tipo || 'pdf', archivo_url, imagen_url || null, categoria || null, orden || 0]
      );
      
      res.status(201).json({ success: true, message: 'Recurso creado correctamente' });
    } catch (error) {
      console.error('Error creating resource:', error);
      res.status(500).json({ error: 'Error al crear recurso' });
    }
  });

  // PUT update resource - admin only
  router.put('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { titulo, descripcion, tipo, archivo_url, imagen_url, categoria, orden, estado } = req.body;
      
      const [existing] = await pool.execute('SELECT id FROM recursos WHERE id = ?', [id]);
      if (existing.length === 0) {
        return res.status(404).json({ error: 'Recurso no encontrado' });
      }
      
      await pool.execute(
        `UPDATE recursos SET 
          titulo = COALESCE(?, titulo),
          descripcion = COALESCE(?, descripcion),
          tipo = COALESCE(?, tipo),
          archivo_url = COALESCE(?, archivo_url),
          imagen_url = COALESCE(?, imagen_url),
          categoria = COALESCE(?, categoria),
          orden = COALESCE(?, orden),
          estado = COALESCE(?, estado)
        WHERE id = ?`,
        [titulo, descripcion, tipo, archivo_url, imagen_url, categoria, orden, estado, id]
      );
      
      res.json({ success: true, message: 'Recurso actualizado correctamente' });
    } catch (error) {
      console.error('Error updating resource:', error);
      res.status(500).json({ error: 'Error al actualizar recurso' });
    }
  });

  // DELETE resource - admin only
  router.delete('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      
      const [existing] = await pool.execute('SELECT id FROM recursos WHERE id = ?', [id]);
      if (existing.length === 0) {
        return res.status(404).json({ error: 'Recurso no encontrado' });
      }
      
      await pool.execute('DELETE FROM recursos WHERE id = ?', [id]);
      res.json({ success: true, message: 'Recurso eliminado correctamente' });
    } catch (error) {
      console.error('Error deleting resource:', error);
      res.status(500).json({ error: 'Error al eliminar recurso' });
    }
  });

  // GET types - public
  router.get('/meta/tipos', async (req, res) => {
    try {
      const [rows] = await pool.execute(
        'SELECT DISTINCT tipo FROM recursos WHERE estado = TRUE ORDER BY tipo'
      );
      res.json(rows.map(r => r.tipo));
    } catch (error) {
      console.error('Error fetching types:', error);
      res.status(500).json({ error: 'Error al obtener tipos de recursos' });
    }
  });

  return router;
};
