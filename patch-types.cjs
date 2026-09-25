const fs = require('fs');
let content = fs.readFileSync('src/types/tennis.ts', 'utf8');

content = content.replace(
  /isAdmin: boolean;/,
  `isAdmin: boolean;\n  accessToken?: string;`
);

fs.writeFileSync('src/types/tennis.ts', content);
console.log('Patched types');
