import { ExamenModel } from "../models/examen.model.js";
import { examenPermisoModel } from "../models/examenPermiso.model.js";
import { UserModel } from "../models/user.model.js";
import { bulkExamenQueries } from "./bulk_examen.query.js";
import { resultadoQueries } from "./resultado.query.js";
import { Op } from "sequelize";
import { DatabaseConfig as sequelize } from "../config/database.js";
import { emailService, bodyEmailCreateExam } from "../emailservice.js";
import ExcelHelper from "../helpers/excel.js";

class ExamenPermisoQueries {

    async store(permiso) {
        try {
            const { id_usuario, id_examen, fecha_limite, id_bulk_examen } = permiso;

            if (!Array.isArray(id_usuario) || id_usuario.length === 0) return { ok: false, data: null, message: "No se proporcionaron usuarios válidos." };

            const users = id_usuario.map(id => ({
                id_usuario: id,
                id_examen,
                fecha_limite,
                id_bulk_examen,
                intentos: 0
            }));

            const result = await examenPermisoModel.bulkCreate(users);

            const query = await examenPermisoModel.findAll({
                where: {
                    id_permiso: { [Op.in]: result.map(r => r.id_permiso) },
                    id_usuario: { [Op.in]: users.map(u => u.id_usuario) }
                },
                include: [
                    { model: UserModel, attributes: ['nombre', "app", "apm", 'correo'] },
                    { model: ExamenModel, attributes: ['nombre_examen'] }
                ]
            });

            if (!query)
                return { ok: false, data: null };

            return { ok: true, data: query };
        } catch (error) {
            console.error(error);
            return { ok: false, data: null };
        }
    }

    async BulkExcelImport(file, body) {
        try {
            // Extraemos los datos necesarios del cuerpo de la petición
            const { id_examen, id_institucion, fecha_limite, id_usuario } = body;

            // Validamos que todos los datos requeridos estén presentes
            if (!file || !id_examen || !id_institucion || !fecha_limite)
                return { ok: false, data: null, message: "Faltan datos necesarios para la importación." };

            // Leemos la hoja de Excel y extraemos los elementos (usuarios) como objetos
            const elements = await ExcelHelper.readOneSheet(file.buffer);

            // Buscamos en la base de datos los estudiantes cuyos correos coincidan con los del archivo Excel
            let students = await UserModel.findAll({
                attributes: ["id_usuario", "nombre", "app", "apm", "correo", "id_institucion"],
                where: { [Op.or]: elements.map(e => ({ correo: e.correo })) }
            });

            // Si no se encontró ningún estudiante, devolvemos un mensaje de error
            if (students.length === 0)
                return { ok: false, data: null, message: "No se encontraron estudiantes con los datos proporcionados." };

            // Filtramos los usuarios del Excel que no existen en la base de datos
            const notExistingUsers = elements.filter(e =>
                !students.some(s => e.correo === s.dataValues.correo)
            );

            // Formateamos solo los correos de los usuarios inexistentes
            const formattedNotExistingUsers = notExistingUsers.map(({ correo, ...resto }) => correo);

            // Si hay usuarios que no existen en la base de datos, se devuelve un mensaje de error
            if (notExistingUsers.length > 0)
                return { ok: false, data: formattedNotExistingUsers, message: "Algunos no existen en la base de datos, por favor, verifica el archivo." };

            // Verificamos si todos los estudiantes pertenecen a la institución indicada
            const usersWithDifferentInstitutions = students.filter(s =>
                s.dataValues.id_institucion.toString() !== id_institucion.toString()
            );

            // Formateamos solo los correos de los usuarios con instituciones diferentes
            const formattedUsersWithDifferentInstitutions = usersWithDifferentInstitutions.map(({ correo, ...resto }) => correo);

            // Si hay usuarios con instituciones distintas, devolvemos un mensaje de error
            if (usersWithDifferentInstitutions.length > 0)
                return { ok: false, data: formattedUsersWithDifferentInstitutions, message: "Algunos estudiantes no pertenecen a su misma institución" };

            // Verificamos si alguno de los estudiantes ya tiene un permiso activo para este examen
            const usersWithPermissions = await this.verifyActiveExamen(
                students.map(s => s.dataValues.id_usuario),
                id_examen
            );

            // Si hubo un error al verificar, devolvemos un mensaje de error
            if (!usersWithPermissions.ok)
                return { ok: false, data: null, message: "No se pudo verificar el examen activo." };

            // Si hay usuarios con permisos activos para este examen, devolvemos un mensaje de error
            if (usersWithPermissions.data.length > 0)
                return {
                    ok: false,
                    data: usersWithPermissions.data,
                    message: "Algunos estudiantes ya tienen permisos para el examen, no pueden recibir un permiso adicional para el mismo examen."
                };

            // Verificamos si ya tienen un certificado vigente del examen
            const usersWithActiveCertificate = await resultadoQueries.findApprovedResultsByExamenAndUsers(
                students.map(s => s.dataValues.id_usuario),
                id_examen
            );

            // Si hubo un error al verificar certificados, devolvemos un mensaje de error
            if (!usersWithActiveCertificate.ok)
                return { ok: false, data: null, message: "No se pudo verificar los certificados activos de los usuarios." };

            // Si hay usuarios con certificado vigente, devolvemos un mensaje de error
            if (usersWithActiveCertificate.data.length > 0)
                return {
                    ok: false,
                    data: usersWithActiveCertificate.data,
                    message: "Algunos estudiantes ya tienen un certificado vigente para el examen, no pueden recibir un permiso adicional para el mismo examen."
                };

            // Si todo está correcto, construimos el objeto para registrar el permiso masivo (bulk)
            const bulkExamenData = {
                id_examen,
                id_creator: id_usuario,
                fecha_limite,
                count_users: students.length,
            };

            // Guardamos el registro del permiso masivo en la base de datos
            const saveQuery = await bulkExamenQueries.store(bulkExamenData);

            // Si hubo un error al guardar, devolvemos un mensaje de error
            if (!saveQuery.ok)
                return { ok: false, data: null, message: 'Error al guardar los permisos en la base de datos.' };

            // Construimos el objeto con los permisos individuales a guardar
            const permisos = {
                id_usuario: students.map(s => s.dataValues.id_usuario),
                id_examen,
                fecha_limite,
                id_bulk_examen: saveQuery.data.id_bulk_examen,
            };

            // Guardamos los permisos individuales y devolvemos el resultado
            return this.store(permisos);
        } catch (error) {
            // Capturamos cualquier error inesperado y lo registramos
            console.error(error);
            return { ok: false, data: null, message: 'Hubo un problema al procesar el archivo.' };
        }
    }

