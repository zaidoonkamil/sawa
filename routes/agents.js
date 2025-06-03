const express = require("express");
const router = express.Router();
const Agent = require("../models/agent");
const multer = require("multer");
const upload = multer();

router.post("/agents", upload.none(), async (req, res) => {
  const { name, phone, location, description } = req.body;

  if (!name || !phone || !location || !description) {
    return res.status(400).json({ error: "جميع الحقول مطلوبة (الاسم، الهاتف، الموقع )" });
  }

  try {
    const existingAgent = await Agent.findOne({ where: { phone } });
    if (existingAgent) {
      return res.status(400).json({ error: "رقم الهاتف مستخدم من قبل وكيل آخر" });
    }

    const agent = await Agent.create({ name, phone, location, description });
    res.status(201).json({
      message: "تم إضافة الوكيل بنجاح",
      agent
    });
  } catch (err) {
    console.error("❌ Error creating agent:", err);
    res.status(500).json({ error: "حدث خطأ في السيرفر" });
  }
});


router.get("/agents", async (req, res) => {
  try {
    const agents = await Agent.findAll();
    res.status(200).json(agents);
  } catch (err) {
    console.error("❌ Error fetching agents:", err);
    res.status(500).json({ error: "حدث خطأ في السيرفر" });
  }
});

module.exports = router;
