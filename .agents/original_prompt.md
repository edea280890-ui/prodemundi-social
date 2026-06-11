## 2026-06-11T00:39:01Z

Aplicación web de "Prode Mundial 2026" para el próximo Mundial de Fútbol, en etapa avanzada y con objetivo de lanzamiento inmediato para producción. Su público objetivo son grupos de amigos, familias y equipos de trabajo, buscando rapidez, interfaz intuitiva e interactividad social.

Working directory: C:\Users\tini2\prodemundi-social
Integrity mode: development

## Requirements

### R1. Optimización de Concurrencia y Supabase Realtime
- Reemplazar el polling de cliente de 15 segundos en `app/dashboard/grupos/[id]/page.tsx` por una suscripción en tiempo real a Supabase (Realtime Channels) para evitar sobrecargas de base de datos bajo alta concurrencia.
- Implementar un disparador (trigger) en la base de datos de Supabase para la creación automática de perfiles desde `auth.users`, evitando inconsistencias por fallos en el cliente.

### R2. Aseguramiento de Calidad y Pruebas Automáticas
- Configurar un framework de pruebas unitarias (como Vitest o Jest) en el proyecto.
- Crear pruebas unitarias automatizadas para validar la lógica de cálculo de puntajes (exactos y aciertos) en los partidos finalizados.

### R3. Despliegue y Configuración de Entornos
- Configurar el flujo de compilación e integración continua en producción usando las variables de entorno de Supabase expuestas en `.env.local`.

## Acceptance Criteria

### Estabilidad y Rendimiento bajo Concurrencia
- [ ] No existen llamadas cíclicas por `setInterval` de consulta a base de datos en el cliente.
- [ ] Las puntuaciones se actualizan de forma inmediata cuando cambia la tabla de `group_scores`.

### Coherencia en Registro de Usuarios
- [ ] La creación de una cuenta nueva inserta automáticamente la fila en la tabla `profiles` desde la base de datos sin depender exclusivamente de llamadas fetch del frontend.

### Calidad de Código
- [ ] El comando `npm run build` compila con éxito y el comando `npm run lint` no arroja errores.
- [ ] Se cuenta con cobertura de pruebas unitarias para la función de asignación de puntos por pronóstico.
