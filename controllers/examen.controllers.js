import { examenQueries } from "../queries/examen.query.js";
export class ExamenController {

    async create(req, res) {
        try {
            const body = req.body;

            const query = await examenQueries.store(body);
            if (query.ok) {
                return res.status(200).json({ ok: true, data: query.data });
            } else {
                return res.status(403).json({ ok: false, data: null, message: 'No se pudo crear el examen' });
            }
        } catch (error) {
            return res.status(400).json({ ok: false, data: null, message: 'Hubo un error en el servidor.', error });
        }
    }

    async findAll(req, res) {
        try {
            const condition = req.query;

            const query = await examenQueries.findAll(condition);
            if (query.ok) {
                return res.status(200).json({ ok: true, data: query.data });
            } else {
                return res.status(403).json({ ok: false, data: null, message: 'No se pudo encontrar el examen' });
            }
        } catch (error) {
            return res.status(400).json({ ok: false, data: null, message: 'Hubo un error en el servidor.', error });
        }
    }

    async findOne(req, res) {
        try {
            const condition = req.query;

            const query = await examenQueries.findOne(condition);
            if (query.ok) {
                return res.status(200).json({ ok: true, data: query.data });
            } else {
                return res.status(403).json({ ok: false, data: null, message: 'No se pudo encontrar el examen' });
            }
        } catch (error) {
            return res.status(400).json({ ok: false, data: null, message: 'Hubo un error en el servidor.', error });
        }
    }

    async delete(req, res) {
        try {
            const id = req.params.id;
            
            const query = await examenQueries.delete(id);
            
            if(query.ok){
                return res.status(200).json({ ok: true, message: 'Se eliminó el examen'});
            } else {
                console.log('El examen no se pudo eliminar.');
                
                return res.status(400).json({ ok: false, message: 'No se pudo eliminar el examen'});
            }
        } catch (error) {
            console.error('Error al eliminar el examen:', error);
            return res.status(404).json({ ok: false, message: 'No se pudo eliminar el examen especificado'});
        }
    }

    async update(req, res) {
        try {
            const id = req.params.id;
            const datos = req.body;

            const query = await examenQueries.update(id, datos);
            if (query) {
                console.log('Se logró actualizar el examen: ' + id);
                return res.status(200).json({ ok: true, data: query.data, message: 'Se actualizó correctamente.' });
            } else {
                return res.status(404).json({ ok: false, data: null, message: 'Examen no actualizado.' });
            }
        } catch (error) {
            return res.status(500).json({ ok: false, data: null, message: 'Error en el servidor backend', error });
        }
    }

    async findExamenConPreguntas(req, res){
        try {
            const id_examen = req.params.id;
            
            const query = await examenQueries.findExamenConPreguntas(id_examen);
            if (query.ok) {
                console.log('Se logró encontrar el examen');
                return res.status(200).json({ ok: true, data: query.data, message: 'El examen fue encontrado.' });
            } else {
                return res.status(404).json({ ok: false, data: null, message: 'Examen no encontrado.' });
            }
        } catch (error) {
            console.error(error);
            return res.status(403).json({ ok: false, data: null, message: 'Hubo un problema en el servidor.'})
        }
    }
    
    async findExamenConPreguntasyRespuestas(req, res){
        try {
            const id_examen = req.params.id;
            
            const query = await examenQueries.findExamenConPreguntasyRespuesta(id_examen);
            if (query.ok) {
                console.log('Se logr�� encontrar el examen');
                return res.status(200).json({ ok: true, data: query.data, message: 'El examen fue encontrado.' });
            } else {
                return res.status(404).json({ ok: false, data: null, message: 'Examen no encontrado.' });
            }
        } catch (error) {
            console.error(error);
            return res.status(403).json({ ok: false, data: null, message: 'Hubo un problema en el servidor.'})
        }
    }
}

export const examenController = new ExamenController();