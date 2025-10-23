Uso de proveedores alternos de IA

Este proyecto tiene soporte por defecto para OpenAI y una opción para usar la Hugging Face Inference API.

Variables de entorno (añadir a `backend/.env`):

- AI_PROVIDER: 'openai' (por defecto) o 'huggingface'
- OPENAI_API_KEY: (si usas OpenAI)
- HF_API_KEY: tu token de Hugging Face (si usas Hugging Face)
- HF_MODEL: id del modelo en Hugging Face. Por ejemplo: 'gpt2' o un modelo conversacional publicado. Si no se especifica, usa 'gpt2'.

Usar Hugging Face (rápido, plan gratuito disponible)

1) Crear cuenta en https://huggingface.co/
2) Ir a Settings -> Access Tokens -> New token -> copia el token (rol: `read` o `inference`).
3) En `backend/.env` agrega:

HF_API_KEY=tu_token_aqui
AI_PROVIDER=huggingface
HF_MODEL=eleccion_del_modelo

Recomendaciones de modelos gratuitos para pruebas:
- "gpt2" — muy pequeño, útil para pruebas pero calidad limitada.
- Modelos comunitarios más grandes: e.g., "tiiuae/falcon-7b-instruct" (puede estar restringido o requerir pago), "bahdshah/llama-2-7b-chat" (verifica licencia y disponibilidad).

Notas sobre el plan gratuito:
- Hugging Face ofrece llamadas limitadas en su plan gratuito. Los modelos hospedados por la comunidad pueden tener límite de uso o colas largas.
- Para uso en producción con carga real, se recomienda revisar los límites o desplegar un modelo local.

Cómo funciona la integración en el código:
- `backend/src/controllers/aiController.ts` lee `AI_PROVIDER`.
  - Si `AI_PROVIDER=huggingface`, el backend llama a `https://api-inference.huggingface.co/models/{HF_MODEL}` con el prompt construido a partir de los mensajes.
  - Si `AI_PROVIDER=openai` (default), se usa la ruta OpenAI actual.

Limitaciones y siguientes pasos:
- El adaptador actual convierte la conversación en un prompt plano (User/Assistant: texto). Para modelos conversacionales nativos (p. ej. que acepten formato chat), se podría adaptar el body según el formato del modelo elegido.
- Puedo añadir soporte para reintentos, streaming y modelos conversacionales específicos si quieres.

Si quieres que implemente esto y haga un test end-to-end usando una clave HF (tú la pones en `.env`), puedo probarlo por ti y ajustar la extracción de respuestas según el modelo elegido.