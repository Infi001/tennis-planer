const fs = require('fs');
let content = fs.readFileSync('src/components/NavigationTabs.tsx', 'utf8');
content = content.replace(/export type TabKey = [\s\S]*?interface NavigationTabsProps/, "export type TabKey = 'matchcenter' | 'schedule' | 'calendar' | 'absences' | 'stats' | 'admin';\n\ninterface NavigationTabsProps");
fs.writeFileSync('src/components/NavigationTabs.tsx', content);
