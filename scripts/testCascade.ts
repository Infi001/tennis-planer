import { calculateStandbyCascade } from '../src/utils/standbyCascade';
import { TrainingWeek } from '../src/types/tennis';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASSED: ${message}`);
}

const baseWeek: TrainingWeek = {
  id: '2026-10-05',
  dateString: '05.10.2026',
  date: '2026-10-05',
  isCancelled: false,
  slots: {
    '18:00-19:00': [
      { playerId: 'p1', status: 'confirmed' },
      { playerId: 'p2', status: 'confirmed' },
      { playerId: 'p3', status: 'confirmed' },
      { playerId: 'p4', status: 'confirmed' },
    ],
    '19:00-20:00': [
      { playerId: 'p5', status: 'confirmed' },
      { playerId: 'p6', status: 'confirmed' },
      { playerId: 'p7', status: 'confirmed' },
      { playerId: 'p8', status: 'confirmed' },
    ],
    '20:00-21:00': [
      { playerId: 'p9', status: 'confirmed' },
      { playerId: 'p10', status: 'confirmed' },
      { playerId: 'p11', status: 'confirmed' },
      { playerId: 'p12', status: 'confirmed' },
    ],
  },
  springer1: { playerId: 'sp1', status: 'idle' },
  springer2: { playerId: 'sp2', status: 'idle' },
  frei: { playerId: 'fr1', status: 'idle' },
};

console.log('--- TEST 1: Full schedule (0 open spots) ---');
let res = calculateStandbyCascade(baseWeek);
assert(res.totalOpenSpots === 0, 'Total open spots is 0');
assert(res.springer1.status === 'idle', 'Springer 1 is idle');
assert(res.springer2.status === 'idle', 'Springer 2 is idle');
assert(res.frei.status === 'idle', 'Frei is idle');
assert(res.openForAnyoneCount === 0, 'Open for anyone is 0');

console.log('\n--- TEST 2: 1 player declines attendance (Prio 1 -> 1. Springer) ---');
const week1Decline: TrainingWeek = JSON.parse(JSON.stringify(baseWeek));
week1Decline.slots['18:00-19:00'][0].status = 'declined';
res = calculateStandbyCascade(week1Decline);
assert(res.totalOpenSpots === 1, 'Total open spots is 1');
assert(res.springer1.status === 'offered', 'Springer 1 gets offered the spot');
assert(res.springer2.status === 'idle', 'Springer 2 stays idle (waiting for Prio 1)');
assert(res.frei.status === 'idle', 'Frei stays idle');
assert(res.openForAnyoneCount === 0, 'Open for anyone is 0');
assert(res.activeOfferedPrios.length === 1 && res.activeOfferedPrios[0] === 1, 'Active offered prio is [1]');

console.log('\n--- TEST 3: 1. Springer declines offer (Cascade to Prio 2 -> 2. Springer) ---');
const weekSp1Declined: TrainingWeek = JSON.parse(JSON.stringify(week1Decline));
weekSp1Declined.springer1.status = 'declined';
res = calculateStandbyCascade(weekSp1Declined);
assert(res.totalOpenSpots === 1, 'Total open spots is 1');
assert(res.springer1.status === 'declined', 'Springer 1 stays declined');
assert(res.springer2.status === 'offered', 'Offer automatically cascades to Springer 2 (Prio 2)');
assert(res.frei.status === 'idle', 'Frei stays idle');
assert(res.openForAnyoneCount === 0, 'Open for anyone is 0');
assert(res.activeOfferedPrios.length === 1 && res.activeOfferedPrios[0] === 2, 'Active offered prio is [2]');

console.log('\n--- TEST 4: 2. Springer declines offer in 2-Springer mode (Spot is open) ---');
const weekSp2Declined: TrainingWeek = JSON.parse(JSON.stringify(weekSp1Declined));
weekSp2Declined.springer2.status = 'declined';
res = calculateStandbyCascade(weekSp2Declined, 2);
assert(res.totalOpenSpots === 1, 'Total open spots is 1');
assert(res.springer1.status === 'declined', 'Springer 1 is declined');
assert(res.springer2.status === 'declined', 'Springer 2 is declined');
assert(res.activeOfferedPrios.length === 0, 'No individual standby offered prio');

console.log('\n--- TEST 6: Multiple open spots (2 spots open -> Springer 1 AND Springer 2 both offered) ---');
const week2Declines: TrainingWeek = JSON.parse(JSON.stringify(baseWeek));
week2Declines.slots['18:00-19:00'][0].status = 'declined';
week2Declines.slots['19:00-20:00'][0].status = 'declined';
res = calculateStandbyCascade(week2Declines, 2);
assert(res.totalOpenSpots === 2, 'Total open spots is 2');
assert(res.springer1.status === 'offered', 'Springer 1 gets offered a spot');
assert(res.springer2.status === 'offered', 'Springer 2 also gets offered a spot (2 spots open)');
assert(res.frei.status === 'idle', 'Frei stays idle in 2-springer mode');
assert(res.activeOfferedPrios.includes(1) && res.activeOfferedPrios.includes(2), 'Active offered prios are [1, 2]');

console.log('\n--- TEST 7: 1-Springer mode (Only 1 Springer offered, 2nd spot goes straight to all members) ---');
let res1 = calculateStandbyCascade(week2Declines, 1);
assert(res1.totalOpenSpots === 2, 'Total open spots is 2');
assert(res1.springer1.status === 'offered', 'Springer 1 gets offered spot');
assert(res1.springer2.status === 'idle', 'Springer 2 stays idle (1-springer mode)');
assert(res1.openForAnyoneCount === 1, 'Remaining 1 spot opens immediately for all members');
assert(res1.activeOfferedPrios.length === 1 && res1.activeOfferedPrios[0] === 1, 'Only prio 1 active');

console.log('\n--- TEST 8: 1. Springer accepts spot in slot ---');
const weekSp1Accepted: TrainingWeek = JSON.parse(JSON.stringify(week2Declines));
weekSp1Accepted.slots['18:00-19:00'][0] = { playerId: 'sp1', status: 'substitute' };
weekSp1Accepted.springer1.status = 'accepted';
res = calculateStandbyCascade(weekSp1Accepted);
assert(res.totalOpenSpots === 1, 'Total open spots reduced to 1');
assert(res.springer1.status === 'accepted', 'Springer 1 remains accepted');
assert(res.springer2.status === 'offered', 'Remaining 1 spot is offered to Springer 2');
assert(res.frei.status === 'idle', 'Frei stays idle');

console.log('\n--- TEST 9: 2. Springer also accepts -> all open spots filled ---');
const weekSp2Accepted: TrainingWeek = JSON.parse(JSON.stringify(weekSp1Accepted));
weekSp2Accepted.slots['19:00-20:00'][0] = { playerId: 'sp2', status: 'substitute' };
weekSp2Accepted.springer2.status = 'accepted';
res = calculateStandbyCascade(weekSp2Accepted);
assert(res.totalOpenSpots === 0, 'Total open spots now 0');
assert(res.openForAnyoneCount === 0, 'Open for anyone is 0');
assert(res.activeOfferedPrios.length === 0, 'No active offered prios');

console.log('\n--- TEST 10: Original player reclaims slot (slot restored to confirmed) ---');
const weekReclaimed: TrainingWeek = JSON.parse(JSON.stringify(week1Decline));
weekReclaimed.slots['18:00-19:00'][0] = { playerId: 'p1', status: 'confirmed' };
res = calculateStandbyCascade(weekReclaimed);
assert(res.totalOpenSpots === 0, 'Total open spots is 0');
assert(res.springer1.status === 'idle', 'Springer 1 offer reverted to idle');
assert(res.activeOfferedPrios.length === 0, 'No active offers');

console.log('\n🎉 ALL STANDBY CASCADE UNIT TESTS PASSED PERFECTLY!');
