const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://xxmbhcdjpgzngqifppka.supabase.co', 'sb_publishable_LPc69sqwgz_0_uV-L6fJqg_0XiFXPLW');
(async () => {
  const { data, error } = await supabase.from('club_settings').select('*');
  console.log('club_settings schema:', data && data.length > 0 ? Object.keys(data[0]) : error);
  process.exit(0);
})();
