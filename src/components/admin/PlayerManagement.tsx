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
  Lock,
  Share2,
  Copy,
  MessageSquare,
  Eye
} from 'lucide-react';

const AVATAR_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#6366F1', 
  '#EC4899', '#8B5CF6', '#14B8A6', '#F97316', 
  '#06B6D4', '#84CC16', '#A855F7', '#E11D48',
  '#0284C7', '#059669', '#D97706', '#475569'
];

export const PlayerManagement: React.FC = () => {
  const { players, currentUser, theme, addPlayer, updatePlayer, deletePlayer, impersonateUser } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [playerToDelete, setPlayerToDelete] = useState<Player | null>(null);

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showAllLinksModal, setShowAllLinksModal] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);

  const getPlayerMagicLink = (player: Player) => {
    return `${window.location.origin}/?token=${player.accessToken || ''}`;
  };

  const handleCopyPlayerLink = (player: Player) => {
    navigator.clipboard.writeText(getPlayerMagicLink(player));
    setCopiedId(player.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleWhatsAppInvite = (player: Player) => {
    const link = getPlayerMagicLink(player);
    const text = `🎾 Hallo ${player.name}!\nHier ist dein persönlicher Zugangslink für unseren ${theme.clubName} Trainingsplaner:\n\n👉 ${link}\n\nEinfach anklicken, dann bist du sofort eingeloggt!`;
    const phone = player.phone ? player.phone.replace(/[^0-9]/g, '') : '';
    const url = phone ? `https://wa.me/${phone}?text=${encodeURIComponent(text)}` : `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleCopyAllLinks = () => {
    const list = players.map(p => `${p.name}: ${getPlayerMagicLink(p)}`).join('\n\n');
    navigator.clipboard.writeText(list);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2500);
  };

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
            onClick={() => setShowAllLinksModal(true)}
            className="py-2 px-3 rounded-xl text-xs font-bold text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 shadow-xs m3-ripple flex items-center space-x-1.5 shrink-0"
            title="Alle persönlichen Einladungs-Links anzeigen"
          >
            <Share2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline">Alle Zugangs-Links</span>
          </button>

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
                {!isCurrent && (
                  <button
                    onClick={() => impersonateUser(player.id)}
                    title={`Aus Sicht von ${player.name} ansehen (Admin-Vorschau)`}
                    className="p-1.5 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-950/40 text-amber-600 dark:text-amber-400 transition-colors m3-ripple"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={() => handleWhatsAppInvite(player)}
                  title="WhatsApp Einladungs-Link senden"
                  className="p-1.5 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 transition-colors m3-ripple"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleCopyPlayerLink(player)}
                  title="Persönlichen Zugangslink kopieren"
                  className="p-1.5 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950/40 text-blue-600 dark:text-blue-400 transition-colors m3-ripple relative"
                >
                  {copiedId === player.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>

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

      {/* All Links Overview Modal */}
      {showAllLinksModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 w-full max-w-xl shadow-2xl border border-neutral-200 dark:border-neutral-800 space-y-4">
            
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                    Alle persönlichen Zugangs-Links
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Übersicht aller 1-Klick-Links für die Vereinsmitglieder
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAllLinksModal(false)}
                className="p-1.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List */}
            <div className="max-h-[50vh] overflow-y-auto space-y-2 p-1">
              {players.map((p) => {
                const link = getPlayerMagicLink(p);
                return (
                  <div 
                    key={p.id}
                    className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/60 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                      <div 
                        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                        style={{ backgroundColor: p.avatarColor || theme.primary }}
                      >
                        {p.shortName}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-neutral-900 dark:text-neutral-100 truncate">
                          {p.name} {p.isAdmin && <span className="text-[10px] text-amber-500 font-semibold">(Admin)</span>}
                        </div>
                        <div className="text-[10px] font-mono text-neutral-400 truncate">
                          {link}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5 shrink-0">
                      <button
                        onClick={() => handleCopyPlayerLink(p)}
                        className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 hover:bg-neutral-100 flex items-center gap-1"
                      >
                        {copiedId === p.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span className="hidden sm:inline">{copiedId === p.id ? 'Kopiert' : 'Link'}</span>
                      </button>
                      <button
                        onClick={() => handleWhatsAppInvite(p)}
                        className="p-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 hover:bg-emerald-200 transition-colors"
                        title="Per WhatsApp senden"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Actions */}
            <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
              <button
                onClick={handleCopyAllLinks}
                className="py-2.5 px-4 rounded-xl text-xs font-bold bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 flex items-center space-x-1.5 transition-colors"
              >
                {copiedAll ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copiedAll ? 'Alle Links in Zwischenablage kopiert!' : 'Alle Links als Text kopieren'}</span>
              </button>

              <button
                onClick={() => setShowAllLinksModal(false)}
                className="py-2.5 px-4 rounded-xl text-xs font-bold text-white shadow-xs m3-ripple"
                style={{ backgroundColor: theme.primary }}
              >
                Fertig
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
