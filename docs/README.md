# Backend - Plataforma Juan Palma

Backend Spring Boot 3 + Java 17 para los formularios de la plataforma.

## Funciones

- Donaciones.
- Registro de personeros (nombres y apellidos por separado).
- Mensajes de contacto.
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
- Protección contra doble envío de donaciones mediante `Idempotency-Key`.
- Restricción adicional: un DNI solo puede registrar un aporte.
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

## 2. Probar donación

```bash
curl -X POST http://localhost:8080/api/donations \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: 7f7b9b1e-1111-4444-8888-123456789012" \
  -d "{\"name\":\"Juan Perez\",\"dni\":\"12345678\",\"amount\":20}"
```

Si el navegador hace doble click y genera dos requests con la misma clave, el backend conserva una sola operación.

Además, el mismo DNI no puede registrar una segunda donación.

## 3. Probar formulario de personeros

```bash
curl -X POST http://localhost:8080/api/personeros \
  -H "Content-Type: application/json" \
  -d "{\"firstName\":\"Maria\",\"lastName\":\"Perez Lopez\",\"dni\":\"12345678\",\"phone\":\"987654321\",\"email\":\"maria@example.com\",\"sector\":\"sector-1\",\"role\":\"Brigadista Digital / Redes\"}"
```

`phone` debe ser exactamente 9 dígitos numéricos. `firstName`/`lastName` solo
aceptan letras (sin números ni símbolos).

## 3b. Probar reporte de incidencia (Los Problemas de Surco)

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

## 3c. Buscar por nombre o apellido

```bash
curl "http://localhost:8080/api/personeros/search?q=Perez" -H "X-Admin-Key: cambiar-esta-clave"
curl "http://localhost:8080/api/issues/search?q=Mendoza" -H "X-Admin-Key: cambiar-esta-clave"
```

Busca coincidencias parciales (sin distinguir mayúsculas) tanto en el nombre
como en el apellido. También hay un buscador visual en `admin.html`.

## 4. Lista negra

La lista negra de DNI se guarda como hash SHA-256. El DNI completo no se guarda en la base.

Para agregar un DNI:

```bash
curl -X POST http://localhost:8080/api/admin/blacklist/dni \
  -H "Content-Type: application/json" \
  -H "X-Admin-Key: cambiar-esta-clave" \
  -d "{\"dni\":\"87654321\",\"reason\":\"Bloqueo administrativo\"}"
```

## 5. Palabras no permitidas

```bash
curl -X POST http://localhost:8080/api/admin/blacklist/word \
  -H "Content-Type: application/json" \
  -H "X-Admin-Key: cambiar-esta-clave" \
  -d "{\"word\":\"palabra\"}"
```

El filtro normaliza mayúsculas/minúsculas y tildes.

## 6. SQL Server / Azure SQL

Definir:

```text
SPRING_PROFILES_ACTIVE=sqlserver
DB_URL=jdbc:sqlserver://SERVIDOR:1433;database=juan_palma;encrypt=true;trustServerCertificate=false;loginTimeout=30
DB_USERNAME=...
DB_PASSWORD=...
CORS_ALLOWED_ORIGINS=https://tu-frontend.github.io
ADMIN_API_KEY=una-clave-larga-y-segura
```

Para Azure SQL se cambiará solamente la configuración de conexión y posteriormente se realizará la configuración de App Service, Managed Identity/secret management y GitHub Actions.

## Nota importante sobre donaciones

Este backend registra el aporte a nivel de sistema. No implementa todavía una pasarela bancaria ni un cobro real. La interfaz actual del frontend dice "Simular Aporte Seguro", por lo que primero estamos construyendo el registro backend. La integración de pago real debe hacerse como una fase separada.

## Integración con el frontend

`docs/js/main.js` ya llama al backend con `fetch()` para: `POST /api/donations`
(con `Idempotency-Key`), `POST /api/personeros`, `POST /api/contacts`,
`POST /api/issues` y `GET /api/issues/approved`. La URL base se define en
`docs/js/main.js`:

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

1. Sube el repo a GitHub y en **Settings → Pages** elige la rama y carpeta
   `/docs` como origen (o usa el workflow ya incluido en
   `.github/workflows/deploy.yml`).
2. Despliega el backend en un servicio con Java 17 (variables de entorno:
   `SPRING_PROFILES_ACTIVE=sqlserver`, `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`,
   `CORS_ALLOWED_ORIGINS=https://tu-usuario.github.io`, `ADMIN_API_KEY`).
3. En `docs/index.html`, antes de cargar `js/main.js`, define la URL real del
   backend:
   ```html
   <script>window.SURCO_API_BASE_URL = "https://tu-backend.azurewebsites.net";</script>
   <script src="js/main.js"></script>
   ```
4. Sin backend público, el sitio en GitHub Pages se ve y navega
   perfectamente, pero los formularios (Donaciones, Personero, Reportar
   Incidencia) mostrarán un error de conexión al enviarse.
