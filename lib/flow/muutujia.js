// muuttujia.js
require('dotenv').config()

module.exports = {
  // Digitransit api osoite
  digiAPI: 'http://api.digitransit.fi/routing/v1/routers/hsl/index/graphql?digitransit-subscription-key=' + process.env.digitransitApiKey
}
