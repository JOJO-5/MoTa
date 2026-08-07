const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, '..', 'Magictower2014', '魔塔2014', 'project');
const outputDir = path.join(__dirname, '..', 'content', 'mota-2014');

function extractAnyObject(code) {
  const patterns = [
    /var\s+\w+\s*=\s*(\{[\s\S]*?\n\})\s*;?\s*$/m,
    /=\s*(\{[\s\S]*?\n\})\s*;?\s*$/m,
  ];

  for (const pattern of patterns) {
    let depth = 0;
    let start = -1;
    let inString = false;
    let escaped = false;

    for (let i = 0; i < code.length; i++) {
      const c = code[i];

      if (escaped) {
        escaped = false;
        continue;
      }

      if (c === '\\') {
        escaped = true;
        continue;
      }

      if (c === '"' || c === "'") {
        inString = !inString;
        continue;
      }

      if (inString) continue;

      if (c === '{') {
        if (start === -1) start = i;
        depth++;
      } else if (c === '}') {
        depth--;
        if (depth === 0 && start !== -1) {
          const objStr = code.substring(start, i + 1);
          try {
            const result = eval(`(${objStr})`);
            return result;
          } catch (e) {
            console.error('Parse error:', e.message);
            return null;
          }
        }
      }
    }
  }
  return null;
}

function extractFloorObject(code, floorId) {
  const pattern = new RegExp(`main\\.floors\\.${floorId}\\s*=\\s*`, 'm');
  const match = code.search(pattern);

  if (match !== -1) {
    let depth = 0;
    let start = -1;
    let inString = false;
    let escaped = false;

    for (let i = match; i < code.length; i++) {
      const c = code[i];

      if (escaped) {
        escaped = false;
        continue;
      }

      if (c === '\\') {
        escaped = true;
        continue;
      }

      if (c === '"' || c === "'") {
        inString = !inString;
        continue;
      }

      if (inString) continue;

      if (c === '{') {
        if (start === -1) start = i;
        depth++;
      } else if (c === '}') {
        depth--;
        if (depth === 0 && start !== -1) {
          const objStr = code.substring(start, i + 1);
          try {
            const result = eval(`(${objStr})`);
            return result;
          } catch (e) {
            console.error(`Error parsing floor ${floorId}:`, e.message);
            return null;
          }
        }
      }
    }
  }
  return null;
}

function importFile(filename, outputName, transform) {
  const srcPath = path.join(sourceDir, filename);
  if (!fs.existsSync(srcPath)) {
    console.log(`Skipping ${filename} - not found`);
    return null;
  }
  const code = fs.readFileSync(srcPath, 'utf-8');
  let data = extractAnyObject(code);
  if (data && transform) {
    data = transform(data);
  }
  if (data) {
    fs.writeFileSync(path.join(outputDir, outputName), JSON.stringify(data, null, 2));
    console.log(`Created ${outputName}`);
    return data;
  } else {
    console.log(`Failed to parse ${filename}`);
  }
  return null;
}

function importFloor(floorId) {
  const floorFile = path.join(sourceDir, 'floors', `${floorId}.js`);
  if (!fs.existsSync(floorFile)) {
    console.log(`Floor file not found: ${floorId}.js`);
    return null;
  }
  const code = fs.readFileSync(floorFile, 'utf-8');
  const floorData = extractFloorObject(code, floorId);
  if (floorData) {
    const outPath = path.join(outputDir, 'floors', `${floorId}.json`);
    fs.writeFileSync(outPath, JSON.stringify(floorData, null, 2));
    console.log(`Created floors/${floorId}.json`);
    return floorData;
  } else {
    console.log(`Failed to parse floor ${floorId}`);
  }
  return null;
}

const targetFloors = [];
for (let i = 0; i <= 20; i++) {
  targetFloors.push(`MT${i}`);
}

fs.mkdirSync(path.join(outputDir, 'floors'), { recursive: true });

console.log('Importing Magictower2014 MT0-MT20...\n');

const data = importFile('data.js', 'data.json', (d) => {
  if (d && d.main) {
    const main = d.main;
    main.floorIds = main.floorIds.filter(id => id.startsWith('MT') && id.match(/^MT\d+$/));
    const nums = main.floorIds.map(id => parseInt(id.replace('MT', ''))).filter(n => n <= 20);
    nums.sort((a, b) => a - b);
    main.floorIds = nums.map(n => `MT${n}`);
    return main;
  }
  return d;
});

importFile('enemys.js', 'enemys.json');
importFile('maps.js', 'maps.json');
importFile('items.js', 'items.json');

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
fs.writeFileSync(path.join(outputDir, '_meta.json'), JSON.stringify(meta, null, 2));
console.log('\nCreated _meta.json');

console.log('\nDone!');
