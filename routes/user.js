const express = require('express');
const Referrals = require('../models/referrals');
const bcrypt = require("bcrypt");
const saltRounds = 10;
const router = express.Router();
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();
const multer = require("multer");
const upload = multer();
const { User, UserDevice } = require('../models');
const UserCounter = require("../models/usercounters");
const Counter = require("../models/counter");
const { Op } = require("sequelize");
const CounterSale = require("../models/counterSale");
const OtpCode = require("../models/OtpCode");
const axios = require('axios');


router.put("/users/alter-table", async (req, res) => {
  try {
    await sequelize.query(`
      ALTER TABLE Users 
      MODIFY COLUMN role ENUM('user', 'admin', 'agent') NOT NULL DEFAULT 'user';
    `);

    await sequelize.query(`
      ALTER TABLE Users 
      ADD COLUMN note TEXT NULL;
    `);

    res.status(200).json({ message: "✅ تم تعديل جدول المستخدمين بنجاح: إضافة الحقل note وتحديث role." });
  } catch (error) {
    console.error("❌ خطأ أثناء تعديل الجدول:", error);
    res.status(500).json({ error: "حدث خطأ أثناء تعديل هيكل جدول المستخدمين." });
  }
});
router.put("/users/set-default-note", async (req, res) => {
  try {
    const defaultNote = "لا توجد ملاحظة";

    const [affectedCount] = await User.update(
      { note: defaultNote },
      {
        where: {
          note: null
        }
      }
    );

    res.status(200).json({
      message: `✅ تم تحديث ${affectedCount} مستخدم بوضع ملاحظة افتراضية.`,
    });

  } catch (error) {
    console.error("❌ خطأ أثناء تحديث الملاحظات:", error);
    res.status(500).json({ error: "حدث خطأ أثناء تحديث الملاحظات." });
  }
});


router.post("/normalize-phones", async (req, res) => {
  try {
    const users = await User.findAll();

    let updatedCount = 0;

    for (const user of users) {
      if (user.phone.startsWith("0")) {
        const newPhone = "964" + user.phone.slice(1);
        console.log(`تحويل رقم: ${user.phone} → ${newPhone}`);
        user.phone = newPhone;
        await user.save();
        updatedCount++;
      }
    }

    res.status(200).json({
      message: `تم تحديث ${updatedCount} رقم بنجاح.`,
    });
    
  } catch (err) {
    console.error("❌ خطأ أثناء تحديث الأرقام:", err);
    res.status(500).json({
      error: "حدث خطأ أثناء تعديل الأرقام.",
    });
  }
});

function generateOtp() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

function normalizePhone(phone) {
  if (phone.startsWith('0')) {
    return '964' + phone.slice(1);
  }
  return phone;
}

