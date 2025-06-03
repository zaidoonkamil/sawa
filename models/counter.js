const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Counter = sequelize.define("Counter", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    points: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    type: {
        type: DataTypes.ENUM("points", "gems"),
        allowNull: false,
    },
    price: {
        type: DataTypes.DOUBLE,
        allowNull: false,
    }
}, {
    timestamps: true,
});

module.exports = Counter;
