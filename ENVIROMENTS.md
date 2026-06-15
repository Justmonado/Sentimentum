# ENVIRONMENTS

Documentación de entornos del proyecto **Next.js** (full-stack).

> Este documento describe el entorno de **Producción** y el pipeline de CI que lo respalda.

---

## Stack y requisitos

| Componente         | Versión / Detalle                                      |
| ------------------ | ------------------------------------------------------ |
| Framework          | Next.js                                                |
| Runtime            | Node.js `22`                                           |
| Gestor de paquetes | pnpm `10`                                              |
| Lockfile           | `pnpm-lock.yaml` (instalación con `--frozen-lockfile`) |

> Este proyecto **no requiere variables de entorno** ni base de datos.

---

## Producción

| Campo                    | Valor                       |
| ------------------------ | --------------------------- |
| Plataforma de despliegue | Google Cloud                |
| URL                      | _Por definir_               |
| Rama desplegada          | `main`                      |
| Trigger de despliegue    | Push / merge a `main`       |

### Comandos de build

```bash
# Instalación de dependencias (exacta, según lockfile)
pnpm install --frozen-lockfile

# Build de producción
pnpm build
```

> El artefacto generado es el directorio `.next/`.

---

## CI / Integración continua

Pipeline definido en `.github/workflows/ci.yml`.

**Se ejecuta en:**
- `push` a las ramas `main` y `develop`
- `pull_request` hacia `main`

**Pasos del job `build-and-test`** (runner: `ubuntu-latest`):

1. Checkout del código (`actions/checkout@v4`)
2. Setup de pnpm (`pnpm/action-setup@v4`, versión `10`) con caché
3. Setup de Node.js `22` (`actions/setup-node@v4`)
4. Instalación de dependencias: `pnpm install --frozen-lockfile`
5. Lint: `pnpm lint` (ESLint)
6. Pruebas: `pnpm test`
7. Build de producción: `pnpm build`
8. Subida del artefacto `next-build-output` (`.next/`)

> ⚠️ **Nota:** en el `ci.yml` actual el paso *"Instalar pnpm"* (`pnpm/action-setup@v4`) aparece **duplicado**. Conviene dejar solo una vez la acción —idealmente la que incluye `version` y `cache`— para evitar pasos redundantes.

---

## Pendientes

- [ ] Definir y documentar la URL de producción.