import { CertificadoModel } from "../models/certificado.model.js";
import { CursoModel } from "../models/curso.model.js";
import { ExamenModel } from "../models/examen.model.js";
import { InstitucionModel } from "../models/institucion.model.js";
import { LogoCertificadoModel } from "../models/logoCertificado.model.js";
import { ResultadoModel } from "../models/resultado.model.js";
import { RolModel } from "../models/rol.model.js";
import { UserModel } from "../models/user.model.js";
import { Op } from "sequelize";
import DataValidator from "../helpers/dataValidator.js";
import { examenPermisoModel } from "../models/examenPermiso.model.js";

//TODO: Modificar el campo fecha_expedido de la tabla certificados en función del campo fecha_limite de la tabla examen_permiso
//fecha_expedido = fecha_limite + 1 

//El Front-End debe mandar al controlador el id del permiso_examen, con ese id se consulta a la base de datos para obtener el campo fecha_expedido y después sumarle un día para ingresar a la base de datos la nueva fecha
//req.body = {
//     id_permiso: INTEGER,
//     id_curso: INTEGER,
//     id_res: INTEGER
//}

class certificadoQueries {

    async store(body) {
        try {
            const { id_permiso, id_curso, id_resultado } = body;
            //Inicializamos variables
            let existe = true;
            let intentos = 0 //Contador de intentos
            const intentosMaximos = 5; //Maximo numero de intentos

            //Iniciamos ciclo de validacion para generar un folio unico y evitar bugs
            while (existe && intentos < intentosMaximos) {
                //Generamos la combinacion aleatoria de 6 cifras 
                const resultado = "F-" + DataValidator.getRandomId(12);

                //Verificamos si el folio existe consultando el folio generado anteriormente
                const verificacion = await CertificadoModel.findOne({ where: { folio: resultado } });

                if (!verificacion) {
                    //Si no existe, definimos como FALSA la variable existe para finalizar el ciclo WHILE
                    existe = false

                    // Se debe extraer el examen_permiso
                    const permiso = await examenPermisoModel.findByPk(id_permiso);
                    if (!permiso) throw new Error('Permiso no encontrado');

                    //Se debe extraer los años de validez del curso
                    const curso = await CursoModel.findByPk(id_curso);
                    if (!curso) throw new Error('Curso no encontrado');

                    //Calcular la fecha de expiración dos años y un día después de la fecha límite del permiso
                    //Obtener la fecha límite y establecerla en un tipo de dato 'Date'
                    let fecha_expira = new Date(permiso.fecha_limite);
                    //Obtener los años de validez del curso
                    const validez = curso.duracion_validez_anios;
                    //Sumar los años de validez del curso
                    fecha_expira = new Date(fecha_expira.setFullYear(fecha_expira.getFullYear() + validez));
                    //Sumar un día a la fecha de expiración
                    fecha_expira = fecha_expira.setDate(fecha_expira.getDate() + 1);

                    //Ejecutamos la query para crear el certificado
                    const query = await CertificadoModel.create({
                        fecha_expedido: permiso.fecha_limite, // Fecha de culminación del examen
                        fecha_expira,
                        folio: resultado,
                        id_resultado
                    });

                    if (query) {
                        return { ok: true, data: query };
                    } else {
                        return { ok: false, data: null }
                    }
                }

                //Si ya existe, aumentamos 1 el valor de la variable INTENTOS
                intentos++;

                //Validamos si el numero de intentos es igual o mayor que el maximo de intentos posibles, para finalizar la operacion y no generar un bucle infinito en caso de algún tipo de error.
                if (intentos >= intentosMaximos) {

                    console.log('Se intento: ' + intentos + ' veces y no se pudo crear el certificado.');
                    return { ok: false, data: null, message: 'No se pudo generar un folio unico despues de varios intentos.' }
                }

            } //Termina ciclo While
        } catch (error) {
            console.log('Error al crear el certificado, verificar información');
            console.error(error);

            return { ok: false, data: null };
        }
    }

    async findAll(condition = {}) {
        try {
            const query = await CertificadoModel.findAll({
                where: condition,
                include: [
                    {
                        model: ResultadoModel,
                        required: true,
                        attributes: {
                            exclude: ['id_resultado', 'createdAt', 'updatedAt']
                        },
                        include: [
                            {
                                model: UserModel,
                                required: true,
                                attributes: {
                                    exclude: ['username', 'password', 'correo', 'token', 'createdAt', 'updatedAt']
                                },
                                include: [
                                    {
                                        model: InstitucionModel,
                                        required: true,
                                        attributes: ['nombre_inst', 'estado']
                                    },
                                    {
                                        model: RolModel,
                                        required: true,
                                        attributes: ['rol']
                                    }
                                ]
                            },
                            {
                                model: ExamenModel,
                                required: true,
                                include: [
                                    {
                                        model: CursoModel,
                                        required: true,
                                        attributes: ['nombre_curso']
                                    }
                                ]
                            }
                        ]
                    }
                ]
            });
            if (query && query.length > 0) {
                return { ok: true, data: query };
            } else {
                return { ok: false, data: null, message: 'No se obtuvieron todos los certificados.' }
            }
        } catch (error) {
            console.log('No se pudieron obtener todos los certificados.');
            return { ok: false, data: null };
        }
    }

