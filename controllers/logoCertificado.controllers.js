import { logoCertificadoQuery } from "../queries/logoCertificado.query.js";
import { request, response } from 'express';

class logoCertificadoController {

    async create(req, res) {
        try {
            const {descripcion} = req.body;
            const path = 'uploads/logos/' + req.file.filename;

            const query = await logoCertificadoQuery.store({
                descripcion,
                path
            });
            if (query) {
                return res.status(200).json({ ok: true, data: query.data });
            } else {
                return res.status(400).json({ ok: false, message: 'No se pudo crear el logo.' });
            }
        } catch (error) {
            console.log('Error al crear el logo en controller.', error);
            return res.status(500).json({ ok: false, message: 'Error en el servidor', error: error.message });
        }
    }

    async findAll(req, res) {
        try {
            const condition = req.query;

            const query = await logoCertificadoQuery.findAll(condition);
            if (query.ok) {
                return res.status(200).json({ ok: true, data: query.data });
            } else {
                return res.status(204).json({ ok: false, data: null, message: 'No se pudieron encontrar los logos.' })
            }
        } catch (error) {
            console.log('Error al encontrar el logo.', error);
            return res.status(500).json({ ok: false, message: 'Error en el servidor', error: error.message });
        }
    }

    async findOne(req, res) {
        try {
            const condition = req.query;

            const query = await logoCertificadoQuery.findOne(condition);

            if (query.ok) {
                return res.status(200).json({ ok: true, data: query.data });
            } else {
                return res.status(204).json({ ok: false, message: 'No se encontr�� un logo con ese ID' });
            }
        } catch (error) {
            console.log('Error al encontrar el logo en controller.', error);
            return res.status(500).json({ ok: false, message: 'Error en el servidor', error: error.message });
        }
    }

    async delete(req, res) {
        try {
            const identifier = req.params.id;

            const query = await logoCertificadoQuery.delete(identifier);
            if (query.ok) {
                return res.status(200).json({ ok: true, message: 'Se elimin�� el logo' });
            } else {
                console.log('El logo no se pudo eliminar.');
                return res.status(400).json({ ok: false, message: 'No se pudo eliminar el logo' });
            }
        } catch (error) {
            console.error('Error al eliminar el logo.', error);
            return res.status(404).json({ ok: false, message: 'No se pudo eliminar el logo especificado' });
        }
    }

    async update(req, res) {
        try {
            const id = req.params.id;
            const datos = req.body;
            let path = null;
            
            if(req.file){
                path = 'uploads/logos/' + req.file.filename;
                datos.path = path;
            }

            const query = await logoCertificadoQuery.updateLogo(id, datos);
            console.log(query);
            
            if (query.ok) {
                console.log('Se logr�� actualizar el logo: ' + id);
                return res.status(200).json({ ok: true, data: query.data });
            } else {
                console.log('Problema en el controller');
                return res.status(404).json({ ok: false, data: null, message: 'logo no actualizado.' });
            }
        } catch (error) {
            return res.status(500).json({ ok: false, data: null, message: 'Error en el servidor', error });
        }
    }
}

export const LogoCertificadoController = new logoCertificadoController();