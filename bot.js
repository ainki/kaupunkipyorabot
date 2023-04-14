//
//  Kaupunkipyorabot
//

// NPM
const TeleBot = require('telebot')
require('dotenv').config()

// Bot token
const token = process.env.token

// BotToken
const bot = new TeleBot({
  token: `${token}`,
  usePlugins: ['askUser', 'floodProtection'],
  pluginConfig: {
    floodProtection: {
      interval: 0.3,
      message: 'Ei spämmiä kiitos! 😤'
    }
  }
})

module.exports = bot
