const fs = require('fs');
let content = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

const correctDateLogic = `
  const [selectedWeekId, setSelectedWeekId] = useState<string>(() => {
    const todayObj = new Date();
    const year = todayObj.getFullYear();
    const month = String(todayObj.getMonth() + 1).padStart(2, '0');
    const day = String(todayObj.getDate()).padStart(2, '0');
    const localToday = \`\${year}-\${month}-\${day}\`;
    
    const initialWeeks = StorageService.getWeeks().sort((a, b) => a.date.localeCompare(b.date));
    const upcoming = initialWeeks.find(w => w.date >= localToday);
    return upcoming ? upcoming.id : (initialWeeks[0]?.id || '2026-10-05');
  });
`;

content = content.replace(
  /const \[selectedWeekId, setSelectedWeekId\] = useState<string>\(\(\) => \{[\s\S]*?\}\);/,
  correctDateLogic.trim()
);

fs.writeFileSync('src/context/AppContext.tsx', content);
console.log('Patched date logic');
