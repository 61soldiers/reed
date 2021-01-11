const { ipcMain } = require('electron')
const path = require('path')
// const ebookConverter =  require('node-ebook-converter')
const commandExists = require('command-exists')
const util = require('util')
const exec = util.promisify(require('child_process').exec)
// const { Poppler } =  require('node-poppler')
// const Epub = require("epub-gen")
// const fs = require('fs')
// const pdfExtraction = require("pdf-extraction")


// Check if calibre cli tool exists
ipcMain.on('isCalibreConvertExist', async function(event, _data) {
  try {
    commandExists('ebook-convert', async function(_err, isExist) {
      if(isExist) {await event.reply('isCalibreConvertExist', {status: 'success', isExist: true})}
      else {await event.reply('isCalibreConvertExist', {status: 'success', isExist: false})}
    }) 
  } catch {await event.reply('isCalibreConvertExist', {status: 'failed'})}
})


// Convert pdf to epub [requires calibre | https://calibre-ebook.com/download]
ipcMain.on('convertPdfToEpub', async function(event, data) {
  try {
    let pdfPath = path.parse(data.path)
    // // Convert with calibre
    // ebookConverter.convert({
    //   input: data.path,
    //   output: `${pdfPath.dir}/${pdfPath.name}.epub`,
    //   silent: true,
    // }).then(async (res) => await event.reply('convertPdfToEpub', {status: 'success'}))
    //   .catch(async (err) => await event.reply('convertPdfToEpub', {status: 'failed', error: err}))



    // TEMP
    const promise = exec(`ebook-convert "${data.path}" "${pdfPath.dir}/${pdfPath.name}.epub"`)
    const child = promise.child
    child.stderr.on('data', async function (data) {
      await event.reply('convertPdfToEpub', {status: 'failed', error: data})
    })
    await promise

    await event.reply('convertPdfToEpub', {status: 'success'})

  } catch {await event.reply('convertPdfToEpub', {status: 'failed'})}
})



//// Don't use
//// convert pdf to epub [dirty way]
// ipcMain.on('convertPdfToEpub OUTOFORDER', async function(event, data) {
//   try {
//     let pdfPath = path.parse(data.path)
//     // Read pdf
//     fs.readFile(data.path, function(_e, c) {
//       // Extract metadata from pdf
//       pdfExtraction(c).then(function({info, text}) {
//         // Text to epub Render
//         let newText = text.split("\n")
//         let finalHtmlArray = []
//         newText.forEach(line => {
//           finalHtmlArray.push("<p>" + line + "</p>".split(',').join(', ').split('.').join('. '))
//         })
//         const option = {
//           title: info.Title,
//           author: info.Author,
//           publisher: info.Producer,
//           output: `${pdfPath.dir}/${pdfPath.name}.epub`,
//           content: [{data: finalHtmlArray.join("")}]
//         }
//         new Epub(option).promise.then(
//           async () => await event.reply('convertPdfToEpub', {status: 'success'}),
//           async (_err) => await event.reply('convertPdfToEpub', {status: 'failed'})
//         )
//       })
//     })
//   } catch {await event.reply('convertPdfToEpub', {status: 'failed'})}
// })