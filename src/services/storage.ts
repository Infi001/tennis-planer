import { Player, TrainingWeek, Absence, SwapRequest, ClubTheme, SlotAssignment } from '../types/tennis';
import { INITIAL_PLAYERS, THEME_PRESETS, generateInitialSchedule } from '../constants/initialData';
import { getSupabase } from './supabase';

const STORAGE_KEYS = {
  PLAYERS: 'tennis_players_v1',
  WEEKS: 'tennis_weeks_v1',
  ABSENCES: 'tennis_absences_v1',
  SWAPS: 'tennis_swaps_v1',
  CURRENT_USER_ID: 'tennis_current_user_id_v1',
  THEME: 'tennis_theme_v1',
  SPRINGER_COUNT: 'tennis_springer_count_v1',
};

async function safeSupabaseSync(action: () => PromiseLike<any>) {
  try {
    const res = await action();
    if (res && res.error) {
      console.error('Supabase write error:', res.error.message, res.error.details, res.error.hint);
    }
  } catch (err) {
    console.warn('Supabase sync warning:', err);
  }
}


function generateToken() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export class StorageService {
  // --- Server Echo Prevention ---
  static serverPlayersJSON = '';
  static serverWeeksJSON = '';
  static serverAbsencesJSON = '';
  static serverSwapsJSON = '';

  static setServerData(type: 'players' | 'weeks' | 'absences' | 'swaps', json: string) {
    if (type === 'players') this.serverPlayersJSON = json;
    if (type === 'weeks') this.serverWeeksJSON = json;
    if (type === 'absences') this.serverAbsencesJSON = json;
    if (type === 'swaps') this.serverSwapsJSON = json;
  }

  // --- Players ---
  static getPlayers(): Player[] {
    const raw = localStorage.getItem(STORAGE_KEYS.PLAYERS);
    if (!raw) {
      this.savePlayers(INITIAL_PLAYERS);
      return INITIAL_PLAYERS.map(p => ({ ...p, accessToken: generateToken() }));
    }
    try {
      const parsed = JSON.parse(raw);
      return parsed.map((p: Player) => p.accessToken ? p : { ...p, accessToken: generateToken() });
    } catch {
      return INITIAL_PLAYERS;
    }
  }

  static lastSavedPlayersJSON = '';
  static savePlayers(players: Player[]) {
    const json = JSON.stringify(players);
    if (json === this.lastSavedPlayersJSON) return;
    this.lastSavedPlayersJSON = json;

    localStorage.setItem(STORAGE_KEYS.PLAYERS, json);
    if (json === this.serverPlayersJSON) return;
    const sb = getSupabase();
    if (sb) {
      safeSupabaseSync(async () => {
        const res = await sb.from('players').upsert(players.map(p => ({
          id: p.id,
          name: p.name,
          short_name: p.shortName,
          avatar_color: p.avatarColor,
          is_admin: p.isAdmin,
          access_token: p.accessToken,
        })));
        sb.channel('tennis_db_sync').send({ type: 'broadcast', event: 'data_changed', payload: { table: 'players' } });
        return res;
      });
    }
  }

  // --- Weeks ---
  static getWeeks(): TrainingWeek[] {
    const raw = localStorage.getItem(STORAGE_KEYS.WEEKS);
    if (!raw) {
      const initial = generateInitialSchedule();
      this.saveWeeks(initial);
      return initial;
    }
    try {
      const parsed: TrainingWeek[] = JSON.parse(raw);
      // Migrate any legacy 'pending' status to 'confirmed' and strictly deduplicate
      let changed = false;
      parsed.forEach(w => {
        if (w.isCancelled) return;
        const seenPlayerIds = new Set<string>();
        const slotKeys = Object.keys(w.slots || {});
        slotKeys.forEach(slotKey => {
          const uniqueSlotAssignments: SlotAssignment[] = [];
          (w.slots[slotKey] || []).forEach(a => {
            if (a.status === 'pending') {
              a.status = 'confirmed';
              changed = true;
            }
            if (a.isGuest) {
              uniqueSlotAssignments.push(a);
            } else if (!seenPlayerIds.has(a.playerId)) {
              seenPlayerIds.add(a.playerId);
              uniqueSlotAssignments.push(a);
            } else {
              // Duplicate found! Skip to eliminate duplicate
              changed = true;
            }
          });
          w.slots[slotKey] = uniqueSlotAssignments;
        });
        if (!w.frei?.status) {
          w.frei = { playerId: w.frei?.playerId || '', status: 'idle' };
          changed = true;
        }
        if (!w.springer1?.status) {
          w.springer1 = { playerId: w.springer1?.playerId || '', status: 'idle' };
          changed = true;
        }
        if (!w.springer2?.status) {
          w.springer2 = { playerId: w.springer2?.playerId || '', status: 'idle' };
          changed = true;
        }
      });
      if (changed) {
        this.saveWeeks(parsed);
      }
      return parsed;
    } catch {
      const initial = generateInitialSchedule();
      return initial;
    }
  }

  static lastSavedWeeksJSON = '';
  static saveWeeks(weeks: TrainingWeek[]) {
    const json = JSON.stringify(weeks);
    if (json === this.lastSavedWeeksJSON) return;
    this.lastSavedWeeksJSON = json;
    localStorage.setItem(STORAGE_KEYS.WEEKS, json);
    
    // Skip Supabase upsert if this is exactly the data we just received from the server
    if (json === this.serverWeeksJSON) return;
    const sb = getSupabase();
    if (sb) {
      safeSupabaseSync(async () => {
        const res = await sb.from('training_weeks').upsert(weeks.map(w => ({
          id: w.id,
          date_string: w.dateString,
          is_cancelled: w.isCancelled,
          cancel_reason: w.cancelReason,
          slots: w.slots,
          springer1: w.springer1,
          springer2: w.springer2,
          frei: w.frei,
          notes: w.notes,
        })));
        // Notify other clients instantly via broadcast
        sb.channel('tennis_db_sync').send({
          type: 'broadcast',
          event: 'data_changed',
          payload: { table: 'training_weeks' }
        });
        return res;
      });
    }
  }

  // --- Absences ---
  static getAbsences(): Absence[] {
    const raw = localStorage.getItem(STORAGE_KEYS.ABSENCES);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  static lastSavedAbsencesJSON = '';
  static saveAbsences(absences: Absence[]) {
    const json = JSON.stringify(absences);
    if (json === this.lastSavedAbsencesJSON) return;
    this.lastSavedAbsencesJSON = json;

    localStorage.setItem(STORAGE_KEYS.ABSENCES, json);
    if (json === this.serverAbsencesJSON) return;
    const sb = getSupabase();
    if (sb) {
      safeSupabaseSync(() => sb.from('absences').upsert(absences.map(a => ({
        id: a.id,
        player_id: a.playerId,
        date: a.date,
        reason: a.reason,
      }))));
    }
  }

  // --- Swaps ---
  static getSwaps(): SwapRequest[] {
    const raw = localStorage.getItem(STORAGE_KEYS.SWAPS);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  static lastSavedSwapsJSON = '';
  static saveSwaps(swaps: SwapRequest[]) {
    const json = JSON.stringify(swaps);
    if (json === this.lastSavedSwapsJSON) return;
    this.lastSavedSwapsJSON = json;

    localStorage.setItem(STORAGE_KEYS.SWAPS, json);
    if (json === this.serverSwapsJSON) return;
    const sb = getSupabase();
    if (sb) {
      safeSupabaseSync(() => sb.from('swap_requests').upsert(swaps.map(s => ({
        id: s.id,
        week_id: s.weekId,
        from_player_id: s.fromPlayerId,
        from_slot: s.fromSlot,
        target_slot: s.targetSlot,
        target_player_id: s.targetPlayerId,
        status: s.status,
      }))));
    }
  }

  // --- Current User ---
  static getCurrentUserId(): string | null {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
  }

  static saveCurrentUserId(id: string) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, id);
  }

  static clearCurrentUserId() {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
  }

  // --- Theme ---
  static getTheme(): ClubTheme {
    const raw = localStorage.getItem(STORAGE_KEYS.THEME);
    if (!raw) return THEME_PRESETS[0];
    try {
      return JSON.parse(raw);
    } catch {
      return THEME_PRESETS[0];
    }
  }

  // --- Springer Count Configuration (1 bis X) ---
  static getSpringerCount(): number {
    const raw = localStorage.getItem(STORAGE_KEYS.SPRINGER_COUNT);
    if (!raw) return 2; // Standard: 2 Springer
    const num = parseInt(raw, 10);
    return isNaN(num) || num < 1 || num > 3 ? 2 : num;
  }

  static saveSpringerCount(count: number) {
    const safeCount = Math.max(1, Math.min(count, 3));
    localStorage.setItem(STORAGE_KEYS.SPRINGER_COUNT, safeCount.toString());
  }

  static async deleteRecord(table: string, id: string) {
    const sb = getSupabase();
    if (sb) {
      await sb.from(table).delete().eq('id', id);
      sb.channel('tennis_db_sync').send({ type: 'broadcast', event: 'data_changed', payload: { table } });
    }
  }

  static serverThemeJSON = '';
  static saveTheme(theme: ClubTheme) {
    const json = JSON.stringify(theme);
    localStorage.setItem(STORAGE_KEYS.THEME, json);
    if (json === this.serverThemeJSON) return;
    
    const sb = getSupabase();
    if (sb) {
      safeSupabaseSync(async () => {
        const res = await sb.from('club_settings').upsert({
          id: 'test',
          name: theme.clubName || 'Tennis Club',
          theme_id: theme.id,
          primary_color: theme.primary,
          secondary_color: theme.secondary
        });
        sb.channel('tennis_db_sync').send({ type: 'broadcast', event: 'data_changed', payload: { table: 'club_settings' } });
        return res;
      });
    }
  }

  // Reset to initial state
  static resetAllData() {
    localStorage.removeItem(STORAGE_KEYS.PLAYERS);
    localStorage.removeItem(STORAGE_KEYS.WEEKS);
    localStorage.removeItem(STORAGE_KEYS.ABSENCES);
    localStorage.removeItem(STORAGE_KEYS.SWAPS);
  }
}
