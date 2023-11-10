const { Scenes } = require('telegraf')

const asema = require('./asemaHandler')
const utils = require('../utils')

// const asemaScene = new Scenes.WizardScene('asemaScene', (ctx) => {
//   console.log('Vaihe 1')
//   // Tarkistaa onko viesti vain /asema
//   if (ctx.message.text === '/asema') {
//     // Jos vain /asema, kystään nimeä tai numeroa
//     ctx.reply('Anna aseman nimi tai numero', { reply_markup: { remove_keyboard: true } })
//     // Kun palaa tähän takaisin siirrytään seuraavaan vaiheeseen
//     return ctx.wizard.next()
//   } else {
//     return ctx.wizard.next()
//   }
// }, async (ctx) => {
//   console.log('Vaihe 2')
//   // Pitää poistua asemaScenestä, jotta saadaan async awaitit toimiin :(
//   const vastaus = await asema(ctx)
//   ctx.replyWithHTML(vastaus.text, utils.startKeyboard)
//   if (!(vastaus.location === null)) {
//     setTimeout(() => {
//       ctx.replyWithLocation(vastaus.location.lat, vastaus.location.lon)
//     }, 100)
//   } else {
//     return ctx.wizard.selectStep(1)
//   }
//   // ctx.wizard.selectStep(0)
//   ctx.scene.leave()
//   return console.log('Asemat lähetetty')
//   // ctx.reply(vastaus.text, { parse_mode: 'HTML' })
// }
// )

const asemaScene = new Scenes.BaseScene('asemaScene')

asemaScene.enter((ctx) => {
  ctx.session.myData = {}
  if (ctx.message.text === '/asema') {
    ctx.reply('Anna aseman nimi tai numero', { reply_markup: { remove_keyboard: true } })
    ctx.session.state = 'ask-asema'
  } else {
    console.log('HAS ID')
  }
})

asemaScene.action(ASK_ASEMA, (ctx) => {

})

asemaScene.on('text', (ctx) => {
  if (ctx.session.state === 'ask-asema') {
    return ctx.scene.action(ASK_ASEMA)
  }
})

module.exports = asemaScene
