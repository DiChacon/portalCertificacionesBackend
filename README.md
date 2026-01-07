# 🎓 Back Plataforma de Certificación STEM

Una plataforma web completa para la gestión de usuarios, exámenes, cursos y certificaciones, diseñada para instituciones educativas. Permite una administración segura y eficiente con roles de usuario bien definidos.

---

## 📚 Sobre el Proyecto

Este proyecto es una aplicación construida con tecnologías modernas de JavaScript. Es una **API REST robusta** construida con **Express.js** y **Node.js**.

La comunicación con la base de datos se maneja a través del ORM **Sequelize**, y la autenticación se asegura mediante **JSON Web Tokens (JWT)**.

---

### 🔑 Características Principales

- **Gestión de Roles**:  
  Sistema de autenticación con 3 roles de usuario:
  - 👑 **Administrador:** Control total sobre la plataforma.
  - 👨‍🏫 **Maestro:** Gestión de usuarios, exámenes y cursos de su institución.
  - 👨‍🎓 **Alumno:** Acceso para realizar exámenes y consultar certificaciones.

- **Gestión de Archivos:**  
  Carga y procesamiento de archivos **Excel (.xlsx)** para la creación masiva de usuarios y asignación de exámenes, utilizando **Multer** en el backend.

- **Seguridad en Backend:**  
  Middlewares personalizados en Express para proteger rutas y validar datos, asegurando que solo los usuarios autorizados puedan realizar ciertas acciones.

- **API RESTful:**  
  Endpoints bien definidos para todas las operaciones CRUD de las entidades principales de la aplicación.

---

## ⚙️ Tech Stack

