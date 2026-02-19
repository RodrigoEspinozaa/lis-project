# API Backend - LIS Liderazgo Integral en Sistemas

Backend con Node.js + Express + MySQL (Local).

## Instalación

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar MySQL Local

1. Descarga e instala MySQL desde https://dev.mysql.com/downloads/mysql/
2. Arranca el servicio MySQL
3. Por defecto: usuario=`root`, sin contraseña (o la que configuraste)

### 3. Configurar variables de entorno

```bash
cp .env.example .env
```

Edita `.env` con tus datos de MySQL:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password_mysql  (si no tienes contraseña, déjalo vacío)
DB_NAME=lis_db
JWT_SECRET=tu_secret_jwt
```

### 4. Crear tablas en la BD

**Opción A: Terminal/CLI**
```bash
mysql -u root -p < schema.sql
```
(Te pedirá la contraseña de MySQL, presiona Enter si no tienes)

**Opción B: MySQL Workbench**
1. Descarga: https://dev.mysql.com/downloads/workbench/
2. Conecta a `localhost:3306` (usuario: `root`)
3. Abre el archivo `schema.sql` y ejecuta (Ctrl+Enter)

### 5. Crear admin inicial

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"changeme123"}'
```

### 6. Ejecutar servidor

**Desarrollo (con watch):**
```bash
npm run dev
```

**Producción:**
```bash
npm start
```

El servidor estará en `http://localhost:3001`

## API Endpoints

### Autenticación
- `POST /api/auth/register` - Registrar admin
- `POST /api/auth/login` - Obtener token JWT
- `GET /api/auth/verify` - Verificar token

### Contactos
- `POST /api/contactos` - Crear contacto (público)
- `GET /api/contactos` - Listar (requiere auth)
- `DELETE /api/contactos/:id` - Eliminar (requiere auth)

### Servicios
- `GET /api/servicios` - Listar todos (público)
- `POST /api/servicios` - Crear (requiere auth)
- `PUT /api/servicios/:id` - Actualizar (requiere auth)
- `DELETE /api/servicios/:id` - Eliminar (requiere auth)

### Testimonios
- `GET /api/testimonios` - Listar todos (público)
- `POST /api/testimonios` - Crear (requiere auth)
- `PUT /api/testimonios/:id` - Actualizar (requiere auth)
- `DELETE /api/testimonios/:id` - Eliminar (requiere auth)

## Deploy

### Netlify Functions, Vercel o Heroku

```bash
# Variables de entorno en la plataforma (copy from .env)
# Deploy
git push
```
