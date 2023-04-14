const { Scenes } = require('telegraf')

const asema = require('./asemaHandler')
const utils = require('../utils')

const asemaScene = new Scenes.WizardScene('asemaScene', (ctx) => {
  console.log('Vaihe 1')
  // Tarkistaa onko viesti vain /asema
  if (ctx.message.text === '/asema') {
    // Jos vain /asema, kystään nimeä tai numeroa
    ctx.reply('Anna aseman nimi tai numero', { reply_markup: { remove_keyboard: true } })
    // Kun palaa tähän takaisin siirrytään seuraavaan vaiheeseen
    return ctx.wizard.next()
  } else {
    ctx.wizard.next()
  }
}, async (ctx) => {
  console.log('Vaihe 2')
  // Pitää poistua asemaScenestä, jotta saadaan async awaitit toimiin :(
  const vastaus = await asema(ctx)
  ctx.replyWithHTML(vastaus.text, utils.startKeyboard)
  if (!(vastaus.location === null)) {
    setTimeout(() => {
      ctx.replyWithLocation(vastaus.location.lat, vastaus.location.lon)
    }, 100)
  } else {
    return ctx.wizard.selectStep(1)
  }
  // ctx.wizard.selectStep(0)
  ctx.scene.leave()
  return console.log('Asemat lähetetty')
  // ctx.reply(vastaus.text, { parse_mode: 'HTML' })
}
)

module.exports = asemaScene
