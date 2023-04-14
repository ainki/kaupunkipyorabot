const { default: request } = require('graphql-request')
const utils = require('../utils/index')

async function asema (ctx) {
  // Kutsuu koodintarkistus function
  const vastaus = await tarkistaKoodi(ctx)
  return vastaus
}

// Tarkistaa onko viestissä koodi vai nimi
async function tarkistaKoodi (ctx) {
  let message = ctx.message.text
  message.includes('/asema')
    ? (message = message.replace('/asema', '').trim())
    : (message = message.replace('/as', '').trim())
  // Tarkistaa nollien määrän
  // const nollienMaara = message.split('0').length - 1
  console.log(containsOnlyNumbers(message))
  // Tarkistaa onko pelkkiä numeroita viestissä
  if (containsOnlyNumbers(message) === true) {
    const vastaus = await asemaHaku(message)
    return vastaus
  }
}

// async function nimiHaku (ctx, message) {

// }

async function asemaHaku (message) {
  const getCityBikeStations = `
  {
    bikeRentalStation (id: "${message}") {
      state
      stationId
      name
      bikesAvailable
      spacesAvailable
      capacity
      networks
      lat
      lon
    }
  }`

  const response = await request(utils.digitransitApi, getCityBikeStations)
  // Jos asema vastauksessa
  if (!(response.bikeRentalStation === null)) {
    const bikeRentalStation = response.bikeRentalStation
    let stationNetwork
    // Tarkistetaan station network
    if (bikeRentalStation.networks[0] === 'smoove') {
      // Lisätään tässä vaiheessa Hel&Esp perään station Id säästetään lisä if rakenteilta
      stationNetwork = 'Helsinki & Espoo ' + bikeRentalStation.stationId
    } else if (bikeRentalStation.networks[0] === 'vantaa') {
      stationNetwork = 'Vantaa'
    }

    const stationLocation = { lat: bikeRentalStation.lat, lon: bikeRentalStation.lon }
    console.log(stationLocation)

    if (bikeRentalStation.state === 'Station off') {
      // Jos asema pois käytöstä
      const viesti = {
        text: `<b>${bikeRentalStation.name}</b>\n${stationNetwork}\n\nAsema ei ole käytössä.`,
        location: stationLocation
      }
      return viesti
    } else {
      const viesti = {
        text: `<b>${bikeRentalStation.name}</b>\n${stationNetwork}\n\nPyöriä asemalla ${bikeRentalStation.bikesAvailable}/${bikeRentalStation.capacity}`,
        location: stationLocation
      }
      return viesti
    }
  } else {
    const viesti = {
      text: `Asemaa <i>${message}</i> ei valitettasti löydy 😕\n\nKokeile toista?`,
      location: null
    }
    return viesti
  }
}

// Muita functioita
function containsOnlyNumbers (str) {
  return /^\d+$/.test(str)
}

module.exports = asema
