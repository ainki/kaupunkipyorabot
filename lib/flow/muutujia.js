// muuttujia.js
require('dotenv').config()

module.exports = {
  // Digitransit api osoite
  digiAPI: 'https://api.digitransit.fi/routing/v2/hsl/gtfs/v1/?digitransit-subscription-key=' + process.env.digitransitApiKey
}
