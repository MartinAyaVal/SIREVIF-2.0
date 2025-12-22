const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Rol = sequelize.define("Rol", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    rol: {
      type: DataTypes.STRING(45),
      allowNull: false
    }
  }, {
    tableName: "roles",
    timestamps: false
  });

  return Rol;
};