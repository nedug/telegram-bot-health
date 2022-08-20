const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
    chatId: { type: Number, required: true, unique: true },
    withoutAlcohol: { type: Number, default: 35 },
    withoutCigarette: { type: Number, default: 35 },
    moneyAlcohol: { type: Number, default: 1.65 },
    moneyCigarette: { type: Number, default: 0.317 },
    cigaretteOneDay: { type: Number, default: 2.858 },
    beerOneDay: { type: Number, default: 0.285 },
    stiffOneDay: { type: Number, default: 0.0125 },
});

module.exports = mongoose.model('User-TG-BOT-Health', userSchema);