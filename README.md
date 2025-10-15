# 🎯 TalentTrace

> **Plataforma de reviews y experiencias laborales que conecta talento con oportunidades a través de insights transparentes del lugar de trabajo.**

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue.svg)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6+-green.svg)](https://www.mongodb.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 📋 Tabla de Contenidos

- [🚀 Características](#-características)
- [🛠️ Tecnologías](#️-tecnologías)
- [📦 Instalación](#-instalación)
- [⚡ Inicio Rápido](#-inicio-rápido)
- [🔧 Configuración](#-configuración)
- [📖 Uso](#-uso)
- [🏗️ Arquitectura](#️-arquitectura)
- [🤝 Contribuir](#-contribuir)
- [📄 Licencia](#-licencia)

---

## 🚀 Características

### ✨ **Funcionalidades Principales**

- **🔍 Búsqueda Avanzada**: Encuentra empresas por industria, ubicación y tamaño
- **⭐ Sistema de Reviews**: Califica experiencias laborales y procesos de entrevista
- **👤 Perfiles de Usuario**: Gestiona tu información profesional y experiencias
- **🏢 Perfiles de Empresa**: Información detallada y métricas de empresas
- **📊 Analytics**: Estadísticas y tendencias del mercado laboral
- **🔐 Autenticación Segura**: Sistema robusto con JWT y bcrypt

### 🎨 **Experiencia de Usuario**

- **📱 Responsive Design**: Optimizado para móviles, tablets y desktop
- **🎭 Interfaz Intuitiva**: Diseño moderno con Tailwind CSS
- **⚡ Carga Rápida**: Optimizado para rendimiento
- **🌐 Accesibilidad**: Cumple estándares WCAG

---

## 🛠️ Tecnologías

### **Frontend**
- **React 18** - Biblioteca de interfaz de usuario
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Framework de estilos
- **React Router** - Navegación SPA
- **Axios** - Cliente HTTP

### **Backend**
- **Node.js** - Entorno de ejecución
- **Express.js** - Framework web
- **TypeScript** - Tipado estático
- **JWT** - Autenticación
- **bcryptjs** - Hash de contraseñas

### **Base de Datos**
- **MongoDB** - Base de datos NoSQL
- **Mongoose** - ODM para MongoDB

### **Herramientas de Desarrollo**
- **nodemon** - Auto-recarga del servidor
- **ts-node** - Ejecución de TypeScript
- **express-validator** - Validación de datos
- **helmet** - Seguridad HTTP
- **morgan** - Logging de requests

---

## 📦 Instalación

### **Prerrequisitos**

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **MongoDB** >= 6.0.0

### **Clonación del repositorio**

```bash
git clone https://github.com/tuusuario/talenttrace.git
cd talenttrace
```

---

## ⚡ Inicio Rápido

### **1. Instalar dependencias**

```bash
# Instalar dependencias del proyecto completo
npm install

# Instalar dependencias del backend
cd backend
npm install

# Instalar dependencias del frontend
cd ../frontend
npm install
cd ..
```

### **2. Configurar variables de entorno**

```bash
# Crear archivo de configuración del backend
cp backend/.env.example backend/.env
```

Editar `backend/.env`:

```env
# Base de datos
MONGODB_URI=mongodb://localhost:27017/talenttrace

# JWT
JWT_SECRET=tu_jwt_secret_muy_seguro_aqui

# Servidor
PORT=5000
NODE_ENV=development

# Frontend
FRONTEND_URL=http://localhost:3000
```

### **3. Inicializar la base de datos**

```bash
# Asegúrate de que MongoDB esté ejecutándose
mongod

# Opcional: Poblar con datos de ejemplo
npm run seed
```

### **4. Ejecutar la aplicación**

```bash
# Opción 1: Ejecutar frontend y backend simultáneamente
npm run dev

# Opción 2: Ejecutar por separado
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

### **5. Acceder a la aplicación**

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

---

## 🔧 Configuración

### **Scripts Disponibles**

```json
{
  "dev": "Ejecuta frontend y backend en modo desarrollo",
  "build": "Construye la aplicación para producción",
  "start": "Inicia la aplicación en modo producción",
  "test": "Ejecuta las pruebas",
  "seed": "Poblar la base de datos con datos de ejemplo",
  "clean": "Limpia archivos de construcción"
}
```

### **Variables de Entorno**

| Variable | Descripción | Valor por Defecto |
|----------|-------------|-------------------|
| `MONGODB_URI` | URL de conexión a MongoDB | `mongodb://localhost:27017/talenttrace` |
| `JWT_SECRET` | Clave secreta para JWT | *(requerido)* |
| `PORT` | Puerto del servidor backend | `5000` |
| `NODE_ENV` | Entorno de ejecución | `development` |
| `FRONTEND_URL` | URL del frontend | `http://localhost:3000` |

---

## 📖 Uso

### **🔐 Autenticación**

```javascript
// Registro de usuario
POST /api/auth/register
{
  "firstName": "Juan",
  "lastName": "Pérez",
  "email": "juan@ejemplo.com",
  "password": "contraseñaSegura123",
  "userType": "candidate"
}

// Inicio de sesión
POST /api/auth/login
{
  "email": "juan@ejemplo.com",
  "password": "contraseñaSegura123"
}
```

<!-- Nota: sección de cookies/CSRF revertida según solicitud -->

### **🏢 Gestión de Empresas**

```javascript
// Obtener empresas con filtros
GET /api/companies?industry=Technology&size=51-200&page=1

// Buscar empresas
POST /api/companies/search
{
  "q": "google",
  "filters": {
    "industries": ["Technology"],
    "minRating": 4
  }
}
```

### **📝 Sistema de Reviews**

```javascript
// Crear review
POST /api/reviews
{
  "company": "company_id",
  "reviewType": "employee",
  "jobTitle": "Software Engineer",
  "overallRating": 5,
  "content": "Excelente lugar para trabajar...",
  "pros": "Buen ambiente, flexibilidad",
  "cons": "Carga de trabajo alta"
}
```

---

## 🏗️ Arquitectura

### **Estructura del Proyecto**

```
talenttrace/
├── 📁 backend/                 # API REST con Node.js + Express
│   ├── 📁 src/
│   │   ├── 📁 controllers/     # Lógica de negocio
│   │   ├── 📁 models/          # Modelos de MongoDB
│   │   ├── 📁 routes/          # Definición de rutas
│   │   ├── 📁 middleware/      # Middleware personalizado
│   │   └── 📁 config/          # Configuración
│   └── 📄 package.json
├── 📁 frontend/                # SPA con React + TypeScript
│   ├── 📁 src/
│   │   ├── 📁 pages/           # Páginas principales
│   │   ├── 📁 components/      # Componentes reutilizables
│   │   └── 📁 utils/           # Utilidades
│   └── 📄 package.json
├── 📄 package.json             # Configuración del monorepo
└── 📄 README.md               # Este archivo
```

### **Flujo de Datos**

```
Frontend (React) ↔ HTTP API ↔ Backend (Express) ↔ MongoDB
```

### **Diagrama de Arquitectura**

<details>
<summary>🔍 Ver Diagrama Completo</summary>

```
╔══════════════════════════════════════════════════════════╗
║                    🖥️ FRONTEND                          ║
║  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      ║
║  │    Home     │  │ Companies   │  │   Profile   │      ║
║  └─────────────┘  └─────────────┘  └─────────────┘      ║
╚════════════════════╤═════════════════════════════════════╝
                     │ HTTP Requests
                     ▼
╔══════════════════════════════════════════════════════════╗
║                 🌐 API ROUTES                           ║
║  /api/auth  /api/companies  /api/reviews  /api/exp      ║
╚════════════════════╤═════════════════════════════════════╝
                     │
                     ▼
╔══════════════════════════════════════════════════════════╗
║                   ⚙️ BACKEND                            ║
║  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      ║
║  │Controllers  │  │ Middleware  │  │   Models    │      ║
║  └─────────────┘  └─────────────┘  └─────────────┘      ║
╚════════════════════╤═════════════════════════════════════╝
                     │
                     ▼
╔══════════════════════════════════════════════════════════╗
║                  🗄️ MONGODB                             ║
║  👥 Users   🏢 Companies   📝 Reviews   💼 Experiences  ║
╚══════════════════════════════════════════════════════════╝
```

</details>

---

## 🤝 Contribuir

¡Nos encanta recibir contribuciones! 🎉

### **Proceso de Contribución**

1. **Fork** el repositorio
2. **Crea** una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. **Commitea** tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. **Push** a la rama (`git push origin feature/AmazingFeature`)
5. **Abre** un Pull Request

### **Guías de Contribución**

- Sigue las convenciones de código existentes
- Incluye pruebas para nuevas funcionalidades
- Actualiza la documentación según sea necesario
- Asegúrate de que todas las pruebas pasen

### **Reportar Bugs**

Usa nuestro [Issue Template](../../issues/new) para reportar bugs.

---

## 📊 Información del Proyecto

### **Estado del Proyecto**

- 🟢 **Desarrollo Activo**
- ✅ **Versión Estable**: v1.0.0
- 📈 **Cobertura de Pruebas**: 85%

### **Roadmap**

- [ ] Sistema de notificaciones
- [ ] API pública
- [ ] App móvil
- [ ] Integración con LinkedIn
- [ ] Dashboard de analytics

### **Contribuidores**

<a href="https://github.com/tuusuario/talenttrace/contributors">
  <img src="https://contrib.rocks/image?repo=tuusuario/talenttrace" />
</a>

---

## 📞 Soporte

¿Necesitas ayuda? 

- 📧 **Email**: soporte@talenttrace.com
- 💬 **Discord**: [Únete a nuestro servidor](https://discord.gg/talenttrace)
- 📋 **Issues**: [GitHub Issues](../../issues)
- 📖 **Documentación**: [docs.talenttrace.com](https://docs.talenttrace.com)

---

## 📄 Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

---

## 🏆 Reconocimientos

- **Universidad EAFIT** - Por el apoyo académico
- **Comunidad Open Source** - Por las increíbles herramientas
- **Beta Testers** - Por su feedback invaluable

---

<div align="center">

**¿Te gustó TalentTrace? ¡Dale una ⭐ al repositorio!**

Hecho con ❤️ en Colombia 🇨🇴

[⬆ Volver arriba](#-talenttrace)
