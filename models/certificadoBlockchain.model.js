import { DataTypes, Model, NOW } from "sequelize";
import { DatabaseConfig } from "../config/database.js";
import { CertificadoModel } from "./certificado.model.js";

export class CertificadoBlockchainModel extends Model {}

CertificadoBlockchainModel.init({
  id_blockchain: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_certificado: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: CertificadoModel,
      key: 'id_certificado'
    },
  },
  hash: {
    type: DataTypes.STRING,
    allowNull: false
  },
  algoritmo: {
    type: DataTypes.STRING,
    defaultValue: 'SHA-256'
  },
  fecha_hash: {
    type: DataTypes.DATE,
    defaultValue: NOW
  }
}, {
  sequelize: DatabaseConfig,
  tableName: 'certificados_blockchain',
  timestamps: false
});
