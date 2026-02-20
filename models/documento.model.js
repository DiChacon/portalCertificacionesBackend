import { DataTypes, Model, NOW } from 'sequelize';
import { DatabaseConfig } from '../config/database.js';
import { CursoModel } from './curso.model.js';

export class DocumentoModel extends Model {}

DocumentoModel.init({

  id_documento: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  titulo: {
    type: DataTypes.STRING(255),
    allowNull: false
  },

  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  nombre_archivo: {
    type: DataTypes.STRING(255),
    allowNull: false
  },

  ruta_archivo: {
    type: DataTypes.STRING(500),
    allowNull: false
  },

  tipo_archivo: {
    type: DataTypes.STRING(100),
    allowNull: false
  },

  tamanio: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  rol_permitido: {
    type: DataTypes.STRING(50),
    allowNull: false
  },

  id_curso: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: CursoModel,
      key: 'id_curso'
    }
  },

  estado: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },

  creado_por: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  created_at: {
    type: DataTypes.DATE,
    defaultValue: NOW
  }

}, {
  sequelize: DatabaseConfig,
  tableName: 'documentos',
  timestamps: false
});
DocumentoModel.belongsTo(CursoModel, {
  foreignKey: 'id_curso',
  as: 'curso'
});

CursoModel.hasMany(DocumentoModel, {
  foreignKey: 'id_curso',
  as: 'documentos'
});