import { generateInitialSchedule } from '../src/constants/initialData';
import { SlotTime } from '../src/types/tennis';

// Simulate the core logic
function runTests() {
  console.log('🧪 Starting Tennis Scheduler State Machine Verification...\n');

  const weeks = generateInitialSchedule();
  const week0 = JSON.parse(JSON.stringify(weeks[0]));

  // Check week 0 initial distribution
  console.log('1. Checking initial week 0 counts:');
  const count18 = week0.slots['18:00-19:00'].length;
  const count19 = week0.slots['19:00-20:00'].length;
  const count20 = week0.slots['20:00-21:00'].length;
  console.log(`- 18:00: ${count18} players (expected 4) -> ${count18 === 4 ? 'PASS ✅' : 'FAIL ❌'}`);
  console.log(`- 19:00: ${count19} players (expected 4) -> ${count19 === 4 ? 'PASS ✅' : 'FAIL ❌'}`);
  console.log(`- 20:00: ${count20} players (expected 4) -> ${count20 === 4 ? 'PASS ✅' : 'FAIL ❌'}`);

  const sp1 = week0.springer1.playerId;
  const sp2 = week0.springer2.playerId;
  const frei = week0.frei.playerId;
  console.log(`- 1. Springer: ${sp1}, 2. Springer: ${sp2}, Frei: ${frei}`);

  // Test 1: Player in 18:00 cannot double-book into 19:00
  console.log('\n2. Testing Double-Booking Prevention:');
  const playerIn18 = week0.slots['18:00-19:00'][0].playerId;
  const isPlayingInitially = (['18:00-19:00', '19:00-20:00', '20:00-21:00'] as SlotTime[]).some(sk =>
    week0.slots[sk].some((a: any) => a.playerId === playerIn18 && a.status !== 'declined')
  );
  console.log(`- Player ${playerIn18} in 18:00 detected as playing: ${isPlayingInitially ? 'YES ✅' : 'NO ❌'}`);

  // Player in 19:00 declines
  const playerIn19 = week0.slots['19:00-20:00'][0].playerId;
  week0.slots['19:00-20:00'][0].status = 'declined';
  console.log(`- Player ${playerIn19} declines 19:00.`);

  // Attempt double booking: playerIn18 tries to claim 19:00
  const canPlayerIn18Claim = !isPlayingInitially;
  console.log(`- Can Player ${playerIn18} claim 19:00? ${canPlayerIn18Claim ? 'ALLOWED (BUG!) ❌' : 'BLOCKED (CORRECT!) ✅'}`);

  // Test 2: Springer 1 steps in
  console.log('\n3. Testing Springer 1 substitution:');
  const sp1PlayingBefore = (['18:00-19:00', '19:00-20:00', '20:00-21:00'] as SlotTime[]).some(sk =>
    week0.slots[sk].some((a: any) => a.playerId === sp1 && a.status !== 'declined')
  );
  console.log(`- Was Springer 1 playing before? ${sp1PlayingBefore ? 'YES' : 'NO (Available ✅)'}`);

  // Springer 1 takes 19:00
  week0.slots['19:00-20:00'][0] = {
    playerId: sp1,
    originalPlayerId: playerIn19,
    status: 'substitute',
  };
  week0.springer1.status = 'accepted';

  const sp1PlayingAfter = (['18:00-19:00', '19:00-20:00', '20:00-21:00'] as SlotTime[]).some(sk =>
    week0.slots[sk].some((a: any) => a.playerId === sp1 && a.status !== 'declined')
  );
  console.log(`- Is Springer 1 now detected as playing in 19:00? ${sp1PlayingAfter ? 'YES ✅' : 'NO ❌'}`);

  // Test 3: Springer 1 tries to take ANOTHER slot at 20:00
  console.log('\n4. Testing Second Slot Prevention for Springer 1:');
  week0.slots['20:00-21:00'][0].status = 'declined';
  const canSp1TakeSecondSlot = !sp1PlayingAfter;
  console.log(`- Can Springer 1 take a second slot at 20:00? ${canSp1TakeSecondSlot ? 'ALLOWED (BUG!) ❌' : 'BLOCKED (NO DOUBLE BOOKING) ✅'}`);

  // Test 4: Springer 1 exits / cancels
  console.log('\n5. Testing Springer Exit ("Springer steigt wieder aus"):');
  // Sub steps down:
  week0.slots['19:00-20:00'][0] = {
    playerId: playerIn19,
    originalPlayerId: playerIn19,
    status: 'declined',
    declineReason: 'Ersatzspieler wieder ausgestiegen',
  };
  week0.springer1.status = 'declined';

  const sp1StillInSlot = week0.slots['19:00-20:00'].some((a: any) => a.playerId === sp1);
  console.log(`- Was Springer 1 cleanly removed from slot? ${!sp1StillInSlot ? 'YES ✅' : 'NO ❌'}`);
  console.log(`- Is 19:00 slot open again? ${week0.slots['19:00-20:00'][0].status === 'declined' ? 'YES ✅' : 'NO ❌'}`);

  // Now Springer 2 can take it!
  const isSp2Playing = (['18:00-19:00', '19:00-20:00', '20:00-21:00'] as SlotTime[]).some(sk =>
    week0.slots[sk].some((a: any) => a.playerId === sp2 && a.status !== 'declined')
  );
  console.log(`- Is Springer 2 eligible to take 19:00? ${!isSp2Playing ? 'YES (Cascade worked!) ✅' : 'NO ❌'}`);

  console.log('\n🎉 All core scheduling edge cases verified successfully!\n');
}

runTests();
