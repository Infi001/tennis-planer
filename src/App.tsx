import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { NavigationTabs, TabKey } from './components/NavigationTabs';
import { WeeklyMatchCenter } from './components/WeeklyMatchCenter';
import { FullScheduleTable } from './components/FullScheduleTable';
import { AbsenceManager } from './components/AbsenceManager';
import { StatsDashboard } from './components/StatsDashboard';
import { AdminDashboard, AdminSubTab } from './components/admin/AdminDashboard';
import { DeclineModal } from './components/DeclineModal';
import { SwapModal } from './components/SwapModal';
import { WhatsAppModal } from './components/WhatsAppModal';
import { AccountModal } from './components/AccountModal';
import { LoginScreen } from './components/LoginScreen';
import { ImpressumModal } from './components/ImpressumModal';
import { AddGuestModal } from './components/AddGuestModal';
import { MyCalendarView } from './components/MyCalendarView';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { HelpView } from './components/HelpView';
import { EmailPromptModal } from './components/EmailPromptModal';
import { SlotTime } from './types/tennis';
import { Calendar, Share2, Sparkles, Eye, ArrowRight } from 'lucide-react';
import { generateMaterialDynamicPalette } from './utils/materialTheme';
import { parseCurrentRoute, syncRouteToUrl } from './utils/urlRouting';

