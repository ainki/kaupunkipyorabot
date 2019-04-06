//
//  Kaupunkipyorabot
//

//NPM
const TeleBot = require('telebot');

//BotToken
const bot = new TeleBot({
    token: '535551085:AAGTUY5UpYpl6Q_Pd31MysyvePGr31NRVR0',
    usePlugins: ['askUser', 'floodProtection'],
    pluginConfig: {
        floodProtection: {
            interval: 0.4,
            message: 'Ei spämmiä kiitos! 😤'
        }
    }
});

module.exports = bot;
