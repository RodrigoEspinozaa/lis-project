const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authenticateToken = require('../middleware/auth');

module.exports = (pool) => {
  const router = express.Router();

  // POST /api/auth/register (solo para crear admin inicial)
  router.post('/register', async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
      }

      const connection = await pool.getConnection();
      
      // Verificar si el usuario ya existe
      const [existing] = await connection.execute(
        'SELECT id FROM admins WHERE username = ?',
        [username]
      );
      
      if (existing.length > 0) {
        connection.release();
        return res.status(409).json({ error: 'Usuario ya existe' });
      }

      // Hash de la contraseña
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insertar admin
      await connection.execute(
        'INSERT INTO admins (username, password) VALUES (?, ?)',
        [username, hashedPassword]
      );

      connection.release();
      res.status(201).json({ message: 'Admin creado exitosamente' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al registrar' });
    }
  });

  // POST /api/auth/login
  router.post('/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
      }

      const connection = await pool.getConnection();
      const [rows] = await connection.execute(
        'SELECT id, username, password FROM admins WHERE username = ?',
        [username]
      );
      connection.release();

      if (rows.length === 0) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      const admin = rows[0];
      const passwordMatch = await bcrypt.compare(password, admin.password);

      if (!passwordMatch) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      const token = jwt.sign({ id: admin.id, username: admin.username }, process.env.JWT_SECRET, {
        expiresIn: '24h'
      });

      res.json({ token, message: 'Autenticación exitosa' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al autenticar' });
    }
  });

  // GET /api/auth/verify (verificar token)
  router.get('/verify', authenticateToken, (req, res) => {
    res.json({ valid: true, user: req.user });
  });

  return router;
};
