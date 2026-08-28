# Backend - Plataforma Juan Palma

Backend Spring Boot 3 + Java 17 para los formularios de la plataforma.

## Funciones

- Registro de personeros (nombres y apellidos por separado), con selección
  de su lugar de votación real (catálogo `centros_votacion`, enlazado por
  llave foránea).
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

## 1b. Probar contra SQL Server real (antes de usar Azure SQL)

> ⚠️ Si ya tenías la tabla `personeros` creada de una prueba anterior, el
> esquema volvió a cambiar (ahora tiene `centro_votacion_id` en vez de
> `sector`, con llave foránea). Antes de correr el backend de nuevo,
> bórrala para que se recree limpia:
> ```sql
> DROP TABLE IF EXISTS personeros;
> DROP TABLE IF EXISTS centros_votacion;
> ```
> (la tabla `centros_votacion` se crea y se llena sola al arrancar)

Por defecto el backend usa H2 (archivo local), que funciona pero no es
exactamente el mismo motor que Azure SQL. Para probar contra un SQL Server
de verdad antes de conectar a Azure, hay un `docker-compose.yml` en la raíz
del repo que levanta SQL Server 2022 (edición Developer, gratuita) en tu
máquina.

**Requisito:** Docker Desktop instalado y corriendo (Windows, Mac o Linux —
el mismo Docker Desktop, no hace falta nada distinto por sistema operativo).

**1. Levantar el contenedor** (desde la raíz del repo, donde está el
`docker-compose.yml`):

```bash
docker compose up -d
```

Espera unos 20-30 segundos a que arranque del todo.

**2. Crear la base de datos** (una sola vez; el contenedor arranca sin
ninguna base de datos creada todavía):

```bash
docker exec -it juanpalma-sqlserver-local /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "JuanPalma2027!Surco" -C -Q "CREATE DATABASE juanpalma_local"
```

**3. Correr el backend apuntando a este SQL Server** (desde `docs/`):

```bash
# Windows PowerShell:
$env:SPRING_PROFILES_ACTIVE="sqlserver"
$env:DB_URL="jdbc:sqlserver://localhost:1433;databaseName=juanpalma_local;encrypt=true;trustServerCertificate=true"
$env:DB_USERNAME="sa"
$env:DB_PASSWORD="JuanPalma2027!Surco"
mvn spring-boot:run

# Linux/Mac/Git Bash:
SPRING_PROFILES_ACTIVE=sqlserver \
DB_URL="jdbc:sqlserver://localhost:1433;databaseName=juanpalma_local;encrypt=true;trustServerCertificate=true" \
DB_USERNAME=sa \
DB_PASSWORD="JuanPalma2027!Surco" \
mvn spring-boot:run
```

Al arrancar, Hibernate crea automáticamente las tablas (`personeros`,
`issue_reports`, etc.) dentro de `juanpalma_local` — no hace falta crearlas
a mano.

**4. Probar que funciona:** registra un personero o un reporte desde el
sitio (o con los `curl` de las secciones 2 y 3 de este documento), y
verifica que quedó guardado de verdad:

```bash
docker exec -it juanpalma-sqlserver-local /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "JuanPalma2027!Surco" -C -d juanpalma_local -Q "SELECT * FROM personeros"
```

Si esto funciona bien acá, el mismo perfil `sqlserver` funciona igual contra
Azure SQL — solo cambia el valor de `DB_URL` (ver sección 7).

**Para detener el contenedor:** `docker compose down` (o `docker compose down -v`
si además quieres borrar los datos y empezar de cero la próxima vez).

## 2. Probar formulario de personeros

Primero consulta los lugares de votación disponibles (endpoint público, sin
clave admin):

```bash
curl http://localhost:8080/api/centros-votacion
```

Devuelve una lista con `id`, `nombre`, `categoria` y `direccion` — usa uno
de esos `id` como `centroVotacionId` al registrar:

```bash
curl -X POST http://localhost:8080/api/personeros \
  -H "Content-Type: application/json" \
  -d "{\"firstName\":\"Maria\",\"lastName\":\"Perez Lopez\",\"dni\":\"12345678\",\"phone\":\"987654321\",\"email\":\"maria@example.com\",\"centroVotacionId\":1,\"role\":\"Brigadista Digital / Redes\"}"
```

`phone` debe ser exactamente 9 dígitos numéricos. `firstName`/`lastName` solo
aceptan letras (sin números ni símbolos). `centroVotacionId` debe existir en
la tabla `centros_votacion` (si no, responde `400 Bad Request`).

### Sobre la tabla `centros_votacion`

Es un catálogo de referencia, separado de `personeros` y enlazado por llave
foránea (`personeros.centro_votacion_id → centros_votacion.id`). Se llena
sola al arrancar el backend por primera vez (ver `DataSeeder.java`), con los
locales de la elección **presidencial** en Santiago de Surco — porque el
JNE/ONPE todavía no publica los locales oficiales para la elección
**municipal** 2026. Si salen variaciones cuando se publiquen los oficiales,
se edita la lista en `DataSeeder.java` y se reinicia la aplicación.

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

## 7. Desplegar en Azure (infraestructura ya provisionada)

La infraestructura para este proyecto **ya fue creada** por el equipo de
infraestructura (no por este script genérico). Recursos reales:

