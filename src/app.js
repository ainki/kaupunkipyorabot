const { Telegraf, Scenes, session } = require('telegraf')
require('dotenv').config() // env-tiedoston lukuun
require('console-stamp')(console, 'HH:MM:ss') // Aikaleimat logiin

const cityBikeLocation = require('./location/index')

const bot = new Telegraf(process.env.telegramBotToken)

bot.use((ctx, next) => {
  console.log('[text] ' + ctx.from.id + ' ' + ctx.message.text)
  next()
})

bot.start((ctx) => {
  ctx.reply(`<b>Hei ${ctx.from.first_name}!</b> Tervetuloa käyttämään Kaupunkipyöräbottia.\n\nOlen versio 2 kehitysversio, joka on vielä kesken.`, { parse_mode: 'HTML' })
  console.info('Start viesti lähetetty')
})

bot.on('location', (ctx) => {
  console.info('[location] ' + ctx.from.id)
  return cityBikeLocation(ctx)
})

bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
