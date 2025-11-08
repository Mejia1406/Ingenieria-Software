## Documentación del proyecto TalentTrace (Ingenieria-Software)

Versión del documento: 1.0
Fecha: 2025-11-08

---

Resumen rápido
---------------
Este repositorio contiene una aplicación fullstack llamada "TalentTrace": una SPA en React + TypeScript (frontend) que consume una API REST en Node.js + Express escrita en TypeScript (backend). La persistencia es MongoDB (Mongoose). También hay soporte opcional para integraciones de IA (OpenAI o Hugging Face) en el backend.

Objetivo de este documento
- Explicar qué usa el proyecto (librerías, herramientas y versiones principales).
- Indicar cómo usarlo en desarrollo y producción (scripts y variables de entorno).
- Describir estructura del repo y puntos importantes (endpoints, despliegue y archivos clave).

Stack principal
--------------
- Frontend: React (Create React App) con TypeScript, Tailwind CSS.
- Backend: Node.js + Express en TypeScript.
- Base de datos: MongoDB con Mongoose (ODM).
- Autenticación: JWT + bcryptjs.
- Despliegue: configuración de encabezados y rewrites en `vercel.json` (front está preparado para Vercel); el backend es una aplicación Express tradicional (puede desplegarse en Vercel Serverless, un VPS, Heroku, Railway, Render, o como contenedor).

Dependencias y herramientas importantes
-------------------------------------
Los datos se obtuvieron de los `package.json` en la raíz y en `backend/` y `frontend/`.

1) Raíz (monorepo scripts)
- `concurrently` (dev workflows)
- `rimraf`, `serve`

2) Backend (`backend/package.json`) — dependencias claves
- express ^4.21
- mongoose ^8.17
- dotenv ^17.2
- helmet ^8.1
- morgan ^1.10
- cors ^2.8
- jsonwebtoken ^9.0
- bcryptjs ^3.0
- express-validator ^7.2
- express-rate-limit ^8.0
- groq-sdk (posible uso con CMS/Headless)

Dev dependencies backend
- typescript, ts-node, nodemon, dotenv-cli, @types/* para Node/Express/etc

3) Frontend (`frontend/package.json`) — dependencias claves
- react ^19.x (notas: package.json muestra 19.1.1)
- react-dom
- react-router-dom
- axios
- react-hot-toast
- gsap, motion (animaciones)
- tailwindcss (devDependency)

Estructura del repositorio (alta nivel)
-------------------------------------
`/` (raíz)
- `package.json` - scripts monorepo y utilidades.
- `vercel.json` - encabezados y rewrites para hosting estático (frontend).
- `README.md` - guía general del proyecto.

`/backend`
- `src/app.ts` - configura Express: middlewares (helmet, cors, morgan), rutas y endpoints principales.
- `src/server.ts` - arranque: carga .env, conecta a MongoDB (`config/database.ts`) y ejecuta `ensureAdmin` para crear admin si hace falta.
- `src/config/database.ts` - módulo de conexión con mongoose, reintentos y estado (`getDbState`).
- `controllers/`, `models/`, `routes/`, `middleware/` - lógica del negocio.
- `AI_README.md` - instrucciones sobre integración OpenAI / Hugging Face.

`/frontend`
- Aplicación CRA en `src/` con páginas, componentes y services.

Despliegue y `vercel.json`
-------------------------
- `vercel.json` contiene reglas de cache y un rewrite que apunta todo a `/index.html` — típico para SPAs servidas desde Vercel.
- Observación: el backend es una app Express estándar (no empaquetada por defecto para Vercel Serverless). Para desplegar en Vercel como funciones serverless habría que adaptar o usar una carpeta `api/` con handlers o desplegar el backend en un servicio que soporte Node/Express (Railway, Render, Heroku, Docker en un VPS, AWS Elastic Beanstalk, DigitalOcean App Platform, etc.).

Scripts útiles (monorepo)
-------------------------
- `npm run dev` (desde raíz) — usa `concurrently` para ejecutar backend (`npm run dev` en `backend`) y frontend (`npm start` en `frontend`).
- `npm run build` — compila backend (tsc) y frontend (react build).
- `npm run clean` — limpia build y node_modules (usa `rimraf`).

Variables de entorno (mínimo necesario)
-------------------------------------
- MONGODB_URI - URI de conexión a MongoDB (ej.: mongodb://...)
- JWT_SECRET - secreto para firmar tokens JWT
- PORT - puerto de backend (por defecto 5000)
- NODE_ENV - development | production
- FRONTEND_URL - URL de la app cliente (ej.: https://miapp.com)
- AI_PROVIDER - 'openai' (default) o 'huggingface'
- OPENAI_API_KEY / HF_API_KEY - claves del proveedor de IA
- HF_MODEL - ID del modelo en Hugging Face (si aplica)

Endpoints principales (resumen)
-------------------------------
- `GET /api` - descripción básica de la API (definida en `app.ts`).
- `GET /api/health` - health check simple.
- `GET /api/health/full` - health con estado de BD (expuesto desde `server.ts`).
- Rutas REST agrupadas por `routes/*`: `/api/auth`, `/api/companies`, `/api/experiences`, `/api/reviews`, `/api/admin`, `/api/analytics`, `/api/notifications`, `/api/blog`, `/api/chatbot`, `/api/forum`.

Notas técnicas y observaciones
----------------------------
- El backend implementa rate limiting (express-rate-limit), helmet y CORS configurado para `FRONTEND_URL`.
- `database.ts` tiene reintentos con backoff simple y listeners para mostrar estado de Mongo.
- `ensureAdmin` corre en arranque para garantizar usuario admin (útil para ambientes de primera vez).
- Se utiliza `groq-sdk`
