const fs = require('fs');
let content = fs.readFileSync('src/components/PlayerCard.tsx', 'utf8');

// Remove swipe state and handlers
content = content.replace(/const \[swipeOffset, setSwipeOffset\] = useState\(0\);\n/, '');
content = content.replace(/const swipeStartX = useRef\(0\);\n/, '');
content = content.replace(/const handleTouchStart[\s\S]*?const handleTouchEnd = \(\) => \{[\s\S]*?\};\n/m, '');

// Remove style transform
content = content.replace(/style=\{\{\n\s*transform: swipeOffset < 0 \? `translateX\(\$\{swipeOffset\}px\)` : 'none',\n\s*transition: swipeOffset === 0 \? 'transform 0\.2s ease' : 'none',\n\s*\}\}/, '');
content = content.replace(/onTouchStart=\{handleTouchStart\}\n\s*onTouchMove=\{handleTouchMove\}\n\s*onTouchEnd=\{handleTouchEnd\}/, '');

// Remove the red backdrop for delete
content = content.replace(/\{isAdmin && \(\n\s*<div className="absolute inset-y-0 right-0 w-24 bg-rose-500 rounded-xl flex items-center justify-end pr-4 text-white font-bold text-xs shadow-inner">\n\s*Löschen\n\s*<\/div>\n\s*\)\}/, '');

// Add X button if admin
const absoluteAdminX = `
      {/* Admin Quick Remove Button */}
      {isAdmin && !isDeclined && (
        <button
          onClick={(e) => { e.stopPropagation(); adminDragDropAssign(weekId, slotTime, player ? player.id : \`guest_\${assignment.guestName}\`, 'remove'); }}
          className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-rose-100 dark:bg-rose-900/50 hover:bg-rose-500 dark:hover:bg-rose-600 text-rose-500 hover:text-white rounded-full flex items-center justify-center border border-white dark:border-neutral-800 shadow-sm transition-colors z-10"
          title="Spieler aus Slot entfernen"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
`;

content = content.replace(/<div\n\s*className=\{`relative overflow-hidden bg-white dark:bg-neutral-800/, absoluteAdminX + '\n      <div\n        className={`relative overflow-hidden bg-white dark:bg-neutral-800');

fs.writeFileSync('src/components/PlayerCard.tsx', content);
console.log('Patched PlayerCard.tsx');
