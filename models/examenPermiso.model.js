import { DataTypes, Model, Op, Sequelize } from "sequelize";
import { DatabaseConfig } from "../config/database.js";
import { UserModel } from "./user.model.js";
import { ExamenModel } from "./examen.model.js";
import { BulkExamenModel } from "./bulk_examen.model.js";

export class examenPermisoModel extends Model{}

examenPermisoModel.init({
    id_permiso: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
    },
    id_usuario: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: UserModel,
            key: 'id_usuario'
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
    fecha_limite:{
        type: DataTypes.DATE,
        allowNull: false
    },
    estado: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    intentos: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    id_bulk_examen: {
        type: DataTypes.STRING(5),
        allowNull: true,
        references: {
            model: BulkExamenModel,
            key: 'id_bulk_examen'
        }
    }
}, {
    sequelize: DatabaseConfig,
    tableName: 'examen_permiso',
    timestamps: true,
    createdAt: 'fecha_activacion',
    updatedAt: false,
    hooks: {
        //Filtro para obtener solamente registros sin intentar
        beforeFind: async () => {
            const now = new Date();
            await examenPermisoModel.update(
                { estado: "sin intentar"},
                {
                    where: {
                        fecha_limite: { [Op.lt]: now},
                        intentos: 0,
                        estado: "activo"
                    }
                }
            );
            
            // 
            // await examenPermisoModel.update(
            //     { fecha_limite: Sequelize.fn(
            //         "DATE_ADD",
            //         Sequelize.col("fecha_limite"),
            //         Sequelize.literal("INTERVAL 1 WEEK")
            //     ) },
            //     {
            //         where: {
            //             fecha_limite: { [Op.lt]: now },
            //             intentos: { [Op.gt]: 0 },
            //         }
            //     }
            // );
        }
    }
});