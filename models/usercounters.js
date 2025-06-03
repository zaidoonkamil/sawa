const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User = require("./user");
const Counter = require("./counter");

const UserCounter = sequelize.define("UserCounter", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    counterId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    timestamps: true,
});


module.exports = UserCounter;
