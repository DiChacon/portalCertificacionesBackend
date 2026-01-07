import { examenPermisoQueries } from "../queries/examenPermiso.query.js";
import { bulkExamenQueries } from "../queries/bulk_examen.query.js";
import { resultadoQueries } from "../queries/resultado.query.js";
class ExamenPermisoController {

    async create(req, res) {
        try {
            const body = req.body;

            // // Verificamos si algun usuario ya tiene permiso para el examen
            const usersWithPermissions = await examenPermisoQueries.verifyActiveExamen(body.id_usuario, body.id_examen);

            // // Si no se pudo verificar el examen activo, retornar error
            if (!usersWithPermissions.ok)
                return res.status(400).json({ ok: false, data: null, message: "No se pudo verificar el examen activo." });

            // // Si alguno de los estudiantes ya tiene permiso para el examen, no se le puede asignar otro del mismo tipo
            if (usersWithPermissions.data.length > 0)
                return res.status(200).json({ ok: false, data: usersWithPermissions.data, message: "Algunos estudiantes ya tienen permisos para el examen, no pueden recibir un permiso adicional para el mismo examen." });

            // Verificamos si ya tiene un certificado vigente del examen
            const usersWithActiveCertificate = await resultadoQueries.findApprovedResultsByExamenAndUsers(body.id_usuario, body.id_examen);

            // Si no se pudo verificar los certificados activos, retornar error
            if (!usersWithActiveCertificate.ok)
                return res.status(400).json({ ok: false, data: null, message: "No se pudo verificar los certificados activos de los usuarios." });

            // Si alguno de los estudiantes ya tiene un certificado vigente, no se le puede asignar un permiso adicional para el mismo examen
            if (usersWithActiveCertificate.data.length > 0)
                return res.status(200).json({ ok: false, data: usersWithActiveCertificate.data, message: "Algunos estudiantes ya tienen un certificado vigente para el examen, no pueden recibir un permiso adicional para el mismo examen." });

            const bulkExamenData = {
                id_examen: body.id_examen,
                id_creator: body.id_creator,
                fecha_limite: body.fecha_limite,
                count_users: body.id_usuario.length,
            }

            const saveQuery = (await bulkExamenQueries.store(bulkExamenData));

            if (!saveQuery.ok) return res.status(200).json({ ok: false, data: null, message: 'Error al guardar los permisos.' });

            const permisos = {
                id_usuario: body.id_usuario,
                id_examen: body.id_examen,
                estado: body.estado,
                fecha_limite: body.fecha_limite,
                id_bulk_examen: saveQuery.data.id_bulk_examen,
            }

            const query = await examenPermisoQueries.store(permisos);

            if (!query.ok) 
                return res.status(400).json({ ok: false, data: null, message: 'No se pudo crear el permiso para realizar el examen' });

            return res.status(200).json({ ok: true, data: query.data });

        } catch (error) {
            console.error(error);
            return res.status(404).json({ ok: false, data: null, message: 'Hubo un problema en el servidor.' });

        }
    }

    async bulkExcelImport(req, res) {
        try {
            const body = req.body;
            const file = req.file;

            const query = await examenPermisoQueries.BulkExcelImport(file, body);
            
            if (!query.ok) 
                return res.status(400).json({ ok: false, data: query.data, message: query.message });

            return res.status(200).json({ ok: true, data: query.data, message: 'Permisos creados y correos enviados exitosamente.' });

        } catch (error) {
            console.error(error);
            return res.status(404).json({ ok: false, data: null, message: 'Hubo un problema en el servidor.' });
        }
    }

    async findAll(req, res){
        try {
            const body = req.query;
            
            const query = await examenPermisoQueries.findAll(body);
            
            if (query.ok) 
                return res.status(200).json({ ok: true, data: query.data });
            else
                return res.status(400).json({ ok: false, data: null, message: 'No se pudieron obtener los examenes a contestar.' });
        } catch (error) {
            console.error(error);
            return res.status(404).json({ ok: false, data: null, message: 'Hubo un problema en el servidor.' });
        }
    }

    async authorizeExamen(req, res) {
        try {
            const data = req.body;

            const query = await examenPermisoQueries.authorizeExamenByBulkExamen(data);

            if (!query.ok) return res.status(400).json({ ok: false, data: null, message: "No se pudo administrar el examen." });

            if (query.data.length === 0)
                return res.status(404).json({ ok: false, data: null, message: "No se encontraron permisos para el examen." });

            return res.status(200).json({ ok: true, message: "Permisos administrados exitosamente." });
        }catch (error) {
            console.error(error);
            return res.status(404).json({ ok: false, data: null, message: 'Hubo un problema en el servidor.' });
        }
    }

