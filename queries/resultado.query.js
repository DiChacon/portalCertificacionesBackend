import { fn, col, Op } from "sequelize";
import { ExamenModel } from "../models/examen.model.js";
import { examenPermisoModel } from "../models/examenPermiso.model.js";
import { PreguntaModel } from "../models/pregunta.model.js";
import { RespuestaModel } from "../models/respuesta.model.js";
import { ResultadoModel } from "../models/resultado.model.js";
import { UserModel } from "../models/user.model.js";
import { CertificadoModel } from "../models/certificado.model.js";
import { CertificadoQueries } from "./certificado.query.js";

class ResultadoQueries {

    async store(resultado) {
        try {
            const query = await ResultadoModel.create(resultado);
            if (query) {
                return { ok: true, data: query };
            } else {
                return { ok: false, data: null };
            }
        } catch (error) {
            console.log('Error al crear el resultado');
            return { ok: false, data: null };
        }
    }

    async findAll(condition = {}) {
        try {
            const query = await ResultadoModel.findAll({
                where: condition, include: [
                    {
                        model: UserModel,
                        key: 'id_user'
                    },
                    {
                        model: ExamenModel,
                        key: 'id_examen'
                    }
                ]
            });
            if (query.length > 0) {
                return { ok: true, data: query };
            } else {
                return { ok: false, data: null, message: 'No se obtuvieron todos los resultados.' }
            }
        } catch (error) {
            console.log('No se pudieron obtener todos los resultados.');
            return { ok: false, data: null };
        }
    }

    async findOne(condition = {}) {
        try {


            const query = await ResultadoModel.findOne({
                where: condition, include: [
                    {
                        model: UserModel,
                        key: 'id_user'
                    },
                    {
                        model: ExamenModel,
                        key: 'id_examen'
                    }
                ]
            });
            if (query) {
                return { ok: true, data: query };
            } else {
                return { ok: false, data: query };
            }
        } catch (error) {
            console.log('No se pudo encontrar el resultado.', error);
            return { ok: false, data: null, message: 'No se pudo encontrar el resultado.' };
        }
    }

    async delete(id) {
        try {
            const query = await ResultadoModel.destroy({ where: { id_resultado: id } });
            if (query) {
                return { ok: true };
            } else {
                return { ok: false };
            }
        } catch (error) {
            console.error('Ocurrió un error', error);
            return { ok: false, message: 'Error en el servidor.' }
        }
    }

    async update(id, datos) {
        try {
            const query = await ResultadoModel.findByPk(id);
            if (query) {
                await query.update(datos, { fields: Object.keys(datos) });
                return query;
            } else {
                return null;
            }
        } catch (error) {
            console.log('Error en la actualizacion del resultado', error);
            return null;
        }
    }

    async calificar(body) {
        try {

            const { id_usuario, id_examen, tiempo, respuestas } = body;

            let correctas = 0;

            // Array para almacenar todas las promesas de creación de respuestas
            const respuestasPromises = respuestas.map(async (respuesta) => {
                const pregunta = await PreguntaModel.findByPk(respuesta.id_pregunta, { raw: true });

                // Primero verifica si la pregunta no es igual a UNDEFINED o NULL
                //Suma +1 a la variable correctas si la respuesta es igual a la respuesta correcta
                if (pregunta && pregunta.correcta === respuesta.respuesta) {
                    correctas += 1;
                }

                // Guardar la respuesta del usuario
                return RespuestaModel.create({
                    id_usuario,
                    id_pregunta: respuesta.id_pregunta,
                    respuesta: respuesta.respuesta
                });
            });

            // Ejecutar todas las promesas de respuestas en paralelo para hacer solo una consulta a la base de datos
            await Promise.all(respuestasPromises);

            // Calculamos la calificación y determinamos si aprobó
            const calificacion = (correctas / respuestas.length) * 100;
            const aprobado = calificacion >= 75;

            // Crear y guardar Resultado
            const resultado = (await ResultadoModel.create({
                porcentaje: calificacion,
                tiempo,
                estado: aprobado,
                id_usuario,
                id_examen
            })).toJSON();

            const id_resultado_actual = resultado.id_resultado;

            // Esta lógica se puede rescatar siempre y cuando exista la validación de que un usuario no tenga activo más de un examen del mismo tipo.
            const permisoExamen = await examenPermisoModel.findOne(
                {
                    where: {
                        id_usuario: id_usuario,
                        id_examen: id_examen,
                        estado: 'activo'
                    }
                }
            );

            const idCurso = await ExamenModel.findByPk(id_examen, { attributes: ['id_curso'] });

            resultado.id_curso = idCurso.id_curso;
            resultado.id_permiso = permisoExamen.id_permiso;

            console.log("Este intento calificado fue la vez número: " , permisoExamen.intentos, " que has hecho");


            if (aprobado) {
                await CertificadoQueries.store(resultado);

                await ResultadoModel.update(
                    {
                        intento: permisoExamen.intentos++ + 1,
                        aprobacion: 1
                    },
                    {
                        where: {
                            id_resultado: id_resultado_actual
                        }
                    }
                );
                
                await examenPermisoModel.update(
                    {
                        estado: "aprobado",
                        intentos: permisoExamen.intentos
                    },
                    {
                        where: {
                            id_permiso: permisoExamen.id_permiso
                        }
                    }
                );


            } else {
                
                await examenPermisoModel.update(
                    {
                        intentos: permisoExamen.intentos++ + 1,
                        estado: "reprobado"
                    },
                    {
                        where: {
                            id_permiso: permisoExamen.id_permiso
                        }
                    }
                );

                await ResultadoModel.update(
                    { 
                        intento: permisoExamen.intentos,
                    },
                    {
                        where: {
                            id_resultado: id_resultado_actual
                        }
                    }
                );

            }

            return { ok: true, data: resultado }

        }
        catch (error) {
            console.error("Error en calificar:", error);
            return { ok: false, data: null, error: error.message };
        }
    }

