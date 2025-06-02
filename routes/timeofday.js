const express = require('express');
const router = express.Router();

router.get("/", (req, res) => {
    const now = new Date();

    const hours = now.getHours();
    const minutes = now.getMinutes();
    const timeString = `${hours}:${minutes < 10 ? '0' + minutes : minutes}`;

    let period;

    if (hours >= 5 && hours < 17) {
        period = "morning";
    } else {
        period = "night";
    }

    res.json({
        time: timeString,
        period: period
    });
});

module.exports = router;