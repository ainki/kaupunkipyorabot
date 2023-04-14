const Loki = require('lokijs')

// Tietokanta
let asematDb
let db = new Loki('./data/asemat.db',
  {
    autoload: true,
    autoloadCallback: databaseInitialize
  })

function databaseInitialize () {
  console.info('Ladataan asematietokanta...')
  asematDb = db.getCollection('kaikkiAsemat')
  if (asematDb === null) {
    console.info('Tietokantaa ei löytynyt, luodaan uusi...')
    asematDb = db.addCollection('kaikkiAsemat')
  }
  console.info('Tietokanta ladattu.')
}

// Handlerit

async function paivitaAsemat () {
}
