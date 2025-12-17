const { DataTypes } = require("sequelize");
const sequelize = require("../db/config.js");

const Victimarios = sequelize.define("Victimarios", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombreCompleto: {
    type: DataTypes.STRING,
    allowNull: false
  },
  fechaNacimiento: {
    type: DataTypes.DATE,
    allowNull: false
  },
  edad: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  tipoDocumento: {
    type: DataTypes.STRING,
    allowNull: false
  },
  otroTipoDocumento: {
    type: DataTypes.STRING,
    allowNull: true
  },   
  numeroDocumento: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  documentoExpedido: {
    type: DataTypes.STRING,
    allowNull: false
  },
  sexo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  lgtbi: {
    type: DataTypes.STRING,
    allowNull: false
  },
  cualLgtbi: {
    type: DataTypes.STRING,
    allowNull: true
  },
  estadoCivil: {
    type: DataTypes.STRING,
    allowNull: false
  },
  direccion: {
    type: DataTypes.STRING,
    allowNull: false
  },
  barrio: {
    type: DataTypes.STRING,
    allowNull: false
  },
  ocupacion: {
    type: DataTypes.STRING,
    allowNull: false
  },
  estudios: {
    type: DataTypes.STRING,
    allowNull: false
  }  
}, {
  tableName: "victimarios",
  timestamps: false         
})

module.exports = Victimarios;