import { cursoQueries } from "../queries/curso.query.js";
class CursoController {

    async create(req, res) {
        const body = req.body;
        const query = await cursoQueries.store(body);
        if (query) {
            return res.status(200).json({ ok: true, data: query.data });
        } else {
            return res.status(400).json({ ok: false, message: 'No se pudo crear el curso.' });
        }
    }

    async findAll(req, res) {
        const condition = req.query;

        const query = await cursoQueries.findAll(condition);
        if (query.ok) {
            return res.status(200).json({ ok: true, data: query.data });
        } else {
            return res.status(403).json({ ok: false, data: null, message: 'No se pudieron encontrar los cursos.' })
        }
    }

    async findOne(req, res) {
        try {
            const condition = req.query;

            const query = await cursoQueries.findOne(condition);

            if (query.ok) {
                return res.status(200).json({ ok: true, data: query.data });
            } else {
                return res.status(403).json({ ok: false, message: 'No se pudo encontrar el curso' });
            }
        } catch (error) {
            console.log('Error al encontrar el curso.', error);
            return res.status(500).json({ ok: false, message: 'Error en el servidor', error: error.message });
        }
    }

    async delete(req, res) {
        try {
            const identifier = req.params.id;

            const query = await cursoQueries.delete(identifier);
            if (query.ok) {
                return res.status(200).json({ ok: true, message: 'Se eliminó el curso' });
            } else {
                console.log('El curso no se pudo eliminar.');
                return res.status(400).json({ ok: false, message: 'No se pudo eliminar el curso' });
            }
        } catch (error) {
            console.error('Error al eliminar el curso.', error);
            return res.status(404).json({ ok: false, message: 'No se pudo eliminar el curso especificado' });
        }
    }

    async update(req, res) {
        try {
            const id = req.params.id;
            const datos = req.body;

            const query = await cursoQueries.updCurso(id, datos);
            if (query) {
                console.log('Se logró actualizar el curso: ' + id);
                return res.status(200).json({ ok: true, data: query.data });
            } else {
                return res.status(404).json({ ok: false, data: null, message: 'Curso no actualizado.' });
            }
        } catch (error) {
            return res.status(500).json({ ok: false, data: null, message: 'Error en el servidor', error });
        }
    }
}

export const cursoController = new CursoController();