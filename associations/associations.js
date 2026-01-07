import { UserModel } from "../models/user.model.js";
import { InstitucionModel } from "../models/institucion.model.js";
import { CertificadoModel } from "../models/certificado.model.js";
import { CursoModel } from "../models/curso.model.js";
import { ExamenModel } from "../models/examen.model.js";
import { PreguntaModel } from "../models/pregunta.model.js";
import { ResultadoModel } from "../models/resultado.model.js";
import { RespuestaModel } from "../models/respuesta.model.js";
import { RolModel } from "../models/rol.model.js";
import { examenPermisoModel } from "../models/examenPermiso.model.js";
import { LogoCertificadoModel } from "../models/logoCertificado.model.js";
import { BulkExamenModel } from "../models/bulk_examen.model.js";
import { EstadosModel } from "../models/estado.model.js";
import { CertificadoBlockchainModel } from "../models/certificadoBlockchain.model.js";

export function Relaciones(){
    //Relacion de Rol a Usuario
    RolModel.hasMany(UserModel, { foreignKey: 'id_rol'});
    UserModel.belongsTo(RolModel, { foreignKey: 'id_rol'});

    //Relacion de Usuarios a Instituci��n
    UserModel.belongsTo(InstitucionModel, { foreignKey: 'id_institucion'});
    InstitucionModel.hasMany(UserModel, { foreignKey: 'id_institucion'});

    //Relacion de Preguntas a Examen
    ExamenModel.hasMany(PreguntaModel, { foreignKey: 'id_examen', as: 'preguntas'});
    PreguntaModel.belongsTo(ExamenModel, { foreignKey: 'id_examen', as: 'examen'});

    //Relacion de Examen a Logo de certificados
    LogoCertificadoModel.hasMany(ExamenModel, { foreignKey: 'logo_examen'});
    ExamenModel.belongsTo(LogoCertificadoModel, { foreignKey: 'logo_examen'});

    //Relacion resultados
    UserModel.belongsToMany(ExamenModel, { foreignKey: 'id_usuario', through: ResultadoModel});
    ExamenModel.belongsToMany(UserModel, { foreignKey: 'id_examen', through: ResultadoModel});

    UserModel.hasMany(ResultadoModel, { foreignKey: 'id_usuario'});
    ExamenModel.hasMany(ResultadoModel, { foreignKey: 'id_examen'});
    ResultadoModel.belongsTo(UserModel, { foreignKey: 'id_usuario'});
    ResultadoModel.belongsTo(ExamenModel, { foreignKey: 'id_examen'});

    //Relacion Respuestas
    UserModel.belongsToMany(PreguntaModel, {through: RespuestaModel, foreignKey: 'id_usuario'});
    PreguntaModel.belongsToMany(UserModel, { through: RespuestaModel, foreignKey: 'id_pregunta'});

    UserModel.hasMany(RespuestaModel, {foreignKey: 'id_usuario'});
    PreguntaModel.hasMany(RespuestaModel, {foreignKey: 'id_pregunta'});
    RespuestaModel.belongsTo(UserModel, { foreignKey: 'id_usuario'});
    RespuestaModel.belongsTo(PreguntaModel, { foreignKey: 'id_pregunta'});

    //Relacion de Certificado a Resultado
    CertificadoModel.belongsTo(ResultadoModel, { foreignKey: 'id_resultado'});
    ResultadoModel.hasMany(CertificadoModel, { foreignKey: 'id_resultado'});

    //Relacion de Curso a Examen
    ExamenModel.belongsTo(CursoModel, { foreignKey: 'id_curso'});
    CursoModel.hasMany(ExamenModel, {foreignKey: 'id_curso'});

    //Relacion de examenes a contestar
    examenPermisoModel.belongsTo(UserModel, {foreignKey: 'id_usuario'});
    examenPermisoModel.belongsTo(ExamenModel, {foreignKey: 'id_examen'});

    //Relaciones del bulk examen con usuario, permisos y examen
    // Un bulk examen pertenece a un solo usuario (creador) y puede tener muchos permisos asociados.
    BulkExamenModel.belongsTo(UserModel, { foreignKey: 'id_creator'});
    BulkExamenModel.hasMany(examenPermisoModel, { foreignKey: 'id_bulk_examen'});
    BulkExamenModel.belongsTo(ExamenModel, { foreignKey: 'id_examen'});
    examenPermisoModel.belongsTo(BulkExamenModel, { foreignKey: 'id_bulk_examen' });

    UserModel.hasMany(examenPermisoModel, { foreignKey: 'id_usuario'});
    ExamenModel.hasMany(examenPermisoModel, {foreignKey: 'id_examen'});

    // Relacion de Institucion a Estados
    InstitucionModel.belongsTo(EstadosModel, { foreignKey: 'estado' });
    EstadosModel.hasMany(InstitucionModel, { foreignKey: 'estado' });

    CertificadoModel.hasOne(CertificadoBlockchainModel, { foreignKey: 'id_certificado'});

    CertificadoBlockchainModel.belongsTo(CertificadoModel, {foreignKey: 'id_certificado'});
}