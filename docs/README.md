# Plataforma Web — Juan Palma | Alcaldía de Santiago de Surco 2027

Plataforma cívica de campaña: propuestas por eje, "Los Problemas de Surco y las
Soluciones de Juan Palma" (basado en el Plan de Gobierno), agenda del
candidato, plan de gobierno, noticias, videos, donaciones, formulario de
contacto y un asistente virtual (SurcoIA).

Sitio 100% estático: **HTML + CSS + JavaScript puro** (sin frameworks, sin
paso de compilación). Se puede abrir directamente en el navegador o publicar
en cualquier hosting estático, incluyendo GitHub Pages.

## Estructura del proyecto

```
├── index.html                 # Página principal (todas las secciones)
├── css/
│   └── styles.css             # Estilos del sitio
├── js/
│   ├── main.js                 # Lógica de la interfaz (menú, formularios, chatbot, etc.)
│   ├── proposalsData.js        # Los 6 ejes de gobierno
│   ├── surcoIssuesData.js      # Los 9 problemas estratégicos y soluciones
│   ├── agendaData.js           # Agenda del candidato, noticias y videos
│   └── aiKnowledgeBase.js      # Respuestas del chatbot SurcoIA
├── imagenes/                   # Logo y fotografías
├── videos/                     # Videos de campaña (mp4)
└── .github/workflows/deploy.yml # Publicación automática a GitHub Pages
```

## Ver el sitio en local

No necesita instalación. Basta abrir `index.html` con doble clic, o levantar
un servidor local simple desde esta carpeta:

```bash
python3 -m http.server 8000
# luego abre http://localhost:8000 en el navegador
```

## Publicar en GitHub Pages (mediante ramas / branches)

Hay dos formas de hacerlo. Ambas funcionan porque **todas las rutas del
proyecto son relativas** (`css/styles.css`, `js/main.js`, `imagenes/...`,
`videos/...`), por lo que el sitio funciona igual en la raíz de un dominio
(`usuario.github.io`) que en una subruta de proyecto
(`usuario.github.io/nombre-del-repo/`).

### Opción A — Automática con GitHub Actions (recomendada)

Este repositorio ya incluye el workflow `.github/workflows/deploy.yml`, que
publica el sitio automáticamente en la rama `gh-pages` cada vez que subes
cambios a `main` o `develop`.

1. Sube este proyecto a un repositorio de GitHub (a la rama `main` o `develop`).
2. Ve a **Settings → Pages** del repositorio.
3. En **Source**, selecciona **Deploy from a branch**.
4. Elige la rama **`gh-pages`** y la carpeta **`/ (root)`**.
5. Guarda. GitHub Actions creará la rama `gh-pages` automáticamente en el
   primer push (revisa la pestaña **Actions** para ver el progreso).
6. Tu sitio quedará publicado en `https://<usuario>.github.io/<repo>/`.

Cada vez que hagas `git push` a `main` o `develop`, el sitio se actualiza solo.

### Opción B — Manual, sin Actions

Si prefieres no usar Actions:

1. Sube el proyecto a la rama `main` (o la que uses para desarrollo).
2. Ve a **Settings → Pages**.
3. En **Source**, selecciona **Deploy from a branch**.
4. Elige la rama `main` y la carpeta `/ (root)`.
5. Guarda y espera unos minutos.

Con esta opción, cada vez que quieras actualizar el sitio publicado basta con
hacer push a esa misma rama; no hace falta gestionar una rama `gh-pages`
aparte.

### Notas importantes

- El archivo `.nojekyll` en la raíz evita que GitHub Pages procese el sitio
  con Jekyll (innecesario para un sitio estático y puede interferir con
  carpetas/archivos).
- Todos los enlaces a Google Fonts, Lucide Icons y canvas-confetti se cargan
  desde CDN (`https://...`), así que funcionan igual en cualquier dominio.
- Si cambias el nombre del repositorio, no necesitas tocar ninguna ruta del
  proyecto: todo es relativo.

## Editar contenido

- **Propuestas / 6 Ejes de Gobierno:** `js/proposalsData.js`
- **Problemas y soluciones (Plan de Gobierno):** `js/surcoIssuesData.js`
- **Agenda, noticias y videos:** `js/agendaData.js`
- **Respuestas del chatbot SurcoIA:** `js/aiKnowledgeBase.js`
- **Textos generales, secciones y estructura:** `index.html`
- **Colores, tipografía y estilos:** `css/styles.css`
