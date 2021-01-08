const { app, BrowserWindow } = require('electron')
const isDev = require('electron-is-dev');
const path = require('path')
const url = require('url')

// Dem files
require('./dbcomms')
require('./convertToEpub')

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    minWidth: 1000,
    minHeight: 600,
    frame: false,
    webPreferences: {
      enableRemoteModule: true,
      nodeIntegration: true,
      webSecurity: isDev ? false : true,
    },
  })

  const devUrl = 'http://localhost:3000'
  const prodUrl = url.format({
    pathname: path.join(__dirname, '../build/index.html'),
    protocol: 'file:',
    slashes: true,
  })
  mainWindow.loadURL(isDev ? devUrl : prodUrl)
  mainWindow.once('ready-to-show', () => mainWindow.show())
  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.on('ready', createWindow)