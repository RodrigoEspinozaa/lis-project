module.exports = function(pool) {
  const express = require('express');
  const router = express.Router();

  // GET all published articles - public endpoint
  router.get('/', async (req, res) => {
    try {
      const { categoria } = req.query;
      let sql = 'SELECT id, titulo, slug, resumen, imagen_url, autor, categoria, fecha_publicacion, vistas FROM blog WHERE estado = TRUE AND fecha_publicacion <= NOW()';
      let params = [];
      
      if (categoria) {
        sql += ' AND categoria = ?';
        params.push(categoria);
      }
      
      sql += ' ORDER BY fecha_publicacion DESC';
      
      const [rows] = await pool.execute(sql, params);
      res.json(rows);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      res.status(500).json({ error: 'Error al obtener artículos del blog' });
    }
  });

  // GET single article by slug - public endpoint
  router.get('/:slug', async (req, res) => {
    try {
      const { slug } = req.params;
      
      const [rows] = await pool.execute(
        'SELECT * FROM blog WHERE slug = ? AND estado = TRUE',
        [slug]
      );
      
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Artículo no encontrado' });
      }
      
      // Increment view count
      pool.execute('UPDATE blog SET vistas = vistas + 1 WHERE id = ?', [rows[0].id]).catch(() => {});
      
      res.json(rows[0]);
    } catch (error) {
      console.error('Error fetching blog post:', error);
      res.status(500).json({ error: 'Error al obtener artículo' });
    }
  });

  // POST new article - admin only (would need auth middleware in production)
  router.post('/', async (req, res) => {
    try {
      const { titulo, slug, resumen, contenido, imagen_url, autor, categoria, etiquetas } = req.body;
      
      if (!titulo || !slug || !resumen || !contenido) {
        return res.status(400).json({ error: 'Todos los campos requeridos' });
      }
      
      await pool.execute(
        `INSERT INTO blog (titulo, slug, resumen, contenido, imagen_url, autor, categoria, etiquetas) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [titulo, slug, resumen, contenido, imagen_url || null, autor || null, categoria || null, etiquetas || null]
      );
      
      res.status(201).json({ success: true, message: 'Artículo creado correctamente' });
    } catch (error) {
      console.error('Error creating blog post:', error);
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: 'El slug ya existe' });
      }
      res.status(500).json({ error: 'Error al crear artículo' });
    }
  });

  // PUT update article - admin only
  router.put('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { titulo, resumen, contenido, imagen_url, autor, categoria, etiquetas, estado } = req.body;
      
      const [existing] = await pool.execute('SELECT id FROM blog WHERE id = ?', [id]);
      if (existing.length === 0) {
        return res.status(404).json({ error: 'Artículo no encontrado' });
      }
      
      await pool.execute(
        `UPDATE blog SET 
          titulo = COALESCE(?, titulo),
          resumen = COALESCE(?, resumen),
          contenido = COALESCE(?, contenido),
          imagen_url = COALESCE(?, imagen_url),
          autor = COALESCE(?, autor),
          categoria = COALESCE(?, categoria),
          etiquetas = COALESCE(?, etiquetas),
          estado = COALESCE(?, estado)
        WHERE id = ?`,
        [titulo, resumen, contenido, imagen_url, autor, categoria, etiquetas, estado, id]
      );
      
      res.json({ success: true, message: 'Artículo actualizado correctamente' });
    } catch (error) {
      console.error('Error updating blog post:', error);
      res.status(500).json({ error: 'Error al actualizar artículo' });
    }
  });

  // DELETE article - admin only
  router.delete('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      
      const [existing] = await pool.execute('SELECT id FROM blog WHERE id = ?', [id]);
      if (existing.length === 0) {
        return res.status(404).json({ error: 'Artículo no encontrado' });
      }
      
      await pool.execute('DELETE FROM blog WHERE id = ?', [id]);
      
      res.json({ success: true, message: 'Artículo eliminado correctamente' });
    } catch (error) {
      console.error('Error deleting blog post:', error);
      res.status(500).json({ error: 'Error al eliminar artículo' });
    }
  });

  // GET categories - public
  router.get('/meta/categorias', async (req, res) => {
    try {
      const [rows] = await pool.execute(
        'SELECT DISTINCT categoria FROM blog WHERE estado = TRUE AND categoria IS NOT NULL ORDER BY categoria'
      );
      res.json(rows.map(r => r.categoria));
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({ error: 'Error al obtener categorías' });
    }
  });

  return router;
};
