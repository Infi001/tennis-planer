import React, { useState } from 'react';
import { Player } from '../../types/tennis';
import { useApp } from '../../context/AppContext';
import { 
  Users, 
  UserPlus, 
  Search, 
  Edit2, 
  Trash2, 
  Shield, 
  ShieldAlert, 
  Phone, 
  Mail, 
  Check, 
  X, 
  Sparkles,
  Lock
} from 'lucide-react';

const AVATAR_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#6366F1', 
  '#EC4899', '#8B5CF6', '#14B8A6', '#F97316', 
  '#06B6D4', '#84CC16', '#A855F7', '#E11D48',
  '#0284C7', '#059669', '#D97706', '#475569'
];

export const PlayerManagement: React.FC = () => {
  const { players, currentUser, theme, addPlayer, updatePlayer, deletePlayer } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [playerToDelete, setPlayerToDelete] = useState<Player | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formShortName, setFormShortName] = useState('');
  const [formColor, setFormColor] = useState('#3B82F6');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formPin, setFormPin] = useState('');
  const [formIsAdmin, setFormIsAdmin] = useState(false);

  const openAddModal = () => {
    setFormName('');
    setFormShortName('');
    setFormColor(AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]);
    setFormEmail('');
    setFormPhone('');
    setFormPin('');
    setFormIsAdmin(false);
    setIsAddingNew(true);
  };

  const openEditModal = (player: Player) => {
    setEditingPlayer(player);
    setFormName(player.name);
    setFormShortName(player.shortName);
    setFormColor(player.avatarColor || '#3B82F6');
    setFormEmail(player.email || '');
    setFormPhone(player.phone || '');
    setFormPin(player.pin || '');
    setFormIsAdmin(!!player.isAdmin);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const shortName = formShortName.trim() || formName.trim().slice(0, 2).toUpperCase();

    if (isAddingNew) {
      addPlayer({
        name: formName.trim(),
        shortName,
        avatarColor: formColor,
        email: formEmail.trim() || undefined,
        phone: formPhone.trim() || undefined,
        pin: formPin.trim() || undefined,
        isAdmin: formIsAdmin,
      });
      setIsAddingNew(false);
    } else if (editingPlayer) {
      updatePlayer({
        ...editingPlayer,
        name: formName.trim(),
        shortName,
        avatarColor: formColor,
        email: formEmail.trim() || undefined,
        phone: formPhone.trim() || undefined,
        pin: formPin.trim() || undefined,
        isAdmin: formIsAdmin,
      });
      setEditingPlayer(null);
    }
  };

  const handleDeleteConfirm = () => {
    if (playerToDelete) {
      deletePlayer(playerToDelete.id);
      setPlayerToDelete(null);
    }
  };

  const filteredPlayers = players.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.shortName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.email && p.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const adminCount = players.filter(p => p.isAdmin).length;

  return (
    <div className="space-y-4">
      
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white dark:bg-[var(--md-sys-color-surface)] rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-xs">
        
        <div className="flex items-center space-x-3">
          <div 
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold shrink-0 shadow-xs"
            style={{ backgroundColor: theme.primary }}
          >
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-extrabold text-neutral-900 dark:text-neutral-100">
                Spieler- & Mitgliederverwaltung
              </h3>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                {players.length} Spieler
              </span>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {adminCount} Admin{adminCount !== 1 ? 's' : ''} • {players.length - adminCount} reguläre Mitglieder
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Spieler suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-xs pl-8 pr-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/80 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500 w-44 sm:w-56"
            />
          </div>

          <button
            onClick={openAddModal}
            className="py-2 px-3.5 rounded-xl text-xs font-bold text-white shadow-xs m3-ripple flex items-center space-x-1.5 shrink-0"
            style={{ backgroundColor: theme.primary }}
          >
            <UserPlus className="w-4 h-4" />
            <span>Neuer Spieler</span>
          </button>
        </div>

      </div>

      {/* Players List Grid / Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredPlayers.map((player, idx) => {
          const isCurrent = currentUser.id === player.id;

          return (
            <div
              key={player.id}
              className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                isCurrent
                  ? 'bg-blue-50/60 dark:bg-blue-950/20 border-blue-300 dark:border-blue-800 ring-2 ring-blue-500/20 shadow-xs'
                  : 'bg-white dark:bg-[var(--md-sys-color-surface)] border-neutral-200/80 dark:border-neutral-800 shadow-xs hover:border-neutral-300 dark:hover:border-neutral-700'
              }`}
            >
              <div className="flex items-center space-x-3 min-w-0">
                <div 
                  className="w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-black text-white shadow-xs shrink-0"
                  style={{ backgroundColor: player.avatarColor || theme.primary }}
                >
                  {player.shortName}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-sm font-bold text-neutral-900 dark:text-neutral-100 truncate">
                      {player.name}
                    </span>
                    {player.isAdmin && (
                      <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300" title="Administrator">
                        <Shield className="w-3 h-3 mr-0.5" />
                        Admin
                      </span>
                    )}
                    {isCurrent && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full text-white" style={{ backgroundColor: theme.primary }}>
                        Du
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 truncate">
                    <span>ID: #{idx + 1} ({player.shortName})</span>
                    {player.phone && (
                      <span className="flex items-center gap-0.5">
                        <Phone className="w-2.5 h-2.5" />
                        <span className="truncate">{player.phone}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-1 shrink-0 ml-2">
                <button
                  onClick={() => openEditModal(player)}
                  title="Spieler bearbeiten"
                  className="p-1.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-blue-600 transition-colors m3-ripple"
                >
                  <Edit2 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setPlayerToDelete(player)}
                  title="Spieler löschen"
                  disabled={players.length <= 4}
                  className="p-1.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 text-neutral-400 hover:text-rose-600 transition-colors m3-ripple disabled:opacity-30"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Add / Edit Modal */}
      {(isAddingNew || editingPlayer) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div 
            className="w-full max-w-md bg-white dark:bg-[var(--md-sys-color-surface)] rounded-3xl p-6 shadow-2xl border border-neutral-200 dark:border-neutral-800 space-y-4"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center space-x-2.5">
                <div 
                  className="w-9 h-9 rounded-2xl flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: formColor }}
                >
                  {formShortName || formName.slice(0, 2).toUpperCase() || '??'}
                </div>
                <div>
                  <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                    {isAddingNew ? 'Neuen Spieler anlegen' : `${editingPlayer?.name} bearbeiten`}
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Basisdaten und Berechtigungen
                  </p>
                </div>
              </div>
              <button 
                onClick={() => { setIsAddingNew(false); setEditingPlayer(null); }}
                className="p-1.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5">
              
              {/* Name & ShortName */}
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2 space-y-1">
                  <label className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300">
                    Vollständiger Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="z. B. Florian Herold"
                    value={formName}
                    onChange={(e) => {
                      setFormName(e.target.value);
                      if (!formShortName) {
                        const parts = e.target.value.trim().split(' ');
                        if (parts.length >= 2) {
                          setFormShortName((parts[0][0] + parts[1][0]).toUpperCase());
                        }
                      }
                    }}
                    className="w-full text-xs p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300">
                    Kürzel (2-3) *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={3}
                    placeholder="z. B. FH"
                    value={formShortName}
                    onChange={(e) => setFormShortName(e.target.value.toUpperCase())}
                    className="w-full text-xs p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase font-mono font-bold"
                  />
                </div>
              </div>

              {/* Color Palette Picker */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300 flex items-center justify-between">
                  <span>Spielerfarbe / Avatar</span>
                  <span className="font-mono text-[10px] text-neutral-400">{formColor}</span>
                </label>
                <div className="flex flex-wrap gap-1.5 p-2 bg-neutral-50 dark:bg-neutral-800/60 rounded-xl border border-neutral-200/80 dark:border-neutral-700">
                  {AVATAR_COLORS.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setFormColor(c)}
                      className={`w-6 h-6 rounded-full transition-transform ${
                        formColor === c ? 'scale-125 ring-2 ring-offset-2 ring-blue-500 shadow-xs' : 'hover:scale-110'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              {/* Contact info (Email & Phone) */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300">
                    E-Mail (optional)
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      placeholder="spieler@tennis.de"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      className="w-full text-xs pl-8 pr-2.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300">
                    Telefon / Mobil (optional)
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      placeholder="+49 170 1234567"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      className="w-full text-xs pl-8 pr-2.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Admin Checkbox */}
              <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-amber-500" />
                    <span>Administrator-Rechte</span>
                  </div>
                  <div className="text-[10px] text-neutral-500">
                    Darf Trainingszeiten konfigurieren und Saisonpläne verändern
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formIsAdmin}
                  onChange={(e) => setFormIsAdmin(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setIsAddingNew(false); setEditingPlayer(null); }}
                  className="flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-3 rounded-xl text-xs font-bold text-white shadow-xs m3-ripple flex items-center justify-center space-x-1"
                  style={{ backgroundColor: theme.primary }}
                >
                  <Check className="w-4 h-4" />
                  <span>{isAddingNew ? 'Spieler anlegen' : 'Änderungen speichern'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {playerToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white dark:bg-[var(--md-sys-color-surface)] rounded-3xl p-6 shadow-2xl border border-neutral-200 dark:border-neutral-800 space-y-4">
            <div className="flex items-center space-x-2.5 text-rose-600">
              <ShieldAlert className="w-6 h-6" />
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                Spieler wirklich löschen?
              </h3>
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
              Möchtest du <strong>{playerToDelete.name}</strong> wirklich aus dem Kader entfernen? Bei der nächsten automatischen Plan-Generierung wird dieser Spieler nicht mehr berücksichtigt.
            </p>
            <div className="flex items-center space-x-2 pt-2">
              <button
                onClick={() => setPlayerToDelete(null)}
                className="flex-1 py-2 rounded-xl text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                Abbrechen
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-xs m3-ripple"
              >
                Endgültig löschen
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
