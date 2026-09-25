const fs = require('fs');
let content = fs.readFileSync('src/hooks/useSupabaseSync.ts', 'utf8');

// Remove confetti
content = content.replace(/import confetti from 'canvas-confetti';\n/, '');
content = content.replace(/confetti\(\{.*?\}\);\n\s*/g, '');

// Add setTheme to interface
content = content.replace(
  /setSwaps: React\.Dispatch<React\.SetStateAction<SwapRequest\[\]>>;\n\}/,
  `setSwaps: React.Dispatch<React.SetStateAction<SwapRequest[]>>;\n  setTheme: React.Dispatch<React.SetStateAction<ClubTheme>>;\n}`
);
content = content.replace(
  /import \{ Player, TrainingWeek, Absence, SwapRequest \} from '\.\.\/types\/tennis';/,
  `import { Player, TrainingWeek, Absence, SwapRequest, ClubTheme } from '../types/tennis';\nimport { THEME_PRESETS } from '../constants/initialData';`
);

// Add setTheme to destructuring
content = content.replace(
  /setSwaps\n\}: UseSupabaseSyncProps\)/,
  `setSwaps,\n  setTheme\n}: UseSupabaseSyncProps)`
);

// Add theme to dependency array
content = content.replace(
  /\[setPlayers, setWeeks, setAbsences, setSwaps\]/,
  `[setPlayers, setWeeks, setAbsences, setSwaps, setTheme]`
);

// Add club_settings to fetchAll
content = content.replace(
  /sb\.from\('swap_requests'\)\.select\('\*'\),\n\s*\]\);/,
  `sb.from('swap_requests').select('*'),\n          sb.from('club_settings').select('*').eq('id', 'test').single(),\n        ]);`
);
content = content.replace(
  /const \[playersRes, weeksRes, absencesRes, swapsRes\] =/,
  `const [playersRes, weeksRes, absencesRes, swapsRes, settingsRes] =`
);

// Handle settingsRes
const settingsHandler = `
        if (settingsRes.data) {
          const s = settingsRes.data;
          const preset = THEME_PRESETS.find(t => t.id === s.theme_id);
          if (preset) {
            const mappedTheme = { ...preset, primary: s.primary_color, secondary: s.secondary_color };
            StorageService.serverThemeJSON = JSON.stringify(mappedTheme);
            setTheme(mappedTheme);
          }
        }
`;
content = content.replace(
  /console\.log\('INITIAL FETCH COMPLETED'\);/,
  settingsHandler + `        console.log('INITIAL FETCH COMPLETED');`
);

// Handle realtime settings
const settingsRealtime = `
      .on('postgres_changes', { event: '*', schema: 'public', table: 'club_settings' }, (payload) => {
        if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
          const s = payload.new;
          const preset = THEME_PRESETS.find(t => t.id === s.theme_id);
          if (preset) {
            const mappedTheme = { ...preset, primary: s.primary_color, secondary: s.secondary_color };
            StorageService.serverThemeJSON = JSON.stringify(mappedTheme);
            setTheme(mappedTheme);
          }
        }
      })`;
content = content.replace(
  /\.on\('postgres_changes', \{ event: '\*', schema: 'public', table: 'swap_requests' \}.*?\}\)/s,
  `$&${settingsRealtime}`
);

fs.writeFileSync('src/hooks/useSupabaseSync.ts', content);
console.log('Patched useSupabaseSync.ts');
