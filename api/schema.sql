-- Script para crear las tablas en PlanetScale MySQL

-- Tabla de administradores
CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_username (username)
);

-- Tabla de contactos
CREATE TABLE IF NOT EXISTS contactos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  mensaje TEXT NOT NULL,
  leido BOOLEAN DEFAULT FALSE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_fecha (fecha_creacion)
);

-- Tabla de servicios
CREATE TABLE IF NOT EXISTS servicios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT NOT NULL,
  orden INT DEFAULT 0,
  estado BOOLEAN DEFAULT TRUE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_estado (estado)
);

-- Tabla de testimonios
CREATE TABLE IF NOT EXISTS testimonios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  cargo VARCHAR(255),
  empresa VARCHAR(255),
  testimonio TEXT NOT NULL,
  avatar_url VARCHAR(500),
  estado BOOLEAN DEFAULT TRUE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_estado (estado)
);

-- ===== NUEVAS TABLAS =====

-- Tabla de servicios con detalles dinámicos
CREATE TABLE IF NOT EXISTS servicios_detalle (
  id INT AUTO_INCREMENT PRIMARY KEY,
  servicio_id INT NOT NULL,
  contenido_largo TEXT NOT NULL,
  beneficios TEXT NOT NULL,
  precio DECIMAL(10,2),
  duracion VARCHAR(100),
  slug VARCHAR(255) UNIQUE,
  estado BOOLEAN DEFAULT TRUE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (servicio_id) REFERENCES servicios(id) ON DELETE CASCADE,
  INDEX idx_slug (slug)
);

-- Tabla de casos de éxito / Portfolio
CREATE TABLE IF NOT EXISTS casos_exito (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT NOT NULL,
  cliente VARCHAR(255) NOT NULL,
  logo_url VARCHAR(500),
  imagen_url VARCHAR(500),
  resultados TEXT,
  testimonio_id INT,
  estado BOOLEAN DEFAULT TRUE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (testimonio_id) REFERENCES testimonios(id) ON DELETE SET NULL,
  INDEX idx_estado (estado)
);

-- Tabla de tickets / Seguimiento
CREATE TABLE IF NOT EXISTS tickets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  contacto_id INT NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT NOT NULL,
  estado ENUM('abierto', 'en_progreso', 'cerrado') DEFAULT 'abierto',
  prioridad ENUM('baja', 'media', 'alta') DEFAULT 'media',
  servicio_id INT,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  fecha_cierre TIMESTAMP NULL,
  FOREIGN KEY (contacto_id) REFERENCES contactos(id) ON DELETE CASCADE,
  FOREIGN KEY (servicio_id) REFERENCES servicios(id) ON DELETE SET NULL,
  INDEX idx_estado (estado),
  INDEX idx_prioridad (prioridad)
);

-- Tabla de contenidos para CMS
CREATE TABLE IF NOT EXISTS contenidos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  clave VARCHAR(255) UNIQUE NOT NULL,
  titulo VARCHAR(255),
  contenido TEXT NOT NULL,
  tipo ENUM('texto', 'html', 'json') DEFAULT 'texto',
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_clave (clave)
);

-- Tabla de planes y precios
CREATE TABLE IF NOT EXISTS planes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  precio DECIMAL(10,2) NOT NULL,
  moneda VARCHAR(10) DEFAULT 'MXN',
  features TEXT NOT NULL,
  orden INT DEFAULT 0,
  es_popular BOOLEAN DEFAULT FALSE,
  estado BOOLEAN DEFAULT TRUE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_estado (estado)
);

-- Tabla de logs de email
CREATE TABLE IF NOT EXISTS email_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  destinatario VARCHAR(255) NOT NULL,
  asunto VARCHAR(255) NOT NULL,
  tipo ENUM('contacto', 'confirmacion', 'notificacion') DEFAULT 'contacto',
  estado ENUM('enviado', 'pendiente', 'fallido') DEFAULT 'pendiente',
  error_mensaje TEXT,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_envio TIMESTAMP NULL,
  INDEX idx_estado (estado),
  INDEX idx_fecha (fecha_creacion)
);

-- Tabla de logs para rate limiting
CREATE TABLE IF NOT EXISTS contacto_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ip_address VARCHAR(45) NOT NULL,
  email VARCHAR(255),
  intentos INT DEFAULT 1,
  bloqueado BOOLEAN DEFAULT FALSE,
  fecha_primer_intento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_ultimo_intento TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  fecha_desbloqueo TIMESTAMP NULL,
  INDEX idx_ip (ip_address),
  INDEX idx_email (email)
);

