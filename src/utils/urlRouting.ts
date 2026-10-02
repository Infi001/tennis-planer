import { TabKey } from '../components/NavigationTabs';
import { AdminSubTab } from '../components/admin/AdminDashboard';

export interface AppRoute {
  tab: TabKey;
  adminSubTab?: AdminSubTab;
  weekId?: string;
  showImpressum?: boolean;
}

const TAB_SLUG_MAP: Record<TabKey, string> = {
  matchcenter: 'wochenplan',
  schedule: 'gesamtplan',
  calendar: 'kalender',
  absences: 'abwesenheiten',
  stats: 'statistik',
  help: 'hilfe',
  admin: 'admin',
};

const SLUG_TO_TAB: Record<string, TabKey> = {
  // Wochenplan / Matchcenter
  wochenplan: 'matchcenter',
  matchcenter: 'matchcenter',
  woche: 'matchcenter',
  home: 'matchcenter',
  start: 'matchcenter',
  
  // Gesamtplan / Schedule
  gesamtplan: 'schedule',
  schedule: 'schedule',
  plan: 'schedule',
  termine: 'schedule',
  spielplan: 'schedule',
  uebersicht: 'schedule',

  // Kalender
  kalender: 'calendar',
  calendar: 'calendar',
  meinkalender: 'calendar',
  'meine-termine': 'calendar',

  // Abwesenheiten
  abwesenheiten: 'absences',
  absences: 'absences',
  urlaub: 'absences',
  abwesenheit: 'absences',

  // Statistik
  statistik: 'stats',
  stats: 'stats',
  statistiken: 'stats',
  auswertung: 'stats',

  // Hilfe
  hilfe: 'help',
  help: 'help',
  faq: 'help',
  anleitung: 'help',

  // Admin
  admin: 'admin',
  verwaltung: 'admin',
  einstellungen: 'admin',
  settings: 'admin',
};

const SUBTAB_SLUGS: Record<string, AdminSubTab> = {
  players: 'players',
  spieler: 'players',
  mitglieder: 'players',
  kader: 'players',

  dates: 'dates',
  termine: 'dates',
  zeiten: 'dates',
  daten: 'dates',

  optimizer: 'optimizer',
  optimierer: 'optimizer',
  generator: 'optimizer',

  settings: 'settings',
  einstellungen: 'settings',
  club: 'settings',
  verein: 'settings',
  email: 'settings',
};

/**
 * Parses the current window location (hash, search params, and pathname)
 * to determine the active tab, subtab, weekId, or modal.
 */
