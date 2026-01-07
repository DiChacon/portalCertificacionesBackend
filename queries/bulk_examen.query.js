import { BulkExamenModel } from "../models/bulk_examen.model.js";
import { ExamenModel } from "../models/examen.model.js";
import { examenPermisoModel } from "../models/examenPermiso.model.js";
import { UserModel } from "../models/user.model.js";
import { Op } from "sequelize";

class BulkExamenQueries {
    async store(bulk) {
        try {
            const query = await BulkExamenModel.create(bulk);
            if (query) return { ok: true, data: query.dataValues, message: "Bulk creado correctamente" };
            else return { ok: false, data: null };
        } catch (e) {
            console.log("Error al crear el bulk", e);
            return { ok: false, data: null };
        }
    }

    async verifyBulkExists(id) {
        try {
            const query = await BulkExamenModel.findOne({ where: { id_bulk_examen: id } });
            if (query) return { ok: true, data: query.dataValues };
            else return { ok: false, data: null };
        } catch (e) {
            console.log("Error al buscar el bulk de examen:", e);
            return { ok: false, data: null };
        }
    }

    async findAll(condition = {}) {
        try {
            const query = await BulkExamenModel.findAll({
                where: condition,
                attributes: [
                    "id_bulk_examen",
                    "created_at",
                    "count_users",
                ],
                include: [
                    {
                        model: UserModel,
                        required: true,
                        attributes: ["nombre", "app", "apm", "correo", "id_rol"],
                    },
                    {
                        model: ExamenModel,
                        required: true,
                        attributes: ["nombre_examen"],
                    },
                    {
                        model: examenPermisoModel,
                        required: true,
                        attributes: ["id_permiso", "fecha_limite", "estado", "intentos"],
                        include: [
                            {
                                model: UserModel,
                                required: true,
                                attributes: ["id_usuario", "nombre", "app", "apm", "correo"]
                            },
                        ]
                    }
                ]
            });

            if (query.length === 0) return { ok: false, data: null };

            return { ok: true, data: query };
        } catch (e) {
            console.log("Error al buscar bulk examenes:", e);
            return { ok: false, data: null };
        }
    }

    async findAllBulks() {
        try {
            // Ejecutamos una consulta para obtener los creadores de bulks por usuario.
            const creadores = await BulkExamenModel.findAll({
                attributes: ["id_creator"],
                include: [
                    {
                        model: UserModel,
                        required: true,
                        attributes: ["id_usuario", "nombre", "app", "apm"],
                    }
                ],
                // Aquí agrupamos por el id_creator para evitar duplicados, solo para obtener los creadores únicos.
                group: ["id_creator"]
            })

            if (creadores.length === 0) return { ok: true, data: [] };

            // Extraemos los ids de los creadores únicos.
            const userIds = creadores.map(creator => creator.id_creator);
            
            const query = await BulkExamenModel.findAll({
                where: { id_creator: {
                    [Op.in]: userIds
                }},
                attributes: [
                    "id_creator",
                    "id_bulk_examen",
                    "fecha_limite",
                    "created_at",
                    "count_users",
                ],
                include: [
                    {
                        model: ExamenModel,
                        required: true,
                        attributes: ["nombre_examen"],
                    }
                ],
            });

            if (query.length === 0) return { ok: false, data: [] };

            // Finalmente, aquí se fusionan los datos en JavaScript

            // Creamos un "mapa" para buscar los nombres de los creadores por su ID rápidamente.
            const mapaDeCreadores = new Map();
            creadores.forEach(creador => {
                const infoUsuario = creador.UserModel;
                mapaDeCreadores.set(infoUsuario.id_usuario, {
                    nombreCompleto: `${infoUsuario.nombre} ${infoUsuario.app || ''} ${infoUsuario.apm || ''}`.trim()
                });
            });

            // Ahora, fusionamos los datos de los creadores con los bulks.
            // Para cada bulk, buscamos el creador correspondiente y lo añadimos al resultado.
            const resultadoFusionado = creadores.map(creador => {
                const infoCreador = mapaDeCreadores.get(creador.id_creator);
                const bulk = query.filter(b => b.id_creator === creador.id_creator);

                return {
                    creador: infoCreador,
                    bulks: bulk
                };
            });

            return { ok: true, data: resultadoFusionado };
        } catch (e) {
            return { ok: false, data: null };
        }
    }