### 🧠 Backend
- [Node.js](https://nodejs.org/)
- [Express.js](https://expressjs.com/es/)
- [Sequelize](https://sequelize.org/)
- [JSON Web Token (JWT)](https://jwt.io/)
- [Multer](https://github.com/expressjs/multer)
- [xlsx](https://www.npmjs.com/package/xlsx)

### 🗃️ Base de Datos
- [MySQL](https://www.mysql.com/)

---

## 📦 Dependencias principales

| Paquete           | Versión       | Descripción breve                            |
|-------------------|---------------|-----------------------------------------------|
| `bcryptjs`        | ^2.4.3        | Hashing de contraseñas                       |
| `cookie-parser`   | ^1.4.7        | Parseo de cookies en las peticiones HTTP     |
| `cors`            | ^2.8.5        | Permite solicitudes entre distintos orígenes |
| `dotenv`          | ^16.4.5       | Carga variables de entorno desde `.env`      |
| `express`         | ^4.21.1       | Framework web minimalista para Node.js       |
| `jsonwebtoken`    | ^9.0.2        | Firmado y verificación de tokens JWT         |
| `multer`          | ^1.4.5-lts.1  | Manejo de subida de archivos multipart       |
| `mysql2`          | ^3.11.3       | Cliente MySQL compatible con Promesas        |
| `nodemailer`      | ^6.9.16       | Envío de correos desde Node.js               |
| `sequelize`       | ^6.37.4       | ORM para bases de datos SQL                  |
| `sequelize-cli`   | ^6.6.2        | Herramientas CLI para Sequelize              |
| `xlsx-populate`   | ^1.21.0       | Manipulación avanzada de archivos Excel      |

---

## 🚀 Empezando

Para tener una copia local del proyecto funcionando, sigue estos pasos:

### 🧩 Prerrequisitos

- Node.js (versión 18.x o superior)
    ```bash
    node -v
    ```
    Puedes instalarlo desde: [https://nodejs.org/es/download](https://nodejs.org/es/download)

- Un gestor de base de datos MySQL (como [XAMPP](https://www.apachefriends.org/es/index.html))

### 🛠️ Instalación

1. Clona el repositorio:
    ```bash
    git clone https://github.com/Daniel160901/BackCertificaciones.git
    cd BackCertificaciones
    ```

2. Instala las dependencias:
    ```bash
    npm install
    ```

3. Crea un archivo `.env` basado en `.env.example` con tus credenciales y clave JWT.

4. Ejecuta las migraciones con Sequelize (si aplica).

5. Inicia el servidor:
    ```bash
    npm start
    ```

La API correrá en `http://localhost:3000` (o el puerto que definas).

---

## 🗂️ Estructura del Proyecto

```plaintext
BackCertificaciones/
│   .env
│   app.cjs
│   app.mjs
│   associations.zip
│   emailservice.js
│   estructura.txt
│   package-lock.json
│   package.json

├── associations/
│   └── associations.js

├── config/
│   ├── config.js
│   └── database.js

├── controllers/
│   ├── bulk_examen.controller.js
│   ├── certificado.controllers.js
│   ├── curso.controllers.js
│   ├── estadisticas.controllers.js
│   ├── estado.controller.js
│   ├── examen.controllers.js
│   ├── examenPermiso.controllers.js
│   ├── institucion.controllers.js
│   ├── logoCertificado.controllers.js
│   ├── mantenimiento.controllers.js
│   ├── pregunta.controllers.js
│   ├── recuperacion.controller.js
│   ├── respuesta.controllers.js
│   ├── resultado.controllers.js
│   └── user.controllers.js

├── helpers/
│   ├── dataValidator.js
│   ├── excel.js
│   └── payload.js

├── keys/
│   ├── private.pem
│   └── public.pem

├── middlewares/
│   ├── accessToken.middleware.js
│   ├── excelValidator.middleware.js
│   ├── handleRol.middleware.js
│   ├── maintenanceMode.middleware.js
│   ├── multer.middleware.js
│   └── newPassword.middleware.js

├── models/
│   ├── bulk.model.js
│   ├── bulk_examen.model.js
│   ├── certificado.model.js
│   ├── curso.model.js
│   ├── estado.model.js
│   ├── examen.model.js
│   ├── examenPermiso.model.js
│   ├── institucion.model.js
│   ├── logoCertificado.model.js
│   ├── pregunta.model.js
│   ├── respuesta.model.js
│   ├── resultado.model.js
│   ├── rol.model.js
│   └── user.model.js

├── queries/
│   ├── bulk.query.js
│   ├── bulk_examen.query.js
│   ├── certificado.query.js
│   ├── curso.query.js
│   ├── estados.query.js
│   ├── examen.query.js
│   ├── examenPermiso.query.js
│   ├── institucion.query.js
│   ├── logoCertificado.query.js
│   ├── pregunta.query.js
│   ├── respuesta.query.js
│   ├── resultado.query.js
│   └── user.query.js

├── routes/
│   └── routes.js

└── uploads/
    ├── logos/
    ├── materiales/
    └── pagina/
```

---

## 📖 Uso

Una vez que la aplicación esté corriendo, solicita al administrador del proyecto credenciales para probar los distintos roles.

---

## 🤝 Colaboradores

| Nombre         | Correo                                      | GitHub                                      | LinkedIn                                      |
|----------------|---------------------------------------------|---------------------------------------------|-----------------------------------------------|
| **Daniel160901** | [daniboy_160901@hotmail.com](mailto:daniboy_160901@hotmail.com) | [Daniel160901](https://github.com/Daniel160901) | — |
| **DiChacon**     | [diegopimentel1202@gmail.com](mailto:diegopimentel1202@gmail.com) | — | — |
| **Alfonsin13**   | [pollicida13@outlook.com](mailto:pollicida13@outlook.com) | [Alfonsin13](https://github.com/Alfonsin13) | — |
| **Tongother**    | [nettelgunther@outlook.es](mailto:nettelgunther@outlook.es) | [Tongother](https://github.com/Tongother) | [Gunther Nettel](https://www.linkedin.com/in/gunthernettel/) |

---

## 🔗 Repositorio

🔗 [https://github.com/Daniel160901/BackCertificaciones.git](https://github.com/Daniel160901/BackCertificaciones.git)