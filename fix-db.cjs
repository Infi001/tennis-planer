const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://xxmbhcdjpgzngqifppka.supabase.co';
const supabaseKey = 'sb_publishable_LPc69sqwgz_0_uV-L6fJqg_0XiFXPLW';
const supabase = createClient(supabaseUrl, supabaseKey);

(async () => {
  await supabase.from('training_weeks').upsert({
    id: '2026-10-05',
    date_string: '05.10.2026',
    slots: {}, springer1: [], springer2: [], frei: []
  });
  console.log("Fixed DB.");
  process.exit(0);
})();
