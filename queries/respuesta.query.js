import { PreguntaModel } from "../models/pregunta.model.js";
import { RespuestaModel } from "../models/respuesta.model.js";
import { UserModel } from "../models/user.model.js";

class RespuestaQueries {

    async store(respuesta) {
        try {
            const query = await RespuestaModel.create(respuesta);

            if (query) {
                return { ok: true, data: query };
            } else {
                return { ok: false, data: null };
            }
        } catch (error) {
            console.error(error);
            return { ok: false, data: null};
        }
    }

    async findAllWithUser (condition={}){
        try {
            const query = await RespuestaModel.findAll({
                where: condition,
                include: [
                    {
                        model: PreguntaModel,
                        required: true
                    },
                    {
                        model: UserModel,
                        required: true
                    }
                ]
            });

            if(query.length>0){
                return { ok: true, data: query};
            } else {
                return { ok: false, data: null};
            }
        } catch (error) {
            console.error(error);
            return { ok: false, data: null};
        }
    }
}

export const respuestaQueries = new RespuestaQueries();