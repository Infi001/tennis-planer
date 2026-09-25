const fs = require('fs');
let content = fs.readFileSync('src/components/NavigationTabs.tsx', 'utf8');
content = content.replace(/export type TabKey = .*?;/, "export type TabKey = 'matchcenter' | 'schedule' | 'calendar' | 'absences' | 'stats' | 'admin';");
fs.writeFileSync('src/components/NavigationTabs.tsx', content);
console.log('Fixed nav tabs');
