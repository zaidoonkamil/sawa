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
    lastCollectedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    timestamps: true,
});

User.hasMany(UserCounter, { foreignKey: "userId" });
Counter.hasMany(UserCounter, { foreignKey: "counterId" });

module.exports = UserCounter;
