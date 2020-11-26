// 'use strict'
import storage from '../renderer/utils/storage.js'

const console = require('console')
const { app, ipcMain, BrowserWindow } = require('electron')
let { menubar } = require('menubar')
const AutoLaunch = require('auto-launch')

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

// 隐藏 Dock 栏
app.dock.hide()

// 开机自动登录
var launch = new AutoLaunch({
  name: 'TimeManager',
  path: process.execPath // 当前运行程序或改成绝对路径
})

// 更新开机自动启动配置
function updateAutoLaunch (isAutoLaunch) {
  if (isAutoLaunch) { // 开机自启
    launch.enable()
    launch.isEnabled().then((isEnabled) => {
      if (isEnabled) {
        console.log('修改成功，当前开机自启状态: ', app.getLoginItemSettings().openAtLogin)
        return
      }
      console.error('重试再次开启....', app.getLoginItemSettings().openAtLogin)
      launch.enable()
      console.log('修改成功，当前开机自启状态: ', app.getLoginItemSettings().openAtLogin)
    }).catch((err) => {
      console.error(err)
    })
  } else { // 取消开机自启
    launch.disable()
    launch.isEnabled().then((isEnabled) => {
      if (!isEnabled) {
        console.log('修改成功，当前开机自启状态: ', app.getLoginItemSettings().openAtLogin)
        return
      }
      console.error('重试再次关闭....', app.getLoginItemSettings().openAtLogin)
      launch.disable()
      console.log('修改成功，当前开机自启状态: ', app.getLoginItemSettings().openAtLogin)
    }).catch((err) => {
      console.error(err)
    })
  }
}

// 检测是否需要更新自启配置
function checkAutoLaunch () {
  let curLaunchConfig = app.getLoginItemSettings().openAtLogin
  let fileLaunchConfig = storage.getItem('auto-launch')

  // 当前配置与开机配置不一致时，进行修改
  console.log(storage.getAll(), '\n\n', '当前自启配置：', curLaunchConfig, ' 缓存配置：', fileLaunchConfig)
  if (curLaunchConfig !== fileLaunchConfig) {
    updateAutoLaunch(fileLaunchConfig)
  }
}

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
  win.on('closed', () => {
    win = null
    // 监测到窗口关闭时，再次检测
    checkAutoLaunch()
  })
}
// 启动程序时检测一遍
checkAutoLaunch()

mb.on('ready', function ready () {
  console.log('app is ready')
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
