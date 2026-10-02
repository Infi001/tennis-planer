import { parseCurrentRoute, buildRouteHash, AppRoute } from '../src/utils/urlRouting';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASSED: ${message}`);
}

// Mock window for Node environment
function setupMockWindow(hash: string, search: string = '', pathname: string = '/') {
  (global as any).window = {
    location: {
      hash,
      search,
      pathname,
      href: `http://localhost:5173${pathname}${search}${hash}`,
    },
  };
}

console.log('--- TEST 1: Build Route Hashes ---');
assert(buildRouteHash({ tab: 'matchcenter', weekId: '2026-10-12' }) === '#/wochenplan/2026-10-12', 'Matchcenter with weekId generates #/wochenplan/2026-10-12');
assert(buildRouteHash({ tab: 'matchcenter' }) === '#/wochenplan', 'Matchcenter without weekId generates #/wochenplan');
assert(buildRouteHash({ tab: 'schedule' }) === '#/gesamtplan', 'Schedule generates #/gesamtplan');
assert(buildRouteHash({ tab: 'calendar' }) === '#/kalender', 'Calendar generates #/kalender');
assert(buildRouteHash({ tab: 'absences' }) === '#/abwesenheiten', 'Absences generates #/abwesenheiten');
assert(buildRouteHash({ tab: 'stats' }) === '#/statistik', 'Stats generates #/statistik');
assert(buildRouteHash({ tab: 'help' }) === '#/hilfe', 'Help generates #/hilfe');
assert(buildRouteHash({ tab: 'admin', adminSubTab: 'dates' }) === '#/admin/dates', 'Admin dates generates #/admin/dates');
assert(buildRouteHash({ tab: 'admin', adminSubTab: 'settings' }) === '#/admin/settings', 'Admin settings generates #/admin/settings');
assert(buildRouteHash({ tab: 'admin', adminSubTab: 'players' }) === '#/admin', 'Admin players generates #/admin');

console.log('\n--- TEST 2: Parse Subsite with Week in Path ---');
setupMockWindow('#/wochenplan/2026-10-12');
let route = parseCurrentRoute();
assert(route.tab === 'matchcenter', 'Tab is matchcenter');
assert(route.weekId === '2026-10-12', 'WeekId is 2026-10-12');

console.log('\n--- TEST 3: Parse Subsite with Week in Hash Query ---');
setupMockWindow('#/wochenplan?week=2026-10-19');
route = parseCurrentRoute();
assert(route.tab === 'matchcenter', 'Tab is matchcenter');
assert(route.weekId === '2026-10-19', 'WeekId is 2026-10-19 from hash query');

console.log('\n--- TEST 4: Parse German alias "woche" & "woche query" ---');
setupMockWindow('#/woche/2026-11-02');
route = parseCurrentRoute();
assert(route.tab === 'matchcenter', 'Tab is matchcenter from #/woche');
assert(route.weekId === '2026-11-02', 'WeekId is 2026-11-02');

setupMockWindow('#/wochenplan?woche=2026-11-09');
route = parseCurrentRoute();
assert(route.tab === 'matchcenter', 'Tab is matchcenter');
assert(route.weekId === '2026-11-09', 'WeekId is 2026-11-09 from ?woche');

console.log('\n--- TEST 5: Parse Direct Date Hash (#/2026-12-01) ---');
setupMockWindow('#/2026-12-01');
route = parseCurrentRoute();
assert(route.tab === 'matchcenter', 'Tab defaults to matchcenter for date hash');
assert(route.weekId === '2026-12-01', 'WeekId is 2026-12-01');

console.log('\n--- TEST 6: Parse Other Subsites Upon Reload ---');
setupMockWindow('#/gesamtplan');
route = parseCurrentRoute();
assert(route.tab === 'schedule', 'Tab is schedule');

setupMockWindow('#/kalender');
route = parseCurrentRoute();
assert(route.tab === 'calendar', 'Tab is calendar');

setupMockWindow('#/abwesenheiten');
route = parseCurrentRoute();
assert(route.tab === 'absences', 'Tab is absences');

setupMockWindow('#/admin/dates');
route = parseCurrentRoute();
assert(route.tab === 'admin', 'Tab is admin');
assert(route.adminSubTab === 'dates', 'AdminSubTab is dates');

setupMockWindow('#/admin/optimizer');
route = parseCurrentRoute();
assert(route.tab === 'admin', 'Tab is admin');
assert(route.adminSubTab === 'optimizer', 'AdminSubTab is optimizer');

console.log('\n--- TEST 7: Search Parameter Fallback (?week=...) ---');
setupMockWindow('', '?week=2026-10-26');
route = parseCurrentRoute();
assert(route.tab === 'matchcenter', 'Tab is matchcenter');
assert(route.weekId === '2026-10-26', 'WeekId is 2026-10-26 from search param');

console.log('\n🎉 ALL URL ROUTING UNIT TESTS PASSED PERFECTLY!\n');
