import { DatabaseConfig } from "../config/database.js";
import { DataTypes, Model } from "sequelize";

export class CursoModel extends Model{}

    CursoModel.init({
        id_curso: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        nombre_curso: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        descripcion_curso: {
            type: DataTypes.STRING(450),
            allowNull: false
        },
        duracion: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        duracion_validez_anios:{
            type: DataTypes.INTEGER
        }
    }, {
        sequelize: DatabaseConfig,
        timestamps: false,
        tableName: 'curso'
    });