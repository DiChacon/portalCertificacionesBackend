import express from 'express';
import { userController } from '../controllers/user.controllers.js';
import { certificadoController } from '../controllers/certificado.controllers.js';
import { examenController } from '../controllers/examen.controllers.js';
import { cursoController } from '../controllers/curso.controllers.js';
import { preguntaController } from '../controllers/pregunta.controllers.js';
import { institucionController } from '../controllers/institucion.controllers.js';
import { resultadoController } from '../controllers/resultado.controllers.js';
import { respuestaController } from '../controllers/respuesta.controllers.js';
import { examenPermisoController } from '../controllers/examenPermiso.controllers.js';
import { UploadFile } from '../middlewares/multer.middleware.js';
import { validateToken } from '../middlewares/accessToken.middleware.js';
import { validateNewPassword } from '../middlewares/newPassword.middleware.js';
import { LogoCertificadoController } from '../controllers/logoCertificado.controllers.js';
import { MantenimientoController } from '../controllers/mantenimiento.controllers.js';
import { EstadisticasController } from '../controllers/estadisticas.controllers.js';
import { estadoController } from '../controllers/estado.controller.js';
import { bulkExamenController } from '../controllers/bulk_examen.controller.js';
import { HandleRol } from '../middlewares/handleRol.middleware.js';

export class Routes {
    constructor() {
        this.router = express.Router();
        this.initRoutes();
    }

