const User = require("./user");
const Counter = require("./counter");
const UserCounter = require("./usercounters");
const DailyAction = require("./DailyAction");


User.hasMany(UserCounter, { foreignKey: 'userId' });
UserCounter.belongsTo(User, { foreignKey: 'userId' });

Counter.hasMany(UserCounter, { foreignKey: 'counterId' });
UserCounter.belongsTo(Counter, { foreignKey: 'counterId' });

User.hasOne(DailyAction, { foreignKey: "user_id" });
DailyAction.belongsTo(User, { foreignKey: "user_id" });

module.exports = {
  User,
  DailyAction,
  Counter,
  UserCounter,
};