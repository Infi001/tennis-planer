const fs = require('fs');
let content = fs.readFileSync('src/components/PlayerCard.tsx', 'utf8');

content = content.replace(/\{isAdmin && swipeOffset < 0 && \([\s\S]*?Löschen[\s\S]*?<\/div>\n\s*\)\}/, '');
content = content.replace(/style=\{\{ transform: `translateX\(\$\{swipeOffset\}px\)` \}\}/, '');
content = content.replace(/const handleTouchStart = \(e: React.TouchEvent\) => \{[\s\S]*?const handleTouchEnd = \(\) => \{[\s\S]*?setSwipeOffset\(0\);\n  \};\n/, '');

fs.writeFileSync('src/components/PlayerCard.tsx', content);
console.log('Patched PlayerCard.tsx again');
