# LIS - Liderazgo Integral en Sistemas

Réplica completa del sitio web LIS con backend, admin panel, y base de datos MySQL local.

## 📋 Requisitos Previos

- **MySQL** instalado localmente (https://dev.mysql.com/downloads/mysql/)
- **Node.js** v14+ (https://nodejs.org/)
- **npm** o **yarn** (incluido con Node.js)
- Un editor de texto (VS Code, etc.)

## 🚀 Inicio Rápido

### Paso 1: Configurar Base de Datos MySQL

```bash
# Crear base de datos
mysql -u root -p

# Dentro de MySQL:
CREATE DATABASE lis_db;
EXIT;

# Importar tablas
mysql -u root -p lis_db < api/schema.sql
```

### Paso 2: Configurar Backend

```bash
cd api

# Copiar variables de entorno
cp .env.example .env

# Editar .env con tus credenciales MySQL
# - DB_USER: tu usuario MySQL (default: root)
# - DB_PASSWORD: tu contraseña (dejar vacío si no tienes)

# Instalar dependencias
npm install

# Crear usuario admin
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"admin\",\"password\":\"changeme123\"}"

# Iniciar servidor
npm run dev
```

**✅ Servidor corriendo en:** `http://localhost:3001`

### Paso 3: Abrir Frontend

Opción A (archivo local):
```
c:\Users\rodri\OneDrive\Escritorio\LIS - LiderazgoIntegral en Sistemas\site\index.html
```

Opción B (servidor local):
```bash
cd site
npx http-server
# Abre http://localhost:8080
```

### Paso 4: Admin Panel

**URL:** `http://localhost:8080/admin/index.html`

**Login:**
- Usuario: `admin`
- Contraseña: `changeme123`

---

## 📁 Estructura del Proyecto

```
├── site/                    # Frontend (HTML + CSS + JS)
│   ├── index.html          # Página principal
│   ├── servicios.html      # Servicios
│   ├── contacto.html       # Contacto
│   ├── quienes-somos.html  # Acerca de
│   ├── admin/index.html    # Panel administrativo
│   ├── styles.css          # Estilos globales
│   ├── script.js           # Lógica frontend
│   └── assets/             # Imágenes optimizadas
│
├── api/                    # Backend (Node.js + Express)
│   ├── server.js           # Servidor Express
│   ├── routes/             # Endpoints API
│   ├── middleware/         # Auth JWT
│   ├── schema.sql          # Tablas MySQL
│   ├── .env.example        # Template variables
│   ├── package.json        # Dependencias
│   └── README.md           # Docs API
│
└── SETUP.md               # Guía de instalación completa
```

---

## 🔑 Funcionalidades

✅ **Frontend Responsivo**
- Landing page con hero section elegante
- Carrusel automático de testimonios
- Contadores animados con sufijos personalizados
- **Formulario de contacto integrado con API** (guarda en BD)
- **Sistema de notificaciones Toast** en tiempo real
- Validaciones mejoradas (email RFC, mín. caracteres, etc.)
- IntersectionObserver para animaciones lazy
- Imágenes optimizadas en WebP/AVIF
- Responsive design (mobile-first)

✅ **Admin Panel Avanzado**
- Autenticación segura con JWT
- **Editar servicios y testimonios** (no solo crear/eliminar)
- **Búsqueda/filtro en tiempo real** por cualquier campo
- Confirmación mejorada con modales antes de eliminar
- **Logout automático por inactividad** (30 minutos)
- Validaciones robustas en cliente
- Alertas visuales con colores por tipo (success, error, warning)
- Interfaz intuitiva con pestañas

✅ **Backend API Seguro**
- Endpoints RESTful con métodos HTTP correctos
- Autenticación JWT con tokens de 24 horas
- Conexión MySQL con pooling de 10 conexiones
- CORS configurado para desarrollo
- Validaciones en servidor
- Manejo de errores consistente
- Health check endpoint

✅ **Base de Datos Robusta**
- 4 tablas normalizadas: admins, contactos, servicios, testimonios
- Soft-delete con columna `estado` booleana
- Timestamps de creación y actualización en todas las tablas
- Índices en campos frecuentemente consultados
- Contraseñas hasheadas con bcrypt (salt: 10 rounds)

✅ **SEO & Marketing**
- JSON-LD Schema.org para rich snippets
- Sitemap.xml para indexación en buscadores
- robots.txt configurado correctamente
- Meta tags Open Graph (Facebook, LinkedIn)
- Meta tags Twitter Card
- Título y descripción meta optimizados
- Favicon en múltiples formatos

✅ **Seguridad & Performance**
- .htaccess con HTTPS redirect y security headers
- Compresión gzip de CSS/JS
- Caché de assets (1 año para imágenes, 1 mes para CSS/JS)
- Headers de seguridad: X-Frame-Options, X-Content-Type-Options, X-XSS-Protection
- Política de Referrer-Policy
- Validaciones en cliente Y servidor
- Contraseñas con requisitos mínimos
- Tokens JWT con expiración

---

## 📖 Documentación

- **[SETUP.md](SETUP.md)** - Guía completa de instalación y deploy
- **[api/README.md](api/README.md)** - Documentación de endpoints API
- **[api/schema.sql](api/schema.sql)** - Estructura de base de datos

---

## 🔧 Comandos Útiles

```bash
# Backend
cd api && npm run dev      # Desarrollo
npm start                  # Producción

# Frontend local
cd site && npx http-server

# MySQL
mysql -u root -p          # Conectar a MySQL
mysql -u root -p lis_db < api/schema.sql  # Importar schema
```

---

## 🌐 Variables de Entorno (.env)

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=lis_db
PORT=3001
JWT_SECRET=tu_secret_aqui
```

---

## 🚢 Deploy

### Frontend → Netlify
```
https://app.netlify.com/drop
Arrastra la carpeta 'site/'
```

### Backend → Render o Heroku
```
Conecta tu repo a GitHub
Configura variables de entorno
Deploy automático
```

---

## ❓ Troubleshooting

**MySQL no conecta:**
- Verifica que MySQL esté corriendo
- Windows: Abre Services → MySQL80 → Start
- Verifica usuario y contraseña en `.env`

**Puerto 3001 en uso:**
- Cambia `PORT=3001` a otro número en `.env`

**Módulos no encontrados:**
```bash
cd api && rm -rf node_modules && npm install
```

---

## 📞 Soporte

Para problemas o preguntas, revisa:
- `SETUP.md` para instalación
- `api/README.md` para endpoints
- Consola del navegador (F12) para errores frontend

---

**¡Tu plataforma LIS está lista para usar! 🎉**
