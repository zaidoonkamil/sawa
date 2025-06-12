require("./models/agent");
const express = require("express");
const sequelize = require("./config/db");
const usersRouter = require("./routes/user");
const timeOfDayRouter = require("./routes/timeofday.js");
const sendmonyRouter = require("./routes/send_mony.js");
const counterRouter = require("./routes/counter.js");
const notifications = require("./routes/notifications.js");
const agentsRouter = require("./routes/agents.js");
require("./cron");

const socketIo = require("socket.io");
const timerRoute = require("./routes/timerRoute");
const app = express();

app.use(express.json());
app.use("/uploads", express.static("./uploads"));


const server = require("http").createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
  },
});
app.use("/timer", timerRoute(io));

io.on("connection", (socket) => {
  console.log("عميل جديد متصل عبر Socket.io");

  socket.on("disconnect", () => {
    console.log("تم قطع الاتصال");
  });
});

sequelize
  .sync({ force: false })
  .then(() => console.log("✅ Database & User table synced!"))
  .catch((err) => console.error("❌ Error syncing database:", err));

app.use("/", usersRouter);
app.use("/", sendmonyRouter);
app.use("/timeofday", timeOfDayRouter);
app.use("/", counterRouter);
app.use("/", notifications);
app.use("/", agentsRouter);

server.listen(3000, () => {
  console.log("🚀 Server running on http://localhost:3000");
});
