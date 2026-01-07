import { DataTypes, Model } from "sequelize";
import { DatabaseConfig } from "../config/database.js";

export class RolModel extends Model{}

RolModel.init({
    id_rol: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: false
    },
    rol: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    sequelize: DatabaseConfig,
    tableName: 'roles',
    timestamps: false
})