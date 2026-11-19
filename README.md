# API de Gestión de Productos (CRUD + JWT + MongoDB)

**URL en producción:** https://act-4-gestion-productos-api-full-st.vercel.app

Aplicación web desarrollada con **Node.js**, **Express.js**, **MongoDB (Mongoose)**, autenticación mediante **JWT**, vista estática de inicio de sesión en **HTML/CSS/JS**, pruebas unitarias automatizadas con **Jest** y pipeline **CI/CD** con **GitHub Actions** desplegado en **Vercel**.

## Requisitos previos
- Node.js v18 o superior
- Cuenta y clúster activo en MongoDB Atlas

## Instalación y ejecución local
1. Clonar el repositorio:
   ```bash
   git clone (https://github.com/GSL94-TM/ACT-4---gestion-productos-api---FullStack.git)
   cd gestion-productos-api
   ```
2. Instalar dependencias:
   ```bash
   npm install
   ```
3. Crear un archivo `.env` en la raíz tomando como base `.env.example`:
   ```env
   PORT=3000
   MONGO_URI=tu_cadena_de_conexion_mongodb_atlas
   JWT_SECRET=tu_clave_secreta_jwt
   JWT_EXPIRES_IN=2h
   ```
4. Iniciar el servidor en modo desarrollo:
   ```bash
   npm run dev
   ```
   - Vista de login: `http://localhost:3000/`
   - Estado de la API: `http://localhost:3000/api/health`

## Pruebas unitarias
```bash
npm test
npm run test:coverage
```

## Endpoints principales
- `POST /api/auth/register` — Registro de usuario
- `POST /api/auth/login` — Inicio de sesión y emisión de JWT
- `POST /api/auth/logout` — Cierre de sesión (requiere Bearer Token)
- `GET /api/auth/profile` — Perfil autenticado (requiere Bearer Token)
- `GET /api/products` — Listar productos (requiere Bearer Token)
- `GET /api/products/:id` — Consultar producto por ID (requiere Bearer Token)
- `POST /api/products` — Crear producto (requiere Bearer Token)
- `PUT /api/products/:id` — Actualizar producto (requiere Bearer Token)
- `DELETE /api/products/:id` — Eliminar producto (requiere Bearer Token)