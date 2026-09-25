const fs = require('fs');
let content = fs.readFileSync('src/components/NavigationTabs.tsx', 'utf8');

// Update TabKey
content = content.replace(
  /export type TabKey = 'matchcenter' | 'schedule' | 'absences' | 'stats' | 'admin';/,
  "export type TabKey = 'matchcenter' | 'schedule' | 'calendar' | 'absences' | 'stats' | 'admin';"
);

// Add calendar to tabs array
const calTab = `
    {
      id: 'calendar',
      label: 'Kalender',
      icon: <Calendar className="w-4 h-4" />,
    },`;

content = content.replace(/\{[\s\S]*?id: 'schedule'[\s\S]*?\},/, "$&" + calTab);

fs.writeFileSync('src/components/NavigationTabs.tsx', content);
console.log('Patched NavigationTabs');
