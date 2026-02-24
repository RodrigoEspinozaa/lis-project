require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const rateLimit = require('./middleware/rate-limit');
const url = require('url');

const app = express();
const PORT = process.env.PORT || 3001;

// Parse DATABASE_URL from Railway (if available)
let dbConfig;
if (process.env.DATABASE_URL) {
  const dbUrl = new url.URL(process.env.DATABASE_URL);
  dbConfig = {
    host: dbUrl.hostname,
    port: dbUrl.port || 3306,
    user: dbUrl.username,
    password: dbUrl.password,
    database: dbUrl.pathname.slice(1)
  };
} else {
  // Local development
  dbConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  };
}

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

// Pool de conexiones MySQL con soporte para Railway
const pool = mysql.createPool({
  ...dbConfig,
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

// Test de ruta básica
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend funcionando correctamente' });
});

// Routes - Load safely
console.log('🚀 Cargando rutas...');

const loadRoute = (name, route) => {
  try {
    const handler = require(route)(pool);
    app.use(`/api/${name}`, handler);
    console.log(`✓ ${name}`);
  } catch (err) {
    console.warn(`⚠ ${name}: ${err.message}`);
  }
};

loadRoute('auth', './routes/auth');
loadRoute('contactos', './routes/contactos');
loadRoute('servicios', './routes/servicios');
loadRoute('servicios-detalle', './routes/servicios-detalle');
loadRoute('testimonios', './routes/testimonios');

console.log('✓ Rutas cargadas\n');

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
