// 'use strict'
const console = require('console')
const { app, ipcMain, BrowserWindow } = require('electron')
let { menubar } = require('menubar')

const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

const iconURL = process.env.NODE_ENV === 'development'
  ? `static/icon/logo.png`
  : `${__dirname}/static/icon/logo.png`

let mb = menubar({
  'index': winURL,
  // 设置 icon
  'icon': iconURL,
  'browserWindow': {
    'webPreferences': {
      'nodeIntegration': true,
      'enableRemoteModule': true
    }
  }
})
var win
function openSettingWindow () {
  win = new BrowserWindow({
    title: 'Prefrence',
    height: 400,
    width: 600,
    x: 100,
    y: 100,
    useContentSize: true,
    // resizable: false,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true
    }
  })

  win.loadURL(winURL + '#/setting').then(() => {
    // win.setTitle('Prefrence')
  })
  win.on('closed', () => { win = null })
}

mb.on('ready', function ready () {
  console.log('app is ready')
})

// 取消开机自动启动
ipcMain.on('cancelAutoStart', () => {
  app.setLoginItemSettings({
    openAtLogin: false
  })
  console.log('当前自动开机状态: ', app.getLoginItemSettings('openAtLogin'))
})

// 开机自动启动
ipcMain.on('autoStart', () => {
  app.setLoginItemSettings({
    openAtLogin: true
  })
  console.log('当前自动开机状态: ', app.getLoginItemSettings('openAtLogin'))
})

// 开启配置选项
ipcMain.on('setting', () => {
  openSettingWindow()
})

// 退出程序，销毁窗口
ipcMain.on('quit', () => {
  app.quit()
})

// 强制退出
ipcMain.on('exit', () => {
  app.exit()
})

// /**
//  * Set `__static` path to static files in production
//  * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
//  */
// if (process.env.NODE_ENV !== 'development') {
//   global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
// }

// let mainWindow

// function createWindow () {
//   /**
//    * Initial window options
//    */
//   mainWindow = new BrowserWindow({
//     height: 563,
//     useContentSize: true,
//     width: 1000
//   })

//   mainWindow.loadURL(winURL)

//   mainWindow.on('closed', () => {
//     mainWindow = null
//   })
// }

// app.on('ready', createWindow)

// app.on('window-all-closed', () => {
//   if (process.platform !== 'darwin') {
//     app.quit()
//   }
// })

// app.on('activate', () => {
//   if (mainWindow === null) {
//     createWindow()
//   }
// })

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
