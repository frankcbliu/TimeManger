// 'use strict'
import storage from '../renderer/utils/storage.js'
import '../renderer/store'
import { autoUpdater } from 'electron-updater'
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

// 初始化日志
function initLog () {
  const electronLog = require('electron-log')
  let log = electronLog.create('main')
  let mlog = log.functions.log
  log.functions.log = function (...params) { mlog('[main]', ...params) }

  log.functions.log('-----------------------启动日志-----------------------')
  log.functions.log('日志文件路径：', log.transports.file.getFile().path)
  log.functions.log('-----------------------------------------------------')
  // 将自动更新的 log 改为 electron-log
  autoUpdater.logger = log
  autoUpdater.logger.transports.file.level = 'info'
  return log.functions
}

const monsole = process.env.NODE_ENV === 'production' ? initLog() : console

// 防止 electron 因为意外挂掉而不退出
process.on('uncaughtException', error => {
  monsole.log('Exception:', error)
  process.exit(1)
})

app.setAppUserModelId('com.electron.time_manager')

let mb = menubar({
  'index': winURL,
  // 设置 icon
  'icon': iconURL,
  'browserWindow': {
    'width': 380,
    'height': 420,
    'transparent': true,
    'skipTaskbar': true,
    'resizable': process.env.NODE_ENV === 'development',
    'webPreferences': {
      'nodeIntegration': true,
      'enableRemoteModule': true
    }
  }
})

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
        monsole.log('修改成功，当前开机自启状态: ', app.getLoginItemSettings().openAtLogin)
        return
      }
      monsole.log('重试再次开启....', app.getLoginItemSettings().openAtLogin)
      launch.enable()
      monsole.log('修改成功，当前开机自启状态: ', app.getLoginItemSettings().openAtLogin)
    }).catch((err) => {
      monsole.log(err)
    })
  } else { // 取消开机自启
    launch.disable()
    launch.isEnabled().then((isEnabled) => {
      if (!isEnabled) {
        monsole.log('修改成功，当前开机自启状态: ', app.getLoginItemSettings().openAtLogin)
        return
      }
      monsole.log('重试再次关闭....', app.getLoginItemSettings().openAtLogin)
      launch.disable()
      monsole.log('修改成功，当前开机自启状态: ', app.getLoginItemSettings().openAtLogin)
    }).catch((err) => {
      monsole.log(err)
    })
  }
}

// 检测是否需要更新自启配置
function checkAutoLaunch () {
  let curLaunchConfig = app.getLoginItemSettings().openAtLogin
  let fileLaunchConfig = storage.getItem('auto-launch')
  if (fileLaunchConfig === undefined) {
    storage.setItem('auto-launch', false)
    fileLaunchConfig = false
  }

  // 当前配置与开机配置不一致时，进行修改
  monsole.log('缓存配置：', JSON.stringify(storage.getAll()))
  monsole.log('当前自启配置：', curLaunchConfig, ' 缓存配置：', fileLaunchConfig)
  if (curLaunchConfig !== fileLaunchConfig) {
    updateAutoLaunch(fileLaunchConfig)
  }
}

var settingWin, completeWin
// 设置窗口
function openSettingWindow () {
  settingWin = new BrowserWindow({
    title: 'Prefrence',
    height: 400,
    width: 600,
    x: 100,
    y: 100,
    useContentSize: true,
    skipTaskbar: true,
    resizable: process.env.NODE_ENV === 'development',
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true
    }
  })

  settingWin.loadURL(winURL + '#/setting').then(() => {
    // win.setTitle('Prefrence')
    // win.webContents.openDevTools({ mode: 'detach' })
  })
  settingWin.on('closed', () => {
    settingWin = null
    // 监测到窗口关闭时，再次检测
    checkAutoLaunch()
  })
}

// 完成窗口
function openCompleteWindow () {
  completeWin = new BrowserWindow({
    title: 'TimeManager',
    height: 450,
    width: 300,
    x: 520,
    y: 180,
    useContentSize: true,
    resizable: process.env.NODE_ENV === 'development',
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true
    }
  })

  completeWin.loadURL(winURL + '#/complete').then(() => {
  })
  completeWin.on('closed', () => {
    completeWin = null
  })
}

// 启动程序时检测一遍
checkAutoLaunch()

mb.on('after-show', function create () {
  mb.app.dock.hide()
  monsole.log('after-show')
})

const checkForUpdate = function () {
  autoUpdater.checkForUpdatesAndNotify()
  monsole.log('当前版本: ', mb.app.getVersion())

  // 更新错误
  autoUpdater.on('error', function (err) {
    monsole.log('[version] 更新出错: ' + err)
  })
  // 检查事件
  autoUpdater.on('checking-for-update', function () {
    monsole.log('[version] 正在检查更新...')
  })
  // 发现新版本
  autoUpdater.on('update-available', function () {
    monsole.log('[version] 发现新版本...')
  })
  let rate = 0
  // 更新下载进度事件
  autoUpdater.on('download-progress', function (progressObj) {
    if (Number(progressObj.percent) > rate) {
      let speed = Number(progressObj.bytesPerSecond) / 1024
      let message = '[version] speed: ' + speed.toFixed(2) + ' kb/s'
      message += ' - ' + Number(progressObj.percent).toFixed(2) + '%'
      message += ' (' + Number(progressObj.transferred / 1024).toFixed(2) + '/' + Number(progressObj.total / 1024).toFixed(2) + ')'
      let minus = (progressObj.total - progressObj.transferred) / speed / 1000
      if (minus > 60) {
        message += ' - 剩余时间: ' + Number(minus / 60).toFixed(2) + ' min'
      } else {
        message += ' - 剩余时间: ' + Number(minus).toFixed(2) + ' s'
      }
      monsole.log(message)
      rate += 0.1
    }
  })

  // 下载完毕
  autoUpdater.on('update-downloaded', function () {
    monsole.log('Update downloaded')
    mb.window.webContents.send('new-version')
    // 退出并进行安装（这里可以做成让用户确认后再调用）
    ipcMain.on('quitAndInstall', () => {
      monsole.log('立即退出并重新安装')
      autoUpdater.quitAndInstall()
    })
  })
}

mb.on('ready', function ready () {
  mb.showWindow()
  monsole.log('app is ready')
  // openCompleteWindow()
  monsole.log('当前自动更新配置: ', storage.getItem('auto-update'))
  if (storage.getItem('auto-update') === true) {
    checkForUpdate()
  }
})

// 开启配置选项
ipcMain.on('setting', () => {
  openSettingWindow()
})

// 开启完成番茄钟后的调整界面
ipcMain.on('complete', () => {
  openCompleteWindow()
})

// 放弃番茄钟，关闭
ipcMain.on('complete-close', () => {
  completeWin.close()
})

// // 刷新时钟界面
// ipcMain.on('reload-clock', () => {
//   mb.window.reload()
// })

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
