// main.js

const { app, BrowserWindow, ipcMain, Menu } = require('electron'); // Added Menu
const path = require('path');
const url = require('url');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Load the index.html from the dist directory
  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, 'dist', 'index.html'),
      protocol: 'file:',
      slashes: true,
    })
  );

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  // Define the application menu
  const menuTemplate = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Protocol',
          accelerator: 'CmdOrCtrl+N',
          click() {
            mainWindow.webContents.send('new-protocol');
          },
        },
        { role: 'quit' },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        {
          label: 'Properties',
          click() {
            mainWindow.webContents.send('open-properties');
          },
        },
      ],
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Adjust Graph Scales',
          click() {
            mainWindow.webContents.send('open-scale-adjustment');
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

  // Handle IPC events if needed
  ipcMain.on('open-add-compound', () => {
    mainWindow.webContents.send('open-add-compound-modal');
  });

  ipcMain.on('compound-added', (event, compoundName) => {
    mainWindow.webContents.send('compound-added', compoundName);
  });

  ipcMain.on('compound-removed', (event, compoundName) => {
    mainWindow.webContents.send('compound-removed', compoundName);
  });

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
  if (mainWindow === null) createWindow();
});
