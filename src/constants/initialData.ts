import { Player, ClubTheme, TrainingWeek, SlotTime } from '../types/tennis';

export const INITIAL_PLAYERS: Player[] = [
  { id: 'p1', name: 'André O.', shortName: 'AO', avatarColor: '#3B82F6', isAdmin: false },
  { id: 'p2', name: 'Andre R.', shortName: 'AR', avatarColor: '#10B981', isAdmin: false },
  { id: 'p3', name: 'Bernd', shortName: 'BE', avatarColor: '#F59E0B', isAdmin: false },
  { id: 'p4', name: 'Florian', shortName: 'FL', avatarColor: '#6366F1', isAdmin: true }, // 2. Admin
  { id: 'p5', name: 'Heiko', shortName: 'HE', avatarColor: '#EC4899', isAdmin: false },
  { id: 'p6', name: 'Ingo', shortName: 'IN', avatarColor: '#8B5CF6', isAdmin: false },
  { id: 'p7', name: 'Jörg B.', shortName: 'JB', avatarColor: '#14B8A6', isAdmin: false },
  { id: 'p8', name: 'Jörg S.', shortName: 'JS', avatarColor: '#F97316', isAdmin: false },
  { id: 'p9', name: 'Kai', shortName: 'KA', avatarColor: '#06B6D4', isAdmin: false },
  { id: 'p10', name: 'Lasse', shortName: 'LA', avatarColor: '#84CC16', isAdmin: false },
  { id: 'p11', name: 'Michael', shortName: 'MI', avatarColor: '#A855F7', isAdmin: false },
  { id: 'p12', name: 'Sascha', shortName: 'SA', avatarColor: '#E11D48', isAdmin: false },
  { id: 'p13', name: 'Stephan', shortName: 'ST', avatarColor: '#0284C7', isAdmin: false },
  { id: 'p14', name: 'Thorsten', shortName: 'TH', avatarColor: '#059669', isAdmin: false },
  { id: 'p15', name: 'Timo', shortName: 'TI', avatarColor: '#D97706', isAdmin: true }, // 1. Admin
];

export const THEME_PRESETS: ClubTheme[] = [
  {
    id: 'rot-weiss',
    name: 'Rot-Weiß Senne (Verein)',
    clubName: 'TC Rot-Weiß Senne',
    logoText: 'RW',
    primary: '#DC2626', // Crimson red
    primaryContainer: '#FEE2E2',
    onPrimary: '#FFFFFF',
    secondary: '#B91C1C',
    accent: '#F87171',
  },
  {
    id: 'blau-weiss',
    name: 'Blau-Weiß (Classic)',
    clubName: 'TC Blau-Weiß',
    logoText: 'BW',
    primary: '#1D4ED8', // Deep blue
    primaryContainer: '#DBEAFE',
    onPrimary: '#FFFFFF',
    secondary: '#0284C7',
    accent: '#38BDF8',
  },
  {
    id: 'gruen-weiss',
    name: 'Grün-Weiß (Rasen & Natur)',
    clubName: 'TC Grün-Weiß',
    logoText: 'GW',
    primary: '#15803D', // Forest Green
    primaryContainer: '#DCFCE7',
    onPrimary: '#FFFFFF',
    secondary: '#166534',
    accent: '#4ADE80',
  },
  {
    id: 'schwarz-gelb',
    name: 'Schwarz-Gelb (Dynamik)',
    clubName: 'TC Schwarz-Gelb',
    logoText: 'SG',
    primary: '#CA8A04', // Rich Gold
    primaryContainer: '#FEF08A',
    onPrimary: '#000000',
    secondary: '#18181B',
    accent: '#FACC15',
  },
  {
    id: 'sandplatz-orange',
    name: 'Sandplatz & Navy (Roland Garros)',
    clubName: 'TC Sandplatz Club',
    logoText: 'RG',
    primary: '#C2410C', // Terracotta Clay
    primaryContainer: '#FFEDD5',
    onPrimary: '#FFFFFF',
    secondary: '#1E293B',
    accent: '#FB923C',
  },
  {
    id: 'wimbledon',
    name: 'Wimbledon (Green & Purple)',
    clubName: 'The Tennis Club',
    logoText: 'TC',
    primary: '#166534', // Wimbledon green
    primaryContainer: '#DCFCE7',
    onPrimary: '#FFFFFF',
    secondary: '#6B21A8', // Regal purple
    accent: '#A855F7',
  },
];

// Cycle pattern of length 15 from the Excel schedule
const ROTATION_CYCLE: Array<{ type: 'slot' | 'springer1' | 'springer2' | 'frei'; slot?: SlotTime }> = [
  { type: 'frei' },                       // index 0
  { type: 'slot', slot: '19:00-20:00' },   // index 1
  { type: 'slot', slot: '20:00-21:00' },   // index 2
  { type: 'slot', slot: '18:00-19:00' },   // index 3
  { type: 'slot', slot: '19:00-20:00' },   // index 4
  { type: 'springer2' },                  // index 5
  { type: 'slot', slot: '20:00-21:00' },   // index 6
  { type: 'slot', slot: '19:00-20:00' },   // index 7
  { type: 'slot', slot: '18:00-19:00' },   // index 8
  { type: 'slot', slot: '20:00-21:00' },   // index 9
  { type: 'springer1' },                  // index 10
  { type: 'slot', slot: '18:00-19:00' },   // index 11
  { type: 'slot', slot: '20:00-21:00' },   // index 12
  { type: 'slot', slot: '19:00-20:00' },   // index 13
  { type: 'slot', slot: '18:00-19:00' },   // index 14
];

