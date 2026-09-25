const fs = require('fs');
let content = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

// Fix brand container layout
content = content.replace(
  /<div className="flex items-center space-x-3">/,
  '<div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">'
);

// Truncate club name and hide 'Trainingsplaner' on mobile
content = content.replace(
  /<span className="font-extrabold text-lg sm:text-xl tracking-tight text-white dark:text-neutral-50">\s*\{theme\.clubName\}\s*<\/span>/,
  '<span className="font-extrabold text-lg sm:text-xl tracking-tight text-white dark:text-neutral-50 truncate">\n                {theme.clubName}\n              </span>'
);

content = content.replace(
  /className="text-\[10px\] font-bold uppercase tracking-wider px-2 py-0\.5 rounded-full text-\[var\(--club-primary\)\] bg-white\/90"/,
  'className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-[var(--club-primary)] bg-white/90"'
);

// Ensure right side doesn't shrink
content = content.replace(
  /<div className="flex items-center space-x-2 sm:space-x-3">/,
  '<div className="flex items-center space-x-1 sm:space-x-3 flex-shrink-0">'
);

// Truncate player name on mobile inside the pill
content = content.replace(
  /<div className="text-xs font-bold text-white dark:text-neutral-200 leading-tight flex items-center gap-1">/,
  '<div className="text-xs font-bold text-white dark:text-neutral-200 leading-tight flex items-center gap-1 max-w-[80px] sm:max-w-[120px] truncate">'
);

fs.writeFileSync('src/components/Navbar.tsx', content);
console.log('Patched Navbar');
