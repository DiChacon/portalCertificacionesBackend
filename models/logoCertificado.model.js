import { DataTypes, Model } from "sequelize";
import { DatabaseConfig } from "../config/database.js";

export class LogoCertificadoModel extends Model { }

LogoCertificadoModel.init({
    id_logo_certificado:{
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
    }, descripcion: {
        type: DataTypes.STRING(100),
        allowNull: false
    }, path: {
        type: DataTypes.STRING(255),
        allowNull: false
    }
},
{
    sequelize: DatabaseConfig,
    tableName: 'logos_certificados',
    timestamps: false
});