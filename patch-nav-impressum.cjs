const fs = require('fs');
let content = fs.readFileSync('src/components/NavigationTabs.tsx', 'utf8');

content = content.replace(
  /<\/div>\n\s*<\/nav>/,
  `</div>\n      <button onClick={() => window.dispatchEvent(new CustomEvent('open-impressum'))} className="absolute -top-6 left-1/2 -translate-x-1/2 sm:static sm:mt-2 text-[9px] text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors">Impressum & Datenschutz</button>\n    </nav>`
);

fs.writeFileSync('src/components/NavigationTabs.tsx', content);
console.log('Patched NavigationTabs for Impressum');
