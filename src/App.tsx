import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { NavigationTabs, TabKey } from './components/NavigationTabs';
import { WeeklyMatchCenter } from './components/WeeklyMatchCenter';
import { FullScheduleTable } from './components/FullScheduleTable';
import { AbsenceManager } from './components/AbsenceManager';
import { StatsDashboard } from './components/StatsDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { DeclineModal } from './components/DeclineModal';
import { SwapModal } from './components/SwapModal';
import { WhatsAppModal } from './components/WhatsAppModal';
import { AccountModal } from './components/AccountModal';
import { LoginScreen } from './components/LoginScreen';
import { SettingsModal } from './components/SettingsModal';
import { ImpressumModal } from './components/ImpressumModal';
import { AddGuestModal } from './components/AddGuestModal';
import { MyCalendarView } from './components/MyCalendarView';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { HelpView } from './components/HelpView';
import { SlotTime } from './types/tennis';
import { Calendar, Share2, Sparkles } from 'lucide-react';
import { generateMaterialDynamicPalette } from './utils/materialTheme';

const AppContent: React.FC = () => {
  const { theme, isDarkMode, setSelectedWeekId, isLoggedIn } = useApp();
  const [activeTab, setActiveTab] = useState<TabKey>('matchcenter');

  // Modals state
  const [declinePlayerId, setDeclinePlayerId] = useState<string | null>(null);
  const [swapData, setSwapData] = useState<{ playerId: string; fromSlot: SlotTime } | null>(null);
  const [guestSlot, setGuestSlot] = useState<SlotTime | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showUserSwitch, setShowUserSwitch] = useState(false);

  const [showCalendarExport, setShowCalendarExport] = useState(false); // remove later if unused
  const [showImpressum, setShowImpressum] = useState(false);

  useEffect(() => {
    const handleOpenImpressum = () => setShowImpressum(true);
    window.addEventListener('open-impressum', handleOpenImpressum);
    return () => window.removeEventListener('open-impressum', handleOpenImpressum);
  }, []);

  const [showWhatsApp, setShowWhatsApp] = useState(false);
  
  // Apply Google Material Dynamic Color palette & dark mode
  useEffect(() => {
    const root = document.documentElement;
    const palette = generateMaterialDynamicPalette(theme.primary, isDarkMode);

    root.style.setProperty('--club-primary', palette.primary);
    root.style.setProperty('--club-primary-container', palette.primaryContainer);
    root.style.setProperty('--club-on-primary', palette.onPrimary);
    root.style.setProperty('--club-on-primary-container', palette.onPrimaryContainer);
    root.style.setProperty('--club-secondary', palette.secondary);
    root.style.setProperty('--club-on-secondary', palette.onSecondary);
    root.style.setProperty('--club-secondary-container', palette.secondaryContainer);
    root.style.setProperty('--club-on-secondary-container', palette.onSecondaryContainer);

    // Dynamic Material 3 System Colors
    root.style.setProperty('--md-sys-color-background', palette.background);
    root.style.setProperty('--md-sys-color-on-background', palette.onBackground);
    root.style.setProperty('--md-sys-color-surface', palette.surface);
    root.style.setProperty('--md-sys-color-on-surface', palette.onSurface);
    root.style.setProperty('--md-sys-color-surface-variant', palette.surfaceVariant);
    root.style.setProperty('--md-sys-color-on-surface-variant', palette.onSurfaceVariant);
    root.style.setProperty('--md-sys-color-surface-container-low', palette.surfaceContainerLow);
    root.style.setProperty('--md-sys-color-surface-container', palette.surfaceContainer);
    root.style.setProperty('--md-sys-color-surface-container-high', palette.surfaceContainerHigh);
    root.style.setProperty('--md-sys-color-outline', palette.outline);
    root.style.setProperty('--md-sys-color-outline-variant', palette.outlineVariant);

    document.body.style.backgroundColor = palette.background;
    document.body.style.color = palette.onBackground;

    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme, isDarkMode]);

  const handleSelectWeekFromTable = (weekId: string) => {
    setSelectedWeekId(weekId);
    setActiveTab('matchcenter');
  };

  if (!isLoggedIn) {
    return <LoginScreen />;
  }

  return (
    <div 
      className="min-h-screen flex flex-col transition-colors duration-200"
      style={{
        backgroundColor: 'var(--md-sys-color-background)',
        color: 'var(--md-sys-color-on-background)'
      }}
    >
      
      {/* Top Navbar */}
      <Navbar
        onOpenSettings={() => setShowSettings(true)}
        onOpenUserSwitch={() => setShowUserSwitch(true)}
        onOpenWhatsApp={() => setShowWhatsApp(true)}
              />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 pb-24 sm:pb-5 space-y-5">
        
        {/* PWA Homescreen Prompt */}
        <PWAInstallBanner />

        {/* Navigation Tabs */}
        <NavigationTabs 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
        />

        {/* Tab Content */}
        {activeTab === 'matchcenter' && (
          <WeeklyMatchCenter
            onOpenDecline={(playerId) => setDeclinePlayerId(playerId)}
            onOpenSwap={(playerId, fromSlot) => setSwapData({ playerId, fromSlot })}
            onOpenAddGuest={(slotTime) => setGuestSlot(slotTime)}
            
            onOpenWhatsApp={() => setShowWhatsApp(true)}
          />
        )}

        {activeTab === 'schedule' && (
          <FullScheduleTable 
            onSelectWeek={handleSelectWeekFromTable} 
          />
        )}

        
        {activeTab === 'calendar' && (
          <MyCalendarView />
        )}
        
        {activeTab === 'absences' && (

          <AbsenceManager />
        )}

        {activeTab === 'stats' && (
          <StatsDashboard />
        )}

        {activeTab === 'help' && (
          <HelpView />
        )}

        {activeTab === 'admin' && (
          <AdminDashboard />
        )}

      
        {/* Impressum Link */}
        <div className="pt-8 pb-4 flex justify-center">
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('open-impressum'))} 
            className="text-[10px] text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors px-4 py-2"
          >
            Impressum & Datenschutz
          </button>
        </div>

      </main>

      

      {/* Interactive Modals */}
      {declinePlayerId && (
        <DeclineModal
          playerId={declinePlayerId}
          onClose={() => setDeclinePlayerId(null)}
          onOpenWhatsApp={() => {
            setDeclinePlayerId(null);
            setShowWhatsApp(true);
          }}
        />
      )}

      {swapData && (
        <SwapModal
          playerId={swapData.playerId}
          fromSlot={swapData.fromSlot}
          onClose={() => setSwapData(null)}
        />
      )}

      {guestSlot && (
        <AddGuestModal
          slotTime={guestSlot}
          onClose={() => setGuestSlot(null)}
        />
      )}

      {showSettings && (
        <SettingsModal onClose={() => setShowSettings(false)} />
      )}

      {showImpressum && (
        <ImpressumModal onClose={() => setShowImpressum(false)} />
      )}

      {showUserSwitch && (
        <AccountModal onClose={() => setShowUserSwitch(false)} />
      )}

      {showWhatsApp && (
        <WhatsAppModal onClose={() => setShowWhatsApp(false)} />
      )}


    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
