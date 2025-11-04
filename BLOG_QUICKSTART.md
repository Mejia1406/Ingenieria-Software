# 🚀 Quick Start - Blog & SEO

## 📦 Instalación Rápida

```bash
# 1. Backend
cd backend
npm install
npm run dev

# 2. Frontend (nueva terminal)
cd frontend
npm install
npm start
```

## ✅ Verificar Instalación

1. **Backend**: http://localhost:5000
2. **Frontend**: http://localhost:3000
3. **Blog**: http://localhost:3000/blog

## 📝 Crear Primer Artículo

### Opción 1: Datos de Prueba (Recomendado)

```bash
cd backend
npm run seed:blog
```

Esto creará 3 artículos de ejemplo automáticamente.

### Opción 2: Manual

1. Inicia sesión como admin
2. Ve a http://localhost:3000/admin/blog
3. Click "Nuevo Artículo"
4. Llena el formulario
5. Click "Crear Artículo"

## 🔍 Verificar SEO

### En el navegador:
1. Abre http://localhost:3000/blog
2. Click derecho → Inspeccionar (F12)
3. Ve a Elements → `<head>`
4. Busca:
   - `<title>`
   - `<meta name="description">`
   - `<script type="application/ld+json">` (Schema.org)

### Herramientas Online:

**Google Rich Results Test:**
```
https://search.google.com/test/rich-results
```

**Facebook Debugger:**
```
https://developers.facebook.com/tools/debug/
```

**Lighthouse (Chrome DevTools):**
```
F12 → Lighthouse → Generate Report
```

## 📚 Documentación Completa

Para guía detallada de SEO, ver:
```
docs/SEO_GUIDE.md
```

## ⚡ Comandos Útiles

```bash
# Backend
npm run dev          # Modo desarrollo
npm run build        # Compilar TypeScript
npm start            # Producción

# Frontend  
npm start            # Modo desarrollo
npm run build        # Build para producción
npm test             # Ejecutar tests
```

## 🎯 Endpoints API del Blog

```
GET    /api/blog                      # Listar posts
GET    /api/blog/slug/:slug           # Post por slug
GET    /api/blog/categories           # Categorías
GET    /api/blog/tags                 # Tags populares
POST   /api/blog                      # Crear (admin)
PUT    /api/blog/:id                  # Actualizar (admin)
DELETE /api/blog/:id                  # Eliminar (admin)
```

## 🆘 Problemas Comunes

### Error: "Cannot find module"
```bash
rm -rf node_modules package-lock.json
npm install
```

### Puerto 3000 ocupado
```bash
# Cambia el puerto en package.json o:
PORT=3001 npm start
```

### MongoDB no conecta
Verifica que MongoDB esté corriendo:
```bash
mongod
# O usa MongoDB Atlas (cloud)
```

## 📞 Soporte

Si tienes problemas, revisa:
1. `docs/SEO_GUIDE.md` - Guía completa
2. `backend/AI_README.md` - Documentación backend
3. `README.md` - Documentación general

---

¡Listo! Tu blog con SEO está funcionando 🎉
