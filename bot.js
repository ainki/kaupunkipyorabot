//
//  Kaupunkipyorabot
//  Made by ainki
//

//NPM
const TeleBot = require('telebot');

//BotToken
const bot = new TeleBot({
    token: 'TOKEN',
    usePlugins: ['askUser', 'floodProtection'],
    pluginConfig: {
        floodProtection: {
            interval: 0.6,
            message: 'Ei spämmiä kiitos! 😤'
        }
    }
});

module.exports = bot;