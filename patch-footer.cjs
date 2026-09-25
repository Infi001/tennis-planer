const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(/\{\/\* Footer \*\/\}[\s\S]*?<\/footer>/, "");

fs.writeFileSync('src/App.tsx', content);
console.log('Removed footer');
