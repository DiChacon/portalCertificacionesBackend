import { Model, DataTypes } from 'sequelize';
import { DatabaseConfig } from '../config/database.js';
import DataValidator from '../helpers/dataValidator.js';

export class BulkExamenModel extends Model {}

BulkExamenModel.init({
    id_bulk_examen: {
        type: DataTypes.STRING(5),
        primaryKey: true,
        comment: 'ID único autoincremental'
    },
    id_examen: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "examenes", 
            key: 'id_examen'
        },
        comment: 'ID del examen asociado'
    },
    id_creator: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "usuarios",
            key: 'id_usuario'
        },
        comment: 'ID del usuario creador'
    },
    count_users: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: 0,
            isInt: true
        },
        comment: 'Cantidad de usuarios incluidos'
    },
    fecha_limite: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: 'Fecha límite para completar el examen'
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: 'Fecha de creación'
    },
    updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: 'Fecha de última actualización'
    }
}, {
    sequelize: DatabaseConfig,
    modelName: 'BulkExamenModel',
    tableName: 'bulk_examen',
    timestamps: false,
    underscored: true,
    freezeTableName: true,
    paranoid: false,
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
    indexes: [
        {
            fields: ['id_creator'],
            name: 'idx_bulk_examenes_creator'
        },
        {
            fields: ['created_at'],
            name: 'idx_bulk_examenes_created_at'
        }
    ],
    hooks: {
        //Generador de id único
        beforeValidate: async (bulk) => {
            console.log('Generando ID para el bulk');

            let intentos = 0;
            let idGenerado;

            while (intentos < 10) {
                idGenerado = DataValidator.getRandomId(5);
                const existe = await BulkExamenModel.findOne({
                    where: { id_bulk_examen: idGenerado },
                });

                if (!existe) {
                    bulk.id_bulk_examen = idGenerado;
                    return;
                }

                intentos++;
            }

            throw new Error("No se pudo asignar el id al bulk");
        },
    }
});