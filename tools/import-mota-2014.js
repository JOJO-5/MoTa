const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const sourceDir = path.join(__dirname, '..', 'Magictower2014', '魔塔2014', 'project');
const outputDir = path.join(__dirname, '..', 'content', 'mota-2014');

function readFileWithEncoding(filePath) {
  const buffer = fs.readFileSync(filePath);
  if (buffer[0] === 0xEF && buffer[1] === 0xBB && buffer[2] === 0xBF) {
    return buffer.toString('utf8');
  }
  const utf8Buffer = Buffer.from(buffer.toString('latin1'), 'latin1');
  return utf8Buffer.toString('utf8');
}

function extractDataFromJS(code) {
  const varPattern = /var\s+\w+\s*=\s*/;
  const match = code.match(varPattern);
  if (!match) return null;

  const startIndex = match.index + match[0].length;
  const objStr = code.substring(startIndex).trim();

  try {
    return new Function('return ' + objStr)();
  } catch (e) {
    console.error('Parse error:', e.message);
    return null;
  }
}

function extractFloorFromJS(code, floorId) {
  const pattern = new RegExp('main\\.floors\\.' + floorId + '\\s*=\\s*');
  const match = code.search(pattern);
  if (match === -1) return null;

  const startIndex = code.indexOf('{', match);
  let depth = 0;
  let endIndex = -1;

  for (let i = startIndex; i < code.length; i++) {
    const c = code[i];
    if (c === '{') depth++;
    else if (c === '}') {
      depth--;
      if (depth === 0) {
        endIndex = i;
        break;
      }
    }
  }

  if (endIndex === -1) return null;

  const objStr = code.substring(startIndex, endIndex + 1);
  try {
    return new Function('return ' + objStr)();
  } catch (e) {
    console.error('Error parsing floor ' + floorId + ':', e.message);
    return null;
  }
}

function cleanObject(obj) {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(cleanObject);
  }

  const cleaned = {};
  for (const key of Object.keys(obj)) {
    const value = cleanObject(obj[key]);
    if (value !== undefined) {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

function importDataFile(filename, outputName, transform) {
  const srcPath = path.join(sourceDir, filename);
  if (!fs.existsSync(srcPath)) {
    console.log('Skipping ' + filename + ' - not found');
    return null;
  }

  const code = readFileWithEncoding(srcPath);
  let data = extractDataFromJS(code);

  if (data && transform) {
    data = transform(data);
  }

  if (data) {
    const cleaned = cleanObject(data);
    const outPath = path.join(outputDir, outputName);
    fs.writeFileSync(outPath, JSON.stringify(cleaned, null, 2), 'utf8');
    console.log('Created ' + outputName);
    return data;
  }
  return null;
}

function importFloor(floorId) {
  const floorFile = path.join(sourceDir, 'floors', floorId + '.js');
  if (!fs.existsSync(floorFile)) {
    console.log('Floor file not found: ' + floorId + '.js');
    return null;
  }

  const code = readFileWithEncoding(floorFile);
  const floorData = extractFloorFromJS(code, floorId);

  if (floorData) {
    const cleaned = cleanObject(floorData);
    const outPath = path.join(outputDir, 'floors', floorId + '.json');
    fs.writeFileSync(outPath, JSON.stringify(cleaned, null, 2), 'utf8');
    console.log('Created floors/' + floorId + '.json');
    return floorData;
  }
  return null;
}

const targetFloors = [];
for (let i = 0; i <= 20; i++) {
  targetFloors.push('MT' + i);
}

fs.mkdirSync(path.join(outputDir, 'floors'), { recursive: true });

console.log('Importing Magictower2014 MT0-MT20...\n');

const data = importDataFile('data.js', 'data.json', function(d) {
  if (d && d.main) {
    const main = d.main;
    if (main.floorIds) {
      main.floorIds = main.floorIds.filter(function(id) {
        return id.match(/^MT\d+$/) && parseInt(id.replace('MT', '')) <= 20;
      });
      main.floorIds.sort(function(a, b) {
        return parseInt(a.replace('MT', '')) - parseInt(b.replace('MT', ''));
      });
    }
    return main;
  }
  return d;
});

importDataFile('enemys.js', 'enemys.json');
importDataFile('maps.js', 'maps.json');
importDataFile('items.js', 'items.json');

console.log('\nImporting floors:');
for (const floorId of targetFloors) {
  importFloor(floorId);
}

const meta = {
  id: 'mota-2014',
  version: '1.0.0',
  source: 'Magictower2014',
  importedAt: new Date().toISOString(),
  note: 'First 21 floors (MT0-MT20) imported from Magictower2014'
};
const metaPath = path.join(outputDir, '_meta.json');
fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2), 'utf8');
console.log('\nCreated _meta.json');

console.log('\nDone!');
