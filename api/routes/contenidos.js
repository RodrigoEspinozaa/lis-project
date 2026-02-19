module.exports = (pool) => {
  const express = require('express');
  const router = express.Router();
  const auth = require('../middleware/auth');

  // GET - Obtener contenido por clave
  router.get('/:clave', async (req, res) => {
    try {
      const connection = await pool.getConnection();
      const [rows] = await connection.execute(
        'SELECT * FROM contenidos WHERE clave=?',
        [req.params.clave]
      );
      connection.release();
      
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Contenido no encontrado' });
      }

      const contenido = rows[0];
      if (contenido.tipo === 'json') {
        contenido.contenido = JSON.parse(contenido.contenido);
      }
      res.json(contenido);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener contenido' });
    }
  });

  // PUT - Actualizar contenido (CMS)
  router.put('/:clave', auth, async (req, res) => {
    try {
      const { contenido, titulo, tipo } = req.body;
      
      if (!contenido) {
        return res.status(400).json({ error: 'Contenido requerido' });
      }

      const connection = await pool.getConnection();
      
      // Verificar si existe
      const [existing] = await connection.execute(
        'SELECT id FROM contenidos WHERE clave=?',
        [req.params.clave]
      );

      let valor = contenido;
      if (tipo === 'json') {
        valor = JSON.stringify(contenido);
      }

      if (existing.length > 0) {
        // Update
        await connection.execute(
          'UPDATE contenidos SET contenido=?, titulo=?, tipo=?, fecha_actualizacion=NOW() WHERE clave=?',
          [valor, titulo || null, tipo || 'texto', req.params.clave]
        );
      } else {
        // Insert
        await connection.execute(
          'INSERT INTO contenidos (clave, titulo, contenido, tipo) VALUES (?, ?, ?, ?)',
          [req.params.clave, titulo || null, valor, tipo || 'texto']
        );
      }

      connection.release();
      res.json({ message: 'Contenido actualizado' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al actualizar' });
    }
  });

  return router;
};
