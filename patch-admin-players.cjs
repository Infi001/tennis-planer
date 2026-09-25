const fs = require('fs');
let content = fs.readFileSync('src/components/admin/PlayerManagement.tsx', 'utf8');

// We want to add a button next to the Trash icon for sending the invite link
const inviteButton = `
                  <button
                    onClick={() => {
                      const url = \`\${window.location.origin}/?token=\${player.accessToken}\`;
                      const text = \`Hallo \${player.name}, hier ist dein persönlicher Zugang zum Tennis-Planer:\\n\\n\${url}\\n\\nBitte öffne den Link auf deinem Handy!\`;
                      window.open(\`https://wa.me/?text=\${encodeURIComponent(text)}\`, '_blank');
                    }}
                    title="Zugangslink per WhatsApp senden"
                    className="p-1.5 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-colors border border-transparent hover:border-emerald-200"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
`;

content = content.replace(/<button\n\s*onClick=\{\(\) => onDeletePlayer\(player\.id\)\}/, inviteButton + '\n                  <button\n                    onClick={() => onDeletePlayer(player.id)}');

// We need to import Share2 if it's not imported.
content = content.replace(/Trash2, UserPlus /, 'Trash2, UserPlus, Share2 ');

fs.writeFileSync('src/components/admin/PlayerManagement.tsx', content);
console.log('Patched PlayerManagement');
