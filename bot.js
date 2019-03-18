//
//  Kaupunkipyorabot
//

//NPM
const TeleBot = require('telebot');

//BotToken
const bot = new TeleBot({
    token: 'TOKEN',
    usePlugins: ['askUser', 'floodProtection'],
    pluginConfig: {
        floodProtection: {
            interval: 0.4,
            message: 'Ei spämmiä kiitos! 😤'
        }
    }
});

module.exports = bot;
