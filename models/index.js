const User = require("./user");
const Counter = require("./counter");
const UserCounter = require("./usercounters");
const DailyAction = require("./DailyAction");
const TransferHistory = require("./transferHistory");


User.hasMany(UserCounter, { foreignKey: 'userId' });
UserCounter.belongsTo(User, { foreignKey: 'userId' });

Counter.hasMany(UserCounter, { foreignKey: 'counterId' });
UserCounter.belongsTo(Counter, { foreignKey: 'counterId' });

User.hasOne(DailyAction, { foreignKey: "user_id" });
DailyAction.belongsTo(User, { foreignKey: "user_id" });

User.hasMany(TransferHistory, { foreignKey: 'senderId' });
User.hasMany(TransferHistory, { foreignKey: 'receiverId' });
TransferHistory.belongsTo(User, { as: 'Sender', foreignKey: 'senderId' });
TransferHistory.belongsTo(User, { as: 'Receiver', foreignKey: 'receiverId' });

module.exports = {
  User,
  DailyAction,
  Counter,
  UserCounter,
  TransferHistory,
};