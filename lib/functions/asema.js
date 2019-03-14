// asema.js

const bot = require('../../bot')
const { request } = require('graphql-request')
var jp = require('jsonpath');

const replyMarkup = require('../flow/nappaimisto')
var muuttujia = require('../flow/muutujia');

// muuttujia
var digiAPI = muuttujia.digiAPI;


function asema(chatId, viesti) {
    // Jos viesti on plekkä '/asema', botti kysyy aseman koodia
    if (viesti == "/asema") {
        bot.sendMessage(chatId, 'Anna aseman koodi.', { replyMarkup: 'hide', ask: 'asemakoodi' })
        return console.log('[info]  Kysytty aseman koodia.')
    } else {
        // Jos viesti sisältää muutakin kuin '/asema', menee botti suoraan asemahaku funktioon
        viesti = viesti.replace('/asema ', '');
        // Menee functioon
        return tarkistaViesti(chatId, viesti)
    }
}


//Exporttaa funktion 'asema' indexiin
module.exports = asema;

bot.on('ask.asemakoodi', msg => {
    let viesti = msg.text;

    if (viesti == '/start' || viesti.includes('/asema') || viesti == '/help') {
        // Älä tee mitään
    } else {
        // Menee funktioon
        return tarkistaViesti(msg.chat.id, viesti)
    }
})


function tarkistaViesti(chatId, viesti) {

    // Tarkistaa onko viestissä koodi vai tekstiä
    nollienMaara = viesti.split('0').length-1;
    if (isNaN(viesti)) {
        bot.sendMessage(chatId, 'Valitettavasti asemia ei pysty hakemaan nimen mukaan 😔.\nKokeile uudestaan käyttäen aseman koodia!', { ask: 'asemakoodi' })

        return console.log('[info]  Ei koodia')
    } else if (nollienMaara === 0 && viesti.length === 1) {

viesti = "00" + viesti
asemahaku(viesti, chatId);
}else if (nollienMaara === 1 && viesti.length === 2) {

viesti = "0" + viesti
asemahaku(viesti, chatId);
}else if (nollienMaara === 0 && viesti.length === 2) {
viesti = "0" + viesti
asemahaku(viesti, chatId);
} else if (nollienMaara === viesti.length) {
  console.log(viesti.length, nollienMaara)
  bot.sendMessage(chatId, `Pyöräasemaa ${viesti} ei löydy.\nKokeile uudestaan!`, { ask: 'asemakoodi' })
  return console.log('[info]  vain nollia')
} else if (viesti.length > 3) {
  console.log(viesti.length, nollienMaara)
  bot.sendMessage(chatId, `Pyöräasemaa ${viesti} ei löydy. (Huom! Kaupunkipyöräasemien koodit ovat aina kolmen merkin pituisia.)\nKokeile uudestaan!`, { ask: 'asemakoodi' })
  return console.log('[info]  liian pitkä')
}else {

asemahaku(viesti, chatId);
    }
}
function asemahaku(viesti,chatId) {
  console.log(viesti)
  // Jos koodi niin jatkaa kyselyllä
  // GraphQL query
  const queryasemahaku = `{
      bikeRentalStation(id: "${viesti}") {
          state
          stationId
          name
          bikesAvailable
          spacesAvailable
          lat
          lon
      }
  }`

  return request(digiAPI, queryasemahaku)
      .then(function (data) {
          // Hakee kyselyn vastauksesta aseman tiedot
          var stationState = jp.query(data, '$..state')
          var station = jp.query(data, '$..bikeRentalStation')
          var stationId = jp.query(data, '$..stationId')
          var stationName = jp.query(data, '$..name')
          var stationBikes = jp.query(data, '$..bikesAvailable')
          var stationAvail = jp.query(data, '$..spacesAvailable')
          var stationLat = jp.query(data, '$..lat')
          var stationLon = jp.query(data, '$..lon')

          // Jos tila on suljettu
          if (stationState == 'Station off') {
              // Palauttaa käyttäjälle viestin
              bot.sendMessage(chatId, `${stationName} - ${stationId} 🚲\n\nPyöräasema ei ole käytössä.`, { replyMarkup })
              lahetaAsemanSijainti(chatId, stationLat, stationLon)
              return console.log('[info]  Pyöräasema ei ole käytössä.')
          } else if (station == '') {
              // Jos asemaa ei ole olemassa
              bot.sendMessage(chatId, `Pyöräasemaa ${viesti} ei löydy.\nKokeile uudestaan!`, { ask: 'asemakoodi' })
              return console.log('[info]  Pyöräasemaa ei löydy.')
          } else {
              // Jatkaa rakentamalla viestin
              bot.sendMessage(chatId, stationName + ' - ' + stationId + ' 🚲\n\nPyöriä saatavilla: ' + stationBikes + '\nPaikkoja vapaana: ' + stationAvail)
              lahetaAsemanSijainti(chatId, stationLat, stationLon)
              return console.log('[info]  Pyöräaseman tiedot lähetetty.')
          }
      })

}
function lahetaAsemanSijainti(chatId, stationLat, stationLon) {
    // Kasaa ja lähettää aseman sijainnin 250ms aseman tietojen jälkee
    setTimeout(function () {
        return bot.sendLocation(chatId, [parseFloat(stationLat), parseFloat(stationLon)], { replyMarkup })
    }, 250)
}
