// index.js
// kaupunkipyorabot

// importit
const bot = require('./bot')
const sijainti = require('./lib/functions/sijainti')
const asema = require('./lib/functions/asema')
const replyMarkup = require('./lib/flow/nappaimisto')

// npm
require('console-stamp')(console, 'HH:MM:ss'); //Aikaleimat logiin

// viestien logaus konsoliin
bot.on('text', (msg) => {
    console.log(`[text]  ${msg.chat.id}: ${msg.text}`);
});

// Komennot

bot.on('/start', (msg) => {
    // Lähettää viestin ja näppäimistön
    bot.sendMessage(msg.chat.id, `<b>Hei ${msg.from.first_name}!</b> Tervetuloa käyttämään Kaupunkipyöräbottia.\n\n/asema\nEtsi asemaa aseman koodilla tai nimellä. Saat vasteukseksi aseman sijainnin ja reaaliaikaisen tilan.\n\nSijainti 📍\nLähetä sijainti ja saat lähimmät kaupunkipyöräasemat ja niiden tiedot.\n\nTutustu kaupunkipyöriin osoitteessa kaupunkipyorat.hsl.fi.\n\nHSL aikataulut @pysakkibot\n\nNähdään baanalla! 🚲`, { replyMarkup , parseMode: 'html'})
    return console.log('[info]  Start viesti lähetetty.')
});

bot.on('/help', (msg) => {
    // Lähettää viestin
    bot.sendMessage(msg.chat.id, `Hei ${msg.from.first_name}. Täältä löytyy ohjeita!\n\nKomennot:\n\n/asema - Etsi asemia koodin tai nimen mukaan.`);
    return console.log("[info]  Help viesti lähetetty.")
});

bot.on('/asema', msg => {
    return asema(msg.chat.id, msg.text);
});
bot.on('/as', msg => {
    return asema(msg.chat.id, msg.text);
});

bot.on(['location'], (msg, self) => {
    return sijainti(msg.chat.id, msg.location);
});

bot.on('*', msg => {
  if (typeof(msg.text) === "string") {
    if (msg.text.includes("/") && !msg.text.startsWith("/asema") && !msg.text.startsWith("/as") && !msg.text.startsWith("/help") && !msg.text.startsWith("/start")) {
      return bot.sendMessage( msg.chat.id,'Virheellinen komento. Komennolla /help saat listan komennoista ', { ask: 'ask/valinta' });

    }


}
});

bot.start();
