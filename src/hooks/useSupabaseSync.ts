import { useEffect } from 'react';
import { getSupabase } from '../services/supabase';
import { StorageService } from '../services/storage';
import { Player, TrainingWeek, Absence, SwapRequest, ClubTheme } from '../types/tennis';
import { THEME_PRESETS } from '../constants/initialData';

interface UseSupabaseSyncProps {
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
  setWeeks: React.Dispatch<React.SetStateAction<TrainingWeek[]>>;
  setAbsences: React.Dispatch<React.SetStateAction<Absence[]>>;
  setSwaps: React.Dispatch<React.SetStateAction<SwapRequest[]>>;
  setTheme: React.Dispatch<React.SetStateAction<ClubTheme>>;
}

export function useSupabaseSync({
  setPlayers,
  setWeeks,
  setAbsences,
  setSwaps,
  setTheme
}: UseSupabaseSyncProps) {
  useEffect(() => {
    const sb = getSupabase();
    console.log('useSupabaseSync mounting. getSupabase() is:', !!sb);
    if (!sb) return;

    let isMounted = true;

    const fetchAll = async () => {
      try {
        const [playersRes, weeksRes, absencesRes, swapsRes, settingsRes] = await Promise.all([
          sb.from('players').select('*'),
          sb.from('training_weeks').select('*'),
          sb.from('absences').select('*'),
          sb.from('swap_requests').select('*'),
          sb.from('club_settings').select('*').eq('id', 'test').single(),
        ]);

        if (!isMounted) return;

        if (playersRes.data && playersRes.data.length > 0) {
          const pData = playersRes.data.map(p => ({
            id: p.id, name: p.name, shortName: p.short_name, avatarColor: p.avatar_color, isAdmin: p.is_admin,
          }));
          StorageService.setServerData('players', JSON.stringify(pData));
          setPlayers(pData);
        }

        if (weeksRes.data && weeksRes.data.length > 0) {
          const wData = weeksRes.data.map(w => ({
            id: w.id, date: w.id, dateString: w.date_string, isCancelled: w.is_cancelled, cancelReason: w.cancel_reason, slots: w.slots, springer1: w.springer1, springer2: w.springer2, frei: w.frei, notes: w.notes,
          }));
          StorageService.setServerData('weeks', JSON.stringify(wData));
          setWeeks(wData);
        }

        if (absencesRes.data && absencesRes.data.length > 0) {
          const aData = absencesRes.data.map(a => ({
            id: a.id, playerId: a.player_id, date: a.date, reason: a.reason, createdAt: a.created_at || new Date().toISOString(),
          }));
          StorageService.setServerData('absences', JSON.stringify(aData));
          setAbsences(aData);
        }

        if (swapsRes.data && swapsRes.data.length > 0) {
          const sData = swapsRes.data.map(s => ({
            id: s.id, weekId: s.week_id, fromPlayerId: s.from_player_id, fromSlot: s.from_slot, targetSlot: s.target_slot, targetPlayerId: s.target_player_id, status: s.status as any, createdAt: s.created_at || new Date().toISOString(),
          }));
          StorageService.setServerData('swaps', JSON.stringify(sData));
          setSwaps(sData);
        }
        
        if (settingsRes.data) {
          const s = settingsRes.data;
          const preset = THEME_PRESETS.find(t => t.id === s.theme_id);
          if (preset) {
            const mappedTheme = { ...preset, primary: s.primary_color, secondary: s.secondary_color };
            StorageService.serverThemeJSON = JSON.stringify(mappedTheme);
            setTheme(mappedTheme);
          }
        }
        
        console.log('INITIAL FETCH COMPLETED');
      } catch (err) {
        console.error("Error fetching from Supabase:", err);
      }
    };

    fetchAll();

    const channel = sb.channel('tennis_db_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'training_weeks' }, (payload) => {
        console.log('REALTIME: training_weeks', payload);
        if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
          const w = payload.new;
          setWeeks(prev => {
            const updated = [...prev];
            const idx = updated.findIndex(item => item.id === w.id);
            const mapped = {
              id: w.id, date: w.id, dateString: w.date_string, isCancelled: w.is_cancelled, 
              cancelReason: w.cancel_reason, slots: w.slots, springer1: w.springer1, 
              springer2: w.springer2, frei: w.frei, notes: w.notes,
            };
            if (idx >= 0) updated[idx] = mapped;
            else updated.push(mapped);
            
            StorageService.setServerData('weeks', JSON.stringify(updated));
            return updated;
          });
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'players' }, (payload) => {
        if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
          const p = payload.new;
          setPlayers(prev => {
            const updated = [...prev];
            const idx = updated.findIndex(item => item.id === p.id);
            const mapped = {
              id: p.id, name: p.name, shortName: p.short_name, 
              avatarColor: p.avatar_color, isAdmin: p.is_admin,
            };
            if (idx >= 0) updated[idx] = mapped;
            else updated.push(mapped);
            
            StorageService.setServerData('players', JSON.stringify(updated));
            return updated;
          });
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'swap_requests' }, (payload) => {
        if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
          const s = payload.new;
          setSwaps(prev => {
            const updated = [...prev];
            const idx = updated.findIndex(item => item.id === s.id);
            const mapped = {
              id: s.id, weekId: s.week_id, fromPlayerId: s.from_player_id, 
              fromSlot: s.from_slot, targetSlot: s.target_slot, 
              targetPlayerId: s.target_player_id, status: s.status as any, 
              createdAt: s.created_at || new Date().toISOString(),
            };
            if (idx >= 0) updated[idx] = mapped;
            else updated.push(mapped);
            
            StorageService.setServerData('swaps', JSON.stringify(updated));
            return updated;
          });
        }
      })
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
      })
      .subscribe((status, err) => {
        console.log('REALTIME STATUS:', status);
        if (err) console.error('Supabase Realtime Error:', err);
      });

    // Also subscribe to our explicit broadcast channel as a fallback
    const syncChannel = sb.channel('tennis_db_sync')
      .on('broadcast', { event: 'data_changed' }, (payload) => {
        console.log('BROADCAST RECEIVED:', payload);
        fetchAll(); // Re-fetch the table manually to guarantee consistency
      })
      .subscribe();

    return () => {
      isMounted = false;
      sb.removeChannel(channel);
      sb.removeChannel(syncChannel);
    };
  }, [setPlayers, setWeeks, setAbsences, setSwaps, setTheme]);
}
