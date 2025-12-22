const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const TipoVictima = sequelize.define("TipoVictima", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    tipo: {
      type: DataTypes.STRING(45),
      allowNull: false
    }
  }, {
    tableName: "tipos_victima",
    timestamps: false
  });

  return TipoVictima;
};