<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Reglas de Imágenes para los Agentes
- **Eliminación de fondos cuadriculados:** Para cualquier imagen que sea agregada, modificada o actualizada en la carpeta `public/` (como logos, escudos o imágenes de jugadores), es obligatorio quitar el fondo cuadriculado (falso patrón de cuadrícula de transparencia gris/blanca) y asegurar que tenga un canal alfa transparente real.

