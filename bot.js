//
//  Kaupunkipyorabot
//

//NPM
const TeleBot = require('telebot');

//Heroku token
var token = process.env.token;
// var token = 'TOKEN'  // Lokaaliin pyörittämiseen

//BotToken
const bot = new TeleBot({
    token: `${token}`,
    usePlugins: ['askUser', 'floodProtection'],
    pluginConfig: {
        floodProtection: {
            interval: 0.3,
            message: 'Ei spämmiä kiitos! 😤'
        }
    }
});

module.exports = bot;
