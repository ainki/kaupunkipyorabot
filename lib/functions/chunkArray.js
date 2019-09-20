// chunkArray.js

const bot = require('../../bot')

function chunkArray(myArray, chunk_size) {
  var results = [];

  while (myArray.length) {
    results.push(myArray.splice(0, chunk_size));
  }
  results.push([bot.button('/asema'), bot.button('location', 'Sijaintisi mukaan 📍')]);
  return results;
}

module.exports = chunkArray;
