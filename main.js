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
      if (line.startsWith('#') || line === '') {
        continue;
      }
      if (line.startsWith('[') && line.endsWith(']')) {
        continue;
      }
      if (line.includes('=')) {
        let [key, value] = line.split('=').map((s) => s.trim());

        if (value.includes('#')) {
          value = value.split('#')[0].trim();
        }

        if (
          key === 'half_life' ||
          key === 'Tmax' ||
          key === 'Cmax' ||
          key === 'ka' ||
          key === 'volume_of_distribution'
        ) {
          const parts = value.split(' ');
          const numValue = parseFloat(parts[0].toLowerCase() === 'nan' ? NaN : parts[0]);
          const unit = parts[1] || '';
          compound[key] = isNaN(numValue) ? null : numValue;
          compound[`${key}_unit`] = unit;
        } else if (key.startsWith('bioavailability')) {
          const numValue = parseFloat(value.toLowerCase() === 'nan' ? NaN : value);
          compound[key] = isNaN(numValue) ? null : numValue;
        } else if (key === 'topical base (used in cream)') {
          compound['topical_base'] = value;
        } else {
          if (
            key === 'therapeutic_use' ||
            key === 'chemical_structure' ||
            key === 'mechanism_of_action'
          ) {
            compound[key] = value;
          } else {
            compound[key] = value;
          }
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
  if (compoundData.therapeutic_use) content += `therapeutic_use = ${compoundData.therapeutic_use}\n`;
  if (compoundData.chemical_structure) content += `chemical_structure = ${compoundData.chemical_structure}\n`;
  if (compoundData.mechanism_of_action) content += `mechanism_of_action = ${compoundData.mechanism_of_action}\n`;
  if (compoundData.halfLife !== undefined && compoundData.halfLifeUnit) {
    const halfLifeValue = isNaN(compoundData.halfLife) ? 'nan' : compoundData.halfLife;
    content += `half_life = ${halfLifeValue} ${compoundData.halfLifeUnit}\n`;
  }
  if (compoundData.ka !== undefined) {
    const kaValue = isNaN(compoundData.ka) ? 'nan' : compoundData.ka;
    content += `ka = ${kaValue} 1/h\n`;
  }
  if (compoundData.volume_of_distribution !== undefined) {
    const vdValue = isNaN(compoundData.volume_of_distribution) ? 'nan' : compoundData.volume_of_distribution;
    content += `volume_of_distribution = ${vdValue} L\n`;
  }
  if (compoundData.Cmax !== undefined) {
    const CmaxValue = isNaN(compoundData.Cmax) ? 'nan' : compoundData.Cmax;
    content += `Cmax = ${CmaxValue} ng/ml\n`;
  }
  if (compoundData.Tmax !== undefined && compoundData.TmaxUnit) {
    const TmaxValue = isNaN(compoundData.Tmax) ? 'nan' : compoundData.Tmax;
    content += `Tmax = ${TmaxValue} ${compoundData.TmaxUnit}\n`;
  }
  // Handle bioavailability fields
  if (compoundData.bioavailability_oral !== undefined) {
    const bioavailabilityValue = isNaN(compoundData.bioavailability_oral) ? 'nan' : compoundData.bioavailability_oral;
    content += `bioavailability_oral = ${bioavailabilityValue}\n`;
  }
  // Handle route-specific bioavailability fields
  const routes = ['iv', 'im', 'subcutaneous', 'inhalation', 'cream'];
  for (const route of routes) {
    const key = `bioavailability_${route}`;
    if (compoundData[key] !== undefined) {
      const value = isNaN(compoundData[key]) ? 'nan' : compoundData[key];
      content += `${key} = ${value}\n`;
    }
  }
  if (compoundData['topical_base']) {
    content += `topical base (used in cream) = ${compoundData['topical_base']}\n`;
  }
  if (compoundData.model) content += `model = ${compoundData.model}\n`;
  if (compoundData.notes) content += `sources_notes = ${compoundData.notes}\n`;
  return content;
}