    async findAllBulksByUserId(userId) {
        try {
            const query = await BulkExamenModel.findAll({
                where: { id_creator: userId },
                attributes: [
                    "id_bulk_examen",
                    "fecha_limite",
                    "created_at",
                    "count_users",
                ],
                include: [
                    {
                        model: ExamenModel,
                        required: true,
                        attributes: [
                            "nombre_examen",
                        ],
                    }
                ],
            });

            if (query.length === 0) return res.status(200).json([]);

            // PASO 2: Contar alumnos inactivos usando la llave correcta -> id_bulk_examen
            const bulkIds = query.map(bulk => bulk.id_bulk_examen); // Obtenemos los IDs de los bulks

            const conteoInactivos = await examenPermisoModel.count({
                where: {
                    id_bulk_examen: { [Op.in]: bulkIds }, // Buscamos por el ID del bulk
                    estado: "inactivo"
                },
                group: ['id_bulk_examen'], // Agrupamos por el ID del bulk
            });

            // PASO 3: Organizar los conteos en un mapa para búsqueda rápida
            const mapaDeConteos = new Map();
            for (const item of conteoInactivos) {
                mapaDeConteos.set(item.id_bulk_examen, item.count);
            }

            // PASO 4: Unir los datos originales con los nuevos conteos
            const resultadoFinal = query.map(bulk => {
                // Convertimos la instancia de Sequelize a un objeto plano para poder modificarlo
                const bulkPlano = bulk.toJSON();
                
                // Buscamos el conteo en nuestro mapa por el ID del bulk
                const alumnosInactivos = mapaDeConteos.get(bulkPlano.id_bulk_examen) || 0;
                
                // Agregamos el nuevo campo al objeto
                bulkPlano.alumnosInactivos = alumnosInactivos;
                
                return bulkPlano;
            });

            return { ok: true, data: resultadoFinal };
        } catch (e) {
            return { ok: false, data: null };
        }
    }

    async findAllInactivesBulks() {
        try {
            const query = await BulkExamenModel.findAll({
                attributes: [
                    "id_bulk_examen", "created_at", "count_users",
                ],
                include: [
                    {
                        model: ExamenModel,
                        required: true,
                        attributes: ["nombre_examen"],
                    },
                    {
                        model: UserModel,
                        required: true,
                        attributes: ["nombre", "app", "apm"]
                    },
                    {
                        model: examenPermisoModel,
                        where: { estado: 'inactivo', fecha_limite: {[Op.gte]: new Date()}}, //Extrae solamente los bulks inactivos ya sea por estado o porque ya pasó su fecha límite.
                        attributes: [],
                        required: true
                    }
                ]
            });

            if (query.length === 0) return { ok: false, data: null };

            return { ok: true, data: query };
        } catch (e) {
            return { ok: false, data: null };
        }
    }

    async findUsersWithSameBulkById(id) {
        try {
            const query = await BulkExamenModel.findOne({
                where: { id_bulk_examen: id },
                attributes: [],
                include: [
                    {
                        model: ExamenModel,
                        required: true,
                        attributes: ["id_examen", "nombre_examen"],
                    },
                    {
                        model: examenPermisoModel,
                        required: true,
                        attributes: ["id_permiso", "fecha_limite", "estado", "intentos"],
                        include: [
                            {
                                model: UserModel,
                                required: true,
                                attributes: ["id_usuario", "nombre", "app", "apm", "correo"]
                            },
                        ]
                    }
                ]
            });

            if (!query) return { ok: false, data: null };

            return { ok: true, data: query };
        } catch (e) {
            console.log("Error al buscar bulk examen:", e);
            return { ok: false, data: null };
        }
    }

    async update(id, bulk) {
        try {
            const query = await BulkExamenModel.update(bulk, {
                where: { id_bulk_examen: id },
                returning: true,
            });

            if (query.length === 0 || query[0] === 0) return { ok: false, data: null, message: "No se pudo actualizar el bulk" };

            return { ok: true, message: "Bulk actualizado correctamente" };

        } catch (e) {
            return { ok: false, data: null };
        }
    }

    async delete(id) {
        try {
            const query = await BulkExamenModel.destroy({
                where: { id_bulk_examen: id }
            });

            if (query === 0) return { ok: false, data: null, message: "No se pudo eliminar el bulk" };

            return { ok: true, data: null, message: "Bulk eliminado correctamente" };
        } catch (e) {
            console.log("Error al eliminar el bulk de examen:", e);
            return { ok: false, data: null };
        }
    }
};

export const bulkExamenQueries = new BulkExamenQueries();