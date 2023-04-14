const getCityBikeStations = require('./locationHandler')

async function cityBikeLocation (ctx) {
  ctx.sendChatAction(ctx, { action: 'typing' })
  const userLocation = ctx.message.location
  // console.log(userLocation.latitude)
  const vastaus = await getCityBikeStations(userLocation)
  ctx.reply(vastaus, { parse_mode: 'HTML' })
  console.info('Asemat lähetetty sijainnin perusteella')
}

module.exports = cityBikeLocation
