import React, { createContext, useContext, useState, useEffect } from 'react';
import { Player, TrainingWeek, Absence, SwapRequest, ClubTheme, SlotTime, PlayerStatus, SlotAssignment } from '../types/tennis';
import { StorageService } from '../services/storage';
import { THEME_PRESETS } from '../constants/initialData';
import { getWeekSlotKeys, generateSlotTimes, canReduceWeekSlots } from '../utils/slotTimeUtils';
import { calculateStandbyCascade, StandbyCascadeResult } from '../utils/standbyCascade';
import { useSupabaseSync } from '../hooks/useSupabaseSync';
import confetti from 'canvas-confetti';

interface AppContextType {
  players: Player[];
  weeks: TrainingWeek[];
  selectedWeek: TrainingWeek | undefined;
  selectedWeekId: string;
  setSelectedWeekId: (id: string) => void;
  currentUser: Player;
  isLoggedIn: boolean;
  logout: () => void;
  setCurrentUser: (player: Player) => void;
  impersonatorAdminId: string | null;
  isImpersonating: boolean;
  actualAdminPlayer: Player | null;
  impersonateUser: (targetPlayerId: string) => void;
  exitImpersonation: () => void;
  theme: ClubTheme;
  setTheme: (theme: ClubTheme) => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  absences: Absence[];
  swaps: SwapRequest[];
  
  // Validation / Helpers
  isPlayerScheduledInWeek: (weekId: string, playerId: string) => boolean;
  getPlayerCurrentSlotInWeek: (weekId: string, playerId: string) => SlotTime | null;
  getOpenSlotsInWeek: (weekId: string) => SlotTime[];

  // Dynamic Session & Slot Configuration
  updateWeekSlotConfig: (weekId: string, hoursCount: number, durations: number | number[], startTime: string) => void;
  applySlotConfigToAllWeeks: (hoursCount: number, durations: number | number[], startTime: string) => void;
  emptyWeekSlot: (weekId: string, slotKey: string) => void;

  // Actions
  confirmAttendance: (weekId: string, playerId: string) => void;
  declineAttendance: (weekId: string, playerId: string, reason?: string) => void;
  reclaimSlot: (weekId: string, slot: SlotTime, playerId: string) => void;
  acceptSubstitute: (weekId: string, slot: SlotTime, candidatePlayerId: string) => boolean;
  cancelSubstitute: (weekId: string, slot: SlotTime, substitutePlayerId: string, reason?: string) => void;
  declineSubstituteOffer: (weekId: string, springerPlayerId: string) => void;
  claimOpenSlot: (weekId: string, slot: SlotTime, candidatePlayerId: string) => boolean;
  skipStandbyPriorityToNext: (weekId: string, prioLevel: number) => void;
  releaseOpenSlotsToAll: (weekId: string) => void;
  resetStandbyCascade: (weekId: string) => void;
  getStandbyCascadeInfo: (weekId: string) => StandbyCascadeResult | null;
  // Player Administration
  addPlayer: (player: Omit<Player, 'id'>) => void;
  updatePlayer: (player: Player) => void;
  deletePlayer: (playerId: string) => void;
  reorderPlayers: (newPlayers: Player[]) => void;

  // Calendar & Schedule Administration
  addTrainingWeekDate: (dateStr: string, iso: string) => void;
  updateWeekDate: (weekId: string, newDateStr: string, newIsoDate: string) => void;
  deleteTrainingWeek: (weekId: string) => void;
  toggleWeekCancellation: (weekId: string, cancelReason?: string) => void;
  updateWeekNotes: (weekId: string, notes: string) => void;
  replaceEntireSchedule: (newWeeks: TrainingWeek[]) => void;

  requestSwap: (weekId: string, fromPlayerId: string, fromSlot: SlotTime, targetSlot: SlotTime, targetPlayerId?: string) => void;
  acceptSwap: (swapId: string, acceptingPlayerId?: string) => void;
  declineSwap: (swapId: string) => void;
  cancelSwap: (swapId: string) => void;
  addAbsence: (playerId: string, date: string, reason: string) => void;
  deleteAbsence: (absenceId: string) => void;
  adminUpdateSlot: (weekId: string, slot: SlotTime, playerIndex: number, newPlayerId: string, status?: PlayerStatus) => void;
  adminDragDropAssign: (weekId: string, slot: SlotTime, droppedPlayerId: string, targetPlayerIdToReplace?: string) => void;
  adminRemovePlayer: (weekId: string, slot: SlotTime, playerIdOrGuest: string) => void;
  adminAddGuest: (weekId: string, slot: SlotTime, guestName: string) => void;
  springerCount: number;
  setSpringerCount: (count: number) => void;
  resetWeekToOriginal: (weekId: string) => void;
  resetAll: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [players, setPlayers] = useState<Player[]>(() => StorageService.getPlayers());
  const [weeks, setWeeks] = useState<TrainingWeek[]>(() => StorageService.getWeeks());
  const [absences, setAbsences] = useState<Absence[]>(() => StorageService.getAbsences());
  const [swaps, setSwaps] = useState<SwapRequest[]>(() => StorageService.getSwaps());
  const [theme, setThemeState] = useState<ClubTheme>(() => StorageService.getTheme());
  const [isDarkMode, setIsDarkModeState] = useState<boolean>(() => {
    const saved = localStorage.getItem('tennis_dark_mode');
    if (saved !== null) return saved === 'true';
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false; // Vibrant light mode fallback
  });

  const setIsDarkMode = (val: boolean) => {
    setIsDarkModeState(val);
    localStorage.setItem('tennis_dark_mode', String(val));
  };

  // Follow system theme changes if user hasn't explicitly set a preference
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      const saved = localStorage.getItem('tennis_dark_mode');
      if (saved === null) {
        setIsDarkModeState(e.matches);
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const [springerCount, setSpringerCountState] = useState<number>(() => StorageService.getSpringerCount());
  const setSpringerCount = (count: number) => {
    const safe = Math.max(0, Math.min(count, 10));
    setSpringerCountState(safe);
    StorageService.saveSpringerCount(safe);
  };

  const [currentUserId, setCurrentUserId] = useState<string | null>(() => StorageService.getCurrentUserId());

  // Impersonation state: Allows admins to view the app as any regular member
  const [impersonatorAdminId, setImpersonatorAdminId] = useState<string | null>(() => {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      return sessionStorage.getItem('tennis_impersonator_admin_id');
    }
    return null;
  });
  
  // Default selected week: Find the first upcoming Monday or week 0
  const [selectedWeekId, setSelectedWeekId] = useState<string>(() => {
    const todayObj = new Date();
    const year = todayObj.getFullYear();
    const month = String(todayObj.getMonth() + 1).padStart(2, '0');
    const day = String(todayObj.getDate()).padStart(2, '0');
    const localToday = `${year}-${month}-${day}`;
    
    const initialWeeks = StorageService.getWeeks().sort((a, b) => a.date.localeCompare(b.date));
    const upcoming = initialWeeks.find(w => w.date >= localToday);
    return upcoming ? upcoming.id : (initialWeeks[0]?.id || '2026-10-05');
  });

