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
        bot.sendMessage(chatId, 'Anna aseman numero.', { replyMarkup: 'hide', ask: 'asemakoodi' })
        return console.log('[info]  Kysytty aseman numeroa.')
    } else {
        // Jos viesti sisältää muutakin kuin '/asema', menee botti suoraan asemahaku funktioon
        viesti = viesti.replace('/asema ', '');
        // Menee functioon
        return asemahaku(chatId, viesti)
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
        return asemahaku(msg.chat.id, viesti)
    }
})

function asemahaku(chatId, viesti) {

    // Tarkistaa onko viestissä numero vai tekstiä
    if (isNaN(viesti)) {
        bot.sendMessage(chatId, 'Valitettavasti asemia ei pysty hakemaan nimen mukaan 😔.\nKokeile uudestaan käyttäen aseman numeroa!', { ask: 'asemakoodi' })
        return console.log('[info]  Ei numeroa')
    } else {
        // Jos numero niin jatkaa kyselyllä
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
            var stationStatus = jp.query(data, '$..state')
            var station = jp.query(data, '$..bikeRentalStation')
            var stationId = jp.query(data, '$..stationId')
            var stationName = jp.query(data, '$..name')
            var stationBikes = jp.query(data, '$..bikesAvailable')
            var stationAvail = jp.query(data, '$..spacesAvailable')
            var stationLat = jp.query(data, '$..lat')
            var stationLon = jp.query(data, '$..lon')
            // Jos tila on suljettu
            if (stationStatus == 'Station off') {
                // Palauttaa käyttäjälle viestin
                bot.sendMessage(chatId, `Pyöräasema ${stationName} - ${stationId}\n\nPyöräasema ei ole käytössä.`, {replyMarkup})
                return console.log('[info]  Pyöräasema ei ole käytössä.')
            } else if (station == null) {
                // Jos asemaa ei ole olemassa
                bot.sendMessage(chatId, `Pyöräasemaa ${viesti} ei löydy.\nKokeile uudestaan!`, { ask: 'asemakoodi' })
            } else {
                // Jatkaa
                
                
            }
        })

    }
}

