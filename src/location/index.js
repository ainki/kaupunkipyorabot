const getCityBikeStations = require('./locationHandler')

async function cityBikeLocation (ctx) {
  // Lähettää typing actionin
  ctx.sendChatAction(ctx, { action: 'typing' })
  // Siirtyy getCityBikeStations functioon ja odottaa vastausta
  const vastaus = await getCityBikeStations(ctx.message.location)
  // Lähettää käyttäjälle viestin
  ctx.reply(vastaus, { parse_mode: 'HTML' })
  console.info('Asemat lähetetty sijainnin perusteella')
}

module.exports = cityBikeLocation
