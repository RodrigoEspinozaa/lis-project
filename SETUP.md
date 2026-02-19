# 🚀 Setup LIS - Backend + Frontend + Admin

[![Status](https://img.shields.io/badge/status-ready-brightgreen)]()

## Estructura del Proyecto

```
LIS - LiderazgoIntegral en Sistemas/
├── site/                    # Frontend (HTML + CSS + JS puro)
│   ├── index.html
│   ├── servicios.html
│   ├── contacto.html
│   ├── quienes-somos.html
│   ├── styles.css
│   ├── script.js
│   ├── assets/              # Imágenes (PNG, WebP, AVIF)
│   └── admin/
│       └── index.html       # Panel administrativo
│
└── api/                     # Backend (Node.js + Express)
    ├── server.js            # Servidor principal
    ├── package.json
    ├── .env.example         # Variables de entorno (copiar y editar)
    ├── schema.sql           # Script para crear tablas
    ├── middleware/
    │   └── auth.js          # Autenticación JWT
    └── routes/
        ├── auth.js
        ├── contactos.js
        ├── servicios.js
        └── testimonios.js
```

## Paso 1: Configurar Base de Datos (MySQL Local)

### 1.1 Instalar MySQL

**Windows:**
1. Descarga desde https://dev.mysql.com/downloads/mysql/
2. Ejecuta el instalador
3. Selecciona "Setup Type: Developer Default"
4. Puerto: **3306** (por defecto)
5. Usuario: **root** (por defecto, opcionalmente con contraseña)
6. Finaliza instalación y verifica que MySQL esté corriendo

**macOS:**
```bash
brew install mysql
brew services start mysql
mysql_secure_installation  # Opcional
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get install mysql-server
sudo mysql_secure_installation  # Opcional
```

### 1.2 Crear base de datos

```bash
mysql -u root -p
```
(Presiona Enter si no tienes contraseña, o ingresa tu password de MySQL)

Dentro de MySQL, ejecuta:
```sql
CREATE DATABASE lis_db;
EXIT;
```

### 1.3 Crear tablas

Desde tu terminal, navega al proyecto e importa el schema:

```bash
cd "tu_ruta\LIS - LiderazgoIntegral en Sistemas"
mysql -u root -p lis_db < api/schema.sql
```

(Si no tienes contraseña, omite el `-p`)

## Paso 2: Configurar Backend

### 2.1 Instalar dependencias
```bash
cd api
npm install
```

### 2.2 Configurar variables de entorno
```bash
cp .env.example .env
```

Edita `.env` con tus datos locales de MySQL:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=lis_db
PORT=3001
JWT_SECRET=tu_secret_super_secreto_aqui_cambialo
ADMIN_USER=admin
ADMIN_PASSWORD=changeme123
```

**Notas:**
- Si tu usuario MySQL no es "root", cámbialo
- Si MySQL tiene contraseña, ingresa en `DB_PASSWORD`
- Si no tienes contraseña, deja `DB_PASSWORD=` vacío

### 2.3 Crear admin inicial
```bash
# En PowerShell/terminal
cd api

# Crear un usuario admin (reemplaza con tus datos)
curl -X POST http://localhost:3001/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{"username":"admin","password":"tu_password_aqui"}'
```

### 2.4 Ejecutar servidor
```bash
# Desarrollo (con auto-reload)
npm run dev

# O producción
npm start
```

✅ Servidor corriendo en: `http://localhost:3001`

## Paso 3: Usar Panel Admin

### 3.1 Acceder
- Abre el navegador: `http://localhost:3001/../site/admin/index.html` 
- O abre directamente el archivo `site/admin/index.html`
- Inicia sesión con tus credenciales admin (usuario y password del paso 2.3)

### 3.2 Funciones disponibles
- **Contactos**: Ver y eliminar contactos del formulario
- **Servicios**: Crear, editar, eliminar servicios
- **Testimonios**: Crear, editar, eliminar testimonios

## Paso 4: Actualizar Frontend para usar API

En `site/script.js`, reemplaza:
```javascript
// Cambiar de mailto a API
// El formulario ya está listo para enviar a: POST /api/contactos
```

Ahora el formulario enviará contactos a la BD automáticamente si cambias el `action` del form en `contacto.html`:
```html
<form class="contact-form" id="contact-form" method="POST" action="http://localhost:3001/api/contactos">
```

## Paso 5: Deploy (Producción)

### Deploy Backend

**Opción: Render.com (recomendado, gratis)**
1. Ve a https://render.com
2. Crea un nuevo "Web Service"
3. Conecta tu repo GitHub
4. Configura env vars (igual que en `.env`)
5. Deploy automático

**Opción: Heroku**
```bash
heroku login
heroku create lis-api
git push heroku main
```

### Deploy Frontend

**Opción: Netlify (recomendado, gratis)**
1. Ve a https://netlify.com
2. Arrastra la carpeta `site` 
3. Deploy instantáneo

**Opción: Vercel**
```bash
npm i -g vercel
vercel --prod
```

## Endpoints API

### Autenticación
```
POST   /api/auth/register      - Registrar admin
POST   /api/auth/login         - Login (obtiene JWT token)
GET    /api/auth/verify        - Verificar token activo
```

### Contactos (públicos)
```
POST   /api/contactos          - Crear contacto (sin auth)
GET    /api/contactos          - Listar (requiere token admin)
DELETE /api/contactos/:id      - Eliminar (requiere token admin)
```

### Servicios
```
GET    /api/servicios          - Listar (público)
POST   /api/servicios          - Crear (requiere token)
PUT    /api/servicios/:id      - Actualizar (requiere token)
DELETE /api/servicios/:id      - Eliminar (requiere token)
```

### Testimonios
```
GET    /api/testimonios        - Listar (público)
POST   /api/testimonios        - Crear (requiere token)
PUT    /api/testimonios/:id    - Actualizar (requiere token)
DELETE /api/testimonios/:id    - Eliminar (requiere token)
```

## Troubleshooting

**Error: "Cannot find module"**
```bash
rm -rf node_modules
npm install
```

## Troubleshooting

**Error: "Cannot find module"**
```bash
cd api
npm install
```

**Error: "Access denied for user 'root'@'localhost'"**
- Verifica que `DB_PASSWORD` en `.env` sea correcto
- O ejecuta: `mysql -u root -p` manualmente para verificar la contraseña

**Error: "Unknown database 'lis_db'"**
```bash
mysql -u root -p < api/schema.sql
```

**Error: "Connection refused"**
- Verifica que MySQL esté corriendo:
  - **Windows**: Services → MySQL80 → Iniciar
  - **macOS**: `brew services list`
  - **Linux**: `sudo systemctl status mysql`
- Verifica que el servidor Node esté corriendo: `npm run dev`

**Error: "CORS"**
- Ya está habilitado en `server.js`
- Si persiste, verifica el `origin` en `cors()` del código

## Support

📧 Email: info-consultoria@lis-consultoria.com
📱 WhatsApp: +52 921 119 3929
