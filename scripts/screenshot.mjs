import { chromium } from 'playwright';

const OUTPUT = 'docs/screenshots';
const URL = 'http://localhost:4173';

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 800, height: 600 } });
const page = await context.newPage();

// Screenshot 1: Main Menu
console.log('Navigating to', URL);
try {
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(2000);
  const title = await page.title();
  console.log('Page title:', title);
  await page.screenshot({ path: `${OUTPUT}/01-main-menu.png`, fullPage: false });
  console.log('✅ Screenshot: Main Menu');
} catch (e) {
  console.error('❌ Main menu failed:', e.message);
}

// Screenshot 2: Click "开始游戏"
try {
  const startBtn = page.locator('button', { hasText: '开始游戏' });
  const count = await startBtn.count();
  console.log('Start button count:', count);
  if (count > 0) {
    await startBtn.click();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: `${OUTPUT}/02-game-canvas.png`, fullPage: false });
    console.log('✅ Screenshot: Game Canvas');
  }
} catch (e) {
  console.error('❌ Game canvas failed:', e.message);
}

// Screenshot 3: DevTools
try {
  const devBtn = page.locator('.dev-tools-toggle');
  if (await devBtn.isVisible()) {
    await devBtn.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${OUTPUT}/03-devtools.png`, fullPage: false });
    console.log('✅ Screenshot: DevTools');
  }
} catch (e) {
  console.error('❌ DevTools failed:', e.message);
}

// Screenshot 4: Settings (navigate back to menu)
try {
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 10000 });
  await page.waitForTimeout(2000);
  const settingsBtn = page.locator('button', { hasText: '游戏设置' });
  if (await settingsBtn.count() > 0) {
    await settingsBtn.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${OUTPUT}/04-settings.png`, fullPage: false });
    console.log('✅ Screenshot: Settings');
  }
} catch (e) {
  console.error('❌ Settings failed:', e.message);
}

await browser.close();

const { readdirSync: fsRead } = await import('node:fs');
const files = fsRead(OUTPUT);
console.log('\n📸 Screenshots saved to docs/screenshots/:');
files.forEach(f => console.log(' -', f));
