## Responder a una Review (Recruiter/Admin)

POST /api/reviews/:id/reply

Permite a un recruiter aprobado (o admin) publicar o actualizar una respuesta oficial a una review aprobada y visible de su empresa.

Body JSON:
{
	"content": "Gracias por tu feedback, trabajaremos en ..." // 5-2000 caracteres
}

Restricciones / Validaciones:
- Auth requerida.
- userType == recruiter (recruiterInfo.status == approved y asociado a la misma company de la review) o userType == admin.
- La review debe estar moderationStatus=approved y isVisible=true.
- Si ya existe respuesta se actualiza (mantiene responder original) y se setea updatedAt.

Respuesta 200:
{
	"success": true,
	"message": "Respuesta registrada",
	"data": {
		"review": { ...reviewConRespuesta }
	}
}

Estructura recruiterResponse en objeto review:
{
	recruiterResponse: {
		responder: { _id, firstName, lastName, userType },
		content: string,
		createdAt: ISODate,
		updatedAt?: ISODate
	}
}

Notificación automática:
Al crear o actualizar la respuesta se genera Notification (type=review_reply) para el autor de la review (si existe y no es quien responde).

Modelo Notification simplificado:
{
	user: ObjectId(User),
	type: 'review_reply',
	review: ObjectId(Review),
	company: ObjectId(Company),
	message: 'Tu review recibió una respuesta del equipo de la empresa.',
	readAt?: Date,
	createdAt, updatedAt
}

---

## Analytics para Recruiters

GET /api/analytics/recruiter?range=30d&interval=week

Devuelve métricas agregadas de las reviews aprobadas y visibles asociadas a la empresa del recruiter autenticado. Si el usuario es admin puede pasar `companyId` explícito (query param obligatorio en ese caso). Un recruiter normal ignora cualquier `companyId` enviado y se usa el de su `recruiterInfo.companyId`.

Query Params:
- companyId (opcional para recruiter, requerido para admin) - ObjectId de la empresa.
- range (opcional) uno de: 7d,30d,90d,180d,365d (default 30d)
- interval (opcional) uno de: day,week,month (si no se envía se decide automáticamente según el rango)

Auth / Roles:
- Requiere JWT.
- userType: recruiter (aprobado y con companyId) o admin.

Respuesta 200:
```
{
	"success": true,
	"meta": {
		"companyId": "...",
		"range": "30d",
		"interval": "day|week|month",
		"generatedAt": "ISODate"
	},
	"metrics": {
		"totalReviews": 42,
		"avgRating": 4.12,
		"reviewsWithResponse": 10,
		"responseRate": 23.81,            // porcentaje (0-100)
		"ratingDistribution": {           // siempre claves 1..5
			"1": 2,
			"2": 3,
			"3": 7,
			"4": 15,
			"5": 15
		},
		"trend": [                        // Serie temporal agregada
			{ "date": "2024-05-01", "count": 3, "avgRating": 4.0 },
			{ "date": "2024-05-02", "count": 2, "avgRating": 3.5 }
		],
		"recent": [                       // Últimas 5 reviews aprobadas
			{ "id": "...", "overallRating": 4, "createdAt": "ISODate", "recruiterResponded": true }
		]
	}
}
```

Reglas / Notas:
- Solo cuenta reviews con `moderationStatus=approved` y `isVisible=true` dentro del rango temporal (`createdAt >= startRange`).
- `responseRate = (reviewsWithResponse / totalReviews) * 100`.
- Distribución de ratings garantiza siempre las claves 1..5 aunque haya 0.
- El intervalo elegido afecta el formato de `date` en `trend`:
	- day: YYYY-MM-DD
	- week: W<weekNumber>-<yearWeek> (ej: W23-2024) usando ISO week
	- month: YYYY-MM

Errores comunes:
- 400 si falta `companyId` en admin.
- 400 si recruiter no tiene `recruiterInfo.companyId`.
- 400 si `companyId` inválido.

