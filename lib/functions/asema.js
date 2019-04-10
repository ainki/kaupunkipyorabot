// asema.js

const bot = require('../../bot')
const { request } = require('graphql-request')
var jp = require('jsonpath');
const fs = require('fs');


let kooditJaNimet = {table:[],lastUpdated: null};
const replyMarkup = require('../flow/nappaimisto')
var muuttujia = require('../flow/muutujia');
// muuttujia
var digiAPI = muuttujia.digiAPI;
function haeJSON () {
  return new Promise((resolve, reject) => {

    fs.readFile("asemat.json", 'utf8', function (error, data) {
      if (error){
        return reject(error);
      }else if(data !== "" && data !== null && data !== undefined) {
        console.log("luetaan tiedostoa");
let output;
        try {
        output = resolve(JSON.parse(data));
        } catch (e) {
console.error("Tiedostonlukuvirhe.");
output = resolve(null);
}finally{
return output;
}

      }else {

        console.log("tyhjä tiedosto asemat.json");
        return  resolve(null);
      }

      console.log(fileName)
      console.log(data)
    })
  });
}
async function haeAsemat() {
  // let kooditJaNimet = kooditJaNimet;
  if (kooditJaNimet.table.length === 0) {
    let haettuJSON = await haeJSON();
    if (haettuJSON !== null) {
      kooditJaNimet = haettuJSON;
    }}
    kooditJaNimet.lastUpdated = new Date(kooditJaNimet.lastUpdated);
    let lastUpdated = Math.round(new Date(kooditJaNimet.lastUpdated).getTime())
    const oneDayOld = lastUpdated + 86400000

    let nyt = (new Date).getTime();
    if (kooditJaNimet.table.length !== 0 && nyt < oneDayOld) {
      console.log("ei päivitystä");
      return kooditJaNimet;
    }else{
      console.log("päivitys");
      const queryasemahaku = `{
        bikeRentalStations {
          name
          stationId
        }
      }`
      return request(digiAPI, queryasemahaku)
      .then(function (data) {
        //Haetaan kaikki asemat (nimet ja koodit jos ei olla jo haettu)

        var stationName = jp.query(data, '$..name')
        var stationId = jp.query(data,'$..stationId')
        // console.log("stationName stationId "+Array.from(stationName)+Array.from(stationId)  );
        const stationNameArr = Array.from(stationName);
        const stationIdArr = Array.from(stationId)
        kooditJaNimet = {table:[],lastUpdated: new Date()};
        for (var i = 0; i < stationNameArr.length; i++) {
          kooditJaNimet.table.push({id: stationIdArr[i],name: stationNameArr[i].toLowerCase() })

        }

        var json = JSON.stringify(kooditJaNimet);
        fs.writeFile('asemat.json', json, (err) => {
          if (err)
          { throw err}else {
            console.log('Tallennetaan asemat');
          }


        });
        return kooditJaNimet;
      })
      .catch(function (error) {
        console.error("Tallennusvirhe.");
      })

    }
  }

  async function nimiHaku (chatId,viesti) {
    kooditJaNimet = await haeAsemat();
    viesti = viesti.toLowerCase();

    //Haetaan kysyttyä asemaa arraysta
    let loytyy = false;
    let sisaltyy = [];
    let objSisaltyy = [];
    let loyty = false;
    for (var i = 0; i < kooditJaNimet.table.length; i++) {
      //kunnolisen haun aloitus vois tehä samalail ku /linja pysäkkibotis
      if (kooditJaNimet.table[i].name.includes(viesti)) {
        sisaltyy.push( kooditJaNimet.table[i].name +" "+ kooditJaNimet.table[i].id+ "\n");
        objSisaltyy.push( {name: kooditJaNimet.table[i].name, id: kooditJaNimet.table[i].id});
      }
      if (kooditJaNimet.table[i].name === viesti) {
        // jos löytyy
        // asemahaku(chatId,kooditJaNimet.table[i].id)
        console.log(kooditJaNimet.table[i].id +" "+ kooditJaNimet.table[i].name);
        loyty = true;
        break;
      }else{
        //jos ei
        loytyy = false;
      }
    }
    if (sisaltyy.length === 1 && loyty) {
      asemahaku(chatId,objSisaltyy[0].id)
    }else if (sisaltyy.length >= 1) {
      sisaltyy = sisaltyy.slice(0, 8)
      sisaltyy = sisaltyy.toString();
      sisaltyy = sisaltyy.replace(/,/g,"");
      bot.sendMessage(chatId, `Kaupunkipyöräasemat: \n${sisaltyy}\n\nValitse asema näppäimistöstä!`, { replyMarkup, ask: 'linjavalinta' })
console.log("vaihtoehdot lähetetty ");
    }else {
      bot.sendMessage(chatId, 'Ei löydy, anna aseman koodi tai nimi', { replyMarkup: 'hide', ask: 'asemakoodi' })

    }

  }
  bot.on('ask.linjavalinta', msg => {
    const valinta = msg.text;
    const chatId = msg.chat.id
    // Typing
    bot.sendAction(msg.from.id, 'typing')
    if (!isNaN(valinta)) {
      console.log(valinta, "valinta");
      return asema(chatId,valinta)
    }



  })

  function asema(chatId, viesti) {
    // Jos viesti on plekkä '/asema', botti kysyy aseman koodia
    if (viesti == "/asema") {
      bot.sendMessage(chatId, 'Anna aseman koodi.', { replyMarkup: 'hide', ask: 'asemakoodi' })
      return console.log('[info]  Kysytty aseman koodia.')
    } else {
      // Jos viesti sisältää muutakin kuin '/asema', menee botti suoraan asemahaku funktioon
      viesti = viesti.replace('/asema ', '');
      // Kutsuu funktiota
      return tarkistaKoodi(chatId, viesti)

    }
  }
  //Exporttaa funktion 'asema' indexiin
  module.exports = asema;


  bot.on('ask.asemakoodi', msg => {
    let viesti = msg.text;

    if (viesti == '/start' || viesti.includes('/asema') || viesti == '/help') {
      // Älä tee mitään
    } else {
      // Kutsutaan funktiota

      return tarkistaKoodi(msg.chat.id, viesti)
    }
  })


  function tarkistaKoodi(chatId, viesti) {

    // Tarkistaa onko viestissä koodi vai tekstiä
    nollienMaara = viesti.split('0').length - 1;
    if (isNaN(viesti)) {

      nimiHaku(chatId,viesti);
      return console.log('[info] nimihaku')

      // Jos on numeroita tarkistaa numeron pituuden ja lisää tarvittaessa nollat koodin eteen lisäksi jos koodi on virheellinen turhaa hakua ei tehdä
    } else if (nollienMaara === 0 && viesti.length === 1) {
      viesti = "00" + viesti
      // Jatkaa asemahakuun
      asemahaku(chatId, viesti);
    } else if (nollienMaara === 1 && viesti.length === 2) {
      viesti = "0" + viesti
      // Jatkaa asemahakuun
      asemahaku(chatId, viesti);
    } else if (nollienMaara === 0 && viesti.length === 2) {
      viesti = "0" + viesti
      // Jatkaa asemahakuun
      asemahaku(chatId, viesti);
    } else if (nollienMaara === viesti.length) {
      // viestissä vain nollia
      console.log(viesti.length, nollienMaara)
      bot.sendMessage(chatId, `Pyöräasemaa ${viesti} ei löydy.\nKokeile uudestaan!`, { ask: 'asemakoodi' })
      return console.log('[info]  Vain nollia asemakoodissa.')
    } else if (viesti.length > 3) {
      // viesti on liian pitkä
      console.log(viesti.length, nollienMaara)
      bot.sendMessage(chatId, `Pyöräasemaa ${viesti} ei löydy.\n\nKaupunkipyöräasemien koodit ovat aina kolmen numeron pituisia.\nKokeile uudestaan!`, { ask: 'asemakoodi' })
      return console.log('[info]  Liian pitkä asemakoodi.')
    } else {
      // Jatkaa asemahakuun
      asemahaku(chatId, viesti);
    }
  }


  function asemahaku(chatId, viesti) {
    // GraphQL query
    const queryasemahaku = `{
      bikeRentalStation(id: "${viesti}") {
        state
        stationId
        name
        bikesAvailable
        spacesAvailable
        lat
        lon
      }
    }`

    return request(digiAPI, queryasemahaku)
    .then(function (data) {
      // Hakee kyselyn vastauksesta aseman tiedot
      var stationState = jp.query(data, '$..state')
      var station = jp.query(data, '$..bikeRentalStation')
      var stationId = jp.query(data, '$..stationId')
      var stationName = jp.query(data, '$..name')
      var stationBikes = jp.query(data, '$..bikesAvailable')
      var stationAvail = jp.query(data, '$..spacesAvailable')
      var stationLat = jp.query(data, '$..lat')
      var stationLon = jp.query(data, '$..lon')

      // Jos tila on suljettu
      if (stationState == 'Station off') {
        // Palauttaa käyttäjälle viestin
        bot.sendMessage(chatId, `${stationName} - ${stationId}\n\nPyöräasema ei ole käytössä.`, { replyMarkup })
        lahetaAsemanSijainti(chatId, stationLat, stationLon)
        return console.log('[info]  Pyöräasema ei ole käytössä.')
      } else if (station == '') {
        // Jos asemaa ei ole olemassa
        bot.sendMessage(chatId, `Pyöräasemaa ${viesti} ei löydy.\nKokeile uudestaan!`, { ask: 'asemakoodi' })
        return console.log('[info]  Pyöräasemaa ei löydy.')
      } else {
        // Jatkaa rakentamalla viestin
        bot.sendMessage(chatId, stationName + ' - ' + stationId + '\n\nPyöriä saatavilla: ' + stationBikes + '\nPaikkoja vapaana: ' + stationAvail)
        lahetaAsemanSijainti(chatId, stationLat, stationLon)
        return console.log('[info]  Pyöräaseman tiedot lähetetty.')
      }
    })

  }

  function lahetaAsemanSijainti(chatId, stationLat, stationLon) {
    // Kasaa ja lähettää aseman sijainnin 250ms aseman tietojen jälkeen
    setTimeout(function () {
      return bot.sendLocation(chatId, [parseFloat(stationLat), parseFloat(stationLon)], { replyMarkup })
    }, 250)
  }
