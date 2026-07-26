# CI/CD — Frontend Vue (VPS Ubuntu)

Despliegue automático con **GitHub Actions** → SSH al VPS.  
Misma llave SSH y mismos secrets de conexión que Django y Laravel.

| Rama | Carpeta en VPS (ejemplo) | Qué hace |
|------|--------------------------|----------|
| `develop` | `/var/www/tesis-unt/frontend-vue-dev` | `npm ci` + `npm run build` |
| `main` | `/var/www/tesis-unt/frontend-vue-prod` | Idem con `.env.production` del servidor |

```
Laptop ──git push──► GitHub (develop | main)
                         │
                         ▼  Actions + SSH (llave compartida)
                    VPS 161.132.48.188:22  (usuario percy)
                         │
                         ├── develop → frontend-vue-dev  → build → Nginx sirve dist/
                         └── main    → frontend-vue-prod → build → Nginx sirve dist/
```

Proyectos en el mismo VPS (nombres de ejemplo):

| Carpeta | Rol |
|---------|-----|
| `backend-django-dev` / `backend-django-prod` | Django |
| `backend-laravel-dev` / `backend-laravel-prod` | Laravel |
| `frontend-vue-dev` / `frontend-vue-prod` | Vue (este repo) |

**Build en el VPS** (recomendado): mismo patrón que los backends (`pull` + comando). Las variables `VITE_*` viven en `.env` / `.env.production` **en el servidor** (se hornean en el build; no van secretos sensibles ahí).

Guías hermanas: Django y Laravel en sus carpetas `documentation/desplieguedev.md`.

---

## Datos del VPS

| Ítem | Valor |
|------|--------|
| Host | `161.132.48.188` |
| Puerto | `22` |
| Usuario | `percy` |
| Llave Actions | Una sola para todos los repos |

Nginx debe apuntar el `root` (o alias) a la carpeta `dist/` de cada ambiente, por ejemplo:

- Dev: `/var/www/tesis-unt/frontend-vue-dev/dist`
- Prod: `/var/www/tesis-unt/frontend-vue-prod/dist`

---

## Qué hace el deploy (Vue)

1. Guarda commit actual.
2. `git pull` de la rama.
3. `npm ci` (o `npm install` si no hay lock estable).
4. `npm run build`.
5. Si el build falla → `git reset --hard` al commit anterior (el `dist/` anterior puede quedar; el siguiente build exitoso lo reemplaza).

**No hace:** tocar Nginx, ni desplegar Laravel/Django, ni subir `.env` desde Actions.

---

## Secrets GitHub (mismos 4)

| Secret | Valor |
|--------|--------|
| `VPS_HOST` | `161.132.48.188` |
| `VPS_USER` | `percy` |
| `VPS_SSH_KEY` | Clave privada `github_actions_vps_deploy` |
| `VPS_PORT` | `22` |

---

## Preparación en el VPS (una vez)

```bash
cd /var/www/tesis-unt/frontend-vue-dev
git checkout develop && git pull origin develop
# .env o .env.production con VITE_API_URL, VITE_API_URL_DJANGO, etc.
ls .env .env.production 2>/dev/null || true
node -v && npm -v

cd /var/www/tesis-unt/frontend-vue-prod
git checkout main && git pull origin main
ls .env.production
```

No hace falta systemd para Vue estático: Nginx sirve `dist/` tras el build.

---

## Workflows

- `.github/workflows/deploy-develop.yml`
- `.github/workflows/deploy-main.yml`

```bash
git add .github/workflows/ documentation/desplieguedev.md
git commit -m "ci: deploy automático Vue develop y main"
git push origin develop
```

---

## Uso diario

```bash
git push origin develop   # build en frontend-vue-dev
git push origin main      # build en frontend-vue-prod
```

Comprobar:

```bash
cd /var/www/tesis-unt/frontend-vue-dev && git log -1 --oneline && ls dist/index.html
```

---

## Checklist

- [ ] Secrets SSH iguales que Django/Laravel
- [ ] Node/npm en el VPS para el usuario `percy`
- [ ] `.env` / `.env.production` con URLs correctas por ambiente
- [ ] Nginx apunta a `dist/` de cada carpeta
- [ ] Actions en verde tras el primer push

---

## Por qué build en VPS (y no en Actions)

| Build en VPS | Build en Actions + subir dist |
|--------------|-------------------------------|
| Mismo flujo que Django/Laravel | Más pasos (artifact/rsync) |
| `.env.production` ya en el servidor | Hay que inyectar `VITE_*` en CI |
| Suficiente para un VPS de tesis | Mejor si el VPS se queda sin CPU/RAM |

Si más adelante el build satura el VPS, se puede pasar a Actions.

---

## Rollback manual

```bash
cd /var/www/tesis-unt/frontend-vue-dev
git reset --hard COMMIT_ANTERIOR
npm ci && npm run build
```

---

## Resumen

Misma llave SSH, carpetas por ambiente, `push` a `develop`/`main` → pull + `npm ci` + `npm run build`. Nginx sigue sirviendo el `dist/` actualizado.
