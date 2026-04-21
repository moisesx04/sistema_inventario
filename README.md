# Inventario 1

Sistema de gestión de inventario moderno desarrollado con Next.js, Prisma y PostgreSQL.

> **Desarrollado por Moises Cuevas**

---

## 🚀 Stack Tecnológico

| Tecnología | Uso |
|---|---|
| **Next.js 16** | Framework React con App Router |
| **TypeScript** | Tipado estático |
| **Tailwind CSS v4** | Estilos utilitarios |
| **shadcn/ui** | Componentes de interfaz |
| **Prisma 7** | ORM para la base de datos |
| **PostgreSQL** | Base de datos relacional |
| **React Query** | Fetching, cache y sincronización de datos |
| **Zustand** | Estado global de la UI |
| **react-hook-form** | Manejo de formularios con validación |

---

## ✨ Funcionalidades

- 🔐 **Autenticación local** con middleware de protección de rutas
- 📊 **Dashboard** con métricas en tiempo real (capital total, stock crítico, agotados)
- 📦 **CRUD de productos** completo (crear, editar, eliminar)
- 🔍 **Búsqueda server-side** con debounce (nombre, SKU, descripción)
- 🏷️ **Estados de stock** automáticos: Disponible / Poco Stock / Agotado
- ⚙️ **Página de Configuración** con purga de datos protegida por contraseña
- 🧭 **Panel de navegación lateral** (Sidebar) responsivo

---

## 🛠️ Instalación y Uso Local

### Prerequisitos

- Node.js 18+
- PostgreSQL (o Podman/Docker)

### 1. Clonar el repositorio

```bash
git clone https://github.com/moisesx04/sistema_inventario.git
cd sistema_inventario
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/inventory?schema=public"
```

### 4. Levantar PostgreSQL con Podman (opcional)

```bash
podman run -d --name inventory-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=inventory \
  -p 5432:5432 \
  docker.io/library/postgres:latest
```

### 5. Aplicar migraciones y generar el cliente

```bash
npx prisma migrate dev
npx prisma generate
```

### 6. Iniciar el servidor de desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## 🔑 Credenciales de Demo

| Acceso | Usuario | Contraseña |
|---|---|---|
| Sistema (Login) | `admin` | `admin` |
| Purgar datos (Settings) | — | `admin2024` |

---

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── api/
│   │   ├── products/          # CRUD de productos
│   │   └── settings/purge/    # Endpoint para purgar datos
│   ├── dashboard/
│   │   ├── inventory/         # Vista de inventario
│   │   ├── settings/          # Configuración del sistema
│   │   └── page.tsx           # Dashboard principal
│   └── login/                 # Página de inicio de sesión
├── components/
│   ├── inventory/             # Tabla y formulario de productos
│   ├── layout/                # Sidebar de navegación
│   └── ui/                    # Componentes shadcn/ui
└── lib/
    ├── hooks/                 # Custom hooks (debounce)
    ├── prisma.ts              # Cliente de base de datos
    └── store.ts               # Estado global (Zustand)
```

---

## 📄 Licencia

Proyecto privado — © 2025 Moises Cuevas. Todos los derechos reservados.
