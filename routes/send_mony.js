const express = require('express');
const router = express.Router();
const multer = require("multer");
const upload = multer();
const User = require('../models/user');

router.post("/sendmony", upload.none(), async (req, res) => {
    const { senderId, receiverId, amount } = req.body;

    try {
        const transferAmount = parseFloat(amount);

        if (isNaN(transferAmount) || transferAmount <= 0) {
            return res.status(400).json({ error: "Invalid transfer amount" });
        }

        // جلب المرسل
        const sender = await User.findOne({
            where: { id: senderId }
        });

        if (!sender) {
            return res.status(404).json({ error: "Sender not found" });
        }

        // تحقق من رصيد المرسل
        if (sender.sawa < transferAmount) {
            return res.status(400).json({ error: "Insufficient balance" });
        }

        // جلب المستقبل
        const receiver = await User.findOne({
            where: { id: receiverId }
        });

        if (!receiver) {
            return res.status(404).json({ error: "Receiver not found" });
        }

        // حساب العمولة
        const fee = transferAmount * 0.10;
        const netAmount = transferAmount - fee;

        // تحديث رصيد الطرفين
        sender.sawa -= transferAmount;
        receiver.sawa += netAmount;

        await sender.save();
        await receiver.save();

        res.status(200).json({
            message: `Successfully transferred ${netAmount} sawa from ${sender.name} to ${receiver.name}. Fee: ${fee} sawa`,
            sender: {
                id: sender.id,
                name: sender.name,
                balance: sender.sawa
            },
            receiver: {
                id: receiver.id,
                name: receiver.name,
                balance: receiver.sawa
            }
        });

    } catch (err) {
        console.error("❌ Error during transfer:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.post("/deposit-jewel", upload.none(), async (req, res) => {
    const { userId, amount } = req.body;

    try {
        const depositAmount = parseInt(amount);

        if (isNaN(depositAmount) || depositAmount <= 0) {
            return res.status(400).json({ error: "Invalid deposit amount" });
        }

        // جلب المستخدم
        const user = await User.findOne({
            where:  { id: userId }
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        user.Jewel += depositAmount;

        await user.save();

        res.status(200).json({
            message: `Successfully added ${depositAmount} jewels to ${user.name}`,
            user: {
                id: user.id,
                name: user.name,
                newBalance: user.Jewel
            }
        });

    } catch (err) {
        console.error("❌ Error during jewel deposit:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.post("/deposit-sawa", upload.none(), async (req, res) => {
    const { userId, amount } = req.body;

    try {
        const depositAmount = parseFloat(amount);

        if (isNaN(depositAmount) || depositAmount <= 0) {
            return res.status(400).json({ error: "Invalid deposit amount" });
        }

        // جلب المستخدم
        const user = await User.findOne({
            where: { id: userId }
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // إضافة النقاط
        user.sawa += depositAmount;

        await user.save();

        res.status(200).json({
            message: `Successfully added ${depositAmount} sawa to ${user.name}`,
            user: {
                id: user.id,
                name: user.name,
                newBalance: user.sawa
            }
        });

    } catch (err) {
        console.error("❌ Error during sawa deposit:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.post("/deposit-dolar", upload.none(), async (req, res) => {
    const { userId, userEmail, amount } = req.body;

    try {
        const depositAmount = parseFloat(amount);

        if (isNaN(depositAmount) || depositAmount <= 0) {
            return res.status(400).json({ error: "Invalid deposit amount" });
        }

        // جلب المستخدم
        const user = await User.findOne({
            where: userId ? { id: userId } : { email: userEmail }
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // إضافة الدولارات
        user.dolar += depositAmount;

        await user.save();

        res.status(200).json({
            message: `Successfully added ${depositAmount} dolar to ${user.name}`,
            user: {
                id: user.id,
                name: user.name,
                newBalance: user.dolar
            }
        });

    } catch (err) {
        console.error("❌ Error during dolar deposit:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.post("/buy-counter", upload.none(), async (req, res) => {
    const { userId, counterId } = req.body;

    try {
        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ error: "User not found" });

        const counter = await Counter.findByPk(counterId);
        if (!counter) return res.status(404).json({ error: "Counter not found" });

        if (user.sawa < counter.price) {
            return res.status(400).json({ error: "Insufficient sawa balance" });
        }

        // خصم السعر من sawa
        user.sawa -= counter.price;
        await user.save();

        // حفظ العداد للمستخدم
        await UserCounter.create({
            userId: user.id,
            counterId: counter.id
        });

        res.status(200).json({
            message: `${counter.name} purchased successfully!`,
            user: {
                id: user.id,
                newSawaBalance: user.sawa
            }
        });

    } catch (err) {
        console.error("❌ Error buying counter:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


module.exports = router;