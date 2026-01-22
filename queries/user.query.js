import { InstitucionModel } from "../models/institucion.model.js";
import { RolModel } from "../models/rol.model.js";
import { UserModel } from "../models/user.model.js";


class userQueries {

    // Esta función permite crear un usuario en la BD
    async store (user){
        try {

            const query = await UserModel.create(user);
            // Si la consulta se ejecuta correctamente, se retorna el usuario creado
            if(query){
                console.log('Se creó el usuario satisfactoriamente.');
                return { ok: true, data: query};
            } else {
                // Si no se pudo crear el usuario, se retorna un la mala respuesta
                return { ok: false, data: null};
            }
        } catch (e) {
            // Si ocurre un error al crear el usuario, se captura y se retorna un mensaje de error
            console.log('Error al crear el usuario', e);
            return { ok: false, data: null};
        }
    }
    
    async bulkUsers (users){
        try {
            const query = await UserModel.bulkCreate(users, {
                ignoreDuplicates: true
            });
            if(query){
                console.log('Se crearon los usuarios satisfactoriamente.');
                return { ok: true, data: query};
            } else {
                return { ok: false, data: null};
            }
        } catch (e) {
            console.log('Error al crear los usuarios', e);
            return { ok: false, data: null};
        }
    }

    
    async delete (condition = {}) {
        try {
            const query = await UserModel.destroy({where: condition});
            if(query){
                return { ok: true, data: query}
            }
        } catch (e) {
            console.log('Error al eliminar el usuario');
            return { ok: false, data: null};            
        }
    }

    async findAll (condition = {}){
        try {
            const query = await UserModel.findAll({
                where: condition, 
                attributes: { exclude: ["password", "updatedAt"] },
                include: [
                    {
                        model: InstitucionModel,
                        attributes: { exclude: ["logo_inst", "nombre_largo",] }
                    },
                    {
                        model: RolModel,
                        attributes: { exclude: ["id_rol"] }
                    }
                ]
            });
            if(query.length > 0){
                return { ok: true, data: query};
            } else {
                return { ok: false, message: 'Hubo un problema en la petición.'}
            }
        } catch (e) {
            console.log('Error al encontrar a todos los usuarios de la institucion', e);
            return { ok: false, message: 'Error al encontrar a todos los usuarios'}
        }
    }

    // Función para obtener a todos los administradores y maestros de la plataforma
    async findAM(){
        try{
            const query = await UserModel.findAll({
                where: {
                    id_rol: { [Op.or]: [process.env.ROL_ADMIN, process.env.ROL_PROFESOR] },
                },
                attributes: ["id_usuario", "nombre", "apm", "app", "id_rol"],
            });

            if(query.length > 0) return { ok: true, data: query };

            return { ok: false, message: "No se encontraron los usuarios." };
        }catch (e) {
            console.log('Error al encontrar a los administradores y maestros', e);
            return { ok: false, message: 'Error al encontrar a los administradores y maestros'};
        }
    }

    async findOne(condition={}){
        try {
            const query = await UserModel.findOne({
                where: condition,
                include: [
                    {
                        model: InstitucionModel,
                    },
                    {
                        model: RolModel
                    }
                ] });
            if (query){
                return { ok: true, data: query };
            } else {
                return { ok: false, data: query};
            }
        } catch (e) {
            console.error('Error al encontrar al usuario.', e);
            return { ok: false, message: 'Ocurrió un error en el servidor'};
        }
    }

    async updUser(id, datos){
        try {
            const query = await UserModel.findByPk(id);
            if(query) {
                await query.update(datos, { fields: Object.keys(datos) });
                return { ok: true, data: query};
            } else {
                return { ok: false, data: null};
            }
        } catch (error) {
            console.log('Error en la actualizacion del usuario', error);
            return { ok: false, data: null};
        }
    }
}

export const UserQueries = new userQueries();