  const activePlayer = players.find(p => p.id === currentUserId) || null;
  const isLoggedIn = activePlayer !== null;
  const currentUser: Player = activePlayer || players[0] || { id: 'p1', name: 'Gast', shortName: 'GA', isAdmin: false };

  const isImpersonating = !!impersonatorAdminId;
  const actualAdminPlayer = impersonatorAdminId 
    ? (players.find(p => p.id === impersonatorAdminId) || null) 
    : (currentUser.isAdmin ? currentUser : null);

  const impersonateUser = (targetPlayerId: string) => {
    const canImpersonate = currentUser.isAdmin || !!impersonatorAdminId;
    if (!canImpersonate) return;

    const originalAdminId = impersonatorAdminId || currentUser.id;
    setImpersonatorAdminId(originalAdminId);
    if (typeof window !== 'undefined' && window.sessionStorage) {
      sessionStorage.setItem('tennis_impersonator_admin_id', originalAdminId);
    }
    setCurrentUserId(targetPlayerId);
  };

  const exitImpersonation = () => {
    if (impersonatorAdminId) {
      setCurrentUserId(impersonatorAdminId);
      setImpersonatorAdminId(null);
      if (typeof window !== 'undefined' && window.sessionStorage) {
        sessionStorage.removeItem('tennis_impersonator_admin_id');
      }
    }
  };

  // Fetch from Supabase and listen for realtime changes
  
  // Magic Link Token Check
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    
    const token = params.get('token');
    const admin = params.get('admin');

    if (admin === 'timo' || admin === 'p15') {
      setCurrentUserId('p15');
      localStorage.setItem('tennis_current_user_id_v1', 'p15');
      const url = new URL(window.location.href);
      url.searchParams.delete('admin');
      window.history.replaceState({}, '', url.toString());
      return;
    }

    if (admin === 'florian' || admin === 'p4') {
      setCurrentUserId('p4');
      localStorage.setItem('tennis_current_user_id_v1', 'p4');
      const url = new URL(window.location.href);
      url.searchParams.delete('admin');
      window.history.replaceState({}, '', url.toString());
      return;
    }

