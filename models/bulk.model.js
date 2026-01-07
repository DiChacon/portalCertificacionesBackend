import { Model, DataTypes } from 'sequelize';
import { DatabaseConfig } from '../config/database.js';
import DataValidator from '../helpers/dataValidator.js';

export class BulksModel extends Model { }
BulksModel.init({
    id_bulk: {
        type: DataTypes.STRING(5),
        allowNull: false,
        primaryKey: true
    },
    count_users: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: 0
        }
    },
    id_creator: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'usuarios',
            key: 'id_usuario'
        }
    }
}, {
    sequelize: DatabaseConfig,
    tableName: 'bulks',
    timestamps: true,
    hooks: {
        //Generador de id único
        beforeValidate: async (bulk) => {
            console.log('Generando ID para el bulk');

            let intentos = 0;
            let idGenerado;

            while (intentos < 10) {
                idGenerado = DataValidator.getRandomId(5);
                const existe = await BulksModel.findOne({
                    where: { id_bulk: idGenerado },
                });

                if (!existe) {
                    bulk.id_bulk = idGenerado;
                    return;
                }

                intentos++;
            }

            throw new Error("No se pudo asignar el id al bulk");
        },
    }
});