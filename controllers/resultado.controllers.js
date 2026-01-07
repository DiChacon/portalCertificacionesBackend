import { resultadoQueries } from "../queries/resultado.query.js";
class ResultadoController {

    async create(req, res) {
        const body = req.body;
        const query = await resultadoQueries.store(body);
        if (query.ok) {
            return res.status(200).json({ ok: true, data: query.data });
        } else {
            return res.status(400).json({ ok: false, message: 'No se pudo crear el resultado.' });
        }
    }

    async findAll(req, res) {
        const condition = req.query;

        const query = await resultadoQueries.findAll(condition);
        if (query.ok) {
            return res.status(200).json({ ok: true, data: query.data });
        } else {
            return res.status(403).json({ ok: false, data: null, message: 'No se pudieron encontrar los resultados.' })
        }
    }

    async findOne(req, res) {
        try {
            const condition = req.query;

            const query = await resultadoQueries.findOne(condition);

            if (query.ok) {
                return res.status(200).json({ ok: true, data: query.data });
            } else {
                return res.status(403).json({ ok: false, message: 'No se pudo encontrar el resultado' });
            }
        } catch (error) {
            console.log('Error al encontrar el resultado.');
            return res.status(500).json({ ok: false, message: 'Error en el servidor', error: error.message });
        }
    }

    async delete(req, res) {
        try {
            const identifier = req.params.id;

            const query = await resultadoQueries.delete(identifier);
            if (query.ok) {
                return res.status(200).json({ ok: true, message: 'Se elimin�� el resultado' });
            } else {
                console.log('El resultado no se pudo eliminar.');
                return res.status(400).json({ ok: false, message: 'No se pudo eliminar el resultado' });
            }
        } catch (error) {
            console.error('Error al eliminar el resultado.', error);
            return res.status(404).json({ ok: false, message: 'No se pudo eliminar el resultado especificado' });
        }
    }

    async update(req, res) {
        try {
            const id = req.params.id;
            const datos = req.body;

            const query = await resultadoQueries.update(id, datos);
            if (query.ok) {
                console.log('Se logr�� actualizar el resultado: ' + id);
                return res.status(200).json({ ok: true, data: query.data });
            } else {
                return res.status(404).json({ ok: false, data: null, message: 'resultado no actualizado.' });
            }
        } catch (error) {
            return res.status(500).json({ ok: false, data: null, message: 'Error en el servidor', error });
        }
    }

    async calificar(req, res) {
        try {
            const body = req.body;

            const query = await resultadoQueries.calificar(body);

            if (query.ok) {
                console.log('Se logró calificar el examen.');
                return res.status(200).json({ ok: true, message: 'Se logró calificar el examen.' });
            } else {
                return res.status(404).json({ ok: false, data: null, message: 'Examen no calificado.' });
            }
        } catch (error) {
            console.error(error);

            return res.status(500).json({ ok: false, data: null, message: 'Error en el servidor', error });
        }
    }

    async findResultadosPorUsuario(req, res) {
        try {
            const id_usuario = req.params.id;

            const query = await resultadoQueries.findResultadosPorUsuario(id_usuario);

            if (query.ok) {
                return res.status(200).json({ ok: true, data: query.data });
            } else {
                return res.status(400).json({ ok: false, message: 'No se encontraron intentos hechos para este usuario.' });
            }
        } catch (error) {
            console.log(error);
            return res.status(403).json({ok: false, message: 'Error en el servidor'});
        }
    }
}



export const resultadoController = new ResultadoController();