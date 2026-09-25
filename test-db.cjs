const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xxmbhcdjpgzngqifppka.supabase.co';
const supabaseKey = 'sb_publishable_LPc69sqwgz_0_uV-L6fJqg_0XiFXPLW';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log("Testing write...");
  const { data, error } = await supabase.from('club_settings').upsert({ id: 'test', name: 'Test' });
  console.log("Write response:", data, error);
  
  console.log("Testing read...");
  const { data: readData, error: readError } = await supabase.from('club_settings').select('*');
  console.log("Read response:", readData, readError);
}

test();
