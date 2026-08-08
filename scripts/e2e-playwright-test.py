"""
E2E test for Magic Tower game using Playwright.
Tests: page load, start game, hero movement, rendering.
"""
import asyncio
import http.server
import os
import socketserver
import threading
import json
from playwright.async_api import async_playwright

DIST_DIR = os.path.join(os.path.dirname(__file__), '..', 'apps', 'web', 'dist-test9')
SCREENSHOT_DIR = os.path.join(os.path.dirname(__file__), '..', 'docs', 'screenshots')
os.makedirs(SCREENSHOT_DIR, exist_ok=True)

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIST_DIR, **kwargs)
    def log_message(self, *args):
        pass  # Suppress logs

def start_server():
    server = socketserver.TCPServer(("127.0.0.1", 8444), Handler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    return server

async def main():
    server = start_server()
    print(f"Server started on http://127.0.0.1:8444")

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True, args=['--no-sandbox', '--disable-gpu'])
        page = await browser.new_page(viewport={'width': 1280, 'height': 800})

        # Collect console logs
        console_logs = []
        page.on('console', lambda msg: console_logs.append(f"[{msg.type}] {msg.text}"))

        print("Navigating to page...")
        await page.goto('http://127.0.0.1:8444/', wait_until='networkidle', timeout=30000)

        # Wait for start button
        print("Waiting for start button...")
        try:
            btn = await page.wait_for_selector('button:has-text("开始")', timeout=10000)
            print(f"Found button: {await btn.text_content()}")
        except Exception as e:
            print(f"Button not found: {e}")
            # Take screenshot of current state
            await page.screenshot(path=os.path.join(SCREENSHOT_DIR, 'e2e-00-no-button.png'))
            print("Console logs so far:")
            for log in console_logs[-20:]:
                print(f"  {log}")
            await browser.close()
            server.shutdown()
            return

        # Click start button
        print("Clicking start button...")
        await btn.click()

        # Wait for game scene to be ready
        print("Waiting for GameScene...")
        try:
            await page.wait_for_function("window.__gameScene != null", timeout=15000)
            print("GameScene is ready!")
        except Exception as e:
            print(f"GameScene not ready: {e}")
            print("Console logs:")
            for log in console_logs[-30:]:
                print(f"  {log}")

        # Wait a bit for floor to render
        await asyncio.sleep(2)

        # Get hero position
        hero_pos = await page.evaluate("""() => {
            const scene = window.__gameScene;
            if (!scene || !scene.heroSprite) return null;
            const c = scene.heroSprite.container;
            return { x: Math.round(c.x / 32), y: Math.round(c.y / 32) };
        }""")
        print(f"Initial hero position: {hero_pos}")

        # Take screenshot before movement
        await page.screenshot(path=os.path.join(SCREENSHOT_DIR, 'e2e-01-before-move.png'))
        print("Screenshot 1 saved: e2e-01-before-move.png")

        # Try moving down 3 times via tryMove
        for i in range(3):
            await page.evaluate("window.__gameScene.tryMove('down')")
            await asyncio.sleep(0.5)
            pos = await page.evaluate("""() => {
                const s = window.__gameScene;
                if (!s || !s.heroSprite) return null;
                const c = s.heroSprite.container;
                return { x: Math.round(c.x / 32), y: Math.round(c.y / 32) };
            }""")
            print(f"  After move down #{i+1}: hero at {pos}")

        # Try moving right 2 times
        for i in range(2):
            await page.evaluate("window.__gameScene.tryMove('right')")
            await asyncio.sleep(0.5)
            pos = await page.evaluate("""() => {
                const s = window.__gameScene;
                if (!s || !s.heroSprite) return null;
                const c = s.heroSprite.container;
                return { x: Math.round(c.x / 32), y: Math.round(c.y / 32) };
            }""")
            print(f"  After move right #{i+1}: hero at {pos}")

        # Take screenshot after movement
        await page.screenshot(path=os.path.join(SCREENSHOT_DIR, 'e2e-02-after-move.png'))
        print("Screenshot 2 saved: e2e-02-after-move.png")

        # Also try keyboard input (arrow keys)
        print("\nTesting keyboard input (ArrowDown)...")
        await page.keyboard.press('ArrowDown')
        await asyncio.sleep(0.5)
        pos = await page.evaluate("""() => {
            const s = window.__gameScene;
            if (!s || !s.heroSprite) return null;
            const c = s.heroSprite.container;
            return { x: Math.round(c.x / 32), y: Math.round(c.y / 32) };
        }""")
        print(f"  After ArrowDown: hero at {pos}")

        await page.keyboard.press('ArrowRight')
        await asyncio.sleep(0.5)
        pos = await page.evaluate("""() => {
            const s = window.__gameScene;
            if (!s || !s.heroSprite) return null;
            const c = s.heroSprite.container;
            return { x: Math.round(c.x / 32), y: Math.round(c.y / 32) };
        }""")
        print(f"  After ArrowRight: hero at {pos}")

        # Final screenshot
        await page.screenshot(path=os.path.join(SCREENSHOT_DIR, 'e2e-03-after-keyboard.png'))
        print("Screenshot 3 saved: e2e-03-after-keyboard.png")

        # Print relevant console logs
        print("\n=== Relevant Console Logs ===")
        for log in console_logs:
            if any(kw in log for kw in ['GameScene', 'bridge', 'TEST', 'error', 'Error', 'towerData', 'floorId', 'HeroSprite', 'TileMap']):
                print(f"  {log}")

        # Get store state
        store_state = await page.evaluate("""() => {
            try {
                const s = window.__gameScene;
                if (!s) return 'no scene';
                return JSON.stringify({
                    floor: s.currentFloor?.floorId,
                    heroExists: !!s.heroSprite,
                    tileMapExists: !!s.tileMap,
                });
            } catch(e) { return 'error: ' + e.message; }
        }""")
        print(f"\nFinal state: {store_state}")

        await browser.close()

    server.shutdown()
    print("\nDone!")

asyncio.run(main())
