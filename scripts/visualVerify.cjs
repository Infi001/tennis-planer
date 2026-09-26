const puppeteer = require('puppeteer');
const { spawn } = require('child_process');

async function run() {
  console.log('Starting preview server...');
  const server = spawn('npx', ['vite', 'preview', '--port', '4173'], { stdio: 'pipe' });

  // Wait for server to be ready
  await new Promise((resolve) => setTimeout(resolve, 1500));

  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();

    // 1. Desktop Test (1280x900)
    await page.setViewport({ width: 1280, height: 900 });
    await page.goto('http://localhost:4173', { waitUntil: 'networkidle0' });

    // Click on Florian (Admin) to log in
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

    // Type PIN 1234
    const pinInput = await page.$('input[type="password"], input[type="text"], input[placeholder*="PIN"]');
    if (pinInput) {
      await pinInput.type('1234');
      const submitBtn = await page.evaluateHandle(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        return btns.find(b => b.textContent && b.textContent.includes('Anmelden'));
      });
      if (submitBtn) await submitBtn.click();
    }
    // Set up test incoming swap targeting Florian in Week 1 (05.10.2026)
    await page.evaluate(() => {
      const currentUserId = localStorage.getItem('tennis_current_user_id_v1');
      const weeks = JSON.parse(localStorage.getItem('tennis_weeks_v1') || '[]');
      const firstWeek = weeks[0];
      if (firstWeek && currentUserId) {
        let mySlot = null;
        Object.entries(firstWeek.slots).forEach(([slot, arr]) => {
          if (arr.some(a => a.playerId === currentUserId)) mySlot = slot;
        });
        const otherSlot = mySlot === '18:00-19:00' ? '20:00-21:00' : '18:00-19:00';
        const mockSwap = {
          id: 'swap-test-incoming',
          weekId: firstWeek.id,
          fromPlayerId: 'p2', // Andre R.
          fromSlot: otherSlot,
          targetSlot: mySlot,
          targetPlayerId: currentUserId,
          status: 'pending',
          createdAt: new Date().toISOString()
        };
        localStorage.setItem('tennis_swaps_v1', JSON.stringify([mockSwap]));
      }
    });
    await page.reload({ waitUntil: 'networkidle0' });

    console.log('Taking Desktop MatchCenter screenshot with incoming swap banner in Week 1...');
    await page.screenshot({ path: 'screenshot_desktop_admin_swap.png', fullPage: true });

    // 2. Mobile Test (390x844)
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await new Promise(r => setTimeout(r, 400));

    console.log('Taking Mobile MatchCenter screenshot (top)...');
    await page.screenshot({ path: 'screenshot_mobile_admin_top.png', fullPage: false });

    // Scroll slightly to view full swap card
    await page.evaluate(() => window.scrollBy(0, 200));
    await new Promise(r => setTimeout(r, 200));
    console.log('Taking Mobile MatchCenter screenshot (swap card)...');
    await page.screenshot({ path: 'screenshot_mobile_admin_swap.png', fullPage: false });

    // Scroll to slots
    await page.evaluate(() => window.scrollBy(0, 600));
    await new Promise(r => setTimeout(r, 300));
    console.log('Taking Mobile MatchCenter screenshot (slots)...');
    await page.screenshot({ path: 'screenshot_mobile_admin_slots.png', fullPage: false });

    // Scroll to mobile admin pool & SpringerHub
    await page.evaluate(() => window.scrollBy(0, 1000));
    await new Promise(r => setTimeout(r, 300));
    console.log('Taking Mobile MatchCenter screenshot (pool & springer)...');
    await page.screenshot({ path: 'screenshot_mobile_admin_pool.png', fullPage: false });

    // 3. Click on unassigned player to test modal
    const unassignedBtn = await page.evaluateHandle(() => {
      const allBtns = Array.from(document.querySelectorAll('button'));
      return allBtns.find(b => b.textContent && b.textContent.includes('nachsetzen') || (b.parentElement && b.parentElement.previousElementSibling && b.parentElement.previousElementSibling.textContent.includes('Verfügbare Spieler')));
    });

    // 4. Admin Settings Page Screenshot
    await page.setViewport({ width: 1024, height: 900 });
    await page.evaluate(() => {
      const navBtns = Array.from(document.querySelectorAll('nav button, header button'));
      const adminNav = navBtns.find(b => b.textContent && (b.textContent.includes('Einstellungen') || b.textContent.includes('Admin')));
      if (adminNav) adminNav.click();
    });
    await new Promise(r => setTimeout(r, 600));
    console.log('Taking Admin Settings screenshot...');
    await page.screenshot({ path: 'screenshot_admin_settings.png', fullPage: true });

    console.log('All screenshots captured successfully!');
  } finally {
    await browser.close();
    server.kill();
  }
}

run().catch(err => {
  console.error('Error during visual verification:', err);
  process.exit(1);
});
