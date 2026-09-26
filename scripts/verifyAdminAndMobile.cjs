const puppeteer = require('puppeteer');
const { spawn } = require('child_process');

async function run() {
  const server = spawn('npx', ['vite', 'preview', '--port', '4173'], { stdio: 'pipe' });
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1100, height: 900 });
    await page.goto('http://localhost:4173', { waitUntil: 'networkidle0' });

    // Log in as Florian (Admin)
    await page.waitForSelector('button');
    const buttons = await page.$$('button');
    for (const btn of buttons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && text.includes('Florian')) {
        await btn.click();
        break;
      }
    }
    await new Promise(r => setTimeout(r, 400));

    // Enter PIN 1234
    const pinInput = await page.$('input[placeholder*="PIN"], input[type="password"]');
    if (pinInput) {
      await pinInput.type('1234');
      const submitBtn = await page.evaluateHandle(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        return btns.find(b => b.textContent && b.textContent.includes('Anmelden'));
      });
      if (submitBtn) await submitBtn.click();
    }
    await new Promise(r => setTimeout(r, 800));

    // Click Admin tab in navigation
    await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('nav button'));
      const adminTab = tabs.find(t => t.textContent && t.textContent.trim() === 'Admin');
      if (adminTab) adminTab.click();
    });
    await new Promise(r => setTimeout(r, 600));

    // Click "Einstellungen" sub-tab inside Admin
    await page.evaluate(() => {
      const subTabs = Array.from(document.querySelectorAll('button'));
      const settingsTab = subTabs.find(b => b.textContent && b.textContent.includes('Einstellungen'));
      if (settingsTab) settingsTab.click();
    });
    await new Promise(r => setTimeout(r, 600));

    // Scroll to Springer-Einstellungen
    await page.evaluate(() => {
      const headings = Array.from(document.querySelectorAll('h3'));
      const h = headings.find(el => el.textContent && el.textContent.includes('Springer-Einstellungen'));
      if (h) h.scrollIntoView();
    });
    await new Promise(r => setTimeout(r, 300));
    await page.screenshot({ path: 'screenshot_admin_springer_settings.png', fullPage: false });

    // Navigate back to "Woche" (MatchCenter) on Mobile (390x844)
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('nav button'));
      const weekTab = tabs.find(t => t.textContent && t.textContent.includes('Woche'));
      if (weekTab) weekTab.click();
    });
    await new Promise(r => setTimeout(r, 800));

    // Scroll slightly so the mobile quick-assign strip and top of slots are in view
    await page.evaluate(() => window.scrollTo(0, 320));
    await new Promise(r => setTimeout(r, 300));
    console.log('Taking screenshot of mobile quick-assign strip and slot header...');
    await page.screenshot({ path: 'screenshot_mobile_quick_assign.png', fullPage: false });

  } finally {
    await browser.close();
    server.kill();
  }
}

run().catch(console.error);
