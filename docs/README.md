# Backend - Plataforma Juan Palma

Backend Spring Boot 3 + Java 17 para los formularios de la plataforma.

## Funciones

- Registro de personeros (nombres y apellidos por separado).
- Reportes de incidencias en "Los Problemas de Surco", con nombres/apellidos
  del vecino que reporta y adjunto opcional de foto o video.
- Búsqueda por nombre o apellido (personeros y reportes).
- Restricciones de formato por campo: nombres/apellidos solo letras,
  teléfono de personero exactamente 9 dígitos, ubicación acepta letras y
  números, correo sin restricciones adicionales.
- Panel de administración (`admin.html`): aprobar/rechazar reportes, ver
  personeros registrados, buscar por nombre/apellido.
- Filtro de DNIs en lista negra.
- Filtro de palabras no permitidas.
- Health check.
- Preparado para SQL Server / Azure SQL.

## 1. Ejecutar localmente

Requisitos:

- Java 17+
- Maven 3.9+

Comando:

```bash
mvn spring-boot:run
```

Por defecto usa H2 en archivo local.

API:
`http://localhost:8080`

Health:
`GET http://localhost:8080/api/health`

## 2. Probar formulario de personeros

```bash
curl -X POST http://localhost:8080/api/personeros \
  -H "Content-Type: application/json" \
  -d "{\"firstName\":\"Maria\",\"lastName\":\"Perez Lopez\",\"dni\":\"12345678\",\"phone\":\"987654321\",\"email\":\"maria@example.com\",\"sector\":\"sector-1\",\"role\":\"Brigadista Digital / Redes\"}"
```

`phone` debe ser exactamente 9 dígitos numéricos. `firstName`/`lastName` solo
aceptan letras (sin números ni símbolos).

## 3. Probar reporte de incidencia (Los Problemas de Surco)

Ahora es `multipart/form-data` (permite adjuntar foto o video opcional):

```bash
curl -X POST http://localhost:8080/api/issues \
  -F "reporterFirstName=Carlos" \
  -F "reporterLastName=Mendoza Ruiz" \
  -F "reporterDni=12345678" \
  -F "title=Parque abandonado" \
  -F "sector=ambiente" \
  -F "location=Calle Los Tulipanes cdra 3" \
  -F "description=Falta iluminación hace 2 semanas." \
  -F "attachment=@/ruta/a/foto.jpg;type=image/jpeg"
```

El campo `attachment` es opcional. Solo se aceptan imágenes (jpg, png, webp)
o videos (mp4, mov, webm), máximo 25MB — se valida en el navegador y también
en el servidor. El archivo queda accesible en
`http://localhost:8080/uploads/issues/<archivo>`.

Queda con estado `PENDING`. Para verlo publicado, un admin debe aprobarlo
(requiere `X-Admin-Key`):

```bash
curl -X PUT "http://localhost:8080/api/issues/1/status?status=APPROVED" \
  -H "X-Admin-Key: cambiar-esta-clave"
```

Listar todos (admin): `GET /api/issues` (header `X-Admin-Key`)
Solo aprobados (público): `GET /api/issues/approved`

## 4. Buscar por nombre o apellido

```bash
curl "http://localhost:8080/api/personeros/search?q=Perez" -H "X-Admin-Key: cambiar-esta-clave"
curl "http://localhost:8080/api/issues/search?q=Mendoza" -H "X-Admin-Key: cambiar-esta-clave"
```

Busca coincidencias parciales (sin distinguir mayúsculas) tanto en el nombre
como en el apellido. También hay un buscador visual en `admin.html`.

## 5. Lista negra

La lista negra de DNI se guarda como hash SHA-256. El DNI completo no se guarda en la base.

Para agregar un DNI:

```bash
curl -X POST http://localhost:8080/api/admin/blacklist/dni \
  -H "Content-Type: application/json" \
  -H "X-Admin-Key: cambiar-esta-clave" \
  -d "{\"dni\":\"87654321\",\"reason\":\"Bloqueo administrativo\"}"
```

## 6. Palabras no permitidas

```bash
curl -X POST http://localhost:8080/api/admin/blacklist/word \
  -H "Content-Type: application/json" \
  -H "X-Admin-Key: cambiar-esta-clave" \
  -d "{\"word\":\"palabra\"}"
```

El filtro normaliza mayúsculas/minúsculas y tildes.

## 7. Desplegar el backend en Azure

Todo lo necesario ya está en el repo:

- `azure/provision.sh` — crea los recursos de Azure (Resource Group, App
  Service Plan S1 Linux, App Service Java 17 + slot `staging`, Azure SQL
  Basic, Storage Account, Application Insights, y la identidad OIDC para
  GitHub Actions).
- `.github/workflows/backend-deploy.yml` — compila con Maven y despliega
  automáticamente a `staging`, verifica el health check, y hace el swap a
  producción.

**⚠️ Importante:** no ejecuté este script — no tengo acceso a tu cuenta de
Azure. Revísalo, edita las variables del inicio (nombre de la app, región,
clave de SQL, tu usuario/repo de GitHub) y córrelo tú:

