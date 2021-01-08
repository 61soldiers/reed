const { ipcMain } = require('electron')
const ForerunnerDB = require('forerunnerdb')
// Init db
const fdb = new ForerunnerDB()
const db = fdb.db('main')
db.persist.auto(true)
db.persist.dataDir('./data')

// Collections
const bookCollections = db.collection('bookCollections'); bookCollections.load(function(err){if (err){console.log(err)}})
const books = db.collection('books'); books.load(function(err){if (err){console.log(err)}})
const userData = db.collection('userData'); userData.load(function(err){if (err){console.log(err)}})

global.bookCollections = bookCollections
global.books = books
global.userData = userData

//// Collection CRUD
// Get collections list
ipcMain.on('getColls', async function(event, _data) {
  try {
    let cursor = await bookCollections.find({})
    let docs = []
    await cursor.forEach(doc => {docs.push(doc)})
    await event.reply('getColls', {status: 'success', docs:docs})
  } catch {
    await event.reply('getColls', {status: 'failed'})
  }
})

// Add collection
ipcMain.on('addColl', async function(event, data) {
  try {
    let docExist = await bookCollections.findOne({name: data})
    if (!docExist) {
      let doc = {name: data,createdAt: Date.now()}
      let insertCB = await bookCollections.insert(doc)
      if (!insertCB.failed.length) {await event.reply("addColl", {status: 'success'})} 
      else {await event.reply("addColl", {status: 'failed'})}
    }else{
      await event.reply("addColl", {status: 'duplicate'})
    }
  } catch {
    await event.reply('addColl', {status: 'failed'})
  }
})

// Rename collection
ipcMain.on('renameColl', async function(event, data) {
  try {
    if (!bookCollections.findOne({name: data.new})) {
      await bookCollections.update({name: data.prev}, {$overwrite:{name: data.new}})
      await event.reply('renameColl', {status: 'success'})
    } else {await event.reply('renameColl', {status: 'failed'})}
  } catch {
    await event.reply('renameColl', {status: 'failed'})
  }
})

// Delete collection
ipcMain.on('delColl', async function(event, data) {
  try {
    await bookCollections.remove({name: data})
    await event.reply('delColl', {status: 'success'})
  } catch {
    await event.reply('delColl', {status: 'failed'})
  }
})






//// EPUB Book CRUD
// Get all books
ipcMain.on('getAllBooks', async function(event, data) {
  try {
    let cursor = await books.find({})
    let docs = []
    await cursor.forEach(doc => {docs.push(doc)})
    await event.reply('getAllBooks', docs)
  } catch {
    await event.reply('getAllBooks', {status: 'failed'})
  }
})

// Get books of said Collection
ipcMain.on('getCollBooks', async function(event, data) {
  try {
    let cursor = await books.find({collection: data})
    let docs = []
    await cursor.forEach(doc => {docs.push(doc)})
    await event.reply('getCollBooks', docs)
  } catch {
    await event.reply('getCollBooks', {status: 'failed'})
  }
})

// Add books
ipcMain.on('addBooks', async function(event, data) {
  try {
    for (let i=0;i<data.length;i++) {
      const {path, metadata} = await data[i]
      let doc = await books.findOne({title: metadata.title})
      if(doc) {await event.reply('addBooks', {status: 'duplicate', title: metadata.title})} // duplicate check
      else {
        // Add book
        let book = {...metadata, path: path, location: null}
        await books.insert(book)
        await event.reply('addBooks', {status: 'success'})
      }
    }
  } catch {
    await event.reply('addBooks', {status: 'failed'})
  }
})

// Delete single book
ipcMain.on('delBook', async function(event, data) {
  try {
    await books.remove({identifier:data})
    await event.reply('delBook', {status: 'success'})
  } catch {
    await event.reply('delBook', {status: 'failed'})
  }
})

// Update book
ipcMain.on('updateBook', async function(event, data) {
  try {
    await books.remove({identifier: data.identifier})
    await books.insert(data)
    await event.reply('updateBook', {status:'success'})
  } catch {await event.reply('updateBook', {status: 'failed'})}
})

// Return book metadata
ipcMain.on('getBookMD', async function(event, data) {
  try {
    
  } catch {
    await event.reply('getBookMD', {status: 'failed'})
  }
})

// Move book to another coll
ipcMain.on('moveBookToColl', async function(event, data) {
  try {
    await books.update({identifier: data.book}, {$overwrite:{collection: data.to}})
    await event.reply('moveBookToColl', {status:'success'})
  } catch {
    await event.reply('moveBookToColl', {status: 'failed'})
  }
})



//// Reader
// Get current reading book
ipcMain.on('getCurrentReadingBook', async function(event, _data) {
  try {
    let doc = await userData.findOne({name: 'crbook'})
    let book = await books.findOne({identifier: doc.bookId})
    if (book) {await event.reply('getCurrentReadingBook', {status: 'success', book:book})}
    else {await event.reply('getCurrentReadingBook', {status: 'failed'})}
  } catch {
    await event.reply('getCurrentReadingBook', {status: 'failed'})
  }
})

// Set current reading book
ipcMain.on('setCurrentReadingBook', async function(event, data) {
  try {
    let doc = await userData.findOne({name: 'crbook'})
    if (!doc) {
      await userData.insert({name: 'crbook', identifier: data})
    } else {await userData.update({name: 'crbook'}, {$overwrite:{bookId: data}})}
    await event.reply('setCurrentReadingBook', {status: 'success'})
  } catch {
    await event.reply('getCurrentReadingBook', {status: 'failed'})
  }
})

//// Location CRUD
// Get location
ipcMain.on('getLoc', async function(event, data) {
  try {
    let doc = await books.findOne({identifier: data})
    await event.reply('getLoc', {status: 'success', location: doc.location})
  } catch {
    await event.reply('getLoc', {status: 'failed'})
  }
})

// Set location
ipcMain.on('setLoc', async function(event, data) {
  try {
    await books.update({identifier: data.identifier}, {$overwrite:{location: data.location}})
    await event.reply('setLoc', {status: 'success'})
  } catch {
    await event.reply('setLoc', {status: 'failed'})
  }
})