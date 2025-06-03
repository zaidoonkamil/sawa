const User = require("./user");
const Counter = require("./counter");
const UserCounter = require("./usercounters");
const NotificationLog = require("./notification_log");


User.hasMany(UserCounter, { foreignKey: "userId" });
Counter.hasMany(UserCounter, { foreignKey: "counterId" });

User.hasMany(UserCounter, { foreignKey: 'userId' });
UserCounter.belongsTo(User, { foreignKey: 'userId' });

Counter.hasMany(UserCounter, { foreignKey: 'counterId' });
UserCounter.belongsTo(Counter, { foreignKey: 'counterId' });


module.exports = {
  User,
  Counter,
  UserCounter,
};