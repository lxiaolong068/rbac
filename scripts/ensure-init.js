const fs = require('fs');
const path = require('path');

const INIT_FILE = '.init';
const initFilePath = path.join(process.cwd(), INIT_FILE);

try {
  if (!fs.existsSync(initFilePath)) {
    fs.writeFileSync(initFilePath, '');
    console.log('Created .init file successfully');
  } else {
    console.log('.init file already exists');
  }
} catch (error) {
  console.error('Error creating .init file:', error);
  process.exit(1);
} 