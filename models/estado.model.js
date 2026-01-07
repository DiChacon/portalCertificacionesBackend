import { Model, DataTypes } from 'sequelize';
import { DatabaseConfig } from '../config/database.js';

export class EstadosModel extends Model { }
EstadosModel.init({
    id_estado: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: DataTypes.STRING(100),
        allowNull: false   
    },
    clave: {
        type: DataTypes.STRING(5),
        allowNull: true
    }
}, {
    sequelize: DatabaseConfig,
    tableName: 'estados',
    timestamps: false
});