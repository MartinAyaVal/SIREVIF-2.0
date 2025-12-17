const { DataTypes } = require('sequelize');
const sequelize = require("../../tipoVictima-service/db/config");

const tipoVictimas = sequelize.define("tipos", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    tipo: {
        type: DataTypes.STRING,
        allowNull: false
    },
}, {
    tableName: "tipoVictimas",
    timestamps: false
});

module.exports = tipoVictimas;