# 🔍 Cómo Indexar TalentTrace en Google

## 1. Registrar el Sitio en Google Search Console

### Paso 1: Acceder a Google Search Console
1. Ve a: https://search.google.com/search-console
2. Inicia sesión con tu cuenta de Google
3. Haz clic en **"Agregar propiedad"**

### Paso 2: Verificar la Propiedad
Tienes 2 opciones:

#### Opción A: Prefijo de URL (más fácil)
1. Selecciona **"Prefijo de URL"**
2. Ingresa: `https://ingenieria-software-2025.vercel.app`
3. Google te dará un archivo HTML para descargar
4. Sube ese archivo a `frontend/public/` (ejemplo: `google1234567890abcdef.html`)
5. Haz commit y push
6. Espera que Vercel redeploy (2-3 min)
7. Vuelve a Google Search Console y haz clic en **"Verificar"**

#### Opción B: Meta Tag (alternativa)
1. Google te dará un meta tag como: `<meta name="google-site-verification" content="abc123...">`
2. Agrégalo en `frontend/public/index.html` dentro del `<head>`
3. Haz commit, push y espera el deploy
4. Vuelve a Google Search Console y verifica

## 2. Enviar el Sitemap

Una vez verificado:

1. En Google Search Console, ve a **"Sitemaps"** (menú lateral)
2. Ingresa: `https://ingenieria-software-2025.vercel.app/sitemap.xml`
3. Haz clic en **"Enviar"**
4. Google comenzará a rastrear todas tus páginas automáticamente

## 3. Solicitar Indexación Manual (Opcional pero Recomendado)

Para acelerar la indexación de los artículos del blog:

1. En Google Search Console, ve a **"Inspección de URLs"**
2. Pega cada URL de tus artículos:
   - `https://ingenieria-software-2025.vercel.app/blog/como-evaluar-cultura-empresarial`
   - `https://ingenieria-software-2025.vercel.app/blog/guia-negociacion-salarios`
   - `https://ingenieria-software-2025.vercel.app/blog/preparacion-entrevistas-tecnicas`
3. Haz clic en **"Solicitar indexación"**
4. Google procesará cada URL en 1-2 días

## 4. Verificar la Indexación

### Método 1: Búsqueda `site:`
En Google, busca:
```
site:ingenieria-software-2025.vercel.app
```
Verás todas las páginas indexadas.

### Método 2: Google Search Console
Ve a **"Cobertura"** o **"Páginas"** para ver el estado de indexación.

## 5. Cronograma Realista

| Acción | Tiempo Estimado |
|--------|----------------|
| Verificar propiedad | 5-10 minutos |
| Google descubra el sitemap | 1-3 días |
| Primera indexación | 3-7 días |
| Indexación completa | 1-4 semanas |
| Aparecer en resultados | 2-8 semanas |
| Rankear en top resultados | 3-6 meses |

## 6. Factores que Afectan el Ranking

### ✅ Lo que YA tienes (gracias al blog):
- Meta tags optimizados
- Datos estructurados (Schema.org)
- Contenido relevante y único
- Sitemap.xml
- Robots.txt
- URLs amigables (slugs)
- Open Graph para redes sociales

### 📈 Lo que puedes mejorar:
- **Backlinks:** Compartir en redes sociales, foros
- **Contenido regular:** Publicar artículos nuevos cada semana
- **Velocidad del sitio:** Ya es buena con React
- **Mobile-friendly:** Ya está responsive
- **HTTPS:** Ya lo tienes (Vercel)

## 7. Herramientas Complementarias

### Bing Webmaster Tools
- https://www.bing.com/webmasters
- Mismo proceso que Google
- Indexa para Bing, Yahoo, DuckDuckGo

### Google Analytics (Opcional)
Para medir tráfico:
1. Ve a: https://analytics.google.com
2. Crea una propiedad
3. Agrega el tracking code en `frontend/public/index.html`

## 8. Cómo Saber si Está Funcionando

### En 1 semana:
```
site:ingenieria-software-2025.vercel.app
```
Deberías ver al menos la página principal.

### En 2-4 semanas:
```
site:ingenieria-software-2025.vercel.app blog
```
Deberías ver los artículos del blog.

### En 1-2 meses:
Busca tus palabras clave específicas:
- "evaluar cultura empresarial TalentTrace"
- "negociación salarios Colombia"
- "preparación entrevistas técnicas"

## 9. Checklist de Verificación

- [ ] Sitio verificado en Google Search Console
- [ ] Sitemap.xml enviado
- [ ] Al menos 3 artículos del blog publicados
- [ ] Meta tags verificados con https://metatags.io
- [ ] Schema.org validado con https://validator.schema.org
- [ ] Datos estructurados verificados con https://search.google.com/test/rich-results
- [ ] robots.txt accesible en `/robots.txt`
- [ ] Sitemap accesible en `/sitemap.xml`
- [ ] URLs solicitan indexación manual
- [ ] Compartido en redes sociales para backlinks

## 10. Errores Comunes a Evitar

❌ **NO hagas:**
- Keyword stuffing (repetir palabras clave excesivamente)
- Contenido duplicado (copiar de otros sitios)
- Comprar backlinks
- Usar texto oculto
- Cloaking (mostrar contenido diferente a Google)

✅ **SÍ haz:**
- Contenido original y útil
- Actualizar artículos regularmente
- Responder comentarios (si implementas)
- Compartir en redes sociales naturalmente
- Conseguir backlinks de forma orgánica

---

## 📞 ¿Necesitas Ayuda?

Si después de 4 semanas no ves resultados:
1. Verifica errores en Google Search Console → Cobertura
2. Revisa que robots.txt no esté bloqueando a Google
3. Confirma que no hay errores 404 en el sitemap
4. Usa la herramienta de inspección de URLs
