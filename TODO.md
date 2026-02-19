# TODO - Mejoras y Nuevas Funcionalidades para LIS

## Plan de Implementación

### Fase 1: Base de Datos y API (Backend) - ✅ COMPLETADO
- [x] 1.1 Agregar tabla `blog` al schema.sql
- [x] 1.2 Agregar tabla `newsletter` al schema.sql
- [x] 1.3 Agregar tabla `faq` al schema.sql
- [x] 1.4 Agregar tabla `equipo` al schema.sql
- [x] 1.5 Agregar tabla `recursos` al schema.sql
- [x] 1.6 Agregar tabla `cotizaciones` al schema.sql
- [x] 1.7 Crear rutas API para blog
- [x] 1.8 Crear rutas API para newsletter
- [x] 1.9 Crear rutas API para faq
- [x] 1.10 Crear rutas API para equipo
- [x] 1.11 Crear rutas API para recursos
- [x] 1.12 Crear rutas API para cotizaciones
- [x] 1.13 Actualizar server.js con nuevas rutas

### Fase 2: Frontend - Páginas y Componentes - ✅ PARCIALMENTE COMPLETADO
- [x] 2.1 Crear blog.html - Página principal del blog
- [ ] 2.2 Crear blog-detalle.html - Página individual de artículo
- [ ] 2.3 Actualizar servicios.html - Agregar enlaces a páginas de detalle
- [ ] 2.4 Crear servicio-detalle.html - Template para cada servicio
- [x] 2.5 Crear faq.html - Página de preguntas frecuentes
- [ ] 2.6 Actualizar quienes-somos.html - Agregar sección de equipo
- [x] 2.7 Crear recursos.html - Página de descargas
- [x] 2.8 Crear cotizacion.html - Página de solicitud de cotización
- [ ] 2.9 Actualizar contacto.html - Agregar Google Maps

### Fase 3: Funcionalidades JS - ✅ PARCIALMENTE COMPLETADO
- [x] 3.1 Blog integrado con API
- [x] 3.2 Formulario de newsletter integrado con API
- [x] 3.3 Sistema de cotización integrado con API
- [ ] 3.4 Agregar chat en vivo (Tawk.to o similar)

### Fase 4: Multiidioma - ❌ PENDIENTE
- [ ] 4.1 Crear versiones en inglés de todas las páginas
- [ ] 4.2 Crear sistema de cambio de idioma

### Fase 5: Analytics y SEO - ✅ PARCIALMENTE COMPLETADO
- [x] 5.1 Google Analytics agregado a index.html (comentado, listo para usar)
- [ ] 5.2 Agregar a otras páginas

### Fase 6: Admin Panel - ❌ PENDIENTE
- [ ] 6.1 Agregar gestión de blog en admin
- [ ] 6.2 Agregar gestión de newsletter en admin
- [ ] 6.3 Agregar gestión de FAQ en admin
- [ ] 6.4 Agregar gestión de equipo en admin
- [ ] 6.5 Agregar gestión de recursos en admin
- [ ] 6.6 Agregar gestión de cotizaciones en admin

## Resumen de Lo Implementado

### Backend (Completado):
- api/schema.sql - Nuevas tablas: blog, newsletter, faq, equipo, recursos, cotizaciones
- api/routes/blog.js - API completa para blog
- api/routes/newsletter.js - API para suscripciones
- api/routes/faq.js - API para preguntas frecuentes
- api/routes/equipo.js - API para equipo de trabajo
- api/routes/recursos.js - API para recursos descargables
- api/routes/cotizaciones.js - API para solicitudes de cotización
- api/server.js - Rutas nuevas integradas

### Frontend (Creado):
- site/blog.html - Página del blog con integración API
- site/faq.html - Página de FAQ con integración API
- site/recursos.html - Página de recursos con integración API
- site/cotizacion.html - Formulario de cotización con integración API
- site/index.html - Actualizado con código de Google Analytics

### Pendiente:
- Google Maps en página de contacto
- Chat en vivo (Tawk.to)
- Versiones en inglés
- Gestión en admin panel
- Detalle de artículos del blog
- Detalle de servicios

## Notas
- Orden de implementación: Primero backend/DB, luego frontend,，最后 admin
- Usar tecnologías existentes del proyecto
- Mantener consistencia con el diseño actual
- Priorizar funcionalidades más importantes

## Archivos a crear:
- site/blog.html
- site/blog-detalle.html
- site/servicio-detalle.html
- site/faq.html
- site/recursos.html
- site/cotizacion.html
- site/en/ (carpeta para inglés)
  - index.html
  - servicios.html
  - blog.html
  - etc.

## Archivos a modificar:
- api/schema.sql
- api/server.js (nuevas rutas)
- site/script.js
- site/styles.css
- site/index.html
- site/servicios.html
- site/contacto.html
- site/quienes-somos.html
- site/admin/index.html
- Todas las páginas para Google Analytics

## Rutas API nuevas:
- /api/blog (GET, POST, PUT, DELETE)
- /api/newsletter (POST, GET)
- /api/faq (GET, POST, PUT, DELETE)
- /api/equipo (GET, POST, PUT, DELETE)
- /api/recursos (GET, POST, PUT, DELETE)
- /api/cotizaciones (POST, GET, PUT)
