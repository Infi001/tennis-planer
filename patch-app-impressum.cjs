const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Add import
content = content.replace(
  /import \{ SettingsModal \} from '\.\/components\/SettingsModal';/,
  "import { SettingsModal } from './components/SettingsModal';\nimport { ImpressumModal } from './components/ImpressumModal';"
);

// Add state
const stateLogic = `
  const [showCalendarExport, setShowCalendarExport] = useState(false); // remove later if unused
  const [showImpressum, setShowImpressum] = useState(false);

  useEffect(() => {
    const handleOpenImpressum = () => setShowImpressum(true);
    window.addEventListener('open-impressum', handleOpenImpressum);
    return () => window.removeEventListener('open-impressum', handleOpenImpressum);
  }, []);
`;
content = content.replace(/const \[showUserSwitch, setShowUserSwitch\] = useState\(false\);/, "const [showUserSwitch, setShowUserSwitch] = useState(false);\n" + stateLogic);

// Add modal render
const modalRender = `
      {showSettings && (
        <SettingsModal onClose={() => setShowSettings(false)} />
      )}
      
      {showImpressum && (
        <ImpressumModal onClose={() => setShowImpressum(false)} />
      )}
`;
content = content.replace(/\{showSettings && \([\s\S]*?\}\)/, modalRender);

fs.writeFileSync('src/App.tsx', content);
console.log('Patched App.tsx for Impressum');
