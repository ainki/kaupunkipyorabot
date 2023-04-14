// chunkArray.js

const bot = require('../../bot')

function chunkArray (myArray, chunkSize) {
  var results = []

  while (myArray.length) {
    results.push(myArray.splice(0, chunkSize))
  }
  results.push([bot.button('/asema'), bot.button('location', 'Sijaintisi mukaan 📍')])
  return results
}

module.exports = chunkArray
