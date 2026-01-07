import { CursoModel } from "../models/curso.model.js";

class CursoQueries {

    async store(curso){
        try {
            const query = await CursoModel.create(curso);
            if(query){
                return { ok: true, data: query};
            } else {
                return { ok: false, data: null}
            }
        } catch (error) {
            console.log('Error al crear el curso', error);
            return{ok: false, data: null};
        }
    }

    async findAll(condition = {}){
        try {
            const query = await CursoModel.findAll({where: condition});
            if(query.length>0){
                return { ok: true, data: query };
            } else {
                return { ok: false, data: null, message: 'No se obtuvieron todos los cursos.'}
            }
        } catch (error) {
            console.log('No se pudieron obtener todos los cursos.');
            return { ok: false, data: null};
        }
    }

    async findOne(condition = {}){
        try {
            const query = await CursoModel.findOne({ where: condition});
            if (query){
                return { ok: true, data: query };
            } else {
                return { ok: false, data: query};
            }
        } catch (error) {
            console.log('No se pudo encontrar el curso: ' + data.query);
            return { ok: false, data: null, message: 'No se pudo encontrar el curso: ' + condition};
        }
    }

    async delete(id){
        try {
            const query = await CursoModel.destroy({ where: { id_curso: id}});
            if(query){
                return { ok: true};
            } else {
                return { ok:false };
            }
        } catch (error) {
            console.error('Ocurrió un error', error);
            return { ok: false, message: 'Error en el servidor.'}
        }
    }

    async updCurso(id, datos){
        try {
            const query = await CursoModel.findByPk(id);
            if(query) {
                await query.update(datos, { fields: Object.keys(datos) });
                return query;
            } else {
                return null;
            }
        } catch (error) {
            console.log('Error en la actualizacion del curso', error);
            return null;
        }
    }
}

export const cursoQueries = new CursoQueries();