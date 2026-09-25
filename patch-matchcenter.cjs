const fs = require('fs');
let content = fs.readFileSync('src/components/WeeklyMatchCenter.tsx', 'utf8');

content = content.replace(
  /\{\/\* Haptic & Intuitive Training Session \/ Slot Configuration Bar \*\/\}\n\s*<TrainingSessionConfigBar week=\{selectedWeek\} \/>/,
  `{/* Haptic & Intuitive Training Session / Slot Configuration Bar (ADMIN ONLY) */}\n      {currentUser.isAdmin && <TrainingSessionConfigBar week={selectedWeek} />}`
);

fs.writeFileSync('src/components/WeeklyMatchCenter.tsx', content);
console.log('Patched MatchCenter admin restriction');
