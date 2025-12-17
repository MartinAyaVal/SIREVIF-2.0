const { DataTypes } = require('sequelize');
const sequelize = require("../../roles-service/db/config");

const roles = sequelize.define("roles", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    rol: {
        type: DataTypes.STRING,
        allowNull: false
    },
}, {
    tableName: "roles",
    timestamps: false
});

module.exports = roles;