const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../db/config.js');

const usuario = sequelize.define("usuario", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true  
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    documento: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    cargo: {
        type: DataTypes.STRING,
        allowNull: false
    },
    correo: {
        type: DataTypes.STRING,
        allowNull: false
    },
    telefono: {
        type: DataTypes.STRING,   
        allowNull: false
    },
    contraseña: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    comisaria_rol: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    rolId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'IdRol'
    },
    estado: {
        type: DataTypes.ENUM('activo', 'inactivo'),
        defaultValue: 'activo',
        allowNull: false
    }
}, {
    tableName: "usuarios",
    timestamps: false
});

usuario.prototype.validarContraseña = async function(contraseña) {
    return await bcrypt.compare(contraseña, this.contraseña);
};

module.exports = usuario;