-- Tabla de códigos 2FA
CREATE TABLE IF NOT EXISTS two_fa (
  id INT AUTO_INCREMENT PRIMARY KEY,
  admin_id INT NOT NULL,
  codigo VARCHAR(6) NOT NULL,
  tipo ENUM('email', 'authenticator') DEFAULT 'email',
  activo BOOLEAN DEFAULT TRUE,
  secret VARCHAR(255),
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_expiracion TIMESTAMP,
  fecha_verificacion TIMESTAMP NULL,
  FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE,
  INDEX idx_admin (admin_id)
);

-- Tabla de traducciones (multi-idioma)
CREATE TABLE IF NOT EXISTS traducciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  idioma VARCHAR(10) NOT NULL,
  clave VARCHAR(255) NOT NULL,
  valor TEXT NOT NULL,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_idioma_clave (idioma, clave),
  INDEX idx_idioma (idioma)
);

-- Tabla de configuración
CREATE TABLE IF NOT EXISTS configuracion (
  id INT AUTO_INCREMENT PRIMARY KEY,
  clave VARCHAR(255) UNIQUE NOT NULL,
  valor TEXT,
  tipo ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
  descripcion TEXT,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ===== NUEVAS TABLAS PARA MEJORAS =====

-- Tabla de Blog
CREATE TABLE IF NOT EXISTS blog (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  resumen TEXT NOT NULL,
  contenido TEXT NOT NULL,
  imagen_url VARCHAR(500),
  autor VARCHAR(255),
  categoria VARCHAR(100),
  etiquetas TEXT,
  fecha_publicacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  estado BOOLEAN DEFAULT TRUE,
  vistas INT DEFAULT 0,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_slug (slug),
  INDEX idx_categoria (categoria),
  INDEX idx_estado (estado),
  INDEX idx_fecha (fecha_publicacion)
);

-- Tabla de Suscriptores Newsletter
CREATE TABLE IF NOT EXISTS newsletter (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  nombre VARCHAR(255),
  activo BOOLEAN DEFAULT TRUE,
  fuente VARCHAR(100) DEFAULT 'web',
  fecha_suscripcion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_baja TIMESTAMP NULL,
  INDEX idx_email (email),
  INDEX idx_activo (activo)
);

-- Tabla de Preguntas Frecuentes (FAQ)
CREATE TABLE IF NOT EXISTS faq (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pregunta VARCHAR(500) NOT NULL,
  respuesta TEXT NOT NULL,
  categoria VARCHAR(100),
  orden INT DEFAULT 0,
  estado BOOLEAN DEFAULT TRUE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_categoria (categoria),
  INDEX idx_orden (orden),
  INDEX idx_estado (estado)
);

-- Tabla de Equipo/Consultores
CREATE TABLE IF NOT EXISTS equipo (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  cargo VARCHAR(255) NOT NULL,
  bio TEXT,
  foto_url VARCHAR(500),
  LinkedIn VARCHAR(500),
  email VARCHAR(255),
  orden INT DEFAULT 0,
  estado BOOLEAN DEFAULT TRUE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_orden (orden),
  INDEX idx_estado (estado)
);

-- Tabla de Recursos Descargables
CREATE TABLE IF NOT EXISTS recursos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  tipo ENUM('pdf', 'guia', 'whitepaper', 'plantilla', 'ebook', 'otro') DEFAULT 'pdf',
  archivo_url VARCHAR(500) NOT NULL,
  imagen_url VARCHAR(500),
  categoria VARCHAR(100),
  orden INT DEFAULT 0,
  estado BOOLEAN DEFAULT TRUE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_tipo (tipo),
  INDEX idx_categoria (categoria),
  INDEX idx_orden (orden),
  INDEX idx_estado (estado)
);

-- Tabla de Cotizaciones/Solicitudes
CREATE TABLE IF NOT EXISTS cotizaciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  empresa VARCHAR(255),
  email VARCHAR(255) NOT NULL,
  telefono VARCHAR(50),
  servicio_id INT,
  mensaje TEXT,
  presupuesto VARCHAR(100),
  estado ENUM('nueva', 'contactada', 'en_proceso', 'cotizada', 'aceptada', 'rechazada') DEFAULT 'nueva',
  notas_admin TEXT,
  fecha_contacto TIMESTAMP NULL,
  fecha_cierre TIMESTAMP NULL,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (servicio_id) REFERENCES servicios(id) ON DELETE SET NULL,
  INDEX idx_email (email),
  INDEX idx_estado (estado),
  INDEX idx_fecha (fecha_creacion)
);

-- Tabla de Testimonios en Video
CREATE TABLE IF NOT EXISTS testimonios_video (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  cargo VARCHAR(255),
  empresa VARCHAR(255),
  video_url VARCHAR(500) NOT NULL,
  thumbnail_url VARCHAR(500),
  duracion INT,
  estado BOOLEAN DEFAULT TRUE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_estado (estado)
);
