const fs = require('fs');
let content = fs.readFileSync('src/components/PlayerCard.tsx', 'utf8');

content = content.replace(/\{isMe && onOpenCalendar && \([\s\S]*?<\/button>\n\s*\)\}/, '');
fs.writeFileSync('src/components/PlayerCard.tsx', content);
console.log('Removed individual calendar button');
