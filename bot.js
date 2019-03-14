//
//  Kaupunkipyorabot
//  Made by ainki
//

//NPM
const TeleBot = require('telebot');

//BotToken
const bot = new TeleBot({
    token: '535551085:AAE_sKOJ_KaR3xMaUiF7yphCYHlHnsz54NM',
    usePlugins: ['askUser', 'floodProtection'],
    pluginConfig: {
        floodProtection: {
            interval: 0.4,
            message: 'Ei spämmiä kiitos! 😤'
        }
    }
});

module.exports = bot;