| Recurso | Nombre |
|---|---|
| Resource Group | `SwissCapital-P-Eastus2-renovacion-RGRP` |
| App Service Plan | `swisscapital-p-renovacion-aspn` |
| App Service (Java 21) | `swcap-p-renovacion-frontend-app` |
| Storage Account | `swisscpn8nprodsa` |
| App Registration (OIDC) | `swisscapital-p-renovacion-SP` |

El App Registration ya tiene rol **Contributor** sobre el Resource Group, y
su **Federated Credential** está configurado exactamente para:

```
Organización: Kiwis100
Repositorio:  Plataforma-web-RP
Branch:       develop
```

Esto significa que el workflow **debe** dispararse con push a la rama
`develop` (no `main`) — así quedó armado
`.github/workflows/azure-deploy.yml`.

### Cómo está pensado el despliegue (fase 1: solo frontend)

Para evitar costos de Azure SQL mientras se prueba el pipeline, el `pom.xml`
ahora empaqueta los archivos estáticos del frontend (`index.html`,
`admin.html`, `css/`, `js/`, `imagenes/`, `videos/`) **dentro del mismo
`.jar`** del backend Spring Boot, que los sirve por su Tomcat embebido. La
API (`/api/**`) sigue existiendo y funcionando, pero usa H2 en archivo local
por defecto (perfil `dev`, sin costo) — no hace falta crear Azure SQL
todavía. El día que quieran el backend con base de datos real, solo agregan
las App Settings de conexión a Azure SQL (perfil `sqlserver`) — **el mismo
pipeline sirve para ambas fases, sin cambios**.

### Configurar GitHub para que el pipeline funcione

En el repo `Kiwis100/Plataforma-web-RP` → **Settings → Secrets and
variables → Actions**:

**Secrets:**
```
AZURE_CLIENT_ID       = e6f38d4f-9494-4292-8d6e-693085a4492d
AZURE_TENANT_ID       = c1e30940-420d-4452-9c58-1fd20f96789e
AZURE_SUBSCRIPTION_ID = b1ff7360-f56c-40d7-aa93-5ac80b1ec9d0
```

**Variables:**
```
AZURE_APP_SERVICE_NAME = swcap-p-renovacion-frontend-app
```

No hace falta crear ningún `Environment` (`staging`/`production`) para este
workflow: no hay slot de staging entre los recursos que compartiste, así que
se despliega directo.

Con eso configurado, cualquier `git push` a `develop` que toque `docs/**`
compila y despliega solo. También se puede lanzar a mano desde
**Actions → Deploy a Azure App Service → Run workflow**.

### Stack: Java SE

El App Service `swcap-p-renovacion-frontend-app` está armado para modo
**"Java SE"** (espera un `.jar` ejecutable con servidor embebido) — así
quedó configurado el `pom.xml` y el workflow.

Antes del primer despliegue, vale la pena confirmarlo con un vistazo rápido
(toma 10 segundos): Azure Portal → el App Service → **Configuration →
General settings → Stack settings** → el campo debajo de "Java version"
debe decir "Java SE". Si en cambio dice "Tomcat X.X", avisa y se ajusta el
`pom.xml` para empaquetar como `.war` en vez de `.jar` — es un cambio
pequeño y no afecta nada más del proyecto.

### ⚠️ Cosas a tener en cuenta antes de usarlo con tráfico real

- **Adjuntos (`uploads/issues/`):** se guardan en el disco local del App
  Service. Funciona para probar, pero no es 100% confiable si algún día
  escalan a más de una instancia. La solución correcta es moverlo a Azure
  Blob Storage — el Storage Account `swisscpn8nprodsa` ya existe para eso,
  puedo hacer ese cambio cuando lo necesiten.
- **`ADMIN_API_KEY`:** el panel `admin.html` va a quedar accesible
  públicamente en esta URL. Antes de mostrarle esta demo a alguien más,
  configura un valor real (no el default `cambiar-esta-clave`) como App
  Setting en el App Service: `ADMIN_API_KEY=una-clave-larga-y-aleatoria`.

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

## Publicar el frontend en GitHub Pages (opción alternativa)

**Nota:** ya no es necesaria para el flujo principal — desde que el `.jar`
empaqueta el frontend y se despliega directo a Azure (sección 7), la web y
la API quedan en el mismo dominio sin pasos extra. Esta sección queda por si
en algún momento prefieren separar el hosting del frontend del backend.

GitHub Pages **solo sirve archivos estáticos**: puede publicar `docs/`
(HTML/CSS/JS/imágenes/videos), pero **no puede correr el backend Java**. Para
que el sitio publicado funcione con formularios reales, el backend debe
desplegarse aparte y quedar accesible por HTTPS.

1. Sube el repo a GitHub y en **Settings → Pages** elige la rama `gh-pages`
   como origen (se crea sola al correr el workflow
   `.github/workflows/pages.yml`), o configura directamente la rama `develop` /
   carpeta `/docs` si prefieres no usar Actions para esto. **Este proyecto
   solo usa la rama `develop`** — no uses `main` en ninguna configuración.
2. Despliega el backend en Azure siguiendo la sección **"7. Desplegar en
   Azure"** de arriba (variables de entorno: `SPRING_PROFILES_ACTIVE=sqlserver`,
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
