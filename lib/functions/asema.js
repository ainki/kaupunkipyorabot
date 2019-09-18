// asema.js

const bot = require('../../bot')
const {request} = require('graphql-request')
var jp = require('jsonpath');
const fs = require('fs');

// muuttujia
let kooditJaNimet = {asemalista: [], lastUpdated: null};
const replyMarkup = require('../flow/nappaimisto')
var muuttujia = require('../flow/muutujia');
var nappaimisto;
var digiAPI = muuttujia.digiAPI;
const chunkArray = require('./chunkArray');


function haeJSON() {
    //haetaan asemalista tiedostosta
    return new Promise((resolve, reject) => {
        fs.readFile("asemat.json", 'utf8', function (error, data) {
            if (error) {
                console.error("Tiedostoa ei voida lukea");
                if (error.code === 'ENOENT') {
                    console.error('koska tiedostoa ei löydy');
                    return resolve(null);
                } else {
                    console.log("muu syy");
                    return reject(error);
                }

            } else if (data !== "" && data !== null && data !== undefined) {
                console.log("luetaan tiedostoa");
                let output;
                // yritetään muuntaa tiedostosta haettu data objektiksi
                try {
                    output = resolve(JSON.parse(data));
                } catch (e) {
                    //jos epäonnistuu
                    console.error("Virhe JSON:issa");
                    //jos palautetaan tyhjää haetaan asemat uudelleen
                    output = resolve(null);
                } finally {
                    return output;
                }

            } else {

                console.log("tyhjä tiedosto asemat.json");
                //jos palautetaan tyhjää haetaan asemat uudelleen
                return resolve(null);
            }
        })
    });
}

async function haeAsemat() {
    //jos asemalista on tyhjä haetaan lista tiedostosta
    if (kooditJaNimet.asemalista.length === 0) {
        let haettuJSON = await haeJSON();
        if (haettuJSON !== null) {
            //jos tiedosto ei tyhjä eikä viallinen
            kooditJaNimet = haettuJSON;
        }
    }

    //viimeksi päivitetty unixaikana
    let lastUpdated = Math.round(new Date(kooditJaNimet.lastUpdated).getTime())
    //viimeksi päivitetty + vuorokausi
    const oneDayOld = lastUpdated + 86400000
    //tämänhetkinen unixaika
    let nyt = (new Date).getTime();
    if (kooditJaNimet.asemalista.length !== 0 && nyt < oneDayOld) {
        //jos asemalista ei ole tyhjä eikä lista ole vanhentunut
        console.log("ei päivitystä");
        return kooditJaNimet;
    } else {
        //jos jompikumpi on
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
                    var stationId = jp.query(data, '$..stationId')

                    const stationNameArr = Array.from(stationName);
                    const stationIdArr = Array.from(stationId)
                    // tyhjennetään asemalista ja annetaan sille uusi aikaleima
                    kooditJaNimet = {asemalista: [], lastUpdated: new Date()};
                    for (var i = 0; i < stationNameArr.length; i++) {
                        //lisätään asemat listaan
                        kooditJaNimet.asemalista.push({id: stationIdArr[i], name: stationNameArr[i]})
                    }
                    //muutetaan JSONiksi
                    var json = JSON.stringify(kooditJaNimet);
                    fs.writeFile('asemat.json', json, (err) => {
                        if (err) {
                            throw err
                        } else {
                            //jos ei ole erroreita asemat tallennetaan
                            console.info('Tallennetaan asemat');
                        }
                    });
                    return kooditJaNimet;
                })
                .catch(function (error) {
                    //jos Tallennusvirhe
                    console.error("Tallennusvirhe.");
                })
    }
}

