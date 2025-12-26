const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  const Usuario = sequelize.define("Usuario", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true  
    },
    nombre: {
      type: DataTypes.STRING(45),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "El nombre es requerido"
        }
      }
    },
    documento: {
      type: DataTypes.STRING(20),  // CAMBIADO A STRING para evitar problemas
      allowNull: false,
      unique: {
        msg: "Este documento ya está registrado"
      },
      validate: {
        notEmpty: {
          msg: "El documento es requerido"
        }
      }
    },
    cargo: {
      type: DataTypes.STRING(45),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "El cargo es requerido"
        }
      }
    },
    correo: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: {
        msg: "Este correo ya está registrado"
      },
      validate: {
        isEmail: {
          msg: "Debe ser un correo electrónico válido"
        },
        notEmpty: {
          msg: "El correo es requerido"
        }
      }
    },
    telefono: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "El teléfono es requerido"
        }
      }
    },
    contraseña: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "La contraseña es requerida"
        },
        len: {
          args: [6, 100],
          msg: "La contraseña debe tener al menos 6 caracteres"
        }
      }
    },
    comisaria_rol: {
      type: DataTypes.STRING(45),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "La comisaría/rol es requerida"
        }
      }
    },
    rolId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      field: 'rol_id',
      validate: {
        isInt: {
          msg: "El rol debe ser un número"
        }
      }
    },
    comisariaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'comisaria_id',
      validate: {
        isInt: {
          msg: "La comisaría debe ser un número"
        }
      }
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
          console.log(`🔐 Hasheando contraseña para nuevo usuario ${usuario.documento}...`);
          try {
            const salt = await bcrypt.genSalt(10);
            usuario.contraseña = await bcrypt.hash(usuario.contraseña, salt);
            console.log(`✅ Contraseña hasheada correctamente`);
          } catch (error) {
            console.error(`❌ Error al hashear contraseña:`, error);
            throw error;
          }
        }
      },
      beforeUpdate: async (usuario) => {
        if (usuario.changed('contraseña')) {
          console.log(`🔐 Actualizando contraseña para usuario ${usuario.documento}...`);
          try {
            const salt = await bcrypt.genSalt(10);
            usuario.contraseña = await bcrypt.hash(usuario.contraseña, salt);
            console.log(`✅ Contraseña actualizada correctamente`);
          } catch (error) {
            console.error(`❌ Error al actualizar contraseña:`, error);
            throw error;
          }
        }
      }
    }
  });

  // MÉTODO PARA VALIDAR CONTRASEÑA - MEJORADO
  Usuario.prototype.validarContraseña = async function(password) {
    try {
      console.log(`🔐 Validando contraseña para usuario ${this.documento}:`);
      console.log(`   Password recibida:`, password ? "***" + password.substring(password.length - 3) : "VACÍA");
      console.log(`   Hash almacenado:`, this.contraseña ? "***" + this.contraseña.substring(10) + "..." : "NO HAY HASH");
      
      if (!this.contraseña) {
        console.log(`❌ Usuario no tiene contraseña en BD`);
        return false;
      }
      
      if (!password) {
        console.log(`❌ No se recibió contraseña para validar`);
        return false;
      }
      
      const isValid = await bcrypt.compare(password, this.contraseña);
      console.log(`   Resultado bcrypt.compare:`, isValid ? "✅ VÁLIDA" : "❌ INVÁLIDA");
      return isValid;
      
    } catch (error) {
      console.error(`🔥 Error en validarContraseña:`, error.message);
      return false;
    }
  };

  // MÉTODO PARA CREAR CONTRASEÑA (útil para debug)
  Usuario.prototype.crearHashContraseña = async function(password) {
    try {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);
      console.log(`🔐 Hash creado para ${this.documento}:`, hash.substring(0, 20) + "...");
      return hash;
    } catch (error) {
      console.error(`❌ Error al crear hash:`, error);
      return null;
    }
  };

  return Usuario;
};