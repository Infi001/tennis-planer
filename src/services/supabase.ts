import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Get credentials from environment
export function getSupabaseConfig(): { url: string; anonKey: string } {
  const url = import.meta.env.VITE_SUPABASE_URL || '';
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  return { url, anonKey };
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  const { url, anonKey } = getSupabaseConfig();
  if (!url || !anonKey) {
    return null;
  }
  if (!supabaseInstance) {
    supabaseInstance = createClient(url, anonKey);
  }
  return supabaseInstance;
}

export function saveSupabaseConfig(url: string, anonKey: string) {
  if (url && anonKey) {
    localStorage.setItem('tennis_supabase_url', url);
    localStorage.setItem('tennis_supabase_key', anonKey);
    supabaseInstance = createClient(url, anonKey);
  } else {
    localStorage.removeItem('tennis_supabase_url');
    localStorage.removeItem('tennis_supabase_key');
    supabaseInstance = null;
  }
}

export const SUPABASE_SQL_SCHEMA = `-- ==========================================
-- Tennis Trainingsplaner - Supabase Schema
-- Führe diesen SQL-Code im Supabase SQL Editor aus:
-- ==========================================

-- 1. Tabelle für Vereins-Einstellungen
CREATE TABLE IF NOT EXISTS club_settings (
  id TEXT PRIMARY KEY DEFAULT 'default-club',
  name TEXT NOT NULL DEFAULT 'TC Blau-Weiß',
  theme_id TEXT NOT NULL DEFAULT 'blau-weiss',
  primary_color TEXT NOT NULL DEFAULT '#1D4ED8',
  secondary_color TEXT NOT NULL DEFAULT '#0284C7',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Tabelle für Spieler
CREATE TABLE IF NOT EXISTS players (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  avatar_color TEXT,
  email TEXT,
  phone TEXT,
  pin TEXT,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Tabelle für Trainingswochen
CREATE TABLE IF NOT EXISTS training_weeks (
  id TEXT PRIMARY KEY, -- z.B. '2026-10-05'
  date_string TEXT NOT NULL,
  is_cancelled BOOLEAN DEFAULT false,
  cancel_reason TEXT,
  slots JSONB NOT NULL,
  springer1 JSONB NOT NULL,
  springer2 JSONB NOT NULL,
  frei JSONB NOT NULL,
  notes TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. Tabelle für Vorab-Abwesenheiten (Urlaub / Dienstreisen)
CREATE TABLE IF NOT EXISTS absences (
  id TEXT PRIMARY KEY,
  player_id TEXT REFERENCES players(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 5. Tabelle für Tauschanfragen
CREATE TABLE IF NOT EXISTS swap_requests (
  id TEXT PRIMARY KEY,
  week_id TEXT REFERENCES training_weeks(id) ON DELETE CASCADE,
  from_player_id TEXT REFERENCES players(id),
  from_slot TEXT NOT NULL,
  target_slot TEXT NOT NULL,
  target_player_id TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- RLS aktivieren & Public Access für Prototyp erlauben
ALTER TABLE club_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_weeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE absences ENABLE ROW LEVEL SECURITY;
ALTER TABLE swap_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read/Write Club" ON club_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Read/Write Players" ON players FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Read/Write Weeks" ON training_weeks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Read/Write Absences" ON absences FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Read/Write Swaps" ON swap_requests FOR ALL USING (true) WITH CHECK (true);

-- Realtime aktivieren
ALTER PUBLICATION supabase_realtime ADD TABLE training_weeks;
ALTER PUBLICATION supabase_realtime ADD TABLE absences;
ALTER PUBLICATION supabase_realtime ADD TABLE swap_requests;
`;
