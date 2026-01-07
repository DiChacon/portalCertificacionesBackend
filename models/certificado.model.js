import { DataTypes, Model, NOW, Sequelize } from "sequelize";
import { DatabaseConfig } from "../config/database.js";
import { ResultadoModel } from "./resultado.model.js";

export class CertificadoModel extends Model{}

    CertificadoModel.init({
        id_certificado: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        folio: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true,
        },
        id_resultado: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: ResultadoModel,
                key: 'id_resultado'
            }
        },
        fecha_expedido: {
            type: DataTypes.DATEONLY,
            defaultValue: Sequelize.NOW,
            allowNull: false,
        },
        fecha_expira: {
            type: DataTypes.DATEONLY,
            allowNull: false
        }     

    },  {
        sequelize: DatabaseConfig,
        tableName: 'certificados',
        timestamps: false,
    });