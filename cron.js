const cron = require('node-cron');
const { UserCounter, User, Counter } = require('./models');
///
cron.schedule("0 0 * * *", async () => {
  console.log("⏰ Running daily rewards distribution...");

  try {
    const now = new Date();

    const userCounters = await UserCounter.findAll({
      where: {
        endDate: {
          [require("sequelize").Op.gt]: now
        }
      },
      include: [
        { model: User },
        { model: Counter }
      ]
    });

    for (const uc of userCounters) {
      const user = uc.User;
      const counter = uc.Counter;

      if (user && counter) {
        user.sawa += counter.dailyReward;
        await user.save();
        console.log(`✅ Added ${counter.dailyReward} sawa to user ${user.id}`);
      }
    }

    console.log("🚀 Cron job starting at", new Date().toLocaleString());
    console.log("✅ Rewards distributed successfully");
  } catch (err) {
    console.error("❌ Error distributing rewards:", err);
  }
});
