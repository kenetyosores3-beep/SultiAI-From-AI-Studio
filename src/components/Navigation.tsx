import React from 'react';
import { Home, BookOpen, MessageSquare, Users, User, Sparkles } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

export type NavTab = 'home' | 'learn' | 'sulti' | 'community' | 'profile';

interface NavigationProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  unreadCount?: number;
}

export const Navigation: React.FC<NavigationProps> = ({ currentTab, onTabChange }) => {
  const tabs: { id: NavTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'learn', label: 'Learn', icon: BookOpen },
    { id: 'sulti', label: 'SULTI AI', icon: MessageSquare },
    { id: 'community', label: 'Community', icon: Users },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const handleSelectTab = (tabId: NavTab) => {
    sounds.playTap();
    onTabChange(tabId);
  };

  return (
    <nav 
      aria-label="Main Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-stone-900/95 backdrop-blur-xl text-stone-100 border-t border-stone-800 shadow-[0_-8px_24px_rgba(0,0,0,0.4)] max-w-md mx-auto"
    >
      <div className="grid grid-cols-5 items-center h-16 px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          const isSulti = tab.id === 'sulti';

          return (
            <button
              key={tab.id}
              onClick={() => handleSelectTab(tab.id)}
              className={`min-h-[52px] min-w-[48px] flex flex-col items-center justify-center relative transition-all duration-200 active:scale-90 ${
                isActive 
                  ? 'text-teal-400 font-bold' 
                  : 'text-stone-400 hover:text-stone-200'
              }`}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
            >
              {isSulti ? (
                <div className={`relative p-2 rounded-2xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-gradient-to-tr from-teal-500 to-emerald-400 text-stone-950 scale-105 shadow-lg shadow-teal-500/40 -translate-y-1' 
                    : 'bg-stone-800/90 text-teal-400 border border-teal-500/30'
                }`}>
                  <Icon className="w-5 h-5" />
                  <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-400" />
                  </span>
                </div>
              ) : (
                <div className={`p-1 rounded-xl transition-all duration-200 ${
                  isActive ? 'bg-teal-500/15 -translate-y-0.5' : ''
                }`}>
                  <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110 text-teal-300' : ''}`} />
                </div>
              )}
              <span className={`text-[10px] tracking-tight mt-0.5 font-medium transition-colors ${
                isActive ? 'text-teal-300 font-bold' : 'text-stone-400'
              }`}>
                {tab.label}
              </span>
              {isActive && !isSulti && (
                <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-teal-400 shadow-[0_0_8px_#2dd4bf]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