    async findOne(condition = {}) {
        try {
            const query = await CertificadoModel.findOne({
                where: condition,
                attributes: ['fecha_expedido', 'fecha_expira', 'folio'],
                include: [
                    {
                        model: ResultadoModel,
                        required: true,
                        attributes: ['estado', 'createdAt'],
                        include: [
                            {
                                model: UserModel,
                                required: true,
                                attributes: ['nombre', 'app', 'apm']
                            },
                            {
                                model: ExamenModel,
                                required: true,
                                attributes: ['nombre_examen'],
                                include: [
                                    {
                                        model: CursoModel,
                                        required: true,
                                        attributes: ['nombre_curso', 'duracion']
                                    },
                                    {
                                        model: LogoCertificadoModel,
                                        required: true,
                                        attributes: ['path']
                                    }
                                ]
                            }
                        ]
                    }
                ]
            });

            if (query) {
                return { ok: true, data: query };
            } else {
                return { ok: false, data: query };
            }
        } catch (error) {
            console.log('No se pudo encontrar el certificado.');
            console.error(error);

            return { ok: false, data: null, message: 'No se pudo encontrar el certificado.' };
        }
    }

    async findWithUser(id) {
        try {
            const query = await CertificadoModel.findAll({
                include: [{
                    model: ResultadoModel,
                    where: {
                        id_usuario: id,
                        porcentaje: {
                            [Op.gte]: 75
                        }
                    },
                    include: [
                        {
                            model: ExamenModel,
                            required: true,
                            include: [
                                {
                                    model: CursoModel,
                                    required: true,
                                    attributes: ['duracion']
                                }
                            ]
                        }
                    ]
                }]
            });

            if (query && query.length > 0) {
                return { ok: true, data: query };
            } else {
                return { ok: false, data: [] };
            }
        } catch (error) {
            console.error(error);
            return { ok: false, data: null };

        }
    }

    async findWithInstitucion(id_inst) {
        try {
            const query = await CertificadoModel.findAll({
                attributes: ['folio', 'fecha_expedido', 'fecha_expira'],
                include: [{
                    model: ResultadoModel,
                    attributes: ['porcentaje'],
                    where: {
                        estado: true
                    },
                    include: [
                        {
                            model: ExamenModel,
                            required: true,
                            attributes: ['nombre_examen'],
                            include: [
                                {
                                    model: CursoModel,
                                    required: true,
                                    attributes: ['nombre_curso', 'duracion']
                                }
                            ]
                        },
                        {
                            model: UserModel,
                            required: true,
                            attributes: ['nombre', 'app', 'apm', 'id_rol'],
                            include: [
                                {
                                    model: InstitucionModel,
                                    required: true,
                                    attributes: ['nombre_inst'],
                                    where: {
                                        id_institucion: id_inst
                                    }
                                },
                                {
                                    model: RolModel,
                                    required: true,
                                    attributes: ['rol']
                                }
                            ]
                        }
                    ]
                }]
            });

            if (query && query.length > 0) {
                return { ok: true, data: query };
            } else {
                return { ok: false, data: null };
            }
        } catch (error) {
            console.error("Error en findWithInstitucion:", error);
            return { ok: false, data: null, error: error.message };
        }
    }

    async countAll(condition = {}) {
        try {
            const query = await CertificadoModel.count({ where: Object.keys(condition).length !== 0 ? condition : undefined });
            if (query)
                return { ok: true, data: query }
            else
                return { ok: false, data: query }
        } catch (error) {
            console.error("Error al contar las instituciones");
            return null
        }
    }

    async getCertificatesInstitute(id_institute) {
        try {
            let qty;
            const estadisticas={};
            const query = await CertificadoModel.findAll({
                attributes: ['folio', 'fecha_expedido', 'fecha_expira'],
                include: [
                    {
                        model: ResultadoModel,
                        required: true,
                        attributes: ['id_resultado'],
                        include: [
                            {
                                model: UserModel,
                                required: true,
                                attributes:  ['nombre', 'app', 'apm'] ,
                                include: [
                                    {
                                        model: InstitucionModel,
                                        required: true,
                                        attributes: ['id_institucion'],
                                        where: {
                                            id_institucion: id_institute
                                        }
                                    }
                                ]
                            },
                            {
                                model: ExamenModel,
                                required: true,
                                attributes: ['id_examen'],
                                include: [{
                                    model: CursoModel,
                                    required: true,
                                    attributes: ['nombre_curso']
                                }]
                            }
                        ]
                    }
                ]
            });
            qty = query.length;
            query.forEach(cert => {
                const curso = cert.ResultadoModel?.ExamenModel?.CursoModel.nombre_curso || 'sin nombre';
                const folio = cert.folio;
                const usuario = cert.ResultadoModel?.UserModel?.nombre + ' ' + cert.ResultadoModel?.UserModel?.app + ' ' + cert.ResultadoModel?.UserModel?.apm || 'Sin nombre';
                const expedido = cert.fecha_expedido;
                const caduca = cert.fecha_expira;

                if(!estadisticas[curso]){
                    estadisticas[curso] = {
                        total: 0,
                        certificados: []
                    };
                }

                estadisticas[curso].certificados.push({
                    folio, usuario, expedido, caduca
                });
                estadisticas[curso].total++;
            });

            if (query && query.length > 0) {

                console.log("Fueron " + query.length + " certificados expedidos.");

                console.log(query);
                return {
                    ok: true, data: { cantidad: qty, certificados: estadisticas }
                }
            } else {
                console.log("No se encontraron certificados");
                return { ok: false, data: null, message: 'No se encontraron certificados' }
            }
        } catch (error) {
            console.error("Error en getCertificatesInstitute:", error);
            return { ok: false, data: null, error: error.message };
        }
    }


}

export const CertificadoQueries = new certificadoQueries();