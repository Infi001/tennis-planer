const puppeteer = require('puppeteer');
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://xxmbhcdjpgzngqifppka.supabase.co', 'sb_publishable_LPc69sqwgz_0_uV-L6fJqg_0XiFXPLW');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page1 = await browser.newPage();
  
  page1.on('console', msg => console.log('HTML:', msg.text()));
  
  await page1.goto('http://localhost:5173/test.html');
  await new Promise(r => setTimeout(r, 2000));
  
  console.log("Triggering DB write...");
  await supabase.from('training_weeks').update({ notes: 'Test ' + Date.now() }).eq('id', '2026-10-05');
  
  await new Promise(r => setTimeout(r, 4000));
  await browser.close();
  process.exit(0);
})();
