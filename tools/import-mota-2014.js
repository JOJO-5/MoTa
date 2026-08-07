const fs = require('fs');
const path = require('path');
const acorn = require('acorn');

const sourceDir = path.join(__dirname, '..', 'Magictower2014', '魔塔2014', 'project');
const outputDir = path.join(__dirname, '..', 'content', 'mota-2014');

function evaluate(code) {
  try {
    return new Function(`return (${code})`)();
  } catch {
    return undefined;
  }
}

function generateCode(node) {
  if (node.type === 'ObjectExpression') {
    const pairs = (node.properties || [])
      .filter(p => p.type === 'Property')
      .map(prop => {
        const key = prop.computed
          ? `[${generateCode(prop.key)}]`
          : prop.key.name || prop.key.value || JSON.stringify(prop.key);
        const val = generateCode(prop.value);
        return `${key}: ${val}`;
      });
    return `{ ${pairs.join(', ')} }`;
  }
  if (node.type === 'ArrayExpression') {
    return `[${(node.elements || []).map(el => el ? generateCode(el) : '').join(', ')}]`;
  }
  if (node.type === 'Literal') return JSON.stringify(node.value);
  if (node.type === 'Identifier') return node.name;
  if (node.type === 'MemberExpression') {
    return `${generateCode(node.object)}.${node.property.name || generateCode(node.property)}`;
  }
  if (node.type === 'ConditionalExpression') {
    return `${generateCode(node.test)} ? ${generateCode(node.consequent)} : ${generateCode(node.alternate)}`;
  }
  return 'null';
}

function findTopLevelAssignments(code, names) {
  const result = new Map();
  try {
    const ast = acorn.parse(code, { ecmaVersion: 'latest', sourceType: 'module' });
    for (const node of ast.body) {
      if (node.type === 'VariableDeclaration') {
        for (const decl of node.declarations) {
          if (decl.id?.type === 'Identifier') {
            const name = decl.id.name;
            if (names.includes(name) && decl.init) {
              const value = evaluate(generateCode(decl.init));
              if (value !== undefined) {
                result.set(name, value);
              }
            }
          }
        }
      }
      if (node.type === 'ExpressionStatement') {
        const expr = node.expression;
        if (expr?.type === 'AssignmentExpression' && expr.left?.type === 'MemberExpression') {
          const objName = expr.left.object?.name;
          const propName = expr.left.property?.name;
          if (objName && propName && names.includes(objName)) {
            const value = evaluate(generateCode(expr.right));
            if (value !== undefined) {
              result.set(propName, value);
            }
          }
        }
      }
    }
  } catch (e) {
    console.error('Parse error:', e.message);
  }
  return result;
}

function extractDataObjects(code) {
  return findTopLevelAssignments(code, ['data', 'enemys', 'maps', 'items', 'events']);
}

function extractFloorObjects(code) {
  const mainObj = findTopLevelAssignments(code, ['main']);
  const main = mainObj.get('main');
  const floors = main?.floors || {};
  const result = new Map();
  for (const [key, value] of Object.entries(floors)) {
    result.set(key, value);
  }
  return result;
}

function importDataFile(filename, outputName) {
  const srcPath = path.join(sourceDir, filename);
  if (!fs.existsSync(srcPath)) {
    console.log(`Skipping ${filename} - not found`);
    return;
  }
  const code = fs.readFileSync(srcPath, 'utf-8');
  const objs = extractDataObjects(code);
  const outData = {};
  for (const [key, value] of objs) {
    outData[key] = value;
  }
  fs.writeFileSync(path.join(outputDir, outputName), JSON.stringify(outData, null, 2));
  console.log(`Created ${outputName}`);
}

function importFloors(floorIds) {
  const floorsDir = path.join(sourceDir, 'floors');
  const outputFloorsDir = path.join(outputDir, 'floors');

  if (!fs.existsSync(floorsDir)) {
    console.log('floors dir not found');
    return;
  }

  for (const floorId of floorIds) {
    const floorFile = path.join(floorsDir, `${floorId}.js`);
    if (!fs.existsSync(floorFile)) {
      console.log(`Floor file not found: ${floorId}.js`);
      continue;
    }
    const code = fs.readFileSync(floorFile, 'utf-8');
    const objs = extractFloorObjects(code);
    for (const [id, floorData] of objs) {
      const outPath = path.join(outputFloorsDir, `${id}.json`);
      fs.writeFileSync(outPath, JSON.stringify(floorData, null, 2));
      console.log(`Created floors/${id}.json`);
    }
  }
}

const targetFloors = [];
for (let i = 0; i <= 20; i++) {
  targetFloors.push(`MT${i}`);
}

fs.mkdirSync(path.join(outputDir, 'floors'), { recursive: true });

importDataFile('data.js', 'data.json');
importDataFile('enemys.js', 'enemys.json');
importDataFile('maps.js', 'maps.json');
importDataFile('items.js', 'items.json');

importFloors(targetFloors);

const meta = {
  id: 'mota-2014',
  version: '1.0.0',
  source: 'Magictower2014',
  importedAt: new Date().toISOString(),
  note: 'First 21 floors (MT0-MT20) imported from Magictower2014'
};
fs.writeFileSync(path.join(outputDir, '_meta.json'), JSON.stringify(meta, null, 2));
console.log('Created _meta.json');

console.log('\nDone!');
