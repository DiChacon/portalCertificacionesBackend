import { Model, DataTypes } from "sequelize";
import { DatabaseConfig } from "../config/database.js";
import { CursoModel } from "./curso.model.js";
import { LogoCertificadoModel } from "./logoCertificado.model.js";

export class ExamenModel extends Model {}

    ExamenModel.init({
        id_examen: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        nombre_examen: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        logo_examen: {
            type: DataTypes.INTEGER
        },
        id_curso: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: CursoModel,
                key: 'id_curso'
            }
        },
        logo_examen: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references:{
                model: LogoCertificadoModel,
                key: 'id_logo_certificado'
            }
        }

    }, {
        sequelize: DatabaseConfig,
        tableName: 'examenes',
        timestamps: false
    });
