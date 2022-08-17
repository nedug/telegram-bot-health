const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
    chatId: { type: Number, required: true, unique: true },
    withoutAlcohol: { type: Number, default: 0 },
    withoutCigarette: { type: Number, default: 0 },
    moneyAlcohol: { type: Number, default: 0 },
    moneyCigarette: { type: Number, default: 0 },
    cigaretteOneDay: { type: Number, default: 0 },
    beerOneDay: { type: Number, default: 0 },
    stiffOneDay: { type: Number, default: 0 },
});

module.exports = mongoose.model('User-TG-BOT-Health', userSchema);