export function parseCurrentRoute(): AppRoute {
  if (typeof window === 'undefined') {
    return { tab: 'matchcenter' };
  }

  let hash = window.location.hash || '';
  // Strip leading # or #/
  if (hash.startsWith('#/')) {
    hash = hash.slice(2);
  } else if (hash.startsWith('#')) {
    hash = hash.slice(1);
  }

  // Check for impressum / datenschutz
  if (hash.toLowerCase() === 'impressum' || hash.toLowerCase() === 'datenschutz') {
    return {
      tab: 'matchcenter',
      showImpressum: true,
    };
  }

  // Split hash query params if any (e.g. "wochenplan?week=w1")
  let hashPath = hash;
  let hashQuery = '';
  const hashQuestionIdx = hash.indexOf('?');
  if (hashQuestionIdx !== -1) {
    hashPath = hash.slice(0, hashQuestionIdx);
    hashQuery = hash.slice(hashQuestionIdx + 1);
  }

  const hashSegments = hashPath.split('/').filter(Boolean);
  const searchParams = new URLSearchParams(window.location.search);
  const hashSearchParams = new URLSearchParams(hashQuery);

  let weekId: string | undefined = 
    hashSearchParams.get('week') || 
    hashSearchParams.get('woche') || 
    searchParams.get('week') || 
    searchParams.get('woche') || 
    undefined;

  // 1. Try parsing primary tab from hash
  let tab: TabKey | undefined;
  let adminSubTab: AdminSubTab | undefined;

  if (hashSegments.length > 0) {
    const firstSegment = hashSegments[0].toLowerCase();
    if (SLUG_TO_TAB[firstSegment]) {
      tab = SLUG_TO_TAB[firstSegment];
    }

    if (hashSegments.length > 1) {
      const secondSegment = hashSegments[1];
      if (tab === 'admin') {
        if (SUBTAB_SLUGS[secondSegment.toLowerCase()]) {
          adminSubTab = SUBTAB_SLUGS[secondSegment.toLowerCase()];
        }
      } else {
        // For matchcenter or other tabs, the 2nd segment is the weekId (e.g. #/wochenplan/2026-10-12)
        if (!weekId && secondSegment) {
          weekId = decodeURIComponent(secondSegment);
        }
      }
    } else if (!tab) {
      // First segment is not a recognized tab name. Check if it's a date or week ID (e.g. #/2026-10-12)
      if (/^\d{4}-\d{2}-\d{2}$/.test(hashSegments[0]) || hashSegments[0].startsWith('week-')) {
        tab = 'matchcenter';
        weekId = decodeURIComponent(hashSegments[0]);
      }
    }
  }

  // 2. Try parsing from query params (?tab=admin&subtab=settings)
  if (!tab) {
    const tabParam = searchParams.get('tab') || searchParams.get('page') || searchParams.get('view');
    if (tabParam && SLUG_TO_TAB[tabParam.toLowerCase()]) {
      tab = SLUG_TO_TAB[tabParam.toLowerCase()];
    }
    const subParam = searchParams.get('subtab') || searchParams.get('sub');
    if (subParam && SUBTAB_SLUGS[subParam.toLowerCase()]) {
      adminSubTab = SUBTAB_SLUGS[subParam.toLowerCase()];
    }
  }

  // 3. Try parsing from pathname (e.g. /admin or /gesamtplan)
  if (!tab) {
    const pathSegments = window.location.pathname.split('/').filter(Boolean);
    if (pathSegments.length > 0 && SLUG_TO_TAB[pathSegments[0].toLowerCase()]) {
      tab = SLUG_TO_TAB[pathSegments[0].toLowerCase()];
      if (pathSegments.length > 1 && tab === 'admin' && SUBTAB_SLUGS[pathSegments[1].toLowerCase()]) {
        adminSubTab = SUBTAB_SLUGS[pathSegments[1].toLowerCase()];
      } else if (pathSegments.length > 1 && !weekId) {
        weekId = decodeURIComponent(pathSegments[1]);
      }
    }
  }

  return {
    tab: tab || 'matchcenter',
    adminSubTab,
    weekId,
  };
}

/**
 * Constructs the canonical hash string for a given route.
 * Example: "#/admin/settings" or "#/gesamtplan" or "#/wochenplan/2026-10-12"
 */
export function buildRouteHash(route: AppRoute): string {
  const slug = TAB_SLUG_MAP[route.tab] || 'wochenplan';
  let hash = `#/${slug}`;

  if (route.tab === 'admin' && route.adminSubTab && route.adminSubTab !== 'players') {
    hash += `/${route.adminSubTab}`;
  }

  if (route.weekId && route.tab === 'matchcenter') {
    hash += `/${encodeURIComponent(route.weekId)}`;
  }

  return hash;
}

/**
 * Updates the browser's address bar without triggering a full page reload.
 */
export function syncRouteToUrl(route: AppRoute, replace = false): void {
  if (typeof window === 'undefined') return;

  const newHash = buildRouteHash(route);
  if (window.location.hash === newHash) return;

  // Preserve existing non-tab search params (e.g. tokens if still present)
  const currentUrl = new URL(window.location.href);
  currentUrl.hash = newHash;

  // If there was no hash previously, always replace to avoid polluting history on first visit
  const shouldReplace = replace || !window.location.hash || window.location.hash === '#';

  if (shouldReplace) {
    window.history.replaceState({ route }, '', currentUrl.toString());
  } else {
    window.history.pushState({ route }, '', currentUrl.toString());
  }
}
