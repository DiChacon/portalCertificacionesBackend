import { DataTypes, Model } from "sequelize";
import { DatabaseConfig } from "../config/database.js";

export class InstitucionModel extends Model { }

InstitucionModel.init({
    id_institucion: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: false,
        primaryKey: true
    },
    nombre_inst: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    nombre_largo: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    logo_inst: {
        type: DataTypes.STRING,
        allowNull: false
    },
    estado: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "estados",
            key: 'id_estado'
        },
        comment: 'ID del estado asociado'
    }
}, {
    sequelize: DatabaseConfig,
    tableName: 'instituciones',
    timestamps: false,
    hooks: {
        beforeValidate: async (institucion) => {
            let intentos = 0;
            let idGenerado;

            while (intentos < 5) {
                idGenerado = Math.floor(Math.random() * 99999) + 1;

                const existe = await InstitucionModel.findOne({
                    where: { id_institucion: idGenerado },
                });

                if (!existe) {
                    institucion.id_institucion = idGenerado;
                    return;
                }

                intentos++;
            }

            throw new Error("No se pudo asignar el id a la institución");
        }
    }
});