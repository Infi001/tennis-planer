const fs = require('fs');
let content = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

content = content.replace(/onOpenCalendar: \(\) => void;\n/, "");
content = content.replace(/onOpenCalendar,\n/, "");
content = content.replace(/onOpenCalendar\n/, "");

fs.writeFileSync('src/components/Navbar.tsx', content);
console.log('Patched Navbar.tsx');
