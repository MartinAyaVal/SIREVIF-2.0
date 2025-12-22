const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  const Usuario = sequelize.define("Usuario", {
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
    documento: {
      type: DataTypes.INTEGER(10),
      allowNull: false,
      unique: true,
      field: 'numero_documento'
    },
    cargo: {
      type: DataTypes.STRING(45),
      allowNull: false
    },
    correo: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    telefono: {
      type: DataTypes.STRING(20),   
      allowNull: false
    },
    contraseña: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'contrasena'
    },
    comisaria_rol: {
      type: DataTypes.STRING(45),
      allowNull: false,
      field: 'comisaria_rol'
    },
    rol_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'rol_id'
    },
    comisaria_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'comisaria_id'
    },
    estado: {
      type: DataTypes.ENUM('activo', 'inactivo'),
      defaultValue: 'activo',
      allowNull: false
    }
  }, {
    tableName: "usuarios",
    timestamps: false,
    hooks: {
      beforeCreate: async (usuario) => {
        if (usuario.contraseña) {
          const salt = await bcrypt.genSalt(10);
          usuario.contraseña = await bcrypt.hash(usuario.contraseña, salt);
        }
      },
      beforeUpdate: async (usuario) => {
        if (usuario.changed('contraseña')) {
          const salt = await bcrypt.genSalt(10);
          usuario.contraseña = await bcrypt.hash(usuario.contraseña, salt);
        }
      }
    }
  });

  Usuario.prototype.validarContraseña = async function(contraseña) {
    return await bcrypt.compare(contraseña, this.contraseña);
  };

  return Usuario;
};