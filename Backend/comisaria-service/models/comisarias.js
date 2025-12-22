const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Comisaria = sequelize.define("Comisaria", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    numero: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true
    },
    lugar: {
      type: DataTypes.STRING(45),
      allowNull: false
    }
  }, {
    tableName: "comisarias",
    timestamps: false
  });

  return Comisaria;
};