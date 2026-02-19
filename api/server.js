require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const rateLimit = require('./middleware/rate-limit');

const app = express();
const PORT = process.env.PORT || 3001;

// CORS Configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL, 'https://your-domain.vercel.app']
    : ['http://localhost:3000', 'http://localhost:8000', 'http://127.0.0.1:5500'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Pool de conexiones MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Rate limiting para formulario de contacto
app.use('/api/contactos/form', rateLimit(pool));

// Rutas existentes
app.use('/api/auth', require('./routes/auth')(pool));
app.use('/api/contactos', require('./routes/contactos')(pool));
app.use('/api/servicios', require('./routes/servicios')(pool));
app.use('/api/servicios-detalle', require('./routes/servicios-detalle')(pool));
app.use('/api/testimonios', require('./routes/testimonios')(pool));
app.use('/api/dashboard', require('./routes/dashboard')(pool));
app.use('/api/tickets', require('./routes/tickets')(pool));
app.use('/api/casos-exito', require('./routes/casos-exito')(pool));
app.use('/api/planes', require('./routes/planes')(pool));
app.use('/api/contenidos', require('./routes/contenidos')(pool));
app.use('/api/reportes', require('./routes/reportes')(pool));

// Nuevas rutas para mejoras
app.use('/api/blog', require('./routes/blog')(pool));
app.use('/api/newsletter', require('./routes/newsletter')(pool));
app.use('/api/faq', require('./routes/faq')(pool));
app.use('/api/equipo', require('./routes/equipo')(pool));
app.use('/api/recursos', require('./routes/recursos')(pool));
app.use('/api/cotizaciones', require('./routes/cotizaciones')(pool));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log(`Conectado a MySQL: ${process.env.DB_HOST}`);
});

module.exports = { pool };
