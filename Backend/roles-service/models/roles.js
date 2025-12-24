const { DataTypes } = require('sequelize');
const sequelize = require("../db/config.js");

module.exports = (sequelize) => {
  const Rol = sequelize.define("Rol", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    rol: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    }
  }, {
    tableName: "roles",
    timestamps: false
  });

  return Rol;
};