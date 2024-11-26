// main.js

const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');
const fs = require('fs');

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
  mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));

  // Open the DevTools (optional)
  // mainWindow.webContents.openDevTools();

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

  // Ensure local_library directory exists in the root of the project
  const libraryPath = path.join(__dirname, 'local_library');

  if (!fs.existsSync(libraryPath)) {
    fs.mkdirSync(libraryPath);
  }

  // IPC handlers
  ipcMain.handle('get-compounds', async () => {
    try {
      const compounds = [];
      const files = fs.readdirSync(libraryPath);
      for (const file of files) {
        if (path.extname(file) === '.cmpd') {
          // Only process .cmpd files
          const filePath = path.join(libraryPath, file);
          const content = fs.readFileSync(filePath, 'utf-8');
          const compound = parseCompoundFile(content);
          if (compound) {
            compounds.push(compound);
          }
        }
      }
      return compounds;
    } catch (error) {
      console.error('Error reading compounds:', error);
      return [];
    }
  });

  ipcMain.handle('add-compound', async (event, compoundData) => {
    try {
      // Generate a filename based on the compound name
      const fileName = `${compoundData.name.replace(/[<>:"/\\|?*]+/g, '_')}.cmpd`;
      const filePath = path.join(libraryPath, fileName);

      // Convert compoundData to the compound file format
      const fileContent = generateCompoundFileContent(compoundData);

      fs.writeFileSync(filePath, fileContent, 'utf-8');

      return true;
    } catch (error) {
      console.error('Error saving compound:', error);
      return false;
    }
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

// Helper functions
function parseCompoundFile(content) {
  try {
    const lines = content.split(/\r?\n/);
    const compound = {};
    for (let line of lines) {
      line = line.trim();
      if (line.startsWith('[') && line.endsWith(']')) {
        // Skip section headers like [Compound]
        continue;
      }
      if (line.includes('=')) {
        let [key, value] = line.split('=').map((s) => s.trim());
        // Handle units in value
        if (key === 'half_life' || key === 'Tmax' || key === 'Cmax') {
          const parts = value.split(' ');
          const numValue = parseFloat(parts[0].toLowerCase() === 'nan' ? NaN : parts[0]);
          const unit = parts[1] || '';
          compound[key] = isNaN(numValue) ? null : numValue;
          compound[`${key}_unit`] = unit;
        } else if (key === 'bioavailability') {
          const numValue = parseFloat(value.toLowerCase() === 'nan' ? NaN : value);
          compound[key] = isNaN(numValue) ? null : numValue;
        } else {
          compound[key] = value;
        }
      }
    }
    return compound;
  } catch (error) {
    console.error('Error parsing compound file:', error);
    return null;
  }
}

function generateCompoundFileContent(compoundData) {
  let content = '[Compound]\n';
  if (compoundData.name) content += `name = ${compoundData.name}\n`;
  if (compoundData.type) content += `type = ${compoundData.type}\n`;
  if (compoundData.category) content += `category = ${compoundData.category}\n`;
  if (compoundData.halfLife !== undefined && compoundData.halfLifeUnit) {
    const halfLifeValue = isNaN(compoundData.halfLife) ? 'nan' : compoundData.halfLife;
    content += `half_life = ${halfLifeValue} ${compoundData.halfLifeUnit}\n`;
  }
  if (compoundData.Cmax !== undefined) {
    const CmaxValue = isNaN(compoundData.Cmax) ? 'nan' : compoundData.Cmax;
    content += `Cmax = ${CmaxValue} ng/ml\n`;
  }
  if (compoundData.Tmax !== undefined && compoundData.TmaxUnit) {
    const TmaxValue = isNaN(compoundData.Tmax) ? 'nan' : compoundData.Tmax;
    content += `Tmax = ${TmaxValue} ${compoundData.TmaxUnit}\n`;
  }
  if (compoundData.bioavailability !== undefined) {
    const bioavailabilityValue = isNaN(compoundData.bioavailability) ? 'nan' : compoundData.bioavailability;
    content += `bioavailability = ${bioavailabilityValue}\n`;
  }
  if (compoundData.model) content += `model = ${compoundData.model}\n`;
  if (compoundData.notes) content += `sources_notes = ${compoundData.notes}\n`;
  return content;
}
