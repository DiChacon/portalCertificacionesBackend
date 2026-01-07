import {estadosQueries} from "../queries/estados.query.js"

class EstadoController {
    async findAll(req, res) {
        const condition = req.query;

        const query = await estadosQueries.findAll(condition);
        if (query.ok) {
            return res.status(200).json({ ok: true, data: query.data });
        } else {
            return res.status(403).json({ ok: false, data: null, message: 'No se pudieron encontrar los estados.' })
        }
    }
}
export const estadoController = new EstadoController;