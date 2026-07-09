# Módulo de Notificaciones Push — Frontend Vue PWA

Documentación técnica del módulo de notificaciones implementado en **app-academic-front**.

---

## 1. Resumen general

Este módulo convierte la aplicación Vue en una **PWA con soporte de notificaciones push** mediante **Firebase Cloud Messaging (FCM)**.

El frontend es responsable de:

- Solicitar **permiso de notificaciones** al usuario ESTUDIANTE
- Obtener el **device token** de Firebase
- Enviar el token al **backend Laravel** para registro
- Recibir notificaciones en **primer plano** y **segundo plano** (app cerrada)
- Mostrar el **historial de notificaciones** con filtros por aula según rol
- Redirigir al módulo de **asistencias del estudiante** al tocar una notificación

**Importante:** Los padres de familia usan las **credenciales del estudiante**. Por eso el registro de push solo ocurre con rol `ESTUDIANTE`.

---

## 2. Arquitectura frontend

```
┌──────────────────────────────────────────────────────────────┐
│                        Vue PWA                                │
├──────────────────────────────────────────────────────────────┤
│  Login.vue / DefaultLayout.vue                               │
│       │                                                       │
│       ▼                                                       │
│  usePushNotifications.js (composable)                        │
│       ├─▶ Firebase SDK → getToken()                          │
│       ├─▶ firebase-messaging-sw.js (background)              │
│       └─▶ PushNotificationService.js → Laravel API         │
├──────────────────────────────────────────────────────────────┤
│  NotificationHistoryView.vue (historial + filtros)           │
│       └─▶ pushNotifications.js (Pinia store)               │
└──────────────────────────────────────────────────────────────┘
         │                              │
         ▼                              ▼
   Firebase FCM                   Laravel API
   (push nativo)                (tokens + historial)
```

---

## 3. Dependencias instaladas

**Archivo:** `package.json`

| Paquete | Uso |
|---------|-----|
| `firebase` | SDK de Firebase Messaging (obtener token, mensajes foreground) |
| `vite-plugin-pwa` | Soporte PWA (workbox, assets, manifest) |
| `workbox-window` | Utilidades PWA (dependencia de vite-plugin-pwa) |

**Instalación:**
```bash
npm install firebase vite-plugin-pwa workbox-window
```

---

## 4. Configuración PWA

### 4.1 Manifest (`public/manifest.json`)

Se amplió el manifest original para cumplir requisitos de PWA instalable en Android:

| Campo | Valor |
|-------|-------|
| `name` | Sistema Académico Ricardo Palma |
| `short_name` | Ricardo Palma |
| `start_url` | `/` |
| `display` | `standalone` |
| `theme_color` | `#0072ff` |
| `background_color` | `#ffffff` |
| `icons` | Iconos Android existentes (36–192px) |

### 4.2 `index.html`

Se agregaron meta tags PWA:

```html
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="theme-color" content="#0072ff">
```

### 4.3 Vite PWA (`vite.config.mjs`)

```javascript
VitePWA({
  registerType: 'autoUpdate',
  injectRegister: false,        // No auto-registrar SW de workbox
  manifest: false,              // Usa public/manifest.json
  includeAssets: [
    'android-icon-192x192.png',
    'firebase-messaging-sw.js',
    'firebase-config.js',
  ],
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
    navigateFallback: '/index.html',
  },
})
```

**Decisión técnica:** `injectRegister: false` evita conflicto entre el service worker de Workbox y el de Firebase. Solo se registra `firebase-messaging-sw.js` manualmente.

---

## 5. Configuración Firebase

