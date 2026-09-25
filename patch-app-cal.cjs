const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(/import \{ CalendarExportModal \} from '\.\/components\/CalendarExportModal';/, "import { MyCalendarView } from './components/MyCalendarView';");
content = content.replace(/const \[showCalendarExport, setShowCalendarExport\] = useState\(false\);\n/, "");
content = content.replace(/onOpenCalendar=\{.*?\}\n/, "");
content = content.replace(/\{showCalendarExport && \([\s\S]*?\}\)/, "");

// Add to switch cases (wait, App.tsx renders tabs via conditional logic)
// Let's find where activeTab is handled
const renderLogic = `
        {activeTab === 'calendar' && (
          <MyCalendarView />
        )}
        
        {activeTab === 'absences' && (
`;

content = content.replace(/\{activeTab === 'absences' && \(/, renderLogic);

fs.writeFileSync('src/App.tsx', content);
console.log('Patched App.tsx for MyCalendarView');
