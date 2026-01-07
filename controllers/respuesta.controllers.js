import { respuestaQueries } from "../queries/respuesta.query.js";
class RespuestaController {

    async create(req, res){
        try {
            const body = req.body;

        const query = await respuestaQueries.store(body);

        if (query.ok){
            return res.status(200).json({ ok: true, data: query.data});
        } else {
            return res.status(400).json({ ok: false, data: null, message: 'No se pudo enviar la respuesta.'});
        }
        } catch (error) {
            console.log(error);
            return res.status(403).json({ ok: false, data: null, message: 'Hubo un problema en el servidor.'});
        }
    }

    async findAllWithUser(req, res){
        try {
            const id=req.query;

            const query = await respuestaQueries.findAllWithUser(id);
            if (query.ok){
                return res.status(200).json({ ok: true, data: query.data});
            } else {
                return res.status(400).json({ ok: false, data: null, message: 'No se pudieron obtener sus respuestas.'});
            }
        } catch (error) {
            console.log(error);
            return res.status(403).json({ ok: false, data: null, message: 'Hubo un problema en el servidor.'});
        }
    }
}

export const respuestaController = new RespuestaController();