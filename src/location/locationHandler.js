const { request } = require('graphql-request')
const utils = require('../utils/index')

async function getCityBikeStations (userLocation) {
  const query = `
  {
    nearest(lat: ${userLocation.latitude}, lon: ${userLocation.longitude}, maxDistance: 1500, maxResults: 4, filterByPlaceTypes: BICYCLE_RENT) {
      edges {
        node {
          distance
          place {
            ... on BikeRentalStation {
              stationId
              name
              bikesAvailable
              spacesAvailable
              state
            }
          }
        }
      }
    }
  }`
  const response = await request(utils.digitransitApi, query)
  const valmisViesti = stationListaus(response)
  return valmisViesti
}

function stationListaus (response) {
  let valmisViesti = '<b>Kaupunkipyöräasemat lähelläsi:</b>\n\n'
  const edges = response.nearest.edges
  // Jos asemia ei löydy käyttäjän läheltä
  if (response.nearest.edges.length === 0) {
    console.info('Ei pyöräasemia käyttäjän lähellä')
    return 'Ei pyöräasemia lähelläsi'
  } else {
    // Käydään jokainen asema läpi
    for (let i = 0; i < edges.length; i++) {
      if (edges[i].node.place.state === 'Station off') {
        valmisViesti = valmisViesti + `<b>${edges[i].node.place.name}</b> ${edges[i].node.place.stationId} ➝ ${edges[i].node.distance}m\nAsema ei ole käytössä.\n\n`
      } else {
        valmisViesti = valmisViesti + `<b>${edges[i].node.place.name}</b> ${edges[i].node.place.stationId} ➝ ${edges[i].node.distance}m\nPyöriä asemalla: ${edges[i].node.place.bikesAvailable}\nPaikkoja vapaana: ${edges[i].node.place.spacesAvailable}\n\n`
      }
    }
  }
  return valmisViesti
}

module.exports = getCityBikeStations
