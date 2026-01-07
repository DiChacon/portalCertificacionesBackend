import { Model, DataTypes } from 'sequelize';
import { DatabaseConfig } from '../config/database.js';
import bcrypt from 'bcryptjs';
import { InstitucionModel } from './institucion.model.js';
import { RolModel } from './rol.model.js';
import { BulksModel } from './bulk.model.js';

export class UserModel extends Model { }
UserModel.init({
    id_usuario: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: false
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    nombre: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    app: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    apm: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    correo: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    id_institucion: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: InstitucionModel,
            key: 'id_institucion'
        }
    },
    id_rol: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: RolModel,
            key: 'id_rol'
        }
    },
    token: {
        type: DataTypes.STRING(999),
        allowNull: true
    },
    estado: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: 1
    },
    id_bulk: {
        type: DataTypes.STRING(5),
        allowNull: true,
        references: {
            model: BulksModel,
            key: 'id_bulk'
        }
    }
}, {
    sequelize: DatabaseConfig,
    tableName: 'usuarios',
    timestamps: true,
    hooks: {
        beforeValidate: async (user) => {
            console.log('Generando ID para:', user.nombre);

            let intentos = 0;
            let idGenerado;

            while (intentos < 10) {
                idGenerado = Math.floor(Math.random() * 99999) + 1;

                const existe = await UserModel.findOne({
                    where: { id_usuario: idGenerado },
                });

                if (!existe) {
                    user.id_usuario = idGenerado;
                    return;
                }

                intentos++;
            }

            throw new Error("No se pudo asignar el id al usuario");
        },
        beforeUpdate: async (user) => {
            if (user.changed('password')) {
                const salt = process.env.SALT;
                user.password = await bcrypt.hash(user.password, parseInt(salt));
            }
        }
    }
});

UserModel.prototype.validPassword = async function (psw) {
    return await bcrypt.compare(psw, this.password); // Compara la contraseña proporcionada con la almacenada
}