    initRoutes() {
    
        //Ruta para mantenimiento
        this.router.get('/apicp/mantenimiento', MantenimientoController.mantenimiento);
        
        // Rutas para USUARIO
            //Manejo de la sesión del usuario
            this.router.get('/apicp/auth', validateToken.validateJWT, userController.authenticate); // Ruta para obtener el payload del token y mantener persistencia de sesión
            this.router.post('/apicp/login', userController.login);
            this.router.post('/apicp/logout', validateToken.validateJWT, userController.logout);
            this.router.post('/apicp/nueva_contrasena', validateNewPassword.validate, userController.newPwd);
            this.router.post('/apicp/recuperar_password', userController.forgotPassword);
        this.router.post('/apicp/create_user', validateToken.validateJWT, userController.create);
        this.router.get('/apicp/find_user', validateToken.validateJWT, userController.findOne);
        this.router.put('/apicp/update_user/:id', validateToken.validateJWT, userController.updUser);
        this.router.get('/apicp/find_users', validateToken.validateJWT, userController.findAll);
        this.router.post('/apicp/bulk_users', validateToken.validateJWT, UploadFile.readExcel('fieldName'), userController.bulkUsers);

        // Rutas para CERTIFICADOS
        this.router.post('/apicp/create_certificado', validateToken.validateJWT, certificadoController.create);//Parece ser que este endpoint no se usa.
        this.router.get('/apicp/find_certificados', validateToken.validateJWT, certificadoController.findAll);
        this.router.get('/apicp/find_certificado', certificadoController.findOne);
        this.router.get('/apicp/find_certificado_user/:id', validateToken.validateJWT, certificadoController.findWithUser);
        this.router.get('/apicp/find_names_certificados_user/:id', validateToken.validateJWT, certificadoController.findNameCertifiedWithUser);
        this.router.get('/apicp/find_certificados_institucion/:id', validateToken.validateJWT, certificadoController.findWithInstitucion);


        // Rutas para EXÁMENES
        this.router.post('/apicp/create_examen', validateToken.validateJWT, examenController.create);
        this.router.get('/apicp/find_examenes', validateToken.validateJWT, examenController.findAll);
        this.router.get('/apicp/find_examen', validateToken.validateJWT, examenController.findOne);
        this.router.delete('/apicp/delete_examen/:id', validateToken.validateJWT, examenController.delete);//Este endpoint sí funciona pero de momento no se usa por integridad de los datos.
        this.router.put('/apicp/update_examen/:id', validateToken.validateJWT, examenController.update);
        this.router.get('/apicp/find_examenPreguntas/:id', validateToken.validateJWT, examenController.findExamenConPreguntas);//Parece ser que este endpoint no se usa actualmente.
        this.router.get('/apicp/find_preguntas_examen_editar/:id', validateToken.validateJWT, examenController.findExamenConPreguntasyRespuestas);

        // Rutas para CURSOS
        this.router.post('/apicp/create_curso', validateToken.validateJWT, cursoController.create);
        this.router.get('/apicp/find_curso', validateToken.validateJWT, cursoController.findOne);
        this.router.get('/apicp/find_cursos', validateToken.validateJWT, cursoController.findAll);
        this.router.delete('/apicp/delete_curso/:id', validateToken.validateJWT, cursoController.delete);//Este endpoint sí funciona pero de momento no se usa por integridad de los datos.
        this.router.put('/apicp/update_curso/:id', validateToken.validateJWT, cursoController.update);

        // Rutas para PREGUNTAS
        this.router.post('/apicp/create_pregunta', validateToken.validateJWT, UploadFile.unica('material_apoyo', 'uploads/materiales'), preguntaController.create);
        this.router.get('/apicp/find_pregunta', validateToken.validateJWT, preguntaController.findOne);
        this.router.get('/apicp/find_preguntas', validateToken.validateJWT, preguntaController.findAll);
        this.router.delete('/apicp/delete_pregunta/:id', validateToken.validateJWT, preguntaController.delete);
        this.router.put('/apicp/update_pregunta/:id', validateToken.validateJWT, UploadFile.unica('material_apoyo', 'uploads/materiales'), preguntaController.update);
        this.router.post('/apicp/find_preguntasExamen', validateToken.validateJWT, preguntaController.findPreguntasExamen);

        // Rutas para INSTITUCIONES
        this.router.post('/apicp/create_inst', validateToken.validateJWT, UploadFile.unica('logo_inst', 'uploads/logos'), institucionController.create);
        this.router.get('/apicp/find_inst', validateToken.validateJWT, institucionController.findOne);
        this.router.get('/apicp/find_instituciones', validateToken.validateJWT, institucionController.findAll);
        this.router.delete('/apicp/delete_inst/:id', validateToken.validateJWT, institucionController.delete);
        this.router.put('/apicp/update_inst/:id', validateToken.validateJWT, UploadFile.unica('logo_inst', 'uploads/logos'), institucionController.update);

        // Rutas para RESULTADOS
        this.router.post('/apicp/create_resultado', validateToken.validateJWT, resultadoController.create); //Parece que este endpoint no se usa actualmente.
        this.router.get('/apicp/find_resultado', validateToken.validateJWT, resultadoController.findOne); //Parece que este endpoint no se usa actualmente.
        this.router.get('/apicp/find_resultados', validateToken.validateJWT, resultadoController.findAll);
        this.router.delete('/apicp/delete_resultado/:id', validateToken.validateJWT, resultadoController.delete);//No se usa por integridad de los datos.
        this.router.put('/apicp/update_resultado/:id', validateToken.validateJWT, resultadoController.update);//No se usa por integridad de los datos.
        this.router.get('/apicp/find_resultado_user/:id', validateToken.validateJWT, resultadoController.findResultadosPorUsuario);

        // Rutas para RESPUESTAS
        this.router.post('/apicp/respuesta', validateToken.validateJWT, respuestaController.create); //No se usa actualmente
        this.router.get('/apicp/find_respuestas', validateToken.validateJWT, respuestaController.findAllWithUser); //No se usa actualmente
        this.router.post('/apicp/calificar', validateToken.validateJWT, resultadoController.calificar);

        // Rutas para PERMISOS DE EXÁMENES
        this.router.post('/apicp/create_permiso', validateToken.validateJWT, examenPermisoController.create);
        this.router.get('/apicp/find_permisos', validateToken.validateJWT, examenPermisoController.findAll);
        this.router.post('/apicp/bulk_exam_assignment', UploadFile.readExcel('fieldname'), examenPermisoController.bulkExcelImport); //Parece que no se utiliza
        this.router.get("/apicp/find_bulk_examen", validateToken.validateJWT, bulkExamenController.findBulkExamen);
        this.router.get("/apicp/find_bulk_examen_by_profesor/:id", validateToken.validateJWT, bulkExamenController.findBulkExamenByProfesor);
        this.router.get("/apicp/find_inactives_bulks", validateToken.validateJWT, bulkExamenController.findInactivesBulks);
        this.router.get("/apicp/find_users_with_same_bulk/:id", validateToken.validateJWT, bulkExamenController.findUsersWithSameBulk);
        this.router.post("/apicp/add_students_to_bulk_examen", validateToken.validateJWT, examenPermisoController.addStudentsToBulkExamen);
        this.router.delete("/apicp/delete_permisos_by_bulk", validateToken.validateJWT, examenPermisoController.deletePermisosByBulk);
        this.router.put("/apicp/let_bulk_examen", validateToken.validateJWT, examenPermisoController.authorizeExamen);
        this.router.put("/apicp/let_masive_bulk_examen", validateToken.validateJWT, examenPermisoController.authorizeMasiveExamen);

        //Rutas para LOGOS
        this.router.post('/apicp/create_logo', validateToken.validateJWT, UploadFile.unica('path', 'uploads/logos'), LogoCertificadoController.create);
        this.router.get('/apicp/find_logo', validateToken.validateJWT, LogoCertificadoController.findOne);
        this.router.get('/apicp/find_logos', validateToken.validateJWT, LogoCertificadoController.findAll);
        this.router.delete('/apicp/delete_logo/:id', validateToken.validateJWT, LogoCertificadoController.delete);
        this.router.put('/apicp/update_logo/:id', validateToken.validateJWT, UploadFile.unica('path', 'uploads/logos'), LogoCertificadoController.update);

        // Rutas para ESTADÍSTICAS
        this.router.get("/apicp/getStatistics", validateToken.validateJWT, EstadisticasController.getGeneralStatistics); //Ruta inservible

        //Rutas para ESTADOS
        this.router.get("/apicp/get_estados", validateToken.validateJWT, estadoController.findAll);

        
    }
}
