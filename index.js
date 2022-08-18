const TelegramApi = require('node-telegram-bot-api');
const {contactMeOptions} = require('./options');
const mongoose = require('mongoose');
const UserModel = require('./models');
require('dotenv').config();


const token = process.env.TG_TOKEN;

const bot = new TelegramApi(token, {polling: true});


const start = async () => {

    try {
        await new mongoose.connect(process.env.DB_URL); /* Обращаемся к MongoDB */
    } catch (e) {
        console.log('Подключение к бд сломалось', e);
    }

    bot.setMyCommands([
        {command: '/start', description: 'Приветствие'},

        {command: '/info', description: 'Статистика о здоровье'},

        {command: '/settings', description: 'Настройки'},
    ]);

    bot.on('message', async msg => {

            const text = msg.text;
            const chatId = msg.chat.id;

            try {
                if (text === '/start') {
                    const user = await UserModel.findOne({chatId});

                    if (!user) {
                        await UserModel.create({chatId});

                        setInterval(async () => {

                            let user = await UserModel.findOne({chatId});

                            user.withoutAlcohol += 1;
                            user.withoutCigarette += 1;

                            user = await user.save();

                            const {
                                withoutAlcohol,
                                withoutCigarette,
                                moneyAlcohol,
                                moneyCigarette,
                                cigaretteOneDay,
                                beerOneDay,
                                stiffOneDay
                            } = user;

                            return bot.sendMessage(chatId, `
Не пью: <b>${withoutAlcohol}</b> дн  🔞
Не курю: <b>${withoutCigarette}</b> дн  🚭

Сэкономил денег: <b>${(withoutAlcohol * moneyAlcohol + withoutCigarette * moneyCigarette).toFixed(1)}</b> $  💵

Не выкурил сигарет: <b>${(withoutCigarette * cigaretteOneDay).toFixed()}</b> шт  🚬

Не выпил пива: <b>${(withoutAlcohol * beerOneDay).toFixed(1)}</b> л  🍺

Не выпил виски: <b>${(withoutAlcohol * stiffOneDay).toFixed(1)}</b> л  🍸
`, {parse_mode: 'HTML'})
                                .catch(error => {
                                    console.log(error.response.body);
                                });
                        }, 900000)
                    }


                    await bot.sendMessage(chatId, `<b>${msg.from.first_name}</b>, добро пожаловать в мой телеграм бот!`, {parse_mode: 'HTML'});
                    return bot.sendMessage(chatId, `Tут вы найдете информацию о количестве дней
без алкоголя и сигарет!  💪 ☘ 💜️ 🥊 🚀`, {parse_mode: 'HTML'});
                }

                if (text === '/info') {
                    const chatId = msg.chat.id;

                    const {
                        withoutAlcohol,
                        withoutCigarette,
                        moneyAlcohol,
                        moneyCigarette,
                        cigaretteOneDay,
                        beerOneDay,
                        stiffOneDay
                    } = await UserModel.findOne({chatId});

                    return bot.sendMessage(chatId, `
Не пью: <b>${withoutAlcohol}</b> дн  🔞
Не курю: <b>${withoutCigarette}</b> дн  🚭

Сэкономил денег: <b>${(withoutAlcohol * moneyAlcohol + withoutCigarette * moneyCigarette).toFixed(1)}</b> $  💵

Не выкурил сигарет: <b>${(withoutCigarette * cigaretteOneDay).toFixed()}</b> шт  🚬

Не выпил пива: <b>${(withoutAlcohol * beerOneDay).toFixed(1)}</b> л  🍺

Не выпил виски: <b>${(withoutAlcohol * stiffOneDay).toFixed(1)}</b> л  🍸
`, {parse_mode: 'HTML'})
                        .catch(error => {
                            console.log(error.response.body);
                        })
                }

                if (text === '/contacts') {
                    return bot.sendMessage(chatId, 'Вы можете связаться со мной через:', contactMeOptions);
                }

            } catch (e) {
                return bot.sendMessage(chatId, 'Произошла какая-то ошибочка!)');
            }
        }
    );


    bot.onText(/не пью: (.+)/, async (msg, [source, match]) => {
        const chatId = msg.chat.id;

        const user = await UserModel.findOne({chatId});
        user.withoutAlcohol = match;
        await user.save();

        return bot.sendMessage(chatId, 'Настройка сохранена!');
    });

    bot.onText(/не курю: (.+)/, async (msg, [source, match]) => {
        const chatId = msg.chat.id;

        const user = await UserModel.findOne({chatId});
        user.withoutCigarette = match;
        await user.save();

        return bot.sendMessage(chatId, 'Настройка сохранена!');
    });

    bot.onText(/на алкоголь: (.+)/, async (msg, [source, match]) => {
        const chatId = msg.chat.id;

        const user = await UserModel.findOne({chatId});
        user.moneyAlcohol = match;
        await user.save();

        return bot.sendMessage(chatId, 'Настройка сохранена!');
    });

    bot.onText(/на сигареты: (.+)/, async (msg, [source, match]) => {
        const chatId = msg.chat.id;

        const user = await UserModel.findOne({chatId});
        user.moneyCigarette = match;
        await user.save();

        return bot.sendMessage(chatId, 'Настройка сохранена!');
    });

    bot.onText(/сигарет в день: (.+)/, async (msg, [source, match]) => {
        const chatId = msg.chat.id;

        const user = await UserModel.findOne({chatId});
        user.cigaretteOneDay = match;
        await user.save();

        return bot.sendMessage(chatId, 'Настройка сохранена!');
    });

    bot.onText(/пива в день: (.+)/, async (msg, [source, match]) => {
        const chatId = msg.chat.id;

        const user = await UserModel.findOne({chatId});
        user.beerOneDay = match;
        await user.save();

        return bot.sendMessage(chatId, 'Настройка сохранена!');
    });

    bot.onText(/крепких в день: (.+)/, async (msg, [source, match]) => {
        const chatId = msg.chat.id;

        const user = await UserModel.findOne({chatId});
        user.stiffOneDay = match;
        await user.save();

        return bot.sendMessage(chatId, 'Настройка сохранена!');
    });
};


start();


