const TelegramApi = require('node-telegram-bot-api');
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


    let users = await UserModel.find();

    let timerId;


    users.forEach(u => {

        timerId = setInterval(async () => {

            let user = await UserModel.findOne({chatId: u.chatId});

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
                stiffOneDay,
            } = user;

            const formatter = new Intl.NumberFormat('ru', {
                style: 'unit',
                unit: 'day',
                unitDisplay: 'long',
            });

            return bot.sendMessage(chatId, `
Не пью: <b>${formatter.format(withoutAlcohol)}</b>  🔞
Не курю: <b>${formatter.format(withoutCigarette)}</b>  🚭

Сэкономил денег: <b>${( withoutAlcohol * moneyAlcohol + withoutCigarette * moneyCigarette ).toFixed(1)} $</b>  💵

Не выкурил сигарет: <b>${( withoutCigarette * cigaretteOneDay ).toFixed()} шт</b>  🚬

Не выпил пива: <b>${( withoutAlcohol * beerOneDay ).toFixed(1)} л</b>  🍺

Не выпил виски: <b>${( withoutAlcohol * stiffOneDay ).toFixed(1)} л</b>  🍸
`, {parse_mode: 'HTML'})
                .catch(error => {
                    console.log(error.response.body);
                });
        }, 86400000);
    })


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

                        clearInterval(timerId);

                        users = await UserModel.find();

                        users.forEach(u => {

                            timerId = setInterval(async () => {

                                let user = await UserModel.findOne({chatId: u.chatId});

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
                                    stiffOneDay,
                                } = user;

                                const formatter = new Intl.NumberFormat('ru', {
                                    style: 'unit',
                                    unit: 'day',
                                    unitDisplay: 'long',
                                });

                                return bot.sendMessage(chatId, `
Не пью: <b>${formatter.format(withoutAlcohol)}</b>  🔞
Не курю: <b>${formatter.format(withoutCigarette)}</b>  🚭

Сэкономил денег: <b>${( withoutAlcohol * moneyAlcohol + withoutCigarette * moneyCigarette ).toFixed(1)} $</b>  💵

Не выкурил сигарет: <b>${( withoutCigarette * cigaretteOneDay ).toFixed()} шт</b>  🚬

Не выпил пива: <b>${( withoutAlcohol * beerOneDay ).toFixed(1)} л</b>  🍺

Не выпил виски: <b>${( withoutAlcohol * stiffOneDay ).toFixed(1)} л</b>  🍸
`, {parse_mode: 'HTML'})
                                    .catch(error => {
                                        console.log(error.response.body);
                                    });
                            }, 86400000);
                        })

                        //                         setInterval(async () => {
                        //
                        //                             let user = await UserModel.findOne({chatId});
                        //
                        //                             user.withoutAlcohol += 1;
                        //                             user.withoutCigarette += 1;
                        //
                        //                             user = await user.save();
                        //
                        //                             const {
                        //                                 withoutAlcohol,
                        //                                 withoutCigarette,
                        //                                 moneyAlcohol,
                        //                                 moneyCigarette,
                        //                                 cigaretteOneDay,
                        //                                 beerOneDay,
                        //                                 stiffOneDay
                        //                             } = user;
                        //
                        //                             return bot.sendMessage(chatId, `
                        // Не пью: <b>${withoutAlcohol}</b> дн  🔞
                        // Не курю: <b>${withoutCigarette}</b> дн  🚭
                        //
                        // Сэкономил денег: <b>${(withoutAlcohol * moneyAlcohol + withoutCigarette * moneyCigarette).toFixed(1)}</b> $  💵
                        //
                        // Не выкурил сигарет: <b>${(withoutCigarette * cigaretteOneDay).toFixed()}</b> шт  🚬
                        //
                        // Не выпил пива: <b>${(withoutAlcohol * beerOneDay).toFixed(1)}</b> л  🍺
                        //
                        // Не выпил виски: <b>${(withoutAlcohol * stiffOneDay).toFixed(1)}</b> л  🍸
                        // `, {parse_mode: 'HTML'})
                        //                                 .catch(error => {
                        //                                     console.log(error.response.body);
                        //                                 });
                        //                         }, 900000)
                    }

                    await bot.sendMessage(chatId, `<b>${msg.from.first_name}</b>, добро пожаловать в мой телеграм бот!`, {parse_mode: 'HTML'});
                    return bot.sendMessage(chatId, `Tут вы найдете информацию о количестве дней
без алкоголя и сигарет!  💪 ☘ 💜️ 🚀`, {parse_mode: 'HTML'});
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
                        stiffOneDay,
                    } = await UserModel.findOne({chatId});

                    const formatter = new Intl.NumberFormat('ru', {
                        style: 'unit',
                        unit: 'day',
                        unitDisplay: 'long',
                    });

                    return bot.sendMessage(chatId, `
Не пью: <b>${formatter.format(withoutAlcohol)}</b>  🔞
Не курю: <b>${formatter.format(withoutCigarette)}</b>  🚭

Сэкономил денег: <b>${( withoutAlcohol * moneyAlcohol + withoutCigarette * moneyCigarette ).toFixed(1)} $</b>  💵

Не выкурил сигарет: <b>${( withoutCigarette * cigaretteOneDay ).toFixed()} шт</b>  🚬

Не выпил пива: <b>${( withoutAlcohol * beerOneDay ).toFixed(1)} л</b>  🍺

Не выпил виски: <b>${( withoutAlcohol * stiffOneDay ).toFixed(1)} л</b>  🍸
`, {parse_mode: 'HTML'})
                        .catch(error => {
                            console.log(error.response.body);
                        })
                }

                if (text === '/settings') {
                    // await bot.sendMessage(chatId, `Сохраните ваши данные!`);
                    await bot.sendMessage(chatId, `Настройки пользователя по умолчанию:
не пью: 0 дн
не курю: 10 дн
Сэкономил денег: 0 $
Не выкурил сигарет: 0 шт
Не выпил пива: 0 л
Не выпил виски: 0 л
`);
                    return bot.sendMessage(chatId, `Для сохранения ваших данных укажите боту:
не пью:                  
не курю:
на алкоголь:
на сигареты:
сигарет в день:
пива в день:
крепких в день:
                    `);
                }

            } catch (e) {
                return bot.sendMessage(chatId, 'Произошла какая-то ошибочка!)');
            }
        },
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


