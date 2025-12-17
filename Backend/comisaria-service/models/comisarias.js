const { DataTypes } = require('sequelize');
const sequelize = require('../db/config.js');

const Comisaria = sequelize.define("Comisaria", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  numero: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  lugar: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: "comisarias",
  timestamps: false
});

module.exports = Comisaria;