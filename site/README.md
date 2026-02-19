Instrucciones para añadir las imágenes que enviaste:

Coloca las imágenes adjuntas dentro de la carpeta `assets/` con estos nombres (o actualiza las referencias en `index.html` si prefieres otros nombres):

- `lis-logo.png`         -> logo principal para header
- `lis-logo-small.png`   -> logo pequeño para footer
- `hero-gif.gif`         -> GIF o imagen para la sección hero
- `knot.png`             -> nudo (opcional)
- `fleur.png`            -> flor de lis (opcional)

Si quieres, puedo subir las imágenes por ti o renombrarlas en el proyecto. Dime si quieres que las coloque con los nombres exactos. También puedo generar una versión optimizada de las imágenes (webp/avif) si lo deseas.

Nuevas páginas agregadas:
- `servicios.html` — lista de servicios expandida y filtros.
- `contacto.html` — formulario con acción a Formspree (reemplaza `YOUR_FORMSPREE_ID` por tu id real en la propiedad `action`).
- `quienes-somos.html` — página de identidad y área de protección del logo.

Formspree: para habilitar envío real del formulario crea una cuenta en Formspree, copia tu endpoint `https://formspree.io/f/YOUR_FORMSPREE_ID` y pégalo en el atributo `action` del formulario en `contacto.html`. Mantén `mailto:` como respaldo para abrir cliente de correo del usuario.