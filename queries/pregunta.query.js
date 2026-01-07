import { fn } from "sequelize";
import { PreguntaModel } from "../models/pregunta.model.js";
import { examenPermisoModel } from "../models/examenPermiso.model.js";

class PreguntaQueries{

    async store(pregunta){
        try {
            const query = await PreguntaModel.create(pregunta);
            if(query){
                return { ok: true, data: query};
            } else {
                return { ok: false, data: null};
            }
        } catch (error) {
            console.error(error);
            
            return { ok: false, data: null};
        } 
    }

    async findAll(condition = {}){
        try {
            const query = await PreguntaModel.findAll({ where: condition});
            if (query.length>0){
                return { ok: true, data: query };
            } else {
                return { ok: false, data: query};
            }
        } catch (error) {
            console.log('No se pudo encontrar la pregunta.');
            return { ok: false, data: null, message: 'No se pudo encontrar la pregunta.'};
        }
    }

    async findOne(condition = {}){
        try {
            const query = await PreguntaModel.findOne({ where: condition});
            if (query){
                return { ok: true, data: query };
            } else {
                return { ok: false, data: null};
            }
        } catch (error) {
            console.log('No se pudo encontrar la pregunta.:');
            return { ok: false, data: null, message: 'No se pudo encontrar la pregunta.'};
        }
    }

    async delete (id){
        try {
            const query = await PreguntaModel.destroy({where: { id_pregunta: id}});
            if(query){
                return { ok: true};
            } else {
                console.log('No se pudo eliminar la pregunta.');
                return { ok: false};
            }
        } catch (error) {
            console.error('Error al eliminar la pregunta.', error);
            return { ok: false, data: null, message: 'Error en la base de datos.'};
        }
    }

    async update(id, datos){
        try {
            const query = await PreguntaModel.findByPk(id);
            if(query) {
                await query.update(datos, { fields: Object.keys(datos) });
                return { ok: true, data: query};
            } else {
                return null;
            }
        } catch (error) {
            console.log('Error en la actualizacion de la pregunta.', error);
            return null;
        }
    }
    
    //Obtener todas las preguntas de un examen
    async findPreguntasExamen(body){
        try {
            
            
            const { id_usuario, id_examen} = body
            const permiso = await examenPermisoModel.findOne({ where: {
                id_usuario,
                id_examen,
                estado: 'activo'
            }});
           
            
            if(!permiso){
                console.log('El usuario no tiene permiso para contestar este examen');
                return { ok: false, data: null};
            }
            
            const query = await PreguntaModel.findAll({
                where: {id_examen},
                order: fn('RAND'),
                limit: 45,//cambiar a 45 despues de pruebas
                attributes: {
                    exclude: ['correcta']
                }
            });
            if(query.length>0){
                return {ok: true, data: query};
            } else {
                return { ok:false, data: null};
            }
        } catch (error) {
            console.error(error);
            return { ok: false, data: null, message: 'Hubo un problema en la query'};
        }
    }
}
export const preguntaQueries = new PreguntaQueries();