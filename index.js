const { app, BrowserWindow, ipcMain } = require('electron')

let { menubar } = require('menubar');

let mb = menubar({
  // 设置 icon
  'icon': 'static/icon/logo.png'
});
// mb.setOption()

mb.on('ready', function ready() {
  console.log('app is ready');
});
