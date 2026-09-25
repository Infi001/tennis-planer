const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://xxmbhcdjpgzngqifppka.supabase.co', 'sb_publishable_LPc69sqwgz_0_uV-L6fJqg_0XiFXPLW');
(async () => {
  await supabase.from('training_weeks').delete().eq('id', '2026-10-05');
  console.log("Deleted broken row.");
  process.exit(0);
})();
