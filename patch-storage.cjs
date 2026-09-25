const fs = require('fs');
let content = fs.readFileSync('src/services/storage.ts', 'utf8');

// Add helper to generate token
const tokenHelper = `
function generateToken() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
`;
content = content.replace(/export class StorageService \{/, tokenHelper + '\nexport class StorageService {');

// Update getPlayers to ensure all have tokens
content = content.replace(/return INITIAL_PLAYERS;/, `return INITIAL_PLAYERS.map(p => ({ ...p, accessToken: generateToken() }));`);
content = content.replace(/return JSON\.parse\(raw\);/, `const parsed = JSON.parse(raw);\n      return parsed.map((p: Player) => p.accessToken ? p : { ...p, accessToken: generateToken() });`);

// Update savePlayers to include access_token
content = content.replace(/is_admin: p\.isAdmin,/, `is_admin: p.isAdmin,\n          access_token: p.accessToken,`);

fs.writeFileSync('src/services/storage.ts', content);
console.log('Patched storage');
