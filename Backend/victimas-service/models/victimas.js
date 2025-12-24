const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Victimas = sequelize.define("Victimas", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nombreCompleto: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    fechaNacimiento: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    edad: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    tipoDocumento: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    otroTipoDocumento: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    numeroDocumento: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    documentoExpedido: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    sexo: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    lgtbi: {
      type: DataTypes.STRING(2),
      allowNull: false,
      defaultValue: 'NO'
    },
    cualLgtbi: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    otroGeneroIdentificacion: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'otro_genero_identificacion'
    },
    estadoCivil: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    direccion: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    barrio: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    ocupacion: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    estudios: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    aparentescoConVictimario: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'aparentesco_victimario'
    },
    telefono: {
      type: DataTypes.STRING(15),
      allowNull: true
    },
    correo: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        isEmail: true
      }
    },
    tipoVictimaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'tipo_victima_id'
    },
    comisariaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'comisaria_id'
    },
    medidaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'medida_id'
    }
  }, {
    tableName: "victimas",
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: 'fecha_actualizacion'
  });

  return Victimas;
};