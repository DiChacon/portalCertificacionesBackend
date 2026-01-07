import { LogoCertificadoModel } from "../models/logoCertificado.model.js";

class LogoCertificadoQuery {

    async store(logo) {
        try {
            const query = await LogoCertificadoModel.create(logo);
            if (query) {
                return { ok: true, data: query };
            } else {
                return { ok: false, data: null }
            }
        } catch (error) {
            console.log('Error al crear el logo del certificado en query', error);
            return { ok: false, data: null };
        }
    }

    async findAll(condition = {}) {
        try {
            const query = await LogoCertificadoModel.findAll({ where: condition });
            if (query.length > 0) {
                return { ok: true, data: query };
            } else {
                return { ok: false, data: null, message: 'No se obtuvieron los logos.' }
            }
        } catch (error) {
            console.log('No se pudieron obtener todos los logos.');
            return { ok: false, data: null };
        }
    }

    async findOne(condition = {}) {
        try {
            const query = await LogoCertificadoModel.findOne({ where: condition });
            if (query) {
                return { ok: true, data: query };
            } else {
                return { ok: false, data: query };
            }
        } catch (error) {
            console.log('No se pudo encontrar el logo');
            return { ok: false, data: null, message: 'No se pudo encontrar el logo ' + condition };
        }
    }

    async delete(id) {
        try {
            const query = await LogoCertificadoModel.destroy({ where: { id_logo_certificado: id } });
            if (query) {
                return { ok: true };
            } else {
                return { ok: false };
            }
        } catch (error) {
            console.error('Ocurri�� un error', error);
            return { ok: false, message: 'Error en el servidor.' }
        }
    }

    async updateLogo(id, datos) {
        try {
            const query = await LogoCertificadoModel.findByPk(id);
            if (query) {
                await query.update(datos, { fields: Object.keys(datos) });
                return { ok: true, data: query };
            } else {
                return null;
            }
        } catch (error) {
            console.log('Error en la actualizacion de la pregunta.', error);
            return null;
        }
    }

    async findLogodeExamen(examen){

    }
}

export const logoCertificadoQuery = new LogoCertificadoQuery();