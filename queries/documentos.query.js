import { DocumentoModel } from '../models/documento.model.js';
import { CursoModel } from '../models/curso.model.js';
import { RolModel } from '../models/rol.model.js';
import fs from 'fs';


class DocumentoQueries {

  /**
   * Registrar documento en BD
   * @param {Object} body
   * @param {Object} file
   * @param {Object} user
   */
  async store(body, file, user) {
    try {
      const {
        titulo,
        descripcion,
        rol_permitido,
        id_curso
      } = body;

      // 1️⃣ Validaciones básicas
      if (!titulo || !rol_permitido || !id_curso) {
        throw new Error('Datos incompletos');
      }

      if (!file) {
        throw new Error('Archivo requerido');
      }

      // 2️⃣ Validar curso
      const curso = await CursoModel.findByPk(id_curso);
      if (!curso) {
        throw new Error('Curso no encontrado');
      }

      // 3️⃣ Validar rol permitido
      const rol = await RolModel.findOne({
        where: { rol: rol_permitido }
      });

      if (!rol) {
        throw new Error('Rol permitido no válido');
      }

      // 4️⃣ Crear documento
      const documento = await DocumentoModel.create({
        titulo,
        descripcion,
        nombre_archivo: file.originalname,
        ruta_archivo: file.path,
        tipo_archivo: file.mimetype,
        tamanio: file.size,
        rol_permitido,
        id_curso,
        estado: true,
        creado_por: user.id_usuario
      });

      if (!documento) {
        return { ok: false, data: null };
      }

      return {
        ok: true,
        data: documento
      };

    } catch (error) {
      console.error('DocumentoQueries.store:', error.message);
      return {
        ok: false,
        message: error.message
      };
    }
  }
async getVisiblesPorRol(user) {
  try {

    let whereCondition = {
      estado: true
    };

    // Si NO es administrador, filtramos por rol
    if (user.id_rol !== 'administrador') {
      whereCondition.rol_permitido = user.id_rol;
    }

    const documentos = await DocumentoModel.findAll({
      where: whereCondition,
      include: [
        {
          model: CursoModel,
          as: 'curso',
          attributes: ['id_curso', 'nombre_curso']
        }
      ],
      order: [['id_curso', 'ASC']]
    });

    return {
      ok: true,
      data: documentos
    };

  } catch (error) {
    console.error('getVisiblesPorRol:', error);
    return {
      ok: false,
      message: 'Error al obtener documentos'
    };
  }
}
async update(id_documento, body, user) {
  try {

    if (user.id_rol !== 'administrador') {
      return { ok: false, message: 'No autorizado' };
    }

    const documento = await DocumentoModel.findByPk(id_documento);

    if (!documento) {
      return { ok: false, message: 'Documento no encontrado' };
    }

    await documento.update({
      titulo: body.titulo ?? documento.titulo,
      descripcion: body.descripcion ?? documento.descripcion,
      rol_permitido: body.rol_permitido ?? documento.rol_permitido,
      estado: body.estado ?? documento.estado
    });

    return { ok: true, data: documento };

  } catch (error) {
    console.error("DocumentoQueries.update:", error);
    return { ok: false, message: error.message };
  }
}
async delete(id_documento, user) {
  try {

    if (user.id_rol !== 'administrador') {
      return { ok: false, message: 'No autorizado' };
    }

    const documento = await DocumentoModel.findByPk(id_documento);

    if (!documento) {
      return { ok: false, message: 'Documento no encontrado' };
    }

    // 🗑 Eliminar archivo físico
    if (fs.existsSync(documento.ruta_archivo)) {
      fs.unlinkSync(documento.ruta_archivo);
    }

    await documento.destroy();

    return { ok: true };

  } catch (error) {
    console.error("DocumentoQueries.delete:", error);
    return { ok: false, message: error.message };
  }
}

}

export const documentoQueries = new DocumentoQueries();
