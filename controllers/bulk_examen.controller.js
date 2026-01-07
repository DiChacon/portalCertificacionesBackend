import { bulkExamenQueries } from "../queries/bulk_examen.query.js";
import { examenPermisoQueries } from "../queries/examenPermiso.query.js";

class BulkExamenController {
  async findBulkExamen(req, res) {
    try {
      const bulk = await bulkExamenQueries.findAllBulks();

      if (!bulk.ok) return res.status(200).json({ ok: false, data: null, message: 'No se pudo encontrar el historial' });

      return res.status(200).json({ ok: true, data: bulk.data, message: 'Historial de grupos obtenido correctamente.' });
    } catch (error) {
      console.error(error);
      return res.status(404).json({ ok: false, data: null, message: 'Hubo un problema en el servidor.' });
    }
  }

  async findBulkExamenByProfesor(req, res) {
    try {
      if (!req.params.id) return res.status(400).json({ ok: false, data: null, message: 'Identificador del profesor es requerido' });
      
      const { id } = req.params;

      const bulk = await bulkExamenQueries.findAllBulksByUserId(id);

      if (!bulk.ok) return res.status(200).json({ ok: false, data: null, message: 'No se pudo encontrar el historial' });

      return res.status(200).json({ ok: true, data: bulk.data, message: 'Historial de grupos obtenido correctamente.' });
    } catch (error) {
      console.error(error);
      return res.status(404).json({ ok: false, data: null, message: 'Hubo un problema en el servidor.' });
    }
  }

  async findInactivesBulks(req, res) {
    try {
      const bulk = await bulkExamenQueries.findAllInactivesBulks();
      
      if (bulk.length == 0 ) return res.status(200).json({ ok: false, data: null, message: 'No hay solicitudes.' });

      if (!bulk.ok) return res.status(400).json({ok: false, message: "Hubo un error al hacer la query."});

      return res.status(200).json({ ok: true, data: bulk.data, message: 'Sí jaló.' });
    } catch (error) {
      console.error(error);
      return res.status(404).json({ ok: false, data: null, message: 'Hubo un problema en el servidor.' });
    }
  }

  async findUsersWithSameBulk(req, res) {
    try {
      if (!req.params.id) return res.status(400).json({ ok: false, data: null, message: 'Identificador del bulk es requerido' });

      const id = req.params.id;

      // 1. Buscar los usuarios que tienen el mismo bulk
      const users = await bulkExamenQueries.findUsersWithSameBulkById(id);

      if (!users.ok) return res.status(400).json({ ok: false, data: null, message: 'No se pudo encontrar los usuarios' });

      return res.status(200).json({ ok: true, data: users.data, message: 'Usuarios obtenidos correctamente.' });
    } catch (error) {
      console.error(error);
      return res.status(404).json({ ok: false, data: null, message: 'Hubo un problema en el servidor.' });
    }
  }

  async updateBulkExamen(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;

      // 1. Actualizar el bulk del examen
      const updatedBulk = await bulkExamenQueries.update(id, data);

      if (!updatedBulk.ok) return res.status(400).json({ ok: false, data: null, message: 'No se pudo actualizar el historial' });

      return res.status(200).json({ ok: true, data: updatedBulk.data, message: 'Historial de grupos actualizado correctamente.' });
    } catch (error) {
      console.error(error);
      return res.status(404).json({ ok: false, data: null, message: 'Hubo un problema en el servidor.' });
    }
  }
}

export const bulkExamenController = new BulkExamenController();