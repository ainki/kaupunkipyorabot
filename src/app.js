const { Telegraf, Scenes, session } = require('telegraf')
require('dotenv').config() // env-tiedoston lukuun
require('console-stamp')(console, 'HH:MM:ss') // Aikaleimat logiin

const cityBikeLocation = require('./location/index')
const asemaScene = require('./asema/index')

const bot = new Telegraf(process.env.telegramBotToken)

// Luodaan Telegraf Stage
const stage = new Scenes.Stage([asemaScene])
bot.use(session())
bot.use(stage.middleware())

// Komennot yms

bot.use((ctx, next) => {
  // Logataan siääntulevat viesti
  console.log('[text] ' + ctx.from.id + ' ' + ctx.message.text)
  next()
})

bot.start((ctx) => {
  ctx.reply(`<b>Hei ${ctx.from.first_name}!</b> Tervetuloa käyttämään Kaupunkipyöräbottia.\n\nOlen versio 2 kehitysversio, joka on vielä kesken.\n\n<b>Ominaisuudet</b>\nSijainti 📍\nLähetä botille sijaintisi ja saat lähimpien asemien tiedot.\n\n<b>Lisätietoa</b>\nTutustu kaupunkipyöriin ja osta kausi osoittesta kaupunkipyorat.hsl.fi.\n\nTestaa myös @pysakkibot!\n\nNähdään baanalla! 🚲`, { parse_mode: 'HTML' })
  console.info('Start viesti lähetetty')
})

bot.on('location', (ctx) => {
  console.info('[location] ' + ctx.from.id)
  return cityBikeLocation(ctx)
})

bot.command('asema', (ctx) => {
  ctx.scene.enter('asemaScene')
})

bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
