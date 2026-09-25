const fs = require('fs');
let content = fs.readFileSync('src/components/PlayerCard.tsx', 'utf8');
content = content.replace(/cascade\?\.openForAnyoneCount > 0/, '(cascade?.openForAnyoneCount ?? 0) > 0');
fs.writeFileSync('src/components/PlayerCard.tsx', content);
console.log('Fixed type error in PlayerCard');
