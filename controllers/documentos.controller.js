import { documentoQueries } from '../queries/documentos.query.js';

export const documentoController = {

  async create(req, res) {
    try {
      const result = await documentoQueries.store(
        req.body,
        req.file,
        req.user
      );
      
      if (!result.ok) {
        return res.status(400).json(result);
      }

      return res.json(result);

    } catch (error) {
      return res.status(500).json({
        ok: false,
        message: 'Error al crear documento'
      });
    }
  },
  async getDocumentos(req, res) {
  try {

    if (!req.user) {
      return res.status(401).json({
        ok: false,
        message: 'No autorizado'
      });
    }

    const result = await documentoQueries.getVisiblesPorRol(req.user);
    console.log("Resultado documentos:", result);
    if (!result.ok) {
      return res.status(400).json(result);
    }

    return res.json(result);

  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: 'Error interno'
    });
  }
},
async update(req, res) {
  try {

    const id = req.params.id;

    const result = await documentoQueries.update(
      id,
      req.body,
      req.user
    );

    if (!result.ok) {
      return res.status(400).json(result);
    }

    return res.json(result);

  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: 'Error interno'
    });
  }
},
async delete(req, res) {
  try {

    const id = req.params.id;

    const result = await documentoQueries.delete(
      id,
      req.user
    );

    if (!result.ok) {
      return res.status(400).json(result);
    }

    return res.json({ ok: true });

  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: 'Error interno'
    });
  }
}
};
