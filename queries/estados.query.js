import { EstadosModel } from "../models/estado.model.js";

//Estados
class EstadosQuery {
    async findAll(condition = {}) {
        try {
            const query = await EstadosModel.findAll({
                where: condition
            });
            if (query.length > 0) {
                return { ok: true, data: query };
            } else {
                return { ok: false, message: 'Hubo un problema en la petición.' }
            }
        } catch (e) {
            console.log('Error al encontrar a todos los estados', e);
            return { ok: false, message: 'Error al encontrar los estados' }
        }
    }
}

export const estadosQueries = new EstadosQuery();