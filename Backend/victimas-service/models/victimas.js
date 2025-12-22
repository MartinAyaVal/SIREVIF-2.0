const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Victimarios = sequelize.define("Victimarios", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nombre_completo: {
      type: DataTypes.STRING(45),
      allowNull: false,
      field: 'nombre_completo'
    },
    fecha_nacimiento: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'fecha_nacimiento'
    },
    edad: {
      type: DataTypes.INTEGER(3),
      allowNull: false
    },
    tipo_documento: {
      type: DataTypes.STRING(45),
      allowNull: false,
      field: 'tipo_documento'
    },
    otro_tipo_documento: {
      type: DataTypes.STRING(45),
      allowNull: true,
      field: 'otro_tipo_documento'
    },   
    numero_documento: {
      type: DataTypes.INTEGER(10),
      allowNull: false,
      field: 'numero_documento'
    },
    documento_expedido_en: {
      type: DataTypes.STRING(45),
      allowNull: false,
      field: 'documento_expedido_en'
    },
    sexo: {
      type: DataTypes.STRING(45),
      allowNull: false
    },
    lgtbi: {
      type: DataTypes.STRING(2),
      allowNull: false,
      field: 'identifica_lgtbi'
    },
    cual_lgtbi: {
      type: DataTypes.STRING(45),
      allowNull: true,
      field: 'cual_lgtbi'
    },
    estado_civil: {
      type: DataTypes.STRING(45),
      allowNull: false,
      field: 'estado_civil'
    },
    direccion: {
      type: DataTypes.STRING(45),
      allowNull: false
    },
    barrio: {
      type: DataTypes.STRING(45),
      allowNull: false
    },
    ocupacion: {
      type: DataTypes.STRING(45),
      allowNull: false
    },
    estudios: {
      type: DataTypes.STRING(45),
      allowNull: false
    }
  }, {
    tableName: "victimarios",
    timestamps: false         
  });

  return Victimarios;
};