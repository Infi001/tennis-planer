const fs = require('fs');

// Fix types
let types = fs.readFileSync('src/types/tennis.ts', 'utf8');
types = types.replace(/isAdmin: boolean;\n  accessToken\?: string;\n  accessToken\?: string;/, 'isAdmin: boolean;\n  accessToken?: string;');
fs.writeFileSync('src/types/tennis.ts', types);

// Fix AppContext
let appCtx = fs.readFileSync('src/context/AppContext.tsx', 'utf8');
appCtx = appCtx.replace(/setCurrentUserIdState\(matchedPlayer\.id\);/, 'setCurrentUserId(matchedPlayer.id);');
appCtx = appCtx.replace(/StorageService\.setCurrentUserId\(matchedPlayer\.id\);/, 'localStorage.setItem(\'tennis_current_user_id_v1\', matchedPlayer.id);');
fs.writeFileSync('src/context/AppContext.tsx', appCtx);

// Fix sync duplicates
let sync = fs.readFileSync('src/hooks/useSupabaseSync.ts', 'utf8');
sync = sync.replace(/accessToken: p\.access_token, accessToken: p\.access_token,/, 'accessToken: p.access_token,');
fs.writeFileSync('src/hooks/useSupabaseSync.ts', sync);

console.log('Fixed build issues');
