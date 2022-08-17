const TelegramApi = require('node-telegram-bot-api');
const {gameOptions, againOptions, contactMeOptions, portfolioOptions} = require('./options');
const axios = require('axios');
const mongoose = require('mongoose');
const UserModel = require('./models');
require('dotenv').config();


const token = process.env.TG_TOKEN;

const bot = new TelegramApi(token, {polling: true});

const chats = {};


// const startGame = async (chatId) => {
//     await bot.sendMessage(chatId, `Сейчас я загадаю цифру от 0 до 9, а ты должен ее угадать!`);
//     const randomNumber = Math.floor(Math.random() * 10)
//     chats[chatId] = randomNumber;
//     await bot.sendMessage(chatId, 'Отгадывай', gameOptions);
// };


const start = async () => {

    try {
        await new mongoose.connect(process.env.DB_URL); /* Обращаемся к MongoDB */
    } catch (e) {
        console.log('Подключение к бд сломалось', e);
    }

    bot.setMyCommands([
        {command: '/start', description: 'Начальное приветствие'},

        {command: '/info', description: 'Инфа'},

        {command: '/settings', description: 'Инфа'},

        // {command: '/skills', description: 'Мои навыки разработки'},
    ]);

    bot.on('message', async msg => {

        // console.log(msg)

        const text = msg.text;
        const chatId = msg.chat.id;

        setInterval(async () => {
            const chatId = msg.chat.id;

            const user = await UserModel.findOne({chatId});

            let {withoutAlcohol, withoutCigarette, moneyAlcohol, moneyCigarette, cigaretteOneDay, beerOneDay, stiffOneDay} = user;

            user.withoutAlcohol += 1;
            user.withoutCigarette += 1;

            await user.save();

            return bot.sendMessage(chatId, `
Не пьете: ${withoutAlcohol} дн
Не курите: ${withoutCigarette} дн

Съэкономлено денег: ${withoutAlcohol * moneyAlcohol + withoutCigarette * moneyCigarette} $

Не выкурено сигарет: ${withoutCigarette * cigaretteOneDay} шт

Не выпито пива: ${withoutAlcohol * beerOneDay} л
Не выпито крепких: ${withoutAlcohol * stiffOneDay} л
`
            );
        }, 1800000)


        try {
            if (text === '/start') {

                const user = await UserModel.findOne({chatId});

                if (!user) {
                    await UserModel.create({chatId});
                }
                await bot.sendMessage(chatId, `<b>${msg.from.first_name}</b>, добро пожаловать в мой телеграм бот!`, {parse_mode: 'HTML'});
                return bot.sendMessage(chatId, `Tут вы найдете информацию о количестве дней без алкоголя!`, {parse_mode: 'HTML'});
            }

            if (text === '/info') {

                const chatId = msg.chat.id;

                const {withoutAlcohol, withoutCigarette, moneyAlcohol, moneyCigarette, cigaretteOneDay, beerOneDay, stiffOneDay} = await UserModel.findOne({chatId});

                return bot.sendMessage(chatId, `
Не пьете: ${withoutAlcohol} дн
Не курите: ${withoutCigarette} дн

Съэкономлено денег: ${withoutAlcohol * moneyAlcohol + withoutCigarette * moneyCigarette} $

Не выкурено сигарет: ${withoutCigarette * cigaretteOneDay} шт

Не выпито пива: ${withoutAlcohol * beerOneDay} л
Не выпито крепких: ${withoutAlcohol * stiffOneDay} л
`
                );
            }

            if (text === '/contacts') {
                return bot.sendMessage(chatId, 'Вы можете связаться со мной через:', contactMeOptions);
            }

            // return bot.sendMessage(chatId, 'Я тебя не понимаю, попробуй еще раз!)');

        } catch (e) {
            return bot.sendMessage(chatId, 'Произошла какая-то ошибочка!)');
        }
    })

//     bot.on('callback_query', async msg => {
//         const data = msg.data;
//         const chatId = msg.message.chat.id;
//
//         if (data === '/again') {
//             return startGame(chatId)
//         }
//         if (data === '/email') {
//             return bot.sendMessage(chatId, `ru55nedug@gmail.com`, {disable_web_page_preview: true,});
//         }
//         if (data === '/telegram') {
//             return bot.sendMessage(chatId, `https://t.me/polkaj`, {disable_web_page_preview: true,});
//         }
//         if (data === '/linkedin') {
//             return bot.sendMessage(chatId, `https://www.linkedin.com/in/alexander-rusin-789760226`, {disable_web_page_preview: true,});
//         }
//         if (data === '/github') {
//             return bot.sendMessage(chatId, `https://github.com/nedug`, {disable_web_page_preview: true,});
//         }
//         if (data === '/cv') {
//             return bot.sendMessage(chatId, `https://drive.google.com/file/d/1mD977Y3Er8u_9zgPc350KDWF6A1grWAA/view`,);
//         }
//         if (data === '/portfoliocv') {
//             return bot.sendMessage(chatId, `https://nedug.github.io/cv-alexander-r`,);
//         }
//
//         // const user = await UserModel.findOne({chatId});
//
//         if (data === chats[chatId]) {
//             user.right += 1;
//             await user.save();
//             await bot.sendMessage(chatId, `Поздравляю, ты отгадал цифру ${chats[chatId]}`);
//             return bot.sendMessage(chatId, `В игре у тебя правильных ответов ${user.right}, неправильных ${user.wrong},
// процент выйгрыша ${(user.right / (user.right + user.wrong) * 100).toFixed(1)}`, againOptions);
//         } else {
//             user.wrong += 1;
//             await user.save();
//             await bot.sendMessage(chatId, `К сожалению ты не угадал, бот загадал цифру ${chats[chatId]}`);
//             return bot.sendMessage(chatId, `В игре у тебя правильных ответов ${user.right}, неправильных ${user.wrong},
// процент выйгрыша ${(user.right / (user.right + user.wrong) * 100).toFixed(1)}`, againOptions);
//         }
//     })


    // bot.onText(/\/info (.+)/, (msg, [source, match]) => {
    //     const chatId = msg.chat.id;
    //     bot.sendMessage(chatId, match);
    // });


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

        console.log(user)

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


