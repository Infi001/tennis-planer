const puppeteer = require('puppeteer');
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://xxmbhcdjpgzngqifppka.supabase.co';
const supabaseKey = 'sb_publishable_LPc69sqwgz_0_uV-L6fJqg_0XiFXPLW';
const supabase = createClient(supabaseUrl, supabaseKey);

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page1 = await browser.newPage();
  
  page1.on('console', msg => {
    console.log('BROWSER:', msg.text());
  });
  
  await page1.goto('http://localhost:5174');
  await new Promise(r => setTimeout(r, 4000));
  
  console.log("Triggering DB write from Node script...");
  await supabase.from('training_weeks').update({ notes: 'Test Note ' + Date.now() }).eq('id', '2026-10-05');
  
  await new Promise(r => setTimeout(r, 10000));
  await browser.close();
  process.exit(0);
})();