    if (token && players.length > 0) {

      const matchedPlayer = players.find(p => p.accessToken === token);
      if (matchedPlayer) {
        setCurrentUserId(matchedPlayer.id);
        localStorage.setItem('tennis_current_user_id_v1', matchedPlayer.id);
        // Clean up URL without refreshing
        const url = new URL(window.location.href);
        url.searchParams.delete('token');
        window.history.replaceState({}, '', url.toString());
      }
    }
  }, [players]); // Re-run if players load late from Supabase

  useSupabaseSync({ setPlayers, setWeeks, setAbsences, setSwaps, setTheme: setThemeState });
  const selectedWeek = weeks.find(w => w.id === selectedWeekId);

  // Sync state to storage
  useEffect(() => {
    StorageService.savePlayers(players);
  }, [players]);

  useEffect(() => {
    StorageService.saveWeeks(weeks);
  }, [weeks]);

  useEffect(() => {
    StorageService.saveAbsences(absences);
  }, [absences]);

  useEffect(() => {
    StorageService.saveSwaps(swaps);
  }, [swaps]);

  const setTheme = (newTheme: ClubTheme) => {
    setThemeState(newTheme);
    StorageService.saveTheme(newTheme);
  };

  const setCurrentUser = (player: Player) => {
    setCurrentUserId(player.id);
    StorageService.saveCurrentUserId(player.id);
  };

  const logout = () => {
    setCurrentUserId(null);
    setImpersonatorAdminId(null);
    if (typeof window !== 'undefined' && window.sessionStorage) {
      sessionStorage.removeItem('tennis_impersonator_admin_id');
    }
    StorageService.clearCurrentUserId();
  };

  // --- Strict Validation Helpers ---
  const isPlayerScheduledInWeek = (weekId: string, playerId: string): boolean => {
    const w = weeks.find(item => item.id === weekId);
    if (!w) return false;
    const slotTimes = getWeekSlotKeys(w);
    return slotTimes.some(slotKey => 
      (w.slots[slotKey] || []).some(a => 
        a.playerId === playerId && 
        (a.status === 'confirmed' || a.status === 'pending' || a.status === 'substitute' || a.status === 'swapped')
      )
    );
  };

  const getPlayerCurrentSlotInWeek = (weekId: string, playerId: string): SlotTime | null => {
    const w = weeks.find(item => item.id === weekId);
    if (!w) return null;
    const slotTimes = getWeekSlotKeys(w);
    for (const slotKey of slotTimes) {
      if ((w.slots[slotKey] || []).some(a => 
        a.playerId === playerId && 
        (a.status === 'confirmed' || a.status === 'pending' || a.status === 'substitute' || a.status === 'swapped')
      )) {
        return slotKey;
      }
    }
    return null;
  };

  const getOpenSlotsInWeek = (weekId: string): SlotTime[] => {
    const w = weeks.find(item => item.id === weekId);
    if (!w || w.isCancelled) return [];
    const open: SlotTime[] = [];
    const slotTimes = getWeekSlotKeys(w);
    slotTimes.forEach(slotKey => {
      const activeCount = (w.slots[slotKey] || []).filter(a => a.status !== 'declined').length;
      if (activeCount < 4 || (w.slots[slotKey] || []).some(a => a.status === 'declined')) {
        open.push(slotKey);
      }
    });
    return open;
  };

  // --- Attendance Confirmation ---
  const confirmAttendance = (weekId: string, playerId: string) => {
    setWeeks(prevWeeks => prevWeeks.map(w => {
      if (w.id !== weekId) return w;
      const newSlots = { ...w.slots };
      getWeekSlotKeys(w).forEach(slotKey => {
        newSlots[slotKey] = (newSlots[slotKey] || []).map(assign => {
          if (assign.playerId === playerId) {
            return { ...assign, status: 'confirmed', updatedAt: new Date().toISOString() };
          }
          return assign;
        });
      });
      return { ...w, slots: newSlots };
    }));
  };

  // --- Attendance Decline (Absage eines regulären Spielers) ---
  const declineAttendance = (weekId: string, playerId: string, reason?: string) => {
    const w = weeks.find(item => item.id === weekId);
    if (!w) return;

    // Check if the person declining was actually a substitute
    let wasSubstitute = false;
    let subSlot: SlotTime | null = null;
    getWeekSlotKeys(w).forEach(slotKey => {
      const found = (w.slots[slotKey] || []).find(a => a.playerId === playerId && a.status === 'substitute');
      if (found) {
        wasSubstitute = true;
        subSlot = slotKey;
      }
    });

    if (wasSubstitute && subSlot) {
      cancelSubstitute(weekId, subSlot, playerId, reason);
      return;
    }

    setWeeks(prevWeeks => prevWeeks.map(weekItem => {
      if (weekItem.id !== weekId) return weekItem;
      const newSlots = { ...weekItem.slots };
      let declinedSlotKey: SlotTime | null = null;
      getWeekSlotKeys(weekItem).forEach(slotKey => {
        newSlots[slotKey] = (newSlots[slotKey] || []).map(assign => {
          if (assign.playerId === playerId) {
            declinedSlotKey = slotKey;
            return { 
              ...assign, 
              status: 'declined', 
              declineReason: reason || 'Keine Angabe',
              updatedAt: new Date().toISOString() 
            };
          }
          return assign;
        });
      });

      // Automatically activate 1. Springer (or 2. / 3. Springer if earlier is busy/declined)
      let autoAssignedSpringerId: string | null = null;
      let newSp1 = { ...weekItem.springer1 };
      let newSp2 = { ...weekItem.springer2 };
      let newFrei = weekItem.frei ? { ...weekItem.frei } : { playerId: '', status: 'idle' as const };

      const isActivelyPlaying = (pId: string) => {
        if (!pId) return true;
        return getWeekSlotKeys(weekItem).some(sk =>
          (newSlots[sk] || []).some(a => a.playerId === pId && a.status !== 'declined')
        );
      };

      if (springerCount >= 1 && newSp1.playerId && newSp1.playerId !== playerId && newSp1.status !== 'declined' && !isActivelyPlaying(newSp1.playerId)) {
        autoAssignedSpringerId = newSp1.playerId;
        newSp1.status = 'accepted';
      } else if (springerCount >= 2 && newSp2.playerId && newSp2.playerId !== playerId && newSp2.status !== 'declined' && !isActivelyPlaying(newSp2.playerId)) {
        autoAssignedSpringerId = newSp2.playerId;
        newSp2.status = 'accepted';
      } else if (springerCount >= 3 && newFrei.playerId && newFrei.playerId !== playerId && newFrei.status !== 'declined' && !isActivelyPlaying(newFrei.playerId)) {
        autoAssignedSpringerId = newFrei.playerId;
        newFrei.status = 'accepted';
      }

      if (autoAssignedSpringerId && declinedSlotKey) {
        newSlots[declinedSlotKey] = (newSlots[declinedSlotKey] || []).map(assign => {
          if (assign.playerId === playerId && assign.status === 'declined') {
            return {
              playerId: autoAssignedSpringerId!,
              originalPlayerId: playerId,
              status: 'substitute',
              updatedAt: new Date().toISOString(),
            };
          }
          return assign;
        });
      }

      // Recalculate standby priority cascade
      const cascade = calculateStandbyCascade({ 
        ...weekItem, 
        slots: newSlots,
        springer1: newSp1,
        springer2: newSp2,
        frei: newFrei,
      }, springerCount);

      return { 
        ...weekItem, 
        slots: newSlots, 
        springer1: cascade.springer1, 
        springer2: cascade.springer2,
        frei: cascade.frei
      };
    }));
  };

  // --- Reclaim Slot (Original-Spieler kann doch und reaktiviert seinen Platz) ---
  const reclaimSlot = (weekId: string, slot: SlotTime, playerId: string) => {
    // STRICT DOUBLE-BOOKING CHECK: Cannot reclaim if active in another slot in this week!
    const wCheck = weeks.find(item => item.id === weekId);
    if (wCheck) {
      const activeInOtherSlot = getWeekSlotKeys(wCheck).some(st =>
        st !== slot && (wCheck.slots[st] || []).some(a => a.playerId === playerId && a.status !== 'declined')
      );
      if (activeInOtherSlot) {
        alert('Doppelbuchung verhindert: Du spielst an diesem Spieltag bereits in einem anderen Zeitslot!');
        return;
      }
    }

    setWeeks(prevWeeks => prevWeeks.map(w => {
      if (w.id !== weekId) return w;
      const newSlots = { ...w.slots };
      
      let bumpedSubId: string | null = null;
      let matchFound = false;

      newSlots[slot] = (newSlots[slot] || []).map(a => {
        if (a.playerId === playerId && a.status === 'declined') {
          matchFound = true;
          return {
            playerId,
            status: 'confirmed',
            declineReason: undefined,
            updatedAt: new Date().toISOString(),
          };
        } else if (a.originalPlayerId === playerId && a.status === 'substitute') {
          matchFound = true;
          bumpedSubId = a.playerId;
          return {
            playerId,
            status: 'confirmed',
            declineReason: undefined,
            updatedAt: new Date().toISOString(),
          };
        }
        return a;
      });

      if (!matchFound) return w;

      let newSp1 = { ...w.springer1 };
      let newSp2 = { ...w.springer2 };
      let newFrei = w.frei ? { ...w.frei } : { playerId: '', status: 'idle' as const };
      if (bumpedSubId === newSp1.playerId) newSp1.status = 'idle';
      if (bumpedSubId === newSp2.playerId) newSp2.status = 'idle';
      if (bumpedSubId === newFrei.playerId) newFrei.status = 'idle';

      // Strict deduplication guarantee for this slot
      const uniqueMap = new Map<string, SlotAssignment>();
      (newSlots[slot] || []).forEach(a => {
        if (!uniqueMap.has(a.playerId) || a.isGuest) {
          uniqueMap.set(a.isGuest ? `guest-${Date.now()}-${Math.random()}` : a.playerId, a);
        }
      });
      newSlots[slot] = Array.from(uniqueMap.values());

      const cascade = calculateStandbyCascade({ 
        ...w, 
        slots: newSlots,
        springer1: newSp1,
        springer2: newSp2,
        frei: newFrei,
      }, springerCount);

      return { 
        ...w, 
        slots: newSlots, 
        springer1: cascade.springer1, 
        springer2: cascade.springer2,
        frei: cascade.frei
      };
    }));
  };

  // --- Accept Substitute (Springer oder Vereinsmitglied nimmt Platz an) ---
  const acceptSubstitute = (weekId: string, targetSlot: SlotTime, candidatePlayerId: string): boolean => {
    // STRICT NO-DOUBLE-BOOKING: If candidate is already playing, REJECT!
    if (isPlayerScheduledInWeek(weekId, candidatePlayerId)) {
      alert('Doppelbuchung verhindert: Du bist an diesem Spieltag bereits in einem anderen Zeitslot eingeteilt!');
      return false;
    }

    try {
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
    } catch {
      // ignore
    }

    setWeeks(prevWeeks => prevWeeks.map(w => {
      if (w.id !== weekId) return w;
      const newSlots = { ...w.slots };
      if (!newSlots[targetSlot]) {
        newSlots[targetSlot] = [];
      }
      
      // INVARIANT 1: Check if candidate is already in targetSlot
      if (newSlots[targetSlot].some(a => a.playerId === candidatePlayerId)) {
        return w;
      }

      // INVARIANT 2: Check if candidate is already active in ANY slot this week
      const allSlotKeys = getWeekSlotKeys(w);
      const alreadyActive = allSlotKeys.some(st => 
        (newSlots[st] || []).some(a => a.playerId === candidatePlayerId && a.status !== 'declined')
      );
      if (alreadyActive) {
        return w;
      }

      // Find the first declined slot assignment in targetSlot
      const declinedIndex = newSlots[targetSlot].findIndex(a => a.status === 'declined');
      if (declinedIndex !== -1) {
        const original = newSlots[targetSlot][declinedIndex];
        newSlots[targetSlot][declinedIndex] = {
          playerId: candidatePlayerId,
          originalPlayerId: original.originalPlayerId || original.playerId,
          status: 'substitute',
          updatedAt: new Date().toISOString(),
        };
      } else {
        // Fallback: If no slot was declined, append only if under 4 players
        if (newSlots[targetSlot].length < 4) {
          newSlots[targetSlot].push({
            playerId: candidatePlayerId,
            status: 'substitute',
            updatedAt: new Date().toISOString(),
          });
        } else {
          return w;
        }
      }

      // GUARANTEE: strictly unique players in targetSlot
      const uniqueMap = new Map<string, SlotAssignment>();
      newSlots[targetSlot].forEach(a => {
        if (!uniqueMap.has(a.playerId) || a.isGuest) {
          uniqueMap.set(a.isGuest ? `guest-${Date.now()}-${Math.random()}` : a.playerId, a);
        }
      });
      newSlots[targetSlot] = Array.from(uniqueMap.values());

      // Mark the candidate as accepted in their respective role
      let newSp1 = { ...w.springer1 };
      let newSp2 = { ...w.springer2 };
      let newFrei = { ...w.frei };

      if (newSp1.playerId === candidatePlayerId) {
        newSp1.status = 'accepted';
      } else if (newSp2.playerId === candidatePlayerId) {
        newSp2.status = 'accepted';
      } else if (newFrei.playerId === candidatePlayerId) {
        newFrei.status = 'accepted';
      }

      // Re-run standby cascade calculation for any remaining open spots
      const cascade = calculateStandbyCascade({ 
        ...w, 
        slots: newSlots, 
        springer1: newSp1, 
        springer2: newSp2,
        frei: newFrei
      });

      return { 
        ...w, 
        slots: newSlots, 
        springer1: cascade.springer1, 
        springer2: cascade.springer2,
        frei: cascade.frei
      };
    }));

    return true;
  };

  // --- Cancel Substitute (Springer steigt wieder aus) ---
  const cancelSubstitute = (weekId: string, targetSlot: SlotTime, substitutePlayerId: string, reason?: string) => {
    setWeeks(prevWeeks => prevWeeks.map(w => {
      if (w.id !== weekId) return w;
      const newSlots = { ...w.slots };
      
      const subIdx = newSlots[targetSlot].findIndex(a => a.playerId === substitutePlayerId && a.status === 'substitute');
      if (subIdx === -1) return w;

      const subAssignment = newSlots[targetSlot][subIdx];
      const origPlayerId = subAssignment.originalPlayerId || 'p1';

      // Re-open the slot for the original player or next substitute
      newSlots[targetSlot][subIdx] = {
        playerId: origPlayerId,
        originalPlayerId: origPlayerId,
        status: 'declined',
        declineReason: reason ? `Ersatzspieler abgesagt: ${reason}` : 'Ersatzspieler wieder ausgestiegen',
        updatedAt: new Date().toISOString(),
      };

      // Mark the substitute's status as declined so it cascades down
      let newSp1 = { ...w.springer1 };
      let newSp2 = { ...w.springer2 };
      let newFrei = { ...w.frei };

      if (newSp1.playerId === substitutePlayerId) {
        newSp1.status = 'declined';
      } else if (newSp2.playerId === substitutePlayerId) {
        newSp2.status = 'declined';
      } else if (newFrei.playerId === substitutePlayerId) {
        newFrei.status = 'declined';
      }

      const isActivelyPlaying = (pId: string) => {
        if (!pId) return true;
        return getWeekSlotKeys(w).some(sk =>
          (newSlots[sk] || []).some(a => a.playerId === pId && a.status !== 'declined')
        );
      };

      // Check if Springer 2 is available to step in automatically
      let nextAutoSpringerId: string | null = null;
      if (newSp1.playerId === substitutePlayerId && springerCount >= 2 && newSp2.playerId && newSp2.status !== 'declined' && !isActivelyPlaying(newSp2.playerId)) {
        nextAutoSpringerId = newSp2.playerId;
        newSp2.status = 'accepted';
      } else if (newSp2.playerId === substitutePlayerId && springerCount >= 3 && newFrei.playerId && newFrei.status !== 'declined' && !isActivelyPlaying(newFrei.playerId)) {
        nextAutoSpringerId = newFrei.playerId;
        newFrei.status = 'accepted';
      }

      if (nextAutoSpringerId) {
        newSlots[targetSlot][subIdx] = {
          playerId: nextAutoSpringerId,
          originalPlayerId: origPlayerId,
          status: 'substitute',
          updatedAt: new Date().toISOString(),
        };
      }

      const cascade = calculateStandbyCascade({
        ...w,
        slots: newSlots,
        springer1: newSp1,
        springer2: newSp2,
        frei: newFrei,
      }, springerCount);

      return { 
        ...w, 
        slots: newSlots, 
        springer1: cascade.springer1, 
        springer2: cascade.springer2,
        frei: cascade.frei
      };
    }));
  };

  // --- Decline Substitute Offer (Springer oder Frei lehnt das Einspringen ab -> Kaskade zur nächsten Stufe) ---
  const declineSubstituteOffer = (weekId: string, playerId: string) => {
    setWeeks(prevWeeks => prevWeeks.map(w => {
      if (w.id !== weekId) return w;
      let newSp1 = { ...w.springer1 };
      let newSp2 = { ...w.springer2 };
      let newFrei = { ...w.frei };

      if (newSp1.playerId === playerId) {
        newSp1.status = 'declined';
      } else if (newSp2.playerId === playerId) {
        newSp2.status = 'declined';
      } else if (newFrei.playerId === playerId) {
        newFrei.status = 'declined';
      }

      const cascade = calculateStandbyCascade({
        ...w,
        springer1: newSp1,
        springer2: newSp2,
        frei: newFrei,
      }, springerCount);

      return { 
        ...w, 
        springer1: cascade.springer1, 
        springer2: cascade.springer2,
        frei: cascade.frei
      };
    }));
  };

  // --- Skip Priority to next candidate (Admin or Fast-Forward) ---
  const skipStandbyPriorityToNext = (weekId: string, prioLevel: number) => {
    setWeeks(prevWeeks => prevWeeks.map(w => {
      if (w.id !== weekId) return w;
      let newSp1 = { ...w.springer1 };
      let newSp2 = { ...w.springer2 };
      let newFrei = w.frei ? { ...w.frei } : { playerId: '', status: 'idle' as const };

      if (prioLevel === 1) newSp1.status = 'declined';
      if (prioLevel === 2) newSp2.status = 'declined';
      if (prioLevel === 3) newFrei.status = 'declined';

      const cascade = calculateStandbyCascade({
        ...w,
        springer1: newSp1,
        springer2: newSp2,
        frei: newFrei,
      }, springerCount);

      return { 
        ...w, 
        springer1: cascade.springer1, 
        springer2: cascade.springer2,
        frei: cascade.frei,
      };
    }));
  };

  // --- Release Open Slots immediately to ALL club members ---
  const releaseOpenSlotsToAll = (weekId: string) => {
    setWeeks(prevWeeks => prevWeeks.map(w => {
      if (w.id !== weekId) return w;
      let newSp1 = { ...w.springer1 };
      let newSp2 = { ...w.springer2 };
      let newFrei = w.frei ? { ...w.frei } : { playerId: '', status: 'idle' as const };

      if (newSp1.status !== 'accepted') newSp1.status = 'declined';
      if (newSp2.status !== 'accepted') newSp2.status = 'declined';
      if (newFrei.status !== 'accepted') newFrei.status = 'declined';

      const cascade = calculateStandbyCascade({
        ...w,
        springer1: newSp1,
        springer2: newSp2,
        frei: newFrei,
      }, springerCount);

      return { 
        ...w, 
        springer1: cascade.springer1, 
        springer2: cascade.springer2,
        frei: cascade.frei
      };
    }));
  };

  // --- Reset Standby Cascade ---
  const resetStandbyCascade = (weekId: string) => {
    setWeeks(prevWeeks => prevWeeks.map(w => {
      if (w.id !== weekId) return w;
      let newSp1 = { ...w.springer1 };
      let newSp2 = { ...w.springer2 };
      let newFrei = w.frei ? { ...w.frei } : { playerId: '', status: 'idle' as const };

      // Reset to idle if not currently playing actively
      const allSlotKeys = getWeekSlotKeys(w);
      const isSp1Playing = allSlotKeys.some(st => (w.slots[st] || []).some(a => a.playerId === newSp1.playerId && a.status !== 'declined'));
      const isSp2Playing = allSlotKeys.some(st => (w.slots[st] || []).some(a => a.playerId === newSp2.playerId && a.status !== 'declined'));
      const isFreiPlaying = allSlotKeys.some(st => (w.slots[st] || []).some(a => a.playerId === newFrei.playerId && a.status !== 'declined'));

      if (!isSp1Playing) newSp1.status = 'idle';
      if (!isSp2Playing) newSp2.status = 'idle';
      if (!isFreiPlaying) newFrei.status = 'idle';

      const cascade = calculateStandbyCascade({
        ...w,
        springer1: newSp1,
        springer2: newSp2,
        frei: newFrei,
      }, springerCount);

      return { 
        ...w, 
        springer1: cascade.springer1, 
        springer2: cascade.springer2,
        frei: cascade.frei
      };
    }));
  };

  // --- Query cascade info ---
  const getStandbyCascadeInfo = (weekId: string): StandbyCascadeResult | null => {
    const w = weeks.find(item => item.id === weekId);
    if (!w) return null;
    return calculateStandbyCascade(w, springerCount);
  };

  // --- Claim Open Slot ---
  const claimOpenSlot = (weekId: string, targetSlot: SlotTime, candidatePlayerId: string): boolean => {
    return acceptSubstitute(weekId, targetSlot, candidatePlayerId);
  };

  // --- Swap Requests ---
  const requestSwap = (
    weekId: string, 
    fromPlayerId: string, 
    fromSlot: SlotTime, 
    targetSlot: SlotTime, 
    targetPlayerId?: string
  ) => {
    const newSwap: SwapRequest = {
      id: `swap-${Date.now()}`,
      weekId,
      fromPlayerId,
      fromSlot,
      targetSlot,
      targetPlayerId,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    setSwaps(prev => [newSwap, ...prev]);

    // Update assignment status to swapped/pending
    setWeeks(prevWeeks => prevWeeks.map(w => {
      if (w.id !== weekId) return w;
      const newSlots = { ...w.slots };
      newSlots[fromSlot] = newSlots[fromSlot].map(a => {
        if (a.playerId === fromPlayerId) {
          return { ...a, status: 'swapped' };
        }
        return a;
      });
      return { ...w, slots: newSlots };
    }));
  };

  const acceptSwap = (swapId: string, acceptingPlayerId?: string) => {
    const swap = swaps.find(s => s.id === swapId);
    if (!swap) return;

    try {
      confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
    } catch {
      // ignore
    }

    setWeeks(prevWeeks => prevWeeks.map(w => {
      if (w.id !== swap.weekId) return w;
      const newSlots = { ...w.slots };

      const fromPlayerIdx = newSlots[swap.fromSlot].findIndex(a => a.playerId === swap.fromPlayerId);
      
      let targetPlayerIdx = -1;
      if (acceptingPlayerId) {
        targetPlayerIdx = newSlots[swap.targetSlot].findIndex(a => a.playerId === acceptingPlayerId);
      } else if (swap.targetPlayerId) {
        targetPlayerIdx = newSlots[swap.targetSlot].findIndex(a => a.playerId === swap.targetPlayerId);
      } else {
        targetPlayerIdx = 0;
      }

      if (fromPlayerIdx !== -1 && targetPlayerIdx !== -1) {
        const targetPlayer = newSlots[swap.targetSlot][targetPlayerIdx];
        if (targetPlayer.playerId !== swap.fromPlayerId) {
          newSlots[swap.targetSlot][targetPlayerIdx] = {
            playerId: swap.fromPlayerId,
            status: 'confirmed',
            updatedAt: new Date().toISOString(),
          };
          newSlots[swap.fromSlot][fromPlayerIdx] = {
            playerId: targetPlayer.playerId,
            status: 'confirmed',
            updatedAt: new Date().toISOString(),
          };

          // Strict deduplication guarantee on both affected slots
          const uniqueTargetMap = new Map<string, SlotAssignment>();
          newSlots[swap.targetSlot].forEach(a => {
            if (!uniqueTargetMap.has(a.playerId) || a.isGuest) {
              uniqueTargetMap.set(a.isGuest ? `guest-${Date.now()}-${Math.random()}` : a.playerId, a);
            }
          });
          newSlots[swap.targetSlot] = Array.from(uniqueTargetMap.values());

          const uniqueFromMap = new Map<string, SlotAssignment>();
          newSlots[swap.fromSlot].forEach(a => {
            if (!uniqueFromMap.has(a.playerId) || a.isGuest) {
              uniqueFromMap.set(a.isGuest ? `guest-${Date.now()}-${Math.random()}` : a.playerId, a);
            }
          });
          newSlots[swap.fromSlot] = Array.from(uniqueFromMap.values());
        }
      }

      return { ...w, slots: newSlots };
    }));

    setSwaps(prev => prev.map(s => s.id === swapId ? { ...s, status: 'accepted' } : s));
  };

  const declineSwap = (swapId: string) => {
    const swap = swaps.find(s => s.id === swapId);
    if (!swap) return;

    setWeeks(prevWeeks => prevWeeks.map(w => {
      if (w.id !== swap.weekId) return w;
      const newSlots = { ...w.slots };
      newSlots[swap.fromSlot] = newSlots[swap.fromSlot].map(a => {
        if (a.playerId === swap.fromPlayerId) {
          return { ...a, status: 'confirmed' };
        }
        return a;
      });
      return { ...w, slots: newSlots };
    }));

    setSwaps(prev => prev.map(s => s.id === swapId ? { ...s, status: 'declined' } : s));
  };

  const cancelSwap = (swapId: string) => {
    const swap = swaps.find(s => s.id === swapId);
    if (!swap) return;

    setWeeks(prevWeeks => prevWeeks.map(w => {
      if (w.id !== swap.weekId) return w;
      const newSlots = { ...w.slots };
      newSlots[swap.fromSlot] = newSlots[swap.fromSlot].map(a => {
        if (a.playerId === swap.fromPlayerId) {
          return { ...a, status: 'confirmed' };
        }
        return a;
      });
      return { ...w, slots: newSlots };
    }));

    setSwaps(prev => prev.filter(s => s.id !== swapId));
  };

  // --- Absences ---
  const addAbsence = (playerId: string, date: string, reason: string) => {
    const newAbsence: Absence = {
      id: `abs-${Date.now()}`,
      playerId,
      date,
      reason,
      createdAt: new Date().toISOString(),
    };
    setAbsences(prev => [...prev, newAbsence]);

    const targetWeek = weeks.find(w => w.date === date);
    if (targetWeek) {
      declineAttendance(targetWeek.id, playerId, reason);
    }
  };

  const deleteAbsence = (absenceId: string) => {
    setAbsences(prev => prev.filter(a => a.id !== absenceId));
  };

  // --- Admin tools ---
  const adminUpdateSlot = (
    weekId: string, 
    slot: SlotTime, 
    playerIndex: number, 
    newPlayerId: string, 
    status: PlayerStatus = 'confirmed'
  ) => {
    setWeeks(prevWeeks => prevWeeks.map(w => {
      if (w.id !== weekId) return w;
      const newSlots = { ...w.slots };
      newSlots[slot] = [...newSlots[slot]];
      newSlots[slot][playerIndex] = {
        playerId: newPlayerId,
        status,
        updatedAt: new Date().toISOString(),
      };
      return { ...w, slots: newSlots };
    }));
  };

  const adminDragDropAssign = (
    weekId: string, 
    slot: SlotTime, 
    droppedPlayerId: string, 
    targetPlayerIdToReplace?: string
  ) => {
    if (droppedPlayerId === targetPlayerIdToReplace) return;

    setWeeks(prevWeeks => {
      const updated = prevWeeks.map(w => {
        if (w.id !== weekId) return w;
        
        // Deep clone slots to avoid reference issues
        const newSlots = JSON.parse(JSON.stringify(w.slots)) as typeof w.slots;
        
        // --- Special Case: Remove player to pool ---
        const isRemoveAction = droppedPlayerId === 'remove' || targetPlayerIdToReplace === 'remove';
        if (isRemoveAction) {
           const targetId = droppedPlayerId === 'remove' ? targetPlayerIdToReplace : droppedPlayerId;
           if (!targetId) return w;
           const targetArr = newSlots[slot] || [];
           const tIdx = targetArr.findIndex(a => 
             a.playerId === targetId || 
             (a.isGuest && (a.guestName === targetId || `guest_${a.guestName}` === targetId || a.playerId === targetId))
           );
           if (tIdx !== -1) {
             targetArr.splice(tIdx, 1);
           }
           const cascade = calculateStandbyCascade({
             ...w,
             slots: newSlots,
           });
           return { 
             ...w, 
             slots: newSlots,
             springer1: cascade.springer1,
             springer2: cascade.springer2,
             frei: cascade.frei,
           };
        }

        // 1. Find where the dropped player currently is
        let sourceSlot: string | null = null;
        let sourceIndex = -1;
        let sourceAssignment: any = null;
        
        Object.entries(newSlots).forEach(([k, arr]) => {
          const idx = arr.findIndex(a => a.playerId === droppedPlayerId);
          if (idx !== -1) {
            sourceSlot = k;
            sourceIndex = idx;
            sourceAssignment = { ...arr[idx] };
          }
        });

        // 2. Find target player if applicable
        let targetIndex = -1;
        let targetAssignment: any = null;
        if (targetPlayerIdToReplace) {
           const tArr = newSlots[slot] || [];
           targetIndex = tArr.findIndex(a => a.playerId === targetPlayerIdToReplace);
           if (targetIndex !== -1) {
             targetAssignment = { ...tArr[targetIndex] };
           }
        }

        // --- Apply Logic ---

        // Case 1: Swapping two planned players
        if (sourceSlot && sourceIndex !== -1 && targetAssignment && targetIndex !== -1) {
           if (sourceSlot === slot) {
              // Same slot swap
              newSlots[slot][targetIndex] = sourceAssignment;
              newSlots[slot][sourceIndex] = targetAssignment;
           } else {
              // Cross-slot swap
              newSlots[slot][targetIndex] = sourceAssignment;
              newSlots[sourceSlot][sourceIndex] = targetAssignment;
           }
        } 
        // Case 2: Dropping from Pool onto a planned player
        else if (!sourceSlot && targetAssignment && targetIndex !== -1) {
           newSlots[slot][targetIndex] = {
             playerId: droppedPlayerId,
             status: 'confirmed',
             updatedAt: new Date().toISOString()
           };
        }
        // Case 3: Moving a planned player to an empty spot
        else if (sourceSlot && !targetPlayerIdToReplace) {
           newSlots[sourceSlot].splice(sourceIndex, 1);
           if (!newSlots[slot]) newSlots[slot] = [];
           if (newSlots[slot].length < 4) {
             newSlots[slot].push(sourceAssignment);
           }
        }
        // Case 4: Dropping from Pool into an empty spot
        else if (!sourceSlot && !targetPlayerIdToReplace) {
           if (!newSlots[slot]) newSlots[slot] = [];
           if (newSlots[slot].length < 4) {
             newSlots[slot].push({
               playerId: droppedPlayerId,
               status: 'confirmed',
               updatedAt: new Date().toISOString()
             });
           }
        }

        const cleanSpringer = (s: {playerId: string, status: string}) => 
          s.playerId === droppedPlayerId ? { playerId: '', status: 'idle' as any } : s;

        return { 
          ...w, 
          slots: newSlots,
          springer1: cleanSpringer(w.springer1),
          springer2: cleanSpringer(w.springer2),
          frei: cleanSpringer(w.frei),
        };
      });
      StorageService.saveWeeks(updated);
      return updated;
    });
  };

  const adminAddGuest = (weekId: string, slot: SlotTime, guestName: string) => {
    setWeeks(prevWeeks => prevWeeks.map(w => {
      if (w.id !== weekId) return w;
      const newSlots = { ...w.slots };
      const declinedIndex = newSlots[slot].findIndex(a => a.status === 'declined');
      const guestAssignment: any = {
        playerId: `guest-${Date.now()}`,
        isGuest: true,
        guestName,
        status: 'confirmed',
        updatedAt: new Date().toISOString(),
      };
      if (declinedIndex !== -1) {
        newSlots[slot][declinedIndex] = guestAssignment;
      } else if (newSlots[slot].length < 4) {
        newSlots[slot].push(guestAssignment);
      }
      return { ...w, slots: newSlots };
    }));
  };

  const adminRemoveGuest = (weekId: string, slot: SlotTime, guestIndex: number) => {
    setWeeks(prevWeeks => prevWeeks.map(w => {
      if (w.id !== weekId) return w;
      const newSlots = { ...w.slots };
      newSlots[slot] = newSlots[slot].filter((_, idx) => idx !== guestIndex);
      return { ...w, slots: newSlots };
    }));
  };

  const adminRemovePlayer = (weekId: string, slot: SlotTime, playerIdOrGuest: string) => {
    adminDragDropAssign(weekId, slot, playerIdOrGuest, 'remove');
  };

  // --- Player Administration ---
  const addPlayer = (newPlayerData: Omit<Player, 'id'>) => {
    const newId = `p${Date.now()}`;
    const newPlayer: Player = {
      ...newPlayerData,
      id: newId,
      shortName: newPlayerData.shortName || newPlayerData.name.slice(0, 2).toUpperCase(),
      avatarColor: newPlayerData.avatarColor || '#3B82F6',
    };
    setPlayers(prev => {
      const updated = [...prev, newPlayer];
      StorageService.savePlayers(updated);
      return updated;
    });
  };

  const updatePlayer = (updatedPlayer: Player) => {
    setPlayers(prev => {
      const updated = prev.map(p => p.id === updatedPlayer.id ? updatedPlayer : p);
      StorageService.savePlayers(updated);
      return updated;
    });
    if (currentUser.id === updatedPlayer.id) {
      setCurrentUser(updatedPlayer);
    }
  };

  const deletePlayer = (playerId: string) => {
    if (players.length <= 4) {
      alert('Es müssen mindestens 4 Spieler im Verein verbleiben!');
      return;
    }
    setPlayers(prev => {
      const updated = prev.filter(p => p.id !== playerId);
      StorageService.savePlayers(updated);
      StorageService.deleteRecord('players', playerId);
      return updated;
    });
    if (currentUser.id === playerId) {
      const next = players.find(p => p.id !== playerId);
      if (next) setCurrentUser(next);
    }
  };

  const reorderPlayers = (newPlayers: Player[]) => {
    setPlayers(newPlayers);
    StorageService.savePlayers(newPlayers);
  };

  // --- Calendar & Schedule Administration ---
  const addTrainingWeekDate = (dateStr: string, iso: string) => {
    const templateWeek = weeks[0];
    const startTime = templateWeek?.startTime || '18:00';
    const slotDuration = templateWeek?.slotDurationMinutes || 60;
    const keys = templateWeek ? getWeekSlotKeys(templateWeek) : ['18:00-19:00', '19:00-20:00', '20:00-21:00'];
    
    const emptySlots: Record<string, SlotAssignment[]> = {};
    keys.forEach(k => { emptySlots[k] = []; });

    const newWeek: TrainingWeek = {
      id: iso,
      dateString: dateStr,
      date: iso,
      isCancelled: false,
      startTime,
      slotDurationMinutes: slotDuration,
      slots: emptySlots,
      springer1: { playerId: players[0]?.id || '', status: 'idle' },
      springer2: { playerId: players[1]?.id || '', status: 'idle' },
      frei: { playerId: players[2]?.id || '', status: 'idle' },
    };

    setWeeks(prev => {
      const updated = [...prev, newWeek].sort((a, b) => a.date.localeCompare(b.date));
      StorageService.saveWeeks(updated);
      return updated;
    });
  };

  const updateWeekDate = (weekId: string, newDateStr: string, newIsoDate: string) => {
    setWeeks(prev => {
      const updated = prev.map(w => {
        if (w.id !== weekId) return w;
        return {
          ...w,
          id: newIsoDate,
          date: newIsoDate,
          dateString: newDateStr,
        };
      }).sort((a, b) => a.date.localeCompare(b.date));
      StorageService.saveWeeks(updated);
      return updated;
    });

    if (selectedWeekId === weekId) {
      setSelectedWeekId(newIsoDate);
    }

    setAbsences(prev => {
      const targetWeek = weeks.find(w => w.id === weekId);
      if (!targetWeek) return prev;
      const updated = prev.map(a => a.date === targetWeek.date ? { ...a, date: newIsoDate } : a);
      StorageService.saveAbsences(updated);
      return updated;
    });

    setSwaps(prev => {
      const updated = prev.map(s => s.weekId === weekId ? { ...s, weekId: newIsoDate } : s);
      StorageService.saveSwaps(updated);
      return updated;
    });
  };

  const deleteTrainingWeek = (weekId: string) => {
    setWeeks(prev => {
      const updated = prev.filter(w => w.id !== weekId);
      StorageService.saveWeeks(updated);
      StorageService.deleteRecord('training_weeks', weekId);
      return updated;
    });
    if (selectedWeekId === weekId) {
      const remaining = weeks.filter(w => w.id !== weekId);
      if (remaining.length > 0) setSelectedWeekId(remaining[0].id);
    }
  };

  const toggleWeekCancellation = (weekId: string, cancelReason?: string) => {
    setWeeks(prev => {
      const updated = prev.map(w => {
        if (w.id !== weekId) return w;
        const isNowCancelled = !w.isCancelled;
        return {
          ...w,
          isCancelled: isNowCancelled,
          cancelReason: isNowCancelled ? (cancelReason || 'Kein Training (Feiertag / Ausfall)') : undefined,
        };
      });
      StorageService.saveWeeks(updated);
      return updated;
    });
  };

  const updateWeekNotes = (weekId: string, notes: string) => {
    setWeeks(prev => {
      const updated = prev.map(w => w.id === weekId ? { ...w, notes } : w);
      StorageService.saveWeeks(updated);
      return updated;
    });
  };

  const replaceEntireSchedule = (newWeeks: TrainingWeek[]) => {
    try {
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
    } catch {}
    setWeeks(newWeeks);
    StorageService.saveWeeks(newWeeks);
  };

  // --- Dynamic Trainingseinheiten & Slot Configuration ---
  const emptyWeekSlot = (weekId: string, slotKey: string) => {
    setWeeks(prevWeeks => {
      const updated = prevWeeks.map(w => {
        if (w.id !== weekId) return w;
        return {
          ...w,
          slots: {
            ...w.slots,
            [slotKey]: []
          }
        };
      });
      StorageService.saveWeeks(updated);
      return updated;
    });
  };

  const updateWeekSlotConfig = (
    weekId: string, 
    hoursCount: number, 
    durations: number | number[], 
    startTime: string
  ) => {
    // Invariant check: Cannot reduce if slots to be removed are still occupied!
    const targetWeek = weeks.find(w => w.id === weekId);
    if (targetWeek) {
      const { allowed, occupiedSlots } = canReduceWeekSlots(targetWeek, hoursCount);
      if (!allowed) {
        console.warn(`Trainingseinheit kann nicht reduziert werden: ${occupiedSlots.length} Einheit(en) noch belegt!`, occupiedSlots);
        return;
      }
    }

    try {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    } catch {}

    setWeeks(prevWeeks => {
      const updated = prevWeeks.map(w => {
        if (w.id !== weekId) return w;

        const newKeys = generateSlotTimes(startTime, durations, hoursCount);
        const oldKeys = getWeekSlotKeys(w);
        const newSlots: Record<string, SlotAssignment[]> = {};

        newKeys.forEach((key, idx) => {
          if (idx < oldKeys.length && w.slots[oldKeys[idx]]) {
            // Transfer existing assignments for this hour index
            newSlots[key] = [...w.slots[oldKeys[idx]]];
          } else {
            // Newly added hour: starts empty (all 4 spots open for springers/substitutes)
            newSlots[key] = [];
          }
        });

        const durationsArray = Array.isArray(durations) ? durations : Array(hoursCount).fill(durations);

        return {
          ...w,
          startTime,
          slotDurationMinutes: Array.isArray(durations) ? durations[0] : durations,
          customDurations: durationsArray,
          slots: newSlots,
        };
      });
      StorageService.saveWeeks(updated);
      return updated;
    });
  };

  const applySlotConfigToAllWeeks = (
    hoursCount: number, 
    durations: number | number[], 
    startTime: string
  ) => {
    try {
      confetti({ particleCount: 90, spread: 75, origin: { y: 0.6 } });
    } catch {}

    setWeeks(prevWeeks => {
      const updated = prevWeeks.map(w => {
        if (w.isCancelled) return w;

        // Skip reduction for weeks whose to-be-removed slots are still occupied
        const { allowed } = canReduceWeekSlots(w, hoursCount);
        if (!allowed) {
          console.warn(`Woche ${w.id} wird nicht reduziert, da Einheiten noch belegt sind.`);
          return w;
        }

        const newKeys = generateSlotTimes(startTime, durations, hoursCount);
        const oldKeys = getWeekSlotKeys(w);
        const newSlots: Record<string, SlotAssignment[]> = {};

        newKeys.forEach((key, idx) => {
          if (idx < oldKeys.length && w.slots[oldKeys[idx]]) {
            newSlots[key] = [...w.slots[oldKeys[idx]]];
          } else {
            newSlots[key] = [];
          }
        });

        const durationsArray = Array.isArray(durations) ? durations : Array(hoursCount).fill(durations);

        return {
          ...w,
          startTime,
          slotDurationMinutes: Array.isArray(durations) ? durations[0] : durations,
          customDurations: durationsArray,
          slots: newSlots,
        };
      });
      StorageService.saveWeeks(updated);
      return updated;
    });
  };

  const resetWeekToOriginal = (weekId: string) => {
    setWeeks(prevWeeks => {
      const updated = prevWeeks.map(w => {
        if (w.id !== weekId) return w;
        if (!w.originalState) {
          alert('Für diesen Spieltag ist kein Ursprungszustand gespeichert. Bitte generiere den Plan neu, um diese Funktion in Zukunft nutzen zu können.');
          return w;
        }

        // Wipe swaps related to this week
        setSwaps(prevSwaps => prevSwaps.filter(s => s.weekId !== weekId));

        return {
          ...w,
          slots: JSON.parse(JSON.stringify(w.originalState.slots)),
          springer1: { ...w.originalState.springer1 },
          springer2: { ...w.originalState.springer2 },
          frei: { ...w.originalState.frei },
        };
      });
      StorageService.saveWeeks(updated);
      return updated;
    });
  };

  const resetAll = () => {
    StorageService.resetAllData();
    setPlayers(StorageService.getPlayers());
    setWeeks(StorageService.getWeeks());
    setAbsences([]);
    setSwaps([]);
    setTheme(THEME_PRESETS[0]);
  };

  return (
    <AppContext.Provider
      value={{
        players,
        weeks,
        selectedWeek,
        selectedWeekId,
        setSelectedWeekId,
        currentUser,
        setCurrentUser,
        impersonatorAdminId,
        isImpersonating,
        actualAdminPlayer,
        impersonateUser,
        exitImpersonation,
        isLoggedIn,
        logout,
        theme,
        setTheme,
        isDarkMode,
        setIsDarkMode,
        absences,
        swaps,
        isPlayerScheduledInWeek,
        getPlayerCurrentSlotInWeek,
        getOpenSlotsInWeek,
        updateWeekSlotConfig,
        applySlotConfigToAllWeeks,
        emptyWeekSlot,
        confirmAttendance,
        declineAttendance,
        reclaimSlot,
        acceptSubstitute,
        cancelSubstitute,
        declineSubstituteOffer,
        claimOpenSlot,
        skipStandbyPriorityToNext,
        releaseOpenSlotsToAll,
        resetStandbyCascade,
        getStandbyCascadeInfo,
        requestSwap,
        acceptSwap,
        declineSwap,
        cancelSwap,
        addAbsence,
        deleteAbsence,
        adminUpdateSlot,
        adminDragDropAssign,
        adminRemovePlayer,
        adminAddGuest,
        springerCount,
        setSpringerCount,
        resetWeekToOriginal,
        addPlayer,
        updatePlayer,
        deletePlayer,
        reorderPlayers,
        addTrainingWeekDate,
        updateWeekDate,
        deleteTrainingWeek,
        toggleWeekCancellation,
        updateWeekNotes,
        replaceEntireSchedule,
        resetAll,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
