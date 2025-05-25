const express = require("express");
const sequelize = require("./config/db");
const usersRouter = require("./routes/user");
const timeOfDayRouter = require("./routes/timeofday.js");
const sendmonyRouter = require("./routes/send_mony.js");
const counterRouter = require("./routes/counter.js");
require("./cron");


const app = express();
app.use(express.json());
app.use("/uploads", express.static("./" + "uploads"));

sequelize.sync({
    alter: true 
//    force: false
 })
    .then(() => console.log("✅ Database & User table synced!"))
    .catch(err => console.error("❌ Error syncing database:", err));


app.use("/", usersRouter);
app.use("/sendmoney", sendmonyRouter);
app.use("/timeofday", timeOfDayRouter);
app.use("/counter", counterRouter);


app.listen( 3000 , () => {
    console.log(`🚀 Server running on http://localhost:3000`);
});
