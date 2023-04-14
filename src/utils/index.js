require('dotenv').config()

module.exports = {
  digitransitApi: 'http://api.digitransit.fi/routing/v1/routers/hsl/index/graphql?digitransit-subscription-key=' + process.env.digitransitApiKey
}