    async findResultadosPorUsuario(id_user) {
        try {

            const query = await ResultadoModel.findAll({
                where: {
                    id_usuario: id_user
                },
                attributes: {
                    exclude: ['porcentaje', 'updatedAt', 'tiempo']
                },
                order: [['createdAt', 'DESC']],
                include: [
                    {
                        model: ExamenModel,
                        required: true,
                        attributes: {
                            exclude: ['id_examen', 'id_curso']
                        }
                    }
                ]
            });

            if (query && query.length > 0) {
                return { ok: true, data: query };
            } else {
                return { ok: false, data: null };
            }
        } catch (error) {
            console.error(error);
            return { ok: false, data: null };
        }
    }

    async statisticsResultsAverage(){
        try{
            const query = await ResultadoModel.findAll({
                attributes: [
                    "id_usuario",
                    [fn("AVG", col("porcentaje")), "promedio"]
                ],
                group: "id_usuario",
                raw: true
            });
            console.log(query);

            const totalStudents = query.length;
            const totalAverage = query.reduce((acc, student) => acc + parseFloat(student.promedio), 0);
            const generalAverage = totalAverage / totalStudents;

            return { ok: true, data: generalAverage }
        }catch(error){
            console.error(error);
            return { ok: false, data: null };
        }
    }

    async findApprovedResultsByExamenAndUsers(id_usuarios, id_examen) {
        try {
            // --- PASO 1: Obtener Resultados Aprobados CON la info del Usuario ---
            // Hacemos un JOIN aquí para ya tener el nombre del usuario junto a cada resultado.
            const resultadosAprobados = await ResultadoModel.findAll({
                where: {
                    id_usuario: { [Op.in]: id_usuarios },
                    id_examen: id_examen,
                    porcentaje: { [Op.gte]: 75 }
                },
                // Incluimos el modelo de usuario para obtener sus datos.
                include: [{
                    model: UserModel,
                    required: true,
                    attributes: ['id_usuario', 'nombre', 'app', 'apm']
                }],
                // Solo necesitamos estos atributos del resultado y del usuario.
                attributes: ['id_resultado', 'id_usuario']
            });

            if (resultadosAprobados.length === 0) return { ok: true, data: [] }; // No hay resultados aprobados

            const idsDeResultados = resultadosAprobados.map(r => r.id_resultado);

            // --- PASO 2: Obtener los IDs de los Certificados que están ACTIVOS ---
            const today = new Date();
            const certificadosActivos = await CertificadoModel.findAll({
                where: {
                    id_resultado: { [Op.in]: idsDeResultados },
                    fecha_expira: { [Op.gte]: today }
                },
                // Solo necesitamos el id_resultado para saber cuáles están activos.
                attributes: ['id_resultado']
            });

            // Creamos un Set con los IDs de resultados que tienen un certificado activo para una búsqueda rápida.
            const idsResultadosConCertificadoActivo = new Set(certificadosActivos.map(c => c.id_resultado));

            // --- PASO 3: Unir y Filtrar la Información ---
            // Filtramos la lista original de resultados aprobados.
            const usuariosConCertificado = resultadosAprobados
            .filter(resultado => 
                // Nos quedamos solo con aquellos cuyo id_resultado existe en nuestro Set de certificados activos.
                idsResultadosConCertificadoActivo.has(resultado.id_resultado)
            )
            .map(resultado => {
                // Mapeamos el resultado final al formato deseado.
                const usuario = resultado.UserModel;
                return {
                    nombreCompleto: `${usuario.nombre} ${usuario.app || ''} ${usuario.apm || ''}`.trim()
                };
            });

            return { ok: true, data: usuariosConCertificado };

        } catch (error) {
            console.error('Error al verificar certificados por lote:', error);
            return { ok: false, data: null };
        }
    }
}

export const resultadoQueries = new ResultadoQueries();