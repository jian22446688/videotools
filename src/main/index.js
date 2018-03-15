import { app, BrowserWindow } from 'electron'
const ipc = require('electron').ipcMain
const dialog = require('electron').dialog
/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 750,
    useContentSize: true,
    width: 1000
  })

  mainWindow.loadURL(winURL),
      mainWindow.webContents.openDevTools(),
  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

ipc.on('open-file-dialog', function (event) {
    dialog.showOpenDialog(mainWindow, {
        properties: ['openFile', 'openDirectory']
    }, function (files) {
        if (files) event.sender.send('selected-directory', files)
    })
})

/**
 * 通用事件通知
 */
ipc.on('openfileeven', function (event, arg) {
    dialog.showOpenDialog(mainWindow, {
        properties: ['openFile', 'openDirectory']
    }, function (files) {
        if (files) event.sender.send(arg, files)
    })
})
ipc.on('openselectdirectory', function (event, arg) {
    dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory']
    }, function (files) {
        if (files) event.sender.send(arg, files)
    })
})
ipc.on('openselectcustumfile', function (event, arg) {
    dialog.showOpenDialog(mainWindow, {
        properties: ['openFile'],
        filters: [
            arg.sustumType,
        ]
    }, function (files) {
        arg.file = files;
        if (files) event.sender.send(arg.event, arg)
    })
})




/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
