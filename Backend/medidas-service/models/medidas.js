const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Medidas = sequelize.define("Medidas", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    numeroMedida: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'numero_medida'
    },
    lugarHechos: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'lugar_hechos'
    },
    tipoViolencia: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'tipo_violencia'
    },
    fechaUltimosHechos: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'fecha_ultimos_hechos'
    },
    horaUltimosHechos: {
      type: DataTypes.TIME,
      allowNull: false,
      field: 'hora_ultimos_hechos'
    },
    comisariaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'comisaria_id'
    },
    usuarioId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'usuario_id'
    },
    victimarioId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'victimario_id'
    }
  }, {
    tableName: "medidas_de_proteccion",
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: 'fecha_actualizacion'
  });

  return Medidas;
};