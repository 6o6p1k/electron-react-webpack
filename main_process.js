
const { app, BrowserWindow } = require('electron');
const path = require('path');
require('electron-reload')(__dirname, 'src');



let win;

function createWindow () {

    win = new BrowserWindow({
        width: 1380,
        height: 600,
        webPreferences: {
            nodeIntegration: true
        }
    });

    win.loadFile('public/build/index.html');

    win.webContents.openDevTools();

    win.on('closed', () => {win = null})
}

app.on('ready', createWindow);


app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

app.on('activate', () => {
    if (win === null) {
        createWindow()
    }
});