async function nimiHaku(chatId, viesti) {
    //haetaan asemat
    kooditJaNimet = await haeAsemat();
    viesti = viesti.toLowerCase();

    let viestiListaAlku = [];
    let objViestiListaAlku = [];
    let nappaimistoListaAlku = [];
    let viestiLista = [];
    let objViestiLista = [];
    let   nappaimistoLista = [];
    let loyty = false;

    //sortataan akkosjärjestykseen
    kooditJaNimet.asemalista.sort((a, b) => {
  var nameA = a.name.toUpperCase(); // ignore upper and lowercase
  var nameB = b.name.toUpperCase(); // ignore upper and lowercase
  if (nameA < nameB) {
    return -1;
  }
  if (nameA > nameB) {
    return 1;
  }

  // names must be equal
  return 0;
});

    //Haetaan kysyttyä asemaa arraysta
    for (var i = 0; i < kooditJaNimet.asemalista.length; i++) {

        //jos asemalistalta löytyy haettu asema
        if (kooditJaNimet.asemalista[i].name.toLowerCase() === viesti) {
            // jos löytyy
            loyty = true;
            asemaHaku(chatId, kooditJaNimet.asemalista[i].id);
            break;
        } else {
            //jos ei
            loyty = false;
        }

        //samankaltaiset asemat, mitä haettiin
        //splitataan asemat välilyönillä nii voi löytää niitki jos on joku turha sana siin ees
        for (var x = 0; x < kooditJaNimet.asemalista[i].name.split(" ").length; x++) {
              if (kooditJaNimet.asemalista[i].name.split(" ")[x].slice(0, viesti.length).toLowerCase() === viesti) {
                  if (x === 0) {

                      viestiListaAlku.push(kooditJaNimet.asemalista[i].name + " " + kooditJaNimet.asemalista[i].id + "\n");
                      objViestiListaAlku.push({id: kooditJaNimet.asemalista[i].id, name: kooditJaNimet.asemalista[i].name});
                      nappaimistoListaAlku.push(kooditJaNimet.asemalista[i].id);
                      break;
                  } else {

                      viestiLista.push(kooditJaNimet.asemalista[i].name + " " + kooditJaNimet.asemalista[i].id + "\n");
                      objViestiLista.push({id: kooditJaNimet.asemalista[i].id, name: kooditJaNimet.asemalista[i].name});
                      nappaimistoLista.push(kooditJaNimet.asemalista[i].id);
                  }
              }else if (kooditJaNimet.asemalista[i].name.slice(0, viesti.length).toLowerCase() === viesti) {

                viestiLista.push(kooditJaNimet.asemalista[i].name + " " + kooditJaNimet.asemalista[i].id + "\n");
                objViestiLista.push({id: kooditJaNimet.asemalista[i].id, name: kooditJaNimet.asemalista[i].name});
                nappaimistoLista.push(kooditJaNimet.asemalista[i].id);
                break;
              }
          }
  }
    viestiLista = viestiListaAlku.concat(viestiLista);
    objViestiLista = objViestiListaAlku.concat(objViestiLista);
    nappaimistoLista = nappaimistoListaAlku.concat(  nappaimistoLista);

    //jos tietty asema löytyi haetaan se
    if (viestiLista.length >= 1) {
      nappaimistoLista =   nappaimistoLista.slice(0, 8);
        viestiLista = viestiLista.slice(0, 8);
        viestiLista = viestiLista.toString().replace(/,/g, "");
        //asemavaihtoehdot
        nappaimisto = chunkArray(  nappaimistoLista, 5);
        let replyMarkup = bot.keyboard(nappaimisto, {resize: true});
        bot.sendMessage(chatId, `Kaupunkipyöräasemat: \n${viestiLista}\n`, {replyMarkup, ask: 'asemakoodi'});
        console.info("vaihtoehdot lähetetty ");
        // nappaimisto = undefined;
    } else if (!loyty) {
        //ei löydy
        bot.sendMessage(chatId, 'Ei löydy, anna aseman koodi tai nimi', {replyMarkup: 'hide', ask: 'asemakoodi'});

    }

}

