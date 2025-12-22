const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Medidas = sequelize.define("Medidas", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    numero_medida: {
      type: DataTypes.INTEGER(3),
      allowNull: false,
      unique: true,
      field: 'numero_medida'
    },
    lugar_ocurrencia: {
      type: DataTypes.STRING(45),
      allowNull: false,
      field: 'lugar_ocurrencia'
    },
    tipo_violencia: {
      type: DataTypes.STRING(45),
      allowNull: false,
      field: 'tipo_violencia'
    },
    fecha_ultimos_hechos: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'fecha_ultimos_hechos'
    },
    hora_ultimos_hechos: {
      type: DataTypes.TIME,
      allowNull: false,
      field: 'hora_ultimos_hechos'
    },
    fecha_creacion: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'fecha_creacion'
    },
    // CLAVES FORÁNEAS
    comisaria_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'comisaria_id'
    },
    usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'usuario_id'
    },
    victimario_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'victimario_id'
    }
  }, {
    tableName: "medidas_proteccion",
    timestamps: false,
    createdAt: 'fecha_creacion',
    updatedAt: false
  });

  return Medidas;
};