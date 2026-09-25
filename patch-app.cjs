const fs = require('fs');
let content = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

// Add token check in useEffect for currentUserId initialization
// Wait, we need it to be checked ONCE on mount, but players might load async from Supabase!
// Actually, AppContext sets players initially from localStorage.
// Let's add a useEffect that checks the URL token, finds the player, and sets currentUserId.
const tokenEffect = `
  // Magic Link Token Check
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token && players.length > 0) {
      const matchedPlayer = players.find(p => p.accessToken === token);
      if (matchedPlayer) {
        setCurrentUserIdState(matchedPlayer.id);
        StorageService.setCurrentUserId(matchedPlayer.id);
        // Clean up URL without refreshing
        const url = new URL(window.location.href);
        url.searchParams.delete('token');
        window.history.replaceState({}, '', url.toString());
      }
    }
  }, [players]); // Re-run if players load late from Supabase
`;

content = content.replace(/useSupabaseSync\(\{/, tokenEffect + '\n  useSupabaseSync({');

fs.writeFileSync('src/context/AppContext.tsx', content);
console.log('Patched AppContext');
