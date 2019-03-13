// nappaimisto.js

const bot = require('../../bot')

//Perusnäppäimitö
let replyMarkup = bot.keyboard([
    [bot.button('/asema'), bot.button('location', 'Sijaintisi mukaan 📍')]
], { resize: true });

module.exports = replyMarkup