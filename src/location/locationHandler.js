const { request } = require('graphql-request')
const utils = require('../utils/index')

async function getCityBikeStations (userLocation) {
  const query = `
  {
    nearest(lat: ${userLocation.latitude}, lon: ${userLocation.longitude}, maxDistance: 1500, maxResults: 5, filterByPlaceTypes: BICYCLE_RENT) {
      edges {
        node {
          distance
          place {
            ... on BikeRentalStation {
              stationId
              name
              bikesAvailable
              spacesAvailable
              capacity
              state
              networks
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
  let valmisViesti = '<b>Kaupunkipyöräasemat lähelläsi</b>\n\n'
  const edges = response.nearest.edges
  // Jos asemia ei löydy käyttäjän läheltä
  if (response.nearest.edges.length === 0) {
    console.info('Ei asemia käyttäjän lähellä')
    return 'Valitettavasti läheltäsi ei löydy asemia 😕'
  } else {
    // Käydään jokainen asema läpi
    for (let i = 0; i < edges.length; i++) {
      console.log(edges[i].node.place.networks[0])
      // Jos vantaan asemat otetaan stationId pois koska vantaan stationId:t = nonsense
      if (edges[i].node.place.networks[0] === 'vantaa') {
        // Tarkistaa onko asema käytössä ja rakentaa viestin
        if (edges[i].node.place.state === 'Station off') {
          valmisViesti = valmisViesti + `<b>${edges[i].node.place.name}</b> ➝ ${edges[i].node.distance}m\nAsema ei ole käytössä.\n\n`
        } else {
          valmisViesti = valmisViesti + `<b>${edges[i].node.place.name}</b> ➝ ${edges[i].node.distance}m\nPyöriä asemalla ${edges[i].node.place.bikesAvailable}/${edges[i].node.place.capacity}\n\n`
        }
      } else {
        // Helsinki & Espoo (smoove) tai muu
        // Tarkistaa onko asema käytössä ja rakentaa viestin
        if (edges[i].node.place.state === 'Station off') {
          valmisViesti = valmisViesti + `<b>${edges[i].node.place.name}</b> ${edges[i].node.place.stationId} ➝ ${edges[i].node.distance}m\nAsema ei ole käytössä.\n\n`
        } else {
          valmisViesti = valmisViesti + `<b>${edges[i].node.place.name}</b> ${edges[i].node.place.stationId} ➝ ${edges[i].node.distance}m\nPyöriä asemalla ${edges[i].node.place.bikesAvailable}/${edges[i].node.place.capacity}\n\n`
        }
      }
    }
  }
  return valmisViesti
}

module.exports = getCityBikeStations
