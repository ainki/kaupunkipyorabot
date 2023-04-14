require('dotenv').config()

// Pääkaupunkiseudun polygon
const polygon = [
  [60.2466, 25.2408],
  [60.2972, 25.2545],
  [60.3587, 25.1522],
  [60.3742, 25.0787],
  [60.4016, 24.8665],
  [60.3424, 24.7491],
  [60.2815, 24.515],
  [60.1789, 24.5678],
  [60.1789, 24.5678],
  [60.1148, 24.6499],
  [60.1251, 24.9431]
]

module.exports = {
  digitransitApi: 'http://api.digitransit.fi/routing/v1/routers/hsl/index/graphql?digitransit-subscription-key=' + process.env.digitransitApiKey,
  polygon
}
