const { DataTypes } = require("sequelize");
const sequelize = require("../db/config.js");

const Victimas = sequelize.define("Victimas", {
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
    allowNull: true
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
    allowNull: true
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
    allowNull: true
  },
  direccion: {
    type: DataTypes.STRING,
    allowNull: true
  },
  barrio: {
    type: DataTypes.STRING,
    allowNull: true
  },
  ocupacion: {
    type: DataTypes.STRING,
    allowNull: true
  },
  estudios: {
    type: DataTypes.STRING,
    allowNull: true
  },
  aparentescoConVictimario: {
    type: DataTypes.STRING,
    allowNull: true
  },
  tipoVictimaId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'IdTipoDeVictima'
  },
  comisariaId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'IdComisaria'
  }  
}, {
  tableName: "victimas",
  timestamps: false         
})

module.exports = Victimas;