import { CursoModel } from "../models/curso.model.js";
import { ExamenModel } from "../models/examen.model.js";
import { PreguntaModel } from "../models/pregunta.model.js";

class ExamenQueries{

    async store(examen){
        try {
            const query = await ExamenModel.create(examen);
            if(query){
                return { ok: true, data: query};
            } else {
                return { ok: false, data: null};
            }
        } catch (error) {
            console.log(error);
            return { ok: false, data: null};
        } 
    }

    async findAll(condition = {}){
        try {
            const query = await ExamenModel.findAll({ where: condition,
                include: [
                    {
                        model: CursoModel,
                        required: true
                    }
                ]
            });
            if (query.length>0){
                return { ok: true, data: query };
            } else {
                return { ok: false, data: query};
            }
        } catch (error) {
            console.log('No se pudo encontrar el certificado.');
            return { ok: false, data: null, message: 'No se pudo encontrar el certificado'};
        }
    }

    async findOne(condition = {}){
        try {
            const query = await ExamenModel.findOne({ where: condition,
                include: [
                    {
                        model: CursoModel,
                        required: true
                    }
                ]
            });
            if (query){
                return { ok: true, data: query };
            } else {
                return { ok: false, data: null};
            }
        } catch (error) {
            console.log('No se pudo encontrar el examen:');
            return { ok: false, data: null, message: 'No se pudo encontrar el examen'};
        }
    }

    async delete (id){
        try {
            const query = await ExamenModel.destroy({where: { id_examen: id}});
            if(query){
                return { ok: true};
            } else {
                console.log('No se pudo eliminar el examen');
                return { ok: false};
            }
        } catch (error) {
            console.error('Error al eliminar el examen ', error);
            return { ok: false, data: null, message: 'Error en la base de datos.'};
        }
    }

    async update(id, datos){
        try {
            const query = await ExamenModel.findByPk(id);
            if(query) {
                await query.update(datos, { fields: Object.keys(datos) });
                return { ok: true, data: query};
            } else {
                return null;
            }
        } catch (error) {
            console.log('Error en la actualizacion del examen', error);
            return null;
        }
    }

    //Obtener examen con todas sus preguntas
    async findExamenConPreguntas(id){
        try {
          
            
            const query = await ExamenModel.findByPk(id, {
                include: [{
                    model: PreguntaModel,
                    as: 'preguntas',
                    required: true,
                    attributes: {
                        exclude: ['correcta']
                    }
                }]
            });
            if(query){
                return { ok: true, data: query};
            } else {
                return { ok: false, data: null};
            }
        } catch (error) {
            console.error(error);
            return { ok: false, data: null, message: 'Ha habido un error en la query'};
        }
    }
    
    //Obtener examen con todas sus preguntas y su respuesta
    async findExamenConPreguntasyRespuesta(id){
        try {
          
            
            const query = await ExamenModel.findByPk(id, {
                include: [{
                    model: PreguntaModel,
                    as: 'preguntas',
                    required: true
                }]
            });
            if(query){
                return { ok: true, data: query};
            } else {
                return { ok: false, data: null};
            }
        } catch (error) {
            console.error(error);
            return { ok: false, data: null, message: 'Ha habido un error en la query'};
        }
    }
}
export const examenQueries = new ExamenQueries();