    // Este authorizeMasiveExamen ocupo otra lógica diferente al authorizeExamen, ya que este recibe un array de objetos con los datos del examen y los usuarios
    // esto se hizo con el fin de optimizar el proceso de autorización de permisos masivos para examenes
    // ya que son demasiados bulks de examenes que se tienen que autorizar
    async authorizeMasiveExamen(req, res) {
        try {
            const data = req.body;
            
            const query = await examenPermisoQueries.authorizeMasiveExamenByBulkExamen(data);

            if (!query.ok || query.data === null) return res.status(400).json({ ok: false, data: null, message: "No se pudo administrar el examen." });

            if (query.data.length === 0)
                return res.status(200).json({ ok: false, data: null, message: "No se encontraron grupos que necesiten autorización." });

            return res.status(200).json({ ok: true, data: query.data, message: "Permisos de los grupos administrados exitosamente." });
        } catch (error) {
            console.error(error);
            return res.status(404).json({ ok: false, data: null, message: 'Hubo un problema en el servidor.' });
        }
    }

     async addStudentsToBulkExamen(req, res) {
        try {
            const dataStudents = req.body;

            const doesBulkExist = await bulkExamenQueries.verifyBulkExists(dataStudents.id_bulk_examen);

            if (!doesBulkExist.ok) return res.status(400).json({ ok: false, data: null, message: "El bulk de examen no existe o no se encontró." });

            // Verificar si el permiso ya existe para el usuario
            const query = await examenPermisoQueries.verifyActiveExamen(dataStudents.id_usuario, dataStudents.id_examen);

            // Si no se pudo verificar el examen activo, retornar error
            if (!query.ok) return res.status(400).json({ ok: false, data: null, message: "No se pudo verificar el examen activo." });

            // Si el usuario ya tiene ese examen activo, no se le puede asignar otro del mismo tipo
            if (query.data.length > 0) 
                return res.status(200).json({ ok: false, data: query.data, message: "Algunos estudiantes ya tienen permisos para el examen, no pueden recibir un permiso adicional para el mismo examen. Si desea agregarlos a este grupo, por favor elimínelos del grupo donde tienen el permiso." });

            // Verificamos si ya tiene un certificado vigente del examen
            const usersWithActiveCertificate = await resultadoQueries.findApprovedResultsByExamenAndUsers(dataStudents.id_usuario, dataStudents.id_examen);

            // Si no se pudo verificar los certificados activos, retornar error
            if (!usersWithActiveCertificate.ok)
                return res.status(400).json({ ok: false, data: null, message: "No se pudo verificar los certificados activos de los usuarios." });

            // Si alguno de los estudiantes ya tiene un certificado vigente, no se le puede asignar un permiso adicional para el mismo examen
            if (usersWithActiveCertificate.data.length > 0)
                return res.status(200).json({ ok: false, data: usersWithActiveCertificate.data, message: "Algunos estudiantes ya tienen un certificado vigente para el examen, no pueden recibir un permiso adicional para el mismo examen." });

            const numberOfStudents = await examenPermisoQueries.countUsersWithSameBulk(dataStudents.id_bulk_examen);

            const updatePermiso = await examenPermisoQueries.store(dataStudents);

            if (!updatePermiso.ok) 
                return res.status(400).json({ ok: false, data: null, message: "No se pudo crear el permiso para realizar el examen." });

            // Actualizar la cantidad de alumnos en el bulk
            await bulkExamenQueries.update(dataStudents.id_bulk_examen, { count_users: numberOfStudents + updatePermiso.data.length });

            return res.status(200).json({ ok: true, data: updatePermiso.data, message: "Permisos creados y correos enviados exitosamente." });

        } catch (error) {
            console.error(error);
            return res.status(404).json({ ok: false, data: null, message: 'Hubo un problema en el servidor.' });
        }
    }

    async deletePermisosByBulk(req, res) {
        try {
            const data = req.body;

            const query = await examenPermisoQueries.deleteByBulk(data);

            if (!query.ok) return res.status(400).json({ ok: false, data: null, message: "No se pudo eliminar el permiso." });

            const numberOfStudents = await examenPermisoQueries.countUsersWithSameBulk(data.id_bulk_examen);

            // Actualizar la cantidad de alumnos en el bulk
            await bulkExamenQueries.update(data.id_bulk_examen, { count_users: numberOfStudents });

            //Si el conteno de alumnos es 0 (ya no existen alumnos en el bulk) se elimina el bulk
            if(numberOfStudents === 0){
                const deleteBulk = await bulkExamenQueries.delete(data.id_bulk_examen);
                if (!deleteBulk.ok) return res.status(400).json({ ok: false, data: null, message: "No se pudo eliminar el bulk de examen." });

                return res.status(200).json({ ok: true, data: query.data, message: "Permisos y bulk de examen eliminado exitosamente." });
            }

            return res.status(200).json({ ok: true, data: query.data, message: "Permisos eliminado exitosamente." });

        } catch (error) {
            console.error(error);
            return res.status(404).json({ ok: false, data: null, message: 'Hubo un problema en el servidor.' });
        }
    }
}

export const examenPermisoController = new ExamenPermisoController();