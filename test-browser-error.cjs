const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page1 = await browser.newPage();
  page1.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  page1.on('console', msg => {
    if (msg.type() === 'error') {
       console.log('CONSOLE ERROR:', msg.text());
    }
  });
  await page1.goto('http://localhost:5173');
  await new Promise(r => setTimeout(r, 4000));
  await browser.close();
  process.exit(0);
})();
