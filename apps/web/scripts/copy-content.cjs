const fs = require('fs');
const path = require('path');

const src = path.resolve(__dirname, '../../../content/mota-2014');
const dest = path.resolve(__dirname, '../public/content/mota-2014');

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

if (fs.existsSync(src)) {
  copyDir(src, dest);
  console.log('[copy-content] Copied content/mota-2014 -> public/content/mota-2014');
} else {
  console.warn('[copy-content] Warning: content/mota-2014 not found, skipping');
}
