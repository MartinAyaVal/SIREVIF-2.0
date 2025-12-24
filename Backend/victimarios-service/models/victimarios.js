const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Victimarios = sequelize.define("Victimarios", {
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
      allowNull: false
    },
    otroTipoDocumento: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    numeroDocumento: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true
    },
    documentoExpedido: {
      type: DataTypes.STRING(100),
      allowNull: false
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
      allowNull: false
    },
    direccion: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    barrio: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    ocupacion: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    estudios: {
      type: DataTypes.STRING(100),
      allowNull: false
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
    antecedentes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    comisariaId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'comisaria_id'
    }
  }, {
    tableName: "victimarios",
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: 'fecha_actualizacion'
  });

  return Victimarios;
};