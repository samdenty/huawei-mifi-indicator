const {app, Tray, Menu, BrowserWindow, window, shell, ipcMain} = require('electron');
const path = require('path');
const url = require('url');

let iconPath = path.join(__dirname, 'icons/loading.ico');
let appIcon = null;
let win = null;
function createWindow () {
  win = new BrowserWindow({width: 800, height: 600})
  win.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))
  win.webContents.openDevTools()

}
app.on('ready', function(){
  ipcMain.on('changeIcon', (event, signal, battery, users, networkType) => {
    var state = signal+battery+users+networkType
    var oldState = state
    let iconPath = path.join(__dirname, 'icons/'+signal+'.ico');
    if (users == 1)  {var usersMsg = users+' user connected'} else {var usersMsg = users+' users connected'}
    appIcon.setToolTip(networkType+' - '+usersMsg+' ('+battery+'%)')
    appIcon.setImage(iconPath);
    var contextMenu = Menu.buildFromTemplate([
        {
          label: 'Connected to '+networkType+' network',
          click: function() {
            shell.openExternal("http://192.168.1.1/html/mobilenetworksettings.html")
          }
        },
        {
          label: usersMsg,
          click: function() {
            shell.openExternal("http://192.168.1.1/html/statistic.html")
          }
        },
        {
          label: battery+'% battery remaining',
          click: function() {
            shell.openExternal("http://192.168.1.1/")
          }
        },
        { label: 'Exit',
          click: function() {
            app.quit()
          }
        }
      ]);
    appIcon.setContextMenu(contextMenu);
  })
  createWindow();
  win = new BrowserWindow({show: false});
  appIcon = new Tray(iconPath);
  var contextMenu = Menu.buildFromTemplate([
    {
      label: 'Connecting...',
    },
    { label: 'Exit',
      click: function() {
        app.quit()
      }
    }
  ]);
  appIcon.setToolTip('Connecting to Huawei MiFi...');
  appIcon.setContextMenu(contextMenu);
});