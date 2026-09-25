const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(/onOpenCalendar=\{\(\) => setShowCalendarExport\(true\)\}/, "");
content = content.replace(/\{showCalendarExport && \([\s\S]*?<\/CalendarExportModal>[\s\S]*?\)\}/, "");
content = content.replace(/\{showCalendarExport && \([\s\S]*?\}\)/, "");

fs.writeFileSync('src/App.tsx', content);
