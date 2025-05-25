const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Referral = sequelize.define("Referral", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  referrerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  referredUserId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true, // عشان كل مستخدم يسجل مرة وحدة فقط
  },
}, {
  timestamps: true,
});

module.exports = Referral;