function asema(chatId, viesti) {
    // Jos viesti on pelkkä '/asema', botti kysyy aseman koodia
    if (viesti === "/asema" || viesti === "/as") {
        bot.sendMessage(chatId, 'Anna aseman koodi tai nimi.', {replyMarkup: 'hide', ask: 'asemakoodi'});
        return console.info('Kysytty aseman koodia.');
    } else {
        // Jos viesti sisältää muutakin kuin '/asema', botti menee suoraan asemahakufunktioon
        viesti.includes("/asema") ? viesti = viesti.replace("/asema", "").trim() : viesti = viesti.replace("/as", "").trim();

        // Kutsuu funktiota
        return tarkistaKoodi(chatId, viesti);

    }
}
//Exporttaa funktion 'asema' indexiin



bot.on('ask.asemakoodi', msg => {
      const viesti = msg.text;
  // Typing
  bot.sendAction(msg.from.id, 'typing')
  if (!isNaN(viesti)) {
      return asema(msg.from.id, viesti)
  }else if (viesti !== '/start' && !viesti.includes('/asema') && !viesti.includes('/as') && viesti !== '/help') {
    return tarkistaKoodi(msg.chat.id, viesti);
  }
});


function tarkistaKoodi(chatId, viesti) {

    // Tarkistaa onko viestissä koodi vai tekstiä
    nollienMaara = viesti.split('0').length - 1;
    if (isNaN(viesti)) {
        //jos viestissä on tekstiä, tehdän nimihaku
        nimiHaku(chatId, viesti);
        return console.info('nimihaku')

        // Jos on numeroita tarkistaa numeron pituuden ja lisää tarvittaessa nollat koodin eteen lisäksi jos koodi on virheellinen turhaa hakua ei tehdä
    } else if (viesti.length < 3) {
        asemaHaku(chatId, "0".repeat(3 - viesti.toString().length) + viesti);


    } else if (nollienMaara === viesti.length) {
        // viestissä vain nollia
        console.log(viesti.length, nollienMaara)
        bot.sendMessage(chatId, `Pyöräasemaa ${viesti} ei löydy.\nKokeile uudestaan!`, {ask: 'asemakoodi'})
        return console.info('Vain nollia asemakoodissa.')
    } else if (viesti.length > 4) {
        // viesti on liian pitkä
        console.log(viesti.length, nollienMaara)
        bot.sendMessage(chatId, `Pyöräasemaa ${viesti} ei löydy.\n\nKaupunkipyöräasemien koodit ovat Helsingissä ja Espoossa kolmen numeron pituisia ja Vantaalla neljän numeron pituisia.\nKokeile uudestaan!`, {ask: 'asemakoodi'})
        return console.info('Liian pitkä asemakoodi.')
    } else {
        // Jatkaa asemahakuun
        asemaHaku(chatId, viesti);
    }
}


function asemaHaku(chatId, viesti) {
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
            .then((data) => {
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
                    bot.sendMessage(chatId, `${stationName} - ${stationId}\n\nPyöräasema ei ole käytössä.`, {ask: 'asemakoodi'})
                    lahetaAsemanSijainti(chatId, stationLat, stationLon)
                    return console.info('Pyöräasema ei ole käytössä.')


                } else if (station == '') {
                    // Jos asemaa ei ole olemassa

                    bot.sendMessage(chatId, `Pyöräasemaa ${viesti} ei löydy.\nKokeile uudestaan!`, {ask: 'asemakoodi'})
                    return console.info('Pyöräasemaa ei löydy.')
                } else {
                    // Jatkaa rakentamalla viestin

                    bot.sendMessage(chatId, stationName + ' - ' + stationId + '\n\nPyöriä saatavilla: ' + stationBikes + '\nPaikkoja vapaana: ' + stationAvail, {ask: 'asemakoodi'})
                    lahetaAsemanSijainti(chatId, stationLat, stationLon)

                    return console.info('Pyöräaseman tiedot lähetetty.')
                }
            })

}

function lahetaAsemanSijainti(chatId, stationLat, stationLon) {
    // Kasaa ja lähettää aseman sijainnin 150ms aseman tietojen jälkeen
    setTimeout(() => {
        return bot.sendLocation(chatId, [parseFloat(stationLat), parseFloat(stationLon)])
    }, 150)
}
module.exports = asema;
