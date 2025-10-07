# API Reference

## Admin Endpoints

Todos requieren autenticación `Bearer <token>` y rol `admin`.

### GET /api/admin/stats
Devuelve métricas agregadas de la plataforma.

### Reviews Moderación

GET /api/admin/reviews
Query params opcionales:
- status: pending|approved|rejected
- rating: 1..5
- page, limit
- sortBy: createdAt|overallRating
- sortOrder: asc|desc

PATCH /api/admin/reviews/:id/moderate
Body:
```
{ "status": "approved" | "rejected", "reason?": "string (opcional, máx 500)" }
```

### Companies (Admin CRUD)

GET /api/admin/companies
Query params:
- page (default 1)
- limit (default 20)
- search (coincidencia en nombre/descripcion)
- industry
- verified: true|false

GET /api/admin/companies/:id

Notas sobre métricas dinámicas:
- `overallRating` y `totalReviews` en respuestas admin se calculan al vuelo a partir de reviews con `moderationStatus='approved'` e `isVisible=true`.
- Si no hay reviews aprobadas, `overallRating=0` y `totalReviews=0`.

POST /api/admin/companies (deshabilitado temporalmente)
Actualmente este endpoint retorna `410 Gone` con el mensaje `Company creation disabled temporarily` y no crea nuevas compañías.

PUT /api/admin/companies/:id
Body: cualquier subconjunto validado de los campos anteriores. Si cambia `name`, el `slug` se regenera automáticamente.

DELETE /api/admin/companies/:id
Elimina la compañía. (Nota: futuras mejoras podrían requerir verificación o soft-delete si hay reviews asociadas.)

### Reglas de Slug
El slug se genera a partir del `name` en pre-save:
- minúsculas
- espacios -> guiones
- caracteres inválidos eliminados
Si cambia el nombre y se guarda, el slug se recalcula.

## Códigos de Error Comunes
400 Validación fallida / nombre duplicado
400 Duplicate key (name/slug) => 'Duplicate key (name or slug) already exists'
401 Falta token o inválido
403 Sin permisos (rol no admin)
404 Recurso no encontrado
500 Error interno

## Futuras Extensiones (Pendiente)
- Gestión de usuarios (promover/bloquear)
- Soft delete y reasignación de reviews al borrar compañías
- Filtros adicionales (rango de rating, fecha creación)

