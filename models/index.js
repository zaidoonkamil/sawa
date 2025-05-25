const User = require("./user");
const Counter = require("./counter");
const UserCounter = require("./usercounters");

// علاقات
User.hasMany(UserCounter, { foreignKey: "userId" });
Counter.hasMany(UserCounter, { foreignKey: "counterId" });

module.exports = {
  User,
  Counter,
  UserCounter,
};
