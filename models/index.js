const User = require("./user");
const Counter = require("./counter");
const UserCounter = require("./usercounters");
const NotificationLog = require("./notification_log");

// علاقات
User.hasMany(UserCounter, { foreignKey: "userId" });
Counter.hasMany(UserCounter, { foreignKey: "counterId" });

module.exports = {
  User,
  Counter,
  UserCounter,
};
