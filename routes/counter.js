const express = require('express');
const router = express.Router();
const multer = require("multer");
const upload = multer();
const Counter = require('../models/counter');
const User = require("../models/user");
const UserCounter = require("../models/usercounters");

router.post("/counters", upload.none(), async (req, res) => {
    const { type, points, price } = req.body;

    if (!["points", "gems"].includes(type)) {
        return res.status(400).json({ error: "type يجب أن يكون 'points' أو 'gems'" });
    }

    try {
        const counter = await Counter.create({ type, points, price });

        res.status(201).json({
            message: "Counter created successfully",
            counter
        });
    } catch (err) {
        console.error("❌ Error creating counter:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.get("/counters", async (req, res) => {
    try {
        const counters = await Counter.findAll();
        res.status(200).json(counters);
    } catch (err) {
        console.error("❌ Error fetching counters:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.post("/assign-counter", upload.none(), async (req, res) => {
  const { userId, counterId } = req.body;

  if (!userId || !counterId) {
    return res.status(400).json({ error: "يجب توفير userId, counterId" });
  }

  try {
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: "المستخدم غير موجود" });

    const counter = await Counter.findByPk(counterId);
    if (!counter) return res.status(404).json({ error: "العداد غير موجود" });

    const assign = await UserCounter.create({ userId, counterId });

    res.status(201).json({
      message: "تم إضافة العداد للمستخدم",
      assign
    });
  } catch (err) {
    console.error("❌ Error assigning counter:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


module.exports = router;