const AppContent: React.FC = () => {
  const { 
    theme, 
    isDarkMode, 
    selectedWeekId,
    setSelectedWeekId, 
    isLoggedIn,
    currentUser,
    isImpersonating,
    actualAdminPlayer,
    exitImpersonation
  } = useApp();
  
  const [activeTab, setActiveTab] = useState<TabKey>(() => {
    const route = parseCurrentRoute();
    return route.tab;
  });
  const [adminSubTab, setAdminSubTab] = useState<AdminSubTab>(() => {
    const route = parseCurrentRoute();
    return route.adminSubTab || 'players';
  });

  // Modals state
  const [declinePlayerId, setDeclinePlayerId] = useState<string | null>(null);
  const [swapData, setSwapData] = useState<{ playerId: string; fromSlot: SlotTime } | null>(null);
  const [guestSlot, setGuestSlot] = useState<SlotTime | null>(null);
  const [showUserSwitch, setShowUserSwitch] = useState(false);
  const [showCalendarExport, setShowCalendarExport] = useState(false); // remove later if unused
  const [showImpressum, setShowImpressum] = useState(false);
  const [dismissedEmailSession, setDismissedEmailSession] = useState(false);

  // Email prompt modal upon login for players without email
  const shouldShowEmailPrompt = Boolean(
    isLoggedIn &&
    currentUser?.id &&
    !isImpersonating &&
    (!currentUser.email || currentUser.email.trim() === '') &&
    currentUser.emailNotifications !== false &&
    !dismissedEmailSession &&
    (typeof window !== 'undefined' && sessionStorage.getItem('dismissed_email_prompt_' + currentUser.id) !== 'true')
  );

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

  // Listen for browser navigation (Back / Forward / direct URL changes)
  useEffect(() => {
    const handleUrlChange = () => {
      const route = parseCurrentRoute();
      if (route.showImpressum) {
        setShowImpressum(true);
      }
      setActiveTab(prev => (prev !== route.tab ? route.tab : prev));
      if (route.adminSubTab) {
        setAdminSubTab(prev => (prev !== route.adminSubTab ? route.adminSubTab! : prev));
      }
      if (route.weekId) {
        setSelectedWeekId(route.weekId);
      }
    };

    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, [setSelectedWeekId]);

  // Keep URL in sync when active tab or selected week in matchcenter changes
  useEffect(() => {
    if (activeTab === 'matchcenter' && selectedWeekId) {
      syncRouteToUrl({
        tab: 'matchcenter',
        weekId: selectedWeekId,
      });
    }
  }, [activeTab, selectedWeekId]);

  // Handle user tab change with immediate URL sync
  const handleTabChange = (newTab: TabKey) => {
    setActiveTab(newTab);
    syncRouteToUrl({
      tab: newTab,
      adminSubTab: newTab === 'admin' ? adminSubTab : undefined,
      weekId: newTab === 'matchcenter' ? selectedWeekId : undefined,
    });
  };

  const handleAdminSubTabChange = (newSubTab: AdminSubTab) => {
    setAdminSubTab(newSubTab);
    syncRouteToUrl({
      tab: 'admin',
      adminSubTab: newSubTab,
    });
  };

  const handleSelectWeekFromTable = (weekId: string) => {
    setSelectedWeekId(weekId);
    setActiveTab('matchcenter');
    syncRouteToUrl({
      tab: 'matchcenter',
      weekId,
    });
  };

  // If a non-admin is on the admin tab, redirect to matchcenter
  useEffect(() => {
    if (activeTab === 'admin' && !currentUser?.isAdmin) {
      handleTabChange('matchcenter');
    }
  }, [activeTab, currentUser?.isAdmin]);

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
      
      {/* Admin Impersonation Banner */}
      {isImpersonating && (
        <div className="sticky top-0 z-50 bg-amber-400 text-neutral-950 px-4 py-2 text-xs font-bold flex items-center justify-between shadow-md border-b border-amber-500">
          <div className="flex items-center space-x-2 min-w-0">
            <Eye className="w-4 h-4 text-neutral-950 shrink-0" />
            <span className="truncate">
              Admin-Vorschau: Du siehst die App aus Sicht von <span className="underline font-black">{currentUser.name}</span>
            </span>
          </div>
          <button
            type="button"
            onClick={exitImpersonation}
            className="px-2.5 py-1 bg-neutral-950 hover:bg-neutral-800 text-white rounded-xl text-[11px] font-bold flex items-center space-x-1 shrink-0 ml-3 transition-colors shadow-xs"
          >
            <span>Vorschau beenden ({actualAdminPlayer?.name || 'Admin'})</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        onOpenUserSwitch={() => setShowUserSwitch(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 pb-28 space-y-5">
        
        {/* PWA Homescreen Prompt */}
        <PWAInstallBanner />

        {/* Tab Content */}
        {activeTab === 'matchcenter' && (
          <WeeklyMatchCenter
            onOpenDecline={(playerId) => setDeclinePlayerId(playerId)}
            onOpenSwap={(playerId, fromSlot) => setSwapData({ playerId, fromSlot })}
            onOpenAddGuest={(slotTime) => setGuestSlot(slotTime)}
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
          <AdminDashboard 
            initialSubTab={adminSubTab}
            onSubTabChange={handleAdminSubTabChange}
          />
        )}

      
        {/* Impressum Link */}
        <div className="pt-8 pb-4 flex justify-center">
          <button 
            onClick={() => {
              setShowImpressum(true);
              syncRouteToUrl({ tab: activeTab, showImpressum: true });
            }} 
            className="text-[10px] text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors px-4 py-2"
          >
            Impressum & Datenschutz
          </button>
        </div>

      </main>
 
      {/* Docked Bottom Navigation Bar */}
      <NavigationTabs 
        activeTab={activeTab} 
        onTabChange={handleTabChange} 
        onOpenImpressum={() => {
          setShowImpressum(true);
          syncRouteToUrl({ tab: activeTab, showImpressum: true });
        }}
      />

      

      {/* Interactive Modals */}
      {declinePlayerId && (
        <DeclineModal
          playerId={declinePlayerId}
          onClose={() => setDeclinePlayerId(null)}
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

      {showImpressum && (
        <ImpressumModal onClose={() => {
          setShowImpressum(false);
          if (window.location.hash.toLowerCase().includes('impressum') || window.location.hash.toLowerCase().includes('datenschutz')) {
            syncRouteToUrl({ 
              tab: activeTab, 
              adminSubTab,
              weekId: activeTab === 'matchcenter' ? selectedWeekId : undefined
            }, true);
          }
        }} />
      )}

      {showUserSwitch && (
        <AccountModal onClose={() => setShowUserSwitch(false)} />
      )}

      {showWhatsApp && (
        <WhatsAppModal onClose={() => setShowWhatsApp(false)} />
      )}

      {shouldShowEmailPrompt && (
        <EmailPromptModal
          onClose={() => {
            setDismissedEmailSession(true);
            if (typeof window !== 'undefined' && window.sessionStorage && currentUser?.id) {
              sessionStorage.setItem('dismissed_email_prompt_' + currentUser.id, 'true');
            }
          }}
        />
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
