// index.js
// kaupunkipyorabot

// vaatimukset
const bot = require('./bot')
const sijainti = require('./lib/functions/sijainti')

// npm
require('console-stamp')(console, 'HH:MM:ss'); //Aikaleimat logiin

// viestien logaus konsoliin
bot.on('text', function (msg) {
    console.log(`[text]  ${msg.chat.id}: ${msg.text}`);
});

// komennot

bot.on('/start', (msg) => {
    // Lähettää viestin ja näppäimistön
    bot.sendMessage(msg.chat.id, `Hei, ${msg.from.first_name}! Tervetuloa käyttäämään kaupunkipyöräbottia.`)
    return console.log('[info]  Start viesti lähetetty.')
})

bot.on('/help', (msg) => {
    // Lähettää viestin
    bot.sendMessage(msg.chat.id, `Hei ${msg.from.first_name}. Täältä saa lisätietoa!\n\nKomennot:\n\n/asema - Etsi asemia nimen tai koodin mukaan.`);
    return console.log("[info]  Help viesti lähetetty.")
});

bot.on(['location'], (msg, self) => {
    return sijainti(msg.chat.id, msg.location);
});