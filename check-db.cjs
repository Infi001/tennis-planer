const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://xxmbhcdjpgzngqifppka.supabase.co', 'sb_publishable_LPc69sqwgz_0_uV-L6fJqg_0XiFXPLW');
(async () => {
  const { data } = await supabase.from('training_weeks').select('*');
  console.log(JSON.stringify(data, null, 2));
  process.exit(0);
})();
