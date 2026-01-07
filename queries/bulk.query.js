import { BulksModel } from '../models/bulk.model.js';

class BulkQueries {
    async store(bulk) {
        try {
            const query = await BulksModel.create(bulk);
            if (query) {
                console.log('Se creó el bulk satisfactoriamente.');
                return { ok: true, data: query };
            } else {
                return { ok: false, data: null };
            }
        } catch (e) {
            console.log('Error al crear el bulk', e);
            return { ok: false, data: null };
        }
    }
};

export const bulkQueries = new BulkQueries();