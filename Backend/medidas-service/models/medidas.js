const { DataTypes } = require("sequelize");
const sequelize = require("../db/config.js");

const Medidas = sequelize.define("Medidas", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  numeroMedida: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  lugarHechos: {
    type: DataTypes.STRING,
    allowNull: false
  },
  tipoViolencia: {
    type: DataTypes.STRING,
    allowNull: false
  },
  fechaUltimosHechos: {
    type: DataTypes.DATE,
    allowNull: false
  },
  horaUltimosHechos: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  comisariaId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'IdComisaria'
  },
  usuarioId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'IdUsuario'
  }
}, {
  tableName: "medidasDeProteccion",
  timestamps: true
});

module.exports = Medidas;