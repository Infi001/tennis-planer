const fs = require('fs');
let content = fs.readFileSync('src/hooks/useSupabaseSync.ts', 'utf8');

// Update fetch
content = content.replace(
  /isAdmin: p\.is_admin,/,
  `isAdmin: p.is_admin, accessToken: p.access_token,`
);

// Update realtime
content = content.replace(
  /isAdmin: p\.is_admin,/,
  `isAdmin: p.is_admin, accessToken: p.access_token,`
);

fs.writeFileSync('src/hooks/useSupabaseSync.ts', content);
console.log('Patched sync');
