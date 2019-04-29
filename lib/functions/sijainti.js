// sijainti.js

const bot = require('../../bot')
const { request } = require('graphql-request')
var jp = require('jsonpath');

const replyMarkup = require('../flow/nappaimisto')
const asemat = require('./asema')
var muuttujia = require('../flow/muutujia');
// muuttujia
var digiAPI = muuttujia.digiAPI;
var tarkistaKoodiFunc = asemat.tarkistaKoodi;


function sijainti(chatId, kayttajanSijainti) {

  console.log(`[location]  ${chatId}`)
  bot.sendAction(chatId, 'typing')

  // Hakee kayttajanSijainnista lati- ja longituden
  var latitude = jp.query(kayttajanSijainti, '$..latitude')
  var longitude = jp.query(kayttajanSijainti, '$..longitude')

  // Query
  const citybikeLocationQuery = `{
        places: nearest(lat: ${latitude}, lon: ${longitude}, maxDistance: 1500, maxResults: 4, 
          filterByPlaceTypes: BICYCLE_RENT) {
          edges {
            node {
              distance
              place {
                ... on BikeRentalStation {
                  stationId
                  name
                  spacesAvailable
                  bikesAvailable
                  state
                }
              }
            }
          }
        }
      }`

  // Hakulauseen suoritus
  return request(digiAPI, citybikeLocationQuery)
    .then(function (data) {
      // Hakee edgen
      var edges = jp.query(data, '$..edges')
      // Jos asemia ei ole lähistöllä
      if (edges == '') {
        bot.sendMessage(chatId, `Läheltäsi ei valitettavastai löydy kaupunkipyöräasemia 😞`);
        return console.log('[info]  Ei asemaia lähellä.')
      } else {
        // Datan haku queryn vastauksesta
        var stationId = jp.query(edges, '$..stationId')
        var stationName = jp.query(edges, '$..name')
        var stationStatus = jp.query(edges, '$..state')
        var stationDistance = jp.query(edges, '$..distance')
        var stationSpaces = jp.query(edges, '$..spacesAvailable')
        var stationBikes = jp.query(edges, '$..bikesAvailable')

        var asemat = 'Kaupunkipyöräasemat lähelläsi:\n\n'
        var asemaNumerot = []

        // Lisää jokaisen aseman asemat variableen
        for (i = 0; i < stationId.length; i += 1) {
          asemaNumerot.push(stationId[i])
          // Jos asema ei ole käytössä
          if (stationStatus[i] == 'Station off') {
            asemat = asemat + stationName[i] + ' ' + stationId[i] + ' - ' + stationDistance[i] + 'm\nPyöräasema ei ole käytössä.\n\n'
          } else {
            asemat = asemat + stationName[i] + ' ' + stationId[i] + ' - ' + stationDistance[i] + 'm\nPyöriä saatavilla: ' + stationBikes[i] + '\nPaikkoja vapaana: ' + stationSpaces[i] + '\n\n'
          }
        }
        var nappaimisto = chunkArray(asemaNumerot, 4);
        let replyMarkup = bot.keyboard(nappaimisto, { resize: true });
        // Lähettää viestin
        bot.sendMessage(chatId, asemat, { replyMarkup, ask: 'asemakoodi' })
        return console.log('[info]  Asemat lähetetty.')
      }
    })
    .catch(err => {
      console.log("[ERROR]  ERROR SIJAINNISSA")
      return bot.sendMessage(chatId, `Ongelma pyynnössä. Kokeile uudestaan!`)
    })
}

module.exports = sijainti;

function chunkArray(myArray, chunk_size) {
  var results = [];

  while (myArray.length) {
    results.push(myArray.splice(0, chunk_size));
  }
  results.push([bot.button('/hae'), bot.button('/linja'), bot.button('location', 'Sijaintisi mukaan 📍')])
  return results;
}