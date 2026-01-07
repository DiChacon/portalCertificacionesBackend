import { DataTypes, Model } from "sequelize";
import { DatabaseConfig } from "../config/database.js";
import { UserModel } from "./user.model.js";
import { PreguntaModel } from "./pregunta.model.js";

export class RespuestaModel extends Model{}

    RespuestaModel.init({
        id_respuesta: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        id_usuario: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: UserModel,
                key: 'id_user'
            }
        },
        id_pregunta: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: PreguntaModel,
                key: 'id_pregunta'
            }
        },
        respuesta: {
            type: DataTypes.STRING,
            allowNull: true
        }
    }, {
        sequelize: DatabaseConfig,
        tableName: 'respuestas_usuarios',
        timestamps: false
    });
    