    async findAll(condition = {}) {
        try {
            const query = await examenPermisoModel.findAll({
                where: condition,
                include: [
                    {
                        model: ExamenModel,
                        required: true,
                        attributes: { exclude: 'id_curso' }
                    }
                ]
            });
            return { ok: true, data: query };
        } catch (error) {
            console.error(error);
            return { ok: false, data: null };
        }
    }

    async verifyActiveExamen(id_usuario, id_examen) {
        const today = new Date();

        if (!Array.isArray(id_usuario) || id_usuario.length === 0)
            return { ok: false, data: null, message: "No se proporcionaron usuarios válidos." };

        try {
            const query = await examenPermisoModel.findAll({
                where: {
                    id_usuario: {
                        [Op.in]: id_usuario
                    },
                    id_examen,
                    fecha_limite: {
                        [Op.gte]: today
                    },
                    estado: {
                        [Op.or]: ["inactivo", "activo"]
                    }
                },
            });

            return { ok: true, data: query };
        } catch (error) {
            console.error(error);
            return { ok: false, data: null }
        }
    }

    countUsersWithSameBulk(id_bulk_examen) {
        if (!id_bulk_examen) return { ok: false, data: null, message: "No se proporcionó un id_bulk_examen válido." };

        return examenPermisoModel.count({
            where: { id_bulk_examen },
        });
    }

    // Método para autorizar un examen por bulk, autorizará a todos los usuarios del bulk
    async authorizeExamenByBulkExamen(data) {
        const { id_bulk_examen, examen, estado, alumnos } = data;

        const query = await examenPermisoModel.update(
            { estado: estado },
            {
                where: {
                    id_bulk_examen: id_bulk_examen,
                    estado: "inactivo"
                },
            },
        );

        if (query === 0)
            return { ok: true, data: null, message: "No se encontraron permisos para actualizar." };

        const link = `${process.env.FRONTEND_URL}/login`;

        for (const data of alumnos) {
            try {
                emailService.sendEmail(
                    data.correo,
                    `Permiso para el examen: ${examen}`,
                    bodyEmailCreateExam(data.nombre_completo, examen, data.fecha_limite, link)
                )
            } catch (error) {
                return { ok: false, data: null, message: 'Error al enviar el correo.' }
            }
        }

        return { ok: true, data: query };
    }

    async authorizeMasiveExamenByBulkExamen(data) {
        // bulkData es un arreglo de JSON. Cada JSON debe contener: id_bulk_examen, nombre_examen, fecha_limite
        const { bulkData, estado } = data;

        if (!bulkData || !estado) return { ok: false, data: null, message: "Faltan datos necesarios para autorizar el examen." };

        const idBulks = bulkData.map(bulk => bulk.id_bulk_examen);

        // Primero se obtienen todos los datos necesarios de los alumnos antes de actualizarlos y no sean recuperables después del update
        // Debido a que pueden haber datos de alumnos ya aceptados anteriormente y colarse
        // Se hace una transaction para indicar que estas 2 consultas deben de ir juntas

        const authorizedStudents = await sequelize.transaction(async (t) => {

            const obtenerAlumnos = await examenPermisoModel.findAll({
                attributes: ["id_bulk_examen"],
                where: {
                    id_bulk_examen: { [Op.in]: idBulks },
                    estado: "inactivo"
                },
                include: [
                    {
                        model: UserModel,
                        attributes: ["nombre", "app", "apm", "correo"],
                        required: true
                    }
                ],
                transaction: t
            });

            if (obtenerAlumnos.length === 0) return { ok: true, data: [] };

            // Se actualiza todos los alumnos de los bulks con estado inactivo
            const updatePermisos = await examenPermisoModel.update(
                { estado: estado },
                {
                    where: {
                        id_bulk_examen: { [Op.in]: idBulks },
                        estado: "inactivo"
                    },
                    transaction: t
                }
            )

            if (updatePermisos[0] === 0) return { ok: true, data: [] };

            const mapBulkData = new Map();

            for (const bulk of bulkData) {
                mapBulkData.set(bulk.id_bulk_examen, bulk);
            }

            // Mapear y fusionar los datos de forma eficiente
            const results = obtenerAlumnos.map(alumno => {
                const newData = mapBulkData.get(alumno.id_bulk_examen);

                const alumnoPlano = alumno.toJSON ? alumno.toJSON() : alumno;

                return {
                    ...alumnoPlano.UserModel,
                    nombre_examen: newData.nombre_examen,
                    fecha_limite: newData.fecha_limite,
                    id_bulk_examen: newData.id_bulk_examen,
                };
            });

            return { ok: true, data: results };
        })

        if (!authorizedStudents.ok) return { ok: false, data: null, message: "Error al autorizar los permisos masivos." };

        if (authorizedStudents.data.length === 0)
            return { ok: true, data: [], message: "No se encontraron permisos para actualizar." };

        // Enviar correos a los alumnos autorizados
        const link = `${process.env.FRONTEND_URL}/login`;

        for (const data of authorizedStudents.data) {
            const nombreCompleto = `${data.nombre} ${data.app} ${data.apm}`;
            try {
                emailService.sendEmail(
                    data.correo,
                    `Permiso para el examen: ${data.nombre_examen}`,
                    bodyEmailCreateExam(nombreCompleto, data.nombre_examen, data.fecha_limite, link)
                )
            } catch (error) {
                return { ok: false, data: null, message: 'Error al enviar el correo.' }
            }
        }

        const updatedBulks = [...new Set(authorizedStudents.data.map(alumno => alumno.id_bulk_examen))];

        return { ok: true, data: updatedBulks, message: "Permisos masivos autorizados correctamente." };
    }

    // Método para autorizar un examen por usuario (actualmente no se usa pero se deja por si se necesita en el futuro)
    async authorizeExamenByIdPermiso(data) {
        const { id_permisos, estado } = data;

        const query = await examenPermisoModel.update(
            { estado: estado },
            { where: { id_permiso: { [Op.in]: id_permisos } } }
        );

        if (!query) return { ok: false, data: null };

        return { ok: true, data: query };
    }

    async deleteByBulk(data) {
        try {
            const { id_usuario, id_bulk_examen } = data;

            if (!Array.isArray(id_usuario) || id_usuario.length === 0 || !id_bulk_examen)
                return { ok: false, data: null };

            const query = await examenPermisoModel.destroy({ where: { id_usuario: { [Op.in]: id_usuario }, id_bulk_examen } });

            if (query === 0)
                return { ok: false, data: null };

            return { ok: true, data: query };
        } catch (error) {
            console.error(error);
            return { ok: false, data: null };
        }
    }
}

export const examenPermisoQueries = new ExamenPermisoQueries();