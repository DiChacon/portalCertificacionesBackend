import { DataTypes, Model } from "sequelize";
import { DatabaseConfig } from "../config/database.js";
import { UserModel } from "./user.model.js";
import { ExamenModel } from "./examen.model.js";

export class ResultadoModel extends Model{}

    ResultadoModel.init({
        id_resultado: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        porcentaje: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        tiempo: {
            type: DataTypes.TIME,
            allowNull: false
        },
        estado: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        id_usuario: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references:{
                model: UserModel,
                key: 'id_user'
            }
        },
        id_examen: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: ExamenModel,
                key: 'id_examen'
            }
        },
        intento: {
            type: DataTypes.INTEGER,
            allowNull: true
        }
    },{
        sequelize: DatabaseConfig,
        tableName: 'resultados',
        timestamps: true
    });