### 5.1 Variables de entorno (`.env`)

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_VAPID_KEY=
```

Obtener desde Firebase Console → Project settings → General (app Web) y Cloud Messaging (VAPID key).

### 5.2 Config en la app (`src/config/firebase.js`)

Lee las variables `VITE_FIREBASE_*` vía `import.meta.env` y exporta:

- `firebaseConfig` — objeto de configuración Firebase
- `firebaseVapidKey` — clave VAPID para Web Push

### 5.3 Config para Service Worker (`public/firebase-config.js`)

El service worker **no puede** usar `import.meta.env`. Por eso existe un archivo separado:

```javascript
self.firebaseConfig = {
  apiKey: '...',
  authDomain: '...',
  projectId: '...',
  messagingSenderId: '...',
  appId: '...',
}
```

**Generación automática en build:**

**Script:** `scripts/generate-firebase-config.mjs`  
**Hook:** `prebuild` en `package.json` ejecuta el script antes de `vite build`.

```bash
npm run build
# → genera public/firebase-config.js desde .env
```

---

## 6. Service Worker de Firebase

**Archivo:** `public/firebase-messaging-sw.js`

### Responsabilidades

1. Importar Firebase compat desde CDN
2. Cargar configuración desde `/firebase-config.js`
3. Manejar mensajes en **background** (`onBackgroundMessage`)
4. Mostrar notificación nativa con sonido y vibración
5. Al tocar la notificación → abrir `/assistances/alumno/reporte`

### Comportamiento al tocar notificación

```javascript
self.addEventListener('notificationclick', (event) => {
  // Cierra la notificación
  // Abre la PWA en /assistances/alumno/reporte
})
```

Esto funciona incluso con la **aplicación completamente cerrada** en Android (PWA instalada).

---

## 7. Composable de push (`src/composables/usePushNotifications.js`)

### Funciones exportadas

| Función | Descripción |
|---------|-------------|
| `registerStudentPushNotifications()` | Flujo completo de registro |
| `ensureStudentPushRegistration()` | Wrapper con try/catch (uso seguro) |
| `unregisterStudentPushNotifications()` | Desactiva token en backend y Firebase |

### Paso a paso — `registerStudentPushNotifications()`

```
1. Verificar rol = ESTUDIANTE (desde localStorage user)
       │
       ▼
2. Verificar soporte de Notification API
       │
       ▼
3. Notification.requestPermission()
       │
       ├─ denied → return { registered: false, reason: 'permission_denied' }
       │
       ▼
4. Inicializar Firebase Messaging (getMessaging)
       │
       ▼
5. Registrar service worker: /firebase-messaging-sw.js
       │
       ▼
6. getToken(messaging, { vapidKey, serviceWorkerRegistration })
       │
       ▼
7. POST /api/push-notifications/device-tokens → Laravel
       │
       ▼
8. onMessage() → mostrar notificación en foreground
       │
       ▼
9. return { registered: true, token }
```

### Notificaciones en primer plano

Cuando la app está abierta, `onMessage` crea una `Notification` nativa del navegador con:

- Título y cuerpo del payload
- Icono `/android-icon-192x192.png`
- Vibración `[200, 100, 200]`
- Click → navega a `/assistances/alumno/reporte`

---

## 8. Servicio API (`src/services/PushNotificationService.js`)

Comunicación con Laravel usando axios (con interceptor JWT de `main.js`).

| Método | Endpoint Laravel | Descripción |
|--------|------------------|-------------|
| `registerDeviceToken()` | POST `/push-notifications/device-tokens` | Registra token |
| `deactivateDeviceToken()` | DELETE `/push-notifications/device-tokens` | Desactiva token |
| `getScope()` | GET `/push-notifications/scope` | Alcance por rol |
| `getGradeSections()` | GET `/push-notifications/grade-sections` | Aulas filtradas |
| `getHistory()` | GET `/push-notifications/history` | Historial paginado |
| `markAsRead()` | PATCH `/push-notifications/history/{id}/read` | Marcar leída |

---

## 9. Store Pinia (`src/stores/pushNotifications.js`)

Gestiona estado del módulo de historial.

### Estado

| Ref | Descripción |
|-----|-------------|
| `filters` | Año escolar, aula, alumno, tipo, estado, fechas |
| `scope` | Rol, permisos, vista estudiante |
| `gradeSections` | Aulas disponibles según rol |
| `students` | Estudiantes del aula seleccionada |
| `items` | Notificaciones del historial |
| `pagination` | Paginación |
| `loading` / `error` | Estados de UI |

### Acciones principales

| Acción | Descripción |
|--------|-------------|
| `initialize()` | Carga scope → aulas → estudiantes → historial |
| `loadHistory(page)` | Consulta historial con filtros actuales |
| `setGradeSection(id)` | Cambia aula y recarga estudiantes + historial |
| `setStudent(id)` | Filtra por estudiante |
| `setSchoolYear(year)` | Cambia año y recarga todo |
| `markAsRead(id)` | Marca notificación como leída |

**Reutilización:** Para listar estudiantes por aula usa `AcademicRiskService.getStudents()` (misma lógica de scope del backend).

---

## 10. Vistas y componentes

### 10.1 Vista principal

**Archivo:** `src/views/push-notifications/NotificationHistoryView.vue`

- Muestra filtros y tabla de historial
- Columnas: fecha, estudiante, aula, título, estado, lectura
- Botón "Ver" abre SweetAlert con detalle del mensaje
- Al ver, marca automáticamente como leída si no lo estaba
- Paginación anterior/siguiente

### 10.2 Filtros

**Archivo:** `src/components/push-notifications/NotificationHistoryFilters.vue`

| Filtro | Visible para |
|--------|-------------|
| Año escolar | Todos |
| Aula | DIRECCION, PROFESOR, AUXILIAR |
| Alumno (opcional) | DIRECCION, PROFESOR, AUXILIAR |
| Estado (enviada/fallida) | Todos |
| Mensaje informativo | ESTUDIANTE (solo sus notificaciones) |

---

## 11. Integración en login y layout

### 11.1 Login (`src/views/login/Login.vue`)

Después de login exitoso con rol `ESTUDIANTE`:

```javascript
if (role === "ESTUDIANTE") {
  ensureStudentPushRegistration();
}
```

Se ejecuta en segundo plano (no bloquea la navegación).

### 11.2 Layout (`src/layouts/DefaultLayout.vue`)

En `onMounted`:

```javascript
ensureStudentPushRegistration()
```

**Propósito:** Re-registrar/actualizar el token si:
- El usuario ya tenía sesión activa
- El token de Firebase cambió
- Se abrió la app sin pasar por login

---

## 12. Navegación y rutas

### 12.1 Ruta

**Archivo:** `src/router/index.js`

```
/push-notifications/historial → NotificationHistoryView.vue
```

### 12.2 Menú lateral

**Archivo:** `src/_nav.js`

```javascript
{
  name: 'Historial de Notificaciones',
  to: '/push-notifications/historial',
  icon: 'cil-bell',
  roles: ['DIRECCION', 'PROFESOR', 'AUXILIAR', 'ESTUDIANTE'],
}
```

**Nota:** Las rutas demo de CoreUI (`/notifications/alerts`, etc.) se mantienen sin cambios.

---

## 13. Paso a paso — Configuración inicial

### Paso 1: Instalar dependencias

```bash
cd app-academic-front
npm install
```

### Paso 2: Configurar Firebase en consola

1. Crear proyecto Firebase (o usar existente)
2. Agregar app **Web**
3. Copiar credenciales a `.env` como `VITE_FIREBASE_*`
4. En Cloud Messaging → generar **Web Push certificate (VAPID key)**
5. Copiar VAPID key a `VITE_FIREBASE_VAPID_KEY`

### Paso 3: Crear archivo `.env`

```env
VITE_API_URL=http://localhost:8000/api
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_VAPID_KEY=...
```

### Paso 4: Generar firebase-config.js

```bash
node scripts/generate-firebase-config.mjs
```

O simplemente:

```bash
npm run build
```

### Paso 5: Ejecutar en desarrollo

```bash
npm run dev
```

**Nota:** Las notificaciones push requieren **HTTPS** en producción. En localhost funciona para pruebas básicas.

### Paso 6: Probar registro de token

1. Login como **ESTUDIANTE**
2. Aceptar permiso de notificaciones en el navegador
3. Verificar en BD Laravel que se creó registro en `device_tokens`

### Paso 7: Instalar PWA en Android

1. Abrir la app en Chrome (HTTPS)
2. Menú → "Agregar a pantalla de inicio" / "Instalar app"
3. Abrir desde el icono instalado
4. Login como ESTUDIANTE y aceptar permisos

---

## 14. Paso a paso — Flujo completo del usuario

### Escenario A: Padre recibe notificación de inasistencia

```
1. Auxiliar/Django registra asistencia con status F en assistances_general
2. A las 14:00 Laravel ejecuta scheduler
3. Laravel detecta inasistencia y envía FCM al device_token del estudiante
4. Padre recibe notificación nativa en Android (app cerrada)
5. Padre toca la notificación
6. Se abre la PWA en /assistances/alumno/reporte
7. Padre revisa el detalle de asistencia
```

### Escenario B: Docente consulta historial

```
1. Docente login con rol PROFESOR
2. Menú → "Historial de Notificaciones"
3. Selecciona aula de sus cursos asignados
4. Opcionalmente filtra por alumno
5. Ve tabla con notificaciones enviadas/fallidas
6. Click "Ver" → detalle del mensaje
```

### Escenario C: Estudiante ve sus notificaciones

```
1. Login ESTUDIANTE (padre usa credenciales del hijo)
2. Al login se registra automáticamente el device token
3. Menú → "Historial de Notificaciones"
4. Ve solo las notificaciones de su cuenta
5. Puede marcar como leídas al ver el detalle
```

---

## 15. Archivos creados en este proyecto

```
app-academic-front/
├── documentatio/notificactioReadme.md          (este archivo)
├── public/
│   ├── firebase-messaging-sw.js                (service worker FCM)
│   ├── firebase-config.js                      (config SW, generado en build)
│   └── manifest.json                           (ampliado para PWA)
├── scripts/
│   └── generate-firebase-config.mjs            (genera firebase-config.js)
├── src/
│   ├── composables/usePushNotifications.js
│   ├── config/firebase.js
│   ├── services/PushNotificationService.js
│   ├── stores/pushNotifications.js
│   ├── views/push-notifications/
│   │   └── NotificationHistoryView.vue
│   └── components/push-notifications/
│       └── NotificationHistoryFilters.vue
```

## 16. Archivos modificados en este proyecto

```
app-academic-front/
├── package.json                 (dependencias + script prebuild)
├── vite.config.mjs              (vite-plugin-pwa)
├── index.html                   (meta tags PWA)
├── src/
│   ├── views/login/Login.vue    (registro push post-login)
│   ├── layouts/DefaultLayout.vue (re-registro token en mount)
│   ├── router/index.js          (ruta historial)
│   └── _nav.js                  (item menú notificaciones)
```

---

## 17. Requisitos para notificaciones con app cerrada

| Requisito | Detalle |
|-----------|---------|
| HTTPS | Obligatorio en producción |
| PWA instalada | Agregar a pantalla de inicio en Android |
| Permisos | Usuario debe aceptar notificaciones |
| Service Worker | `firebase-messaging-sw.js` registrado |
| Token registrado | POST exitoso a Laravel |
| Firebase configurado | Variables `VITE_FIREBASE_*` correctas |

---

## 18. Troubleshooting

| Problema | Causa | Solución |
|----------|-------|----------|
| No aparece permiso de notificaciones | Rol no es ESTUDIANTE | Login con cuenta estudiante |
| `messaging_unavailable` | Firebase no configurado | Verificar `VITE_FIREBASE_*` en `.env` |
| `permission_denied` | Usuario rechazó permisos | Habilitar en configuración del navegador |
| No llegan push con app cerrada | PWA no instalada o sin HTTPS | Instalar PWA, usar HTTPS |
| `firebase-config.js` con REPLACE_ME | No se ejecutó prebuild | `node scripts/generate-firebase-config.mjs` |
| Historial vacío | Sin notificaciones enviadas | Verificar scheduler Laravel y tokens |

---

## 19. Documentación relacionada

- **Backend Laravel:** `app-academic-back/documentatio/notificactioReadme.md`
- **Django (tabla de asistencias):** `app-academic-django/documentatio/notificactioReadme.md`
- **Despliegue:** `app-academic-back/DEPLOY_PUSH_NOTIFICATIONS.md`
