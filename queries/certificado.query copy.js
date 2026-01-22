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
import { BlockchainHelper } from '../helpers/blockchain.helper.js';
import { CertificadoBlockchainModel } from "../models/certificadoBlockchain.model.js";



class certificadoQueries {

 async store(body) {
    try {
      const { id_permiso, id_curso, id_resultado } = body;

      let existe = true;
      let intentos = 0;
      const intentosMaximos = 5;

      while (existe && intentos < intentosMaximos) {

        // 1️⃣ Generar folio
        const folioGenerado = "F-" + DataValidator.getRandomId(12);

        const verificacion = await CertificadoModel.findOne({
          where: { folio: folioGenerado }
        });

        if (!verificacion) {
          existe = false;

          // 2️⃣ Obtener permiso
          const permiso = await examenPermisoModel.findByPk(id_permiso);
          if (!permiso) throw new Error('Permiso no encontrado');

          // 3️⃣ Obtener curso
          const curso = await CursoModel.findByPk(id_curso);
          if (!curso) throw new Error('Curso no encontrado');

          // 4️⃣ Calcular fecha de expiración
          let fecha_expira = new Date(permiso.fecha_limite);
          const validez = curso.duracion_validez_anios;

          fecha_expira.setFullYear(fecha_expira.getFullYear() + validez);
          fecha_expira.setDate(fecha_expira.getDate() + 1);

          // 5️⃣ Crear certificado (NO se toca el payload)
          const certificado = await CertificadoModel.create({
            fecha_expedido: permiso.fecha_limite,
            fecha_expira,
            folio: folioGenerado,
            id_resultado
          });

          if (!certificado) {
            return { ok: false, data: null };
          }

          // 6️⃣ Obtener datos del usuario desde Resultado
          const resultadoData = await ResultadoModel.findByPk(id_resultado, {
            include: [
              {
                model: UserModel,
                attributes: ['nombre', 'app', 'apm']
              }
            ]
          });

          if (!resultadoData || !resultadoData.UserModel) {
            throw new Error('No se pudo obtener la información del usuario para blockchain');
          }

          // 7️⃣ Generar hash blockchain
          const hash = BlockchainHelper.generarHashCertificado({
            folio: certificado.folio,
            fecha_expedido: certificado.fecha_expedido,
            fecha_expira: certificado.fecha_expira,
            nombre: resultadoData.UserModel.nombre,
            app: resultadoData.UserModel.app,
            apm: resultadoData.UserModel.apm
          });
          console.log('Hash generado para blockchain:', hash);
          // 8️⃣ Guardar hash blockchain
          await CertificadoBlockchainModel.create({
            id_certificado: certificado.id_certificado,
            hash,
            algoritmo: 'SHA-256'
          });

          // 9️⃣ Retorno final
          return {
            ok: true,
            data: certificado
          };
        }

        // Si el folio ya existe
        intentos++;

        if (intentos >= intentosMaximos) {
          console.log(`Se intentó ${intentos} veces y no se pudo generar el certificado.`);
          return {
            ok: false,
            data: null,
            message: 'No se pudo generar un folio único después de varios intentos.'
          };
        }
      }

    } catch (error) {
      console.error('Error al crear el certificado:', error);
      return {
        ok: false,
        data: null,
        message: error.message
      };
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
                                        attributes: ['nombre_inst']
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

    // 1️⃣ Obtener certificado (lo que ya haces)
    const certificado = await CertificadoModel.findOne({
      where: condition,
      attributes: ['id_certificado', 'fecha_expedido', 'fecha_expira', 'folio'],
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

    if (!certificado) {
      return { ok: false, data: null };
    }

    // 2️⃣ Obtener hash blockchain original
    const blockchain = await CertificadoBlockchainModel.findOne({
      where: { id_certificado: certificado.id_certificado }
    });

    if (!blockchain) {
      console.warn('⚠️ Certificado SIN registro blockchain');
      return { ok: true, data: certificado };
    }

    // 3️⃣ Recalcular hash con datos actuales
    const hashRecalculado = BlockchainHelper.generarHashCertificado({
      folio: certificado.folio,
      fecha_expedido: certificado.fecha_expedido,
      fecha_expira: certificado.fecha_expira,
      nombre: certificado.ResultadoModel.UserModel.nombre,
      app: certificado.ResultadoModel.UserModel.app,
      apm: certificado.ResultadoModel.UserModel.apm
    });
    let integridad = 'Valido';
    if (!blockchain) {
      integridad = 'SIN_BLOCKCHAIN';
    } else if (hashRecalculado !== blockchain.hash) {
      integridad = 'ALTERADO';
    }

    // 5️⃣ Retorno normal 
    return { ok: true, data: 
      { ...certificado.toJSON(), 
        integridad 
      } 
    };

  } catch (error) {
    console.error('No se pudo validar el certificado:', error);
    return {
      ok: false,
      data: null,
      message: 'No se pudo encontrar el certificado.'
    };
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
                return { ok: false, data: []};
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


}

export const CertificadoQueries = new certificadoQueries();