// All Monday dates in the Winter 2026/2027 season
export const SEASON_MONDAYS: Array<{ dateStr: string; iso: string; cancelled?: boolean; cancelReason?: string }> = [
  // 2026
  { dateStr: '05.10.26', iso: '2026-10-05' },
  { dateStr: '12.10.26', iso: '2026-10-12' },
  { dateStr: '19.10.26', iso: '2026-10-19' },
  { dateStr: '26.10.26', iso: '2026-10-26' },
  { dateStr: '02.11.26', iso: '2026-11-02' },
  { dateStr: '09.11.26', iso: '2026-11-09' },
  { dateStr: '16.11.26', iso: '2026-11-16' },
  { dateStr: '23.11.26', iso: '2026-11-23' },
  { dateStr: '30.11.26', iso: '2026-11-30' },
  { dateStr: '07.12.26', iso: '2026-12-07' },
  { dateStr: '14.12.26', iso: '2026-12-14' },
  { dateStr: '21.12.26', iso: '2026-12-21' },
  { dateStr: '28.12.26', iso: '2026-12-28' },
  // 2027
  { dateStr: '04.01.27', iso: '2027-01-04' },
  { dateStr: '11.01.27', iso: '2027-01-11' },
  { dateStr: '18.01.27', iso: '2027-01-18' },
  { dateStr: '25.01.27', iso: '2027-01-25' },
  { dateStr: '01.02.27', iso: '2027-02-01' },
  { dateStr: '08.02.27', iso: '2027-02-08' },
  { dateStr: '15.02.27', iso: '2027-02-15' },
  { dateStr: '22.02.27', iso: '2027-02-22' },
  { dateStr: '01.03.27', iso: '2027-03-01' },
  { dateStr: '08.03.27', iso: '2027-03-08' },
  { dateStr: '15.03.27', iso: '2027-03-15' },
  { dateStr: '22.03.27', iso: '2027-03-22' },
  { dateStr: '29.03.27', iso: '2027-03-29', cancelled: true, cancelReason: 'Kein Training (Ostermontag)' },
  { dateStr: '05.04.27', iso: '2027-04-05' },
  { dateStr: '12.04.27', iso: '2027-04-12' },
  { dateStr: '19.04.27', iso: '2027-04-19' },
  { dateStr: '26.04.27', iso: '2027-04-26' },
];

/**
 * Generate initial training weeks according to the 15-player cyclic permutation
 */
export function generateInitialSchedule(): TrainingWeek[] {
  let activeWeekIndex = 0;

  return SEASON_MONDAYS.map((m) => {
    if (m.cancelled) {
      return {
        id: m.iso,
        dateString: m.dateStr,
        date: m.iso,
        isCancelled: true,
        cancelReason: m.cancelReason,
        slots: {
          '18:00-19:00': [],
          '19:00-20:00': [],
          '20:00-21:00': [],
        },
        springer1: { playerId: '', status: 'idle' },
        springer2: { playerId: '', status: 'idle' },
        frei: { playerId: '', status: 'idle' },
      };
    }

    const weekIdx = activeWeekIndex % 15;
    activeWeekIndex++;

    const slots: Record<SlotTime, Array<{ playerId: string; status: 'confirmed' | 'pending' }>> = {
      '18:00-19:00': [],
      '19:00-20:00': [],
      '20:00-21:00': [],
    };
    let sp1PlayerId = '';
    let sp2PlayerId = '';
    let freiPlayerId = '';

    INITIAL_PLAYERS.forEach((player, playerIdx) => {
      // Offset formula matching the Excel rotation:
      // Player p's role in week w is ROTATION_CYCLE[(w - p) mod 15]
      const cycleIdx = (weekIdx - playerIdx + 1500) % 15;
      const role = ROTATION_CYCLE[cycleIdx];

      if (role.type === 'slot' && role.slot) {
        slots[role.slot].push({
          playerId: player.id,
          status: 'confirmed',
        });
      } else if (role.type === 'springer1') {
        sp1PlayerId = player.id;
      } else if (role.type === 'springer2') {
        sp2PlayerId = player.id;
      } else if (role.type === 'frei') {
        freiPlayerId = player.id;
      }
    });

    return {
      id: m.iso,
      dateString: m.dateStr,
      date: m.iso,
      isCancelled: false,
      slots: {
        '18:00-19:00': slots['18:00-19:00'],
        '19:00-20:00': slots['19:00-20:00'],
        '20:00-21:00': slots['20:00-21:00'],
      },
      springer1: { playerId: sp1PlayerId, status: 'idle' },
      springer2: { playerId: sp2PlayerId, status: 'idle' },
      frei: { playerId: freiPlayerId, status: 'idle' },
    };
  });
}
