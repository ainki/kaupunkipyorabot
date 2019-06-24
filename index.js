// index.js
// kaupunkipyorabot

// importit
const bot = require('./bot')
const sijainti = require('./lib/functions/sijainti')
const asemat = require('./lib/functions/asema')
const replyMarkup = require('./lib/flow/nappaimisto')
var asemaFunc = asemat.asema;
// npm
require('console-stamp')(console, 'HH:MM:ss'); //Aikaleimat logiin

// viestien logaus konsoliin
bot.on('text', (msg) => {
    console.log(`[text]  ${msg.chat.id}: ${msg.text}`);
});

// Komennot

bot.on('/start', (msg) => {
    // Lähettää viestin ja näppäimistön
    bot.sendMessage(msg.chat.id, `Hei ${msg.from.first_name}! Tervetuloa käyttämään Kaupunkipyöräbottia.\n\nVoit etsiä asemia tekemällä /asema ja antamalla aseman koodin. Saat aseman tiedot ja sijainnin.\n\nVoit myös lähettää sijaintisi ja saat lähimpien kaupunkipyöräasemien tiedot.\n\nTutustu kaupunkipyöriin osoitteessa kaupunkipyorat.hsl.fi.\n\nNähdään baanalla! 🚲`, { replyMarkup })
    return console.log('[info]  Start viesti lähetetty.')
});

bot.on('/help', (msg) => {
    // Lähettää viestin
    bot.sendMessage(msg.chat.id, `Hei ${msg.from.first_name}. Täältä löytyy ohjeita!\n\nKomennot:\n\n/asema - Etsi asemia koodin tai nimen mukaan.`);
    return console.log("[info]  Help viesti lähetetty.")
});

bot.on('/asema', msg => {
    return asemaFunc(msg.chat.id, msg.text);
});

bot.on(['location'], (msg, self) => {
    return sijainti(msg.chat.id, msg.location);
});

bot.start();
