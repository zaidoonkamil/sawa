const User = require("./user");
const Counter = require("./counter");
const UserCounter = require("./usercounters");
const DailyAction = require("./DailyAction");
const TransferHistory = require("./transferHistory");
const CounterSale = require("./counterSale");

User.hasMany(UserCounter, { foreignKey: 'userId' });
UserCounter.belongsTo(User, { foreignKey: 'userId' });

Counter.hasMany(UserCounter, { foreignKey: 'counterId' });
UserCounter.belongsTo(Counter, { foreignKey: 'counterId' });

User.hasOne(DailyAction, { foreignKey: "user_id" });
DailyAction.belongsTo(User, { foreignKey: "user_id" });

User.hasMany(TransferHistory, { as: 'SentTransfers', foreignKey: 'senderId' });
User.hasMany(TransferHistory, { as: 'ReceivedTransfers', foreignKey: 'receiverId' });
TransferHistory.belongsTo(User, { as: 'Sender', foreignKey: 'senderId' });
TransferHistory.belongsTo(User, { as: 'Receiver', foreignKey: 'receiverId' });

UserCounter.hasMany(CounterSale, { foreignKey: 'userCounterId' });
CounterSale.belongsTo(UserCounter, { foreignKey: 'userCounterId' });

User.hasMany(CounterSale, { foreignKey: 'userId' });
CounterSale.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
  User,
  DailyAction,
  Counter,
  UserCounter,
  TransferHistory,
  CounterSale,
};
