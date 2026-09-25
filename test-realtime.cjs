const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xxmbhcdjpgzngqifppka.supabase.co';
const supabaseKey = 'sb_publishable_LPc69sqwgz_0_uV-L6fJqg_0XiFXPLW';
const supabase = createClient(supabaseUrl, supabaseKey);

console.log("Subscribing...");
const channel = supabase.channel('tennis_db_changes')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'training_weeks' }, payload => {
    console.log("RECEIVED REALTIME PAYLOAD:", payload);
  })
  .subscribe(async (status) => {
    console.log("Status:", status);
    if (status === 'SUBSCRIBED') {
      console.log("Triggering update...");
      await supabase.from('training_weeks').upsert({
        id: '2026-10-05',
        date_string: '05.10.2026',
        slots: {},
        springer1: {},
        springer2: {},
        frei: {}
      });
      console.log("Update sent!");
    }
  });

setTimeout(() => {
  console.log("Exiting test.");
  process.exit(0);
}, 5000);