router.post("/send-otp", upload.none(), async (req, res) => {
  const { phone } = req.body;

  try {

    const normalizedPhone = normalizePhone(phone);
    const user = await User.findOne({ where: { phone: normalizedPhone } });
    if (!user) {
      return res.status(404).json({ error: "المستخدم غير موجود" });
    }

    const code = generateOtp();
    const expiryDate = new Date(Date.now() + 1 * 60 * 1000);

    await OtpCode.create({ phone: normalizedPhone, code, expiryDate });

    const messagePayload = {
      messaging_product: "whatsapp",
      to: normalizedPhone,
      type: "template",
      template: {
        name: "otp",
        language: { code: "ar" },
        components: [
          {
            type: "body",
            parameters: [{ type: "text", text: code.toString() }],
          },
          {
            type: "button",
            sub_type: "url",
            index: "0",
            parameters: [{ type: "text", text: code.toString() }],
          },
        ],
      },
    };

    await axios.post(
      `https://graph.facebook.com/v19.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      messagePayload,
      {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.status(200).json({ message: "تم إرسال كود التحقق بنجاح" });

  } catch (error) {
    if (error.response) {
      console.error("❌ خطأ في إرسال كود التحقق:", error.response.data);
    } else {
      console.error("❌ خطأ في إرسال كود التحقق:", error.message);
    }
    res.status(500).json({ error: "حدث خطأ أثناء إرسال كود التحقق" });
  }
});

router.post("/verify-otp", upload.none(), async (req, res) => {
  let { phone, code } = req.body;

  try {
    const normalizedPhone = normalizePhone(phone);

    const otp = await OtpCode.findOne({
      where: {
        phone: normalizedPhone,
        code,
        isUsed: false,
        expiryDate: { [Op.gt]: new Date() },
      },
    });

    if (!otp) {
      return res.status(400).json({ error: "كود تحقق غير صالح أو منتهي" });
    }

    otp.isUsed = true;
    await otp.save();

    user.isVerified = true;
    await user.save();

    console.log("✅ User verified:", normalizedPhone);
    res.status(200).json({ message: "تم تفعيل الحساب بنجاح" });

  } catch (err) {
    console.error("❌ خطأ أثناء التحقق من الكود:", err);
    res.status(500).json({ error: "حدث خطأ داخلي في الخادم" });
  }
});

router.post("/users", upload.none() ,async (req, res) => {
    const { name, email, location ,password , role = 'user'} = req.body;
    let phone = req.body.phone;
    try {
        const existingUser = await User.findOne({ where: { email } });

        if (phone.startsWith("0")) {
          phone = "964" + phone.slice(1);
        }

        if (existingUser) {
            return res.status(400).json({ error: "email already in use" });
        }
    
        const existingPhone = await User.findOne({ where: { phone } });
        if (existingPhone) {
          return res.status(400).json({ error: "phone already in use" });
        }

        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const user = await User.create({ name, email, phone, location, password: hashedPassword, role });

        res.status(201).json({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        location: user.location,
        role: role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
     });
    } catch (err) {
        console.error("❌ Error creating user:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '350d' } 
    );
};

const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ error: "Access denied, no token provided" });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: "Invalid token" });
        req.user = user;
        next();
    });
};

router.delete("/users/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findByPk(id, {
      include: { model: UserDevice, as: "devices" },
    });

    if (!user) {
      return res.status(404).json({ error: "المستخدم غير موجود" });
    }

    await user.destroy(); 

    res.status(200).json({ message: "تم حذف المستخدم وأجهزته بنجاح" });
  } catch (err) {
    console.error("❌ خطأ أثناء الحذف:", err);
    res.status(500).json({ error: "حدث خطأ أثناء عملية الحذف" });
  }
});

router.put("/users/:id/gems", upload.none() , async (req, res) => {
  const { id } = req.params;
  const { gems } = req.body;

  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.Jewel = gems;

    await user.save();

    res.status(200).json({ message: "Jewel updated successfully", user });
  } catch (err) {
    console.error("Error updating gems:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/verify-token", (req, res) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.json({ valid: false, message: "Token is missing" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.json({ valid: false, message: "Invalid token" });
    }
    return res.json({ valid: true, data: decoded });
  });
});

router.post("/users", upload.none() ,async (req, res) => {
    const { name, email, phone , location ,password , role = 'user'} = req.body;
    
    try {
        const existingUser = await User.findOne({ where: { email } });


        if (existingUser) {
            return res.status(400).json({ error: "email already in use" });
        }

        const normalizedPhone = normalizePhone(phone);
        const existingPhoneUser = await User.findOne({ where: { phone: normalizedPhone } });
        if (existingPhoneUser) {
          return res.status(400).json({ error: "رقم الهاتف مستخدم بالفعل" });
        }
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const user = await User.create({ name, email, phone, location, password: hashedPassword, role });

        res.status(201).json({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: normalizedPhone,
        location: user.location,
        role: role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
     });
    } catch (err) {
        console.error("❌ Error creating user:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.post("/login", upload.none(), async (req, res) => {
  const { email , password, refId } = req.body;

  try {

    /*if (!phone) {
      return res.status(400).json({ error: "يرجى إدخال رقم هاتف صحيح" });
    }
    const normalizedPhone = normalizePhone(phone);

    const user = await User.findOne({ where: { phone: normalizedPhone } });
    if (!user) {
      return res.status(400).json({ error: "رقم الهاتف غير صحيح" });
    }*/

    if (!email) {
      return res.status(400).json({ error: "يرجى إدخال البريد الإلكتروني" });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: "البريد الإلكتروني غير صحيح" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: "كلمة المرور غير صحيحة" });
    }

    if (refId) {
      const friend = await User.findOne({ where: { id: refId } });
      if (!friend) {
        return res.status(400).json({ error: "كود الإحالة غير صحيح" });
      }

      const alreadyReferred = await Referrals.findOne({
        where: { referredUserId: user.id }
      });

      if (!alreadyReferred) {
        friend.sawa += 5;
        await friend.save();

        await Referrals.create({
          referrerId: friend.id,
          referredUserId: user.id
        });
      }
    }

    const token = generateToken(user);

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isVerified: user.isVerified,
        sawa: user.sawa,
        role: user.role,
        location: user.location,
        Jewel: user.Jewel,
        dolar: user.dolar
      },
      token
    });

  } catch (err) {
    console.error("❌ خطأ أثناء تسجيل الدخول:", err);
    res.status(500).json({ error: "خطأ داخلي في الخادم" });
  }
});

router.get("/allusers", async (req, res) => {
    try {
        const users = await User.findAll(); 
        res.status(200).json(users); 
    } catch (err) {
        console.error("❌ Error fetching users:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.get("/users", async (req, res) => {
  try {
    const users = await User.findAll({
      where: {
        role: {
          [Op.ne]: "admin"
        }
      }
    });
    res.status(200).json(users);
  } catch (err) {
    console.error("❌ Error fetching users:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [
        {
          model: UserCounter,
          include: [
            {
              model: Counter,
              paranoid: false,
            },
            {
              model: CounterSale,
              where: { isSold: false },
              required: false, // حتى لو ما عنده عرض بيع ما يطرد المستخدم
            },
          ],
        },
      ],
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const userData = user.toJSON();

    // حساب الأيام المتبقية لكل عداد
    userData.UserCounters = userData.UserCounters.map((counter) => {
      if (counter.endDate) {
        const now = new Date();
        const endDate = new Date(counter.endDate);
        const diffInMs = endDate - now;
        const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));

        return {
          ...counter,
          remainingDays: diffInDays > 0 ? diffInDays : 0,
        };
      }
      return { ...counter, remainingDays: null };
    });

    // تحويل الساوا للدولار
    userData.dolar = userData.sawa * 10;

    let totalPoints = 0;
    let totalGems = 0;

    userData.UserCounters.forEach((uc) => {
      if (uc.Counter) {
        if (uc.Counter.type === "points") {
          totalPoints += uc.Counter.points;
        } else if (uc.Counter.type === "gems") {
          totalGems += uc.Counter.points;
        }
      }
    });

    userData.totalPoints = totalPoints;
    userData.totalGems = totalGems;

    res.status(200).json(userData);
  } catch (err) {
    console.error("❌ Error fetching user profile:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});



router.get("/users/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findByPk(id, {
      include: [
        {
          model: UserCounter,
           include: [{
            model: Counter,
            paranoid: false, 
          }],
        }
      ]
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const userData = user.toJSON();

    // حساب عدد الأيام المتبقية للعدادات
    userData.UserCounters = userData.UserCounters.map(counter => {
      if (counter.endDate) {
        const now = new Date();
        const endDate = new Date(counter.endDate);
        const diffInMs = endDate - now;
        const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));

        return {
          ...counter,
          remainingDays: diffInDays > 0 ? diffInDays : 0
        };
      } else {
        return {
          ...counter,
          remainingDays: null
        };
      }
    });

    // حساب الدولار بناءً على الساوا
    userData.dolar = (userData.sawa * 0.010).toFixed(2);

    // حساب مجموع points و gems من UserCounters
    let totalPoints = 0;
    let totalGems = 0;

    userData.UserCounters.forEach(uc => {
      if (uc.Counter) {
        if (uc.Counter.type === "points") {
          totalPoints += uc.Counter.points;
        } else if (uc.Counter.type === "gems") {
          totalGems += uc.Counter.points;
        }
      }
    });

    // أضف المجموع إلى الرد
    userData.totalPoints = totalPoints;
    userData.totalGems = totalGems;

    res.status(200).json(userData);

  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});



module.exports = router;