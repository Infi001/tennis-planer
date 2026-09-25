const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://xxmbhcdjpgzngqifppka.supabase.co';
const supabaseKey = 'sb_publishable_LPc69sqwgz_0_uV-L6fJqg_0XiFXPLW';
const supabase = createClient(supabaseUrl, supabaseKey);

(async () => {
  const channelName = 'debug_channel_' + Date.now();
  console.log("Subscribing to", channelName);
  
  supabase.channel(channelName)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'training_weeks' }, payload => {
      console.log("RECEIVED PAYLOAD:", payload.eventType);
    })
    .subscribe(async (status) => {
      console.log("STATUS:", status);
      if (status === 'SUBSCRIBED') {
         await supabase.from('training_weeks').update({ notes: 'Node test ' + Date.now() }).eq('id', '2026-10-05');
      }
    });

  await new Promise(r => setTimeout(r, 10000));
  process.exit(0);
})();