```bash
az login
bash azure/provision.sh
```

Al final imprime los valores exactos que debes copiar a GitHub:

1. **Settings → Secrets and variables → Actions → Secrets:**
   `AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, `AZURE_SUBSCRIPTION_ID`
2. **Settings → Secrets and variables → Actions → Variables:**
   `AZURE_APP_SERVICE_NAME`, `AZURE_RESOURCE_GROUP`
3. **Settings → Environments:** crea `staging` y `production` (el workflow
   los usa; puedes dejarlos sin reglas de protección para empezar).

Después, cualquier `git push` a `main` que toque `docs/src/**` o
`docs/pom.xml` compila y despliega solo. El primer despliegue también lo
puedes lanzar a mano desde la pestaña **Actions → Build y Deploy Backend a
Azure App Service → Run workflow**.

**Variables de entorno que quedan configuradas automáticamente por el script**
(App Settings del App Service, en producción y en staging):

```text
SPRING_PROFILES_ACTIVE=sqlserver
DB_URL=jdbc:sqlserver://SERVIDOR.database.windows.net:1433;database=...;encrypt=true;...
DB_USERNAME=...
DB_PASSWORD=...
CORS_ALLOWED_ORIGINS=https://tu-usuario.github.io
ADMIN_API_KEY=una-clave-larga-y-segura
APPLICATIONINSIGHTS_CONNECTION_STRING=...
```

### ⚠️ Cosas a tener en cuenta antes de usarlo en producción real

- **Adjuntos (`uploads/issues/`):** ahora mismo se guardan en el disco local
  del App Service. Funciona para probar, pero **no es 100% confiable en
  producción**: si escalas a más de una instancia, cada instancia tendría su
  propia copia de archivos. La solución correcta es mover
  `FileStorageService` a Azure Blob Storage (el Storage Account que crea
  `provision.sh` ya está listo para eso) — puedo hacer ese cambio si vas a
  recibir tráfico real.
- **La clave de administrador (`ADMIN_API_KEY`)** y la contraseña de SQL
  quedan como texto plano en App Settings. Para más seguridad, muévelas a
  **Azure Key Vault** y referéncialas desde el App Service (tal como sugiere
  el documento de migración original).
- El `SQL_ADMIN_PASSWORD` de ejemplo en `provision.sh` **debes cambiarlo**
  antes de correr el script.

## Integración con el frontend

`docs/js/main.js` ya llama al backend con `fetch()` para: `POST /api/personeros`,
`POST /api/issues` (multipart, con adjunto opcional) y
`GET /api/issues/approved`. La URL base se define en `docs/js/main.js`:

```js
const API_BASE_URL = window.SURCO_API_BASE_URL || 'http://localhost:8080';
```

## Cómo correr backend + frontend juntos en local

**Terminal 1 — backend:**
```bash
cd docs
mvn spring-boot:run
```
Queda en `http://localhost:8080` (H2 en archivo, persiste en `docs/data/`).

**Terminal 2 — frontend:**
```bash
cd docs
python3 -m http.server 8000
```
Abre `http://localhost:8000`. Como el puerto 8000 ya está permitido en CORS
por defecto, los formularios funcionarán contra el backend local sin tocar
nada más.

**Panel de administración:** `http://localhost:8000/admin.html` (pide la
clave `app.admin.api-key` de `application.properties`, por defecto
`cambiar-esta-clave`). Ahí apruebas/rechazas reportes y ves los personeros
registrados, con buscador por nombre o apellido.

## Publicar el frontend en GitHub Pages

GitHub Pages **solo sirve archivos estáticos**: puede publicar `docs/`
(HTML/CSS/JS/imágenes/videos), pero **no puede correr el backend Java**. Para
que el sitio publicado funcione con formularios reales, el backend debe
desplegarse aparte (Azure App Service, Railway, Render, etc.) y quedar
accesible por HTTPS.

1. Sube el repo a GitHub y en **Settings → Pages** elige la rama `gh-pages`
   como origen (se crea sola al correr el workflow
   `.github/workflows/pages.yml`), o configura directamente la rama `main` /
   carpeta `/docs` si prefieres no usar Actions para esto.
2. Despliega el backend en Azure siguiendo la sección **"6. Desplegar el
   backend en Azure"** de arriba (o cualquier otro servicio con Java 17:
   Railway, Render, etc. — variables de entorno: `SPRING_PROFILES_ACTIVE=sqlserver`,
   `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`,
   `CORS_ALLOWED_ORIGINS=https://tu-usuario.github.io`, `ADMIN_API_KEY`).
3. En `docs/index.html`, antes de cargar `js/main.js`, define la URL real del
   backend:
   ```html
   <script>window.SURCO_API_BASE_URL = "https://tu-backend.azurewebsites.net";</script>
   <script src="js/main.js"></script>
   ```
4. Sin backend público, el sitio en GitHub Pages se ve y navega
   perfectamente, pero los formularios (Personero, Reportar
   Incidencia) mostrarán un error de conexión al enviarse.
