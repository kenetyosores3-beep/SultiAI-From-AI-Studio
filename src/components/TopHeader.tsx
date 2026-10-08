import React, { useState } from 'react';
import { 
  Flame, ShieldCheck, Gem, Volume2, Globe, ChevronRight, 
  Award, Sun, Moon, Sparkles, Sliders 
} from 'lucide-react';
import { TargetDialect } from '../types';
import { sounds } from '../utils/soundEffects';
import { speakBisaya } from '../utils/audio';
import { ASSETS } from '../assets/images';
import { useTheme } from '../context/ThemeContext';

interface TopHeaderProps {
  streak: number;
  xp: number;
  gems?: number;
  hearts?: number;
  dialect: TargetDialect;
  onOpenDialectModal: () => void;
  onOpenAuditModal: () => void;
  onOpenAdminApp?: () => void;
  onRefillHearts?: () => void;
  userName?: string;
  showHeroGreeting?: boolean;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  streak,
  xp,
  gems = 285,
  hearts = 5,
  dialect,
  onOpenDialectModal,
  onOpenAuditModal,
  onOpenAdminApp,
  userName = 'Genesis',
  showHeroGreeting = true,
}) => {
  const { themeMode, setThemeMode, isDark, toggleTheme } = useTheme();
  const [isPlayingGreeting, setIsPlayingGreeting] = useState(false);

  // Time-aware Bisaya greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    const name = userName.split(' ')[0] || 'Genesis';
    if (hour < 12) {
      return { bisaya: `Maayong buntag, ${name} 👋`, english: 'Good morning' };
    } else if (hour < 18) {
      return { bisaya: `Maayong hapon, ${name} 👋`, english: 'Good afternoon' };
    } else {
      return { bisaya: `Maayong gabii, ${name} 👋`, english: 'Good evening' };
    }
  };

  const greeting = getGreeting();

  const handlePlayAudio = async () => {
    setIsPlayingGreeting(true);
    sounds.playTap();
    await speakBisaya(greeting.bisaya.replace('👋', ''));
    setIsPlayingGreeting(false);
  };

  return (
    <header className="w-full text-stone-950 dark:text-white transition-colors">
      <div className="w-full max-w-md mx-auto px-3 sm:px-4 pt-1 pb-2 space-y-3">
        {/* ROW 1: BRAND ANCHOR & SINGLE UNIFIED STATUS BAR ROW (STICKY TOP APP BAR) */}
        <div className="sticky top-0 z-40 -mx-3 sm:-mx-4 px-3 sm:px-4 py-2 sm:py-2.5 bg-white/95 dark:bg-[#11222D]/95 backdrop-blur-md border-b border-stone-300 dark:border-white/15 shadow-2xs flex flex-wrap items-center justify-between gap-1.5 w-[calc(100%+1.5rem)] sm:w-[calc(100%+2rem)] transition-colors">
          {/* SultiAI Logo & Mascot Brand Anchor */}
          <div 
            onClick={() => {
              sounds.playTap();
              onOpenAuditModal();
            }}
            className="flex items-center gap-2 cursor-pointer group active:scale-98 transition-transform select-none min-w-0 shrink-0"
            title="SultiAI Language Companion · Tap for Project Blueprint"
          >
            <div className="relative shrink-0">
              <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-teal-600 dark:border-teal-400 bg-teal-50 dark:bg-stone-800 shadow-2xs flex items-center justify-center group-hover:border-teal-500 transition-colors">
                <img
                  src={ASSETS.tutorMascot}
                  alt="SultiAI Mascot"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-[#11222D] shadow-xs" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-display text-base font-black tracking-tight text-stone-950 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors leading-none">
                Sulti<span className="text-teal-600 dark:text-teal-400">AI</span>
              </span>
              <span className="text-[9px] font-mono font-extrabold uppercase tracking-wider text-stone-700 dark:text-stone-300 mt-0.5 leading-none truncate max-w-[100px] sm:max-w-none">
                Bisaya Companion
              </span>
            </div>
          </div>

          {/* SINGLE UNIFIED STATUS BAR ROW (Streak, Bahandi Gems/XP, Theme Switcher, Security Action) */}
          <div className="flex items-center gap-1 shrink-0 bg-stone-100 dark:bg-stone-800/90 p-0.5 rounded-full border border-stone-300 dark:border-white/15 shadow-inner backdrop-blur-md">
            {/* Fire Streak Pill - High Contrast */}
            <button
              onClick={() => {
                sounds.playTap();
                onOpenAuditModal();
              }}
              className="h-7 px-2 sm:px-2.5 flex items-center gap-1 rounded-full bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/80 dark:hover:bg-amber-900/80 text-amber-950 dark:text-amber-200 border border-amber-300 dark:border-amber-500/40 active:scale-95 transition-all cursor-pointer font-mono text-xs font-black shadow-2xs"
              title={`${streak}-day streak! Keep up your daily Bisaya practice.`}
            >
              <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-600 dark:text-amber-400 shrink-0" />
              <span className="tabular-nums font-black">{streak}</span>
            </button>

            {/* Diamond / Bahandi Gems Pill - High Contrast */}
            <button
              onClick={() => {
                sounds.playTap();
                onOpenAuditModal();
              }}
              className="h-7 px-2 sm:px-2.5 flex items-center gap-1 rounded-full bg-teal-100 hover:bg-teal-200 dark:bg-teal-950/80 dark:hover:bg-teal-900/80 text-teal-950 dark:text-teal-200 border border-teal-300 dark:border-teal-500/40 active:scale-95 transition-all cursor-pointer font-mono text-xs font-black shadow-2xs"
              title={`${gems} Bahandi Gems (XP: ${xp})`}
            >
              <Gem className="w-3.5 h-3.5 fill-teal-600/30 text-teal-700 dark:text-teal-300 shrink-0" />
              <span className="tabular-nums font-black">{gems}</span>
            </button>

            {/* Quick Theme Switcher Button (☀️ Light / 🌙 Dark) */}
            <button
              onClick={() => {
                sounds.playTap();
                toggleTheme();
              }}
              className="w-7 h-7 rounded-full bg-white dark:bg-stone-700 hover:bg-stone-100 dark:hover:bg-stone-600 text-stone-900 dark:text-amber-300 border border-stone-300 dark:border-white/15 shadow-2xs flex items-center justify-center transition-all active:scale-95 cursor-pointer shrink-0"
              title={`Currently in ${isDark ? 'Dark' : 'Light'} Mode. Tap to toggle.`}
            >
              {isDark ? (
                <Sun className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-stone-800" />
              )}
            </button>

            {/* Security & Capstone Blueprint Action */}
            <button
              onClick={() => {
                sounds.playTap();
                onOpenAuditModal();
              }}
              className="w-7 h-7 rounded-full bg-white dark:bg-stone-700 hover:bg-stone-100 dark:hover:bg-stone-600 text-teal-700 dark:text-teal-300 border border-stone-300 dark:border-white/15 shadow-2xs flex items-center justify-center transition-all active:scale-95 cursor-pointer shrink-0"
              title="SultiAI Research Blueprint & Supabase Security Audit"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
            </button>

            {/* Admin Web Dashboard Action */}
            {onOpenAdminApp && (
              <button
                onClick={() => {
                  sounds.playTap();
                  onOpenAdminApp();
                }}
                className="w-7 h-7 rounded-full bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shadow-2xs flex items-center justify-center transition-all active:scale-95 cursor-pointer shrink-0"
                title="Open Admin Dashboard & Audit Control Center"
              >
                <Sliders className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              </button>
            )}
          </div>
        </div>

        {/* ROW 2: UNIFIED HERO GREETING & INTEGRATED LEARNER STATUS SECTION */}
        {showHeroGreeting && (
          <div className="relative rounded-2xl sm:rounded-3xl p-4 sm:p-4.5 bg-white dark:bg-[#132532] border border-stone-300 dark:border-white/15 shadow-sm overflow-hidden transition-all animate-in fade-in slide-in-from-top-1 duration-300">
            {/* Subtle background ambient warmth */}
            <div className="absolute top-0 right-0 w-36 h-36 bg-teal-500/5 dark:bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

            {/* Main Greeting Row: Typography + Audio Pronunciation button */}
            <div className="flex items-start justify-between gap-3 relative z-10">
              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-teal-600 dark:bg-teal-400 animate-pulse" />
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-black uppercase tracking-wider bg-teal-50 dark:bg-teal-950/80 text-teal-900 dark:text-teal-200 border border-teal-200 dark:border-teal-800">
                    Bisaya Journey
                  </span>
                </div>
                <h1 className="font-display font-black text-xl sm:text-2xl text-stone-950 dark:text-white tracking-tight leading-snug">
                  {greeting.bisaya}
                </h1>
                <p className="text-xs sm:text-[13px] text-stone-750 dark:text-stone-200 font-medium leading-relaxed">
                  Ready for your Bisaya communication practice today?
                </p>
              </div>

              <button
                onClick={handlePlayAudio}
                className="p-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-900 dark:text-stone-100 hover:text-teal-700 dark:hover:text-teal-300 border border-stone-300 dark:border-stone-700 shadow-2xs active:scale-95 transition-all cursor-pointer shrink-0 mt-0.5"
                title="Paminawa ang Bisaya nga pagtimbaya (Listen to native pronunciation)"
              >
                <Volume2 className={`w-4 h-4 ${isPlayingGreeting ? 'animate-pulse text-teal-600 dark:text-teal-400' : ''}`} />
              </button>
            </div>

            {/* INTEGRATED SECONDARY LEARNER STATUS ROW (Target Dialect & Level 3) */}
            <div className="mt-3.5 pt-3 border-t border-stone-200 dark:border-white/15 flex flex-wrap items-center justify-between gap-2 relative z-10">
              {/* Target Dialect Area */}
              <button
                onClick={() => {
                  sounds.playTap();
                  onOpenDialectModal();
                }}
                className="flex items-center gap-2 text-left group cursor-pointer active:scale-[0.98] transition-transform min-w-0"
                title="Switch target dialect (Davao Bisaya, Standard Cebuano, Hiligaynon)"
              >
                <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-950 border border-teal-300 dark:border-teal-500/40 text-teal-900 dark:text-teal-200 flex items-center justify-center shrink-0 group-hover:bg-teal-200 dark:group-hover:bg-teal-900 transition-colors">
                  <Globe className="w-4 h-4 text-teal-800 dark:text-teal-300" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-mono font-black tracking-wider uppercase text-teal-950 dark:text-teal-300 leading-none">
                    TARGET DIALECT
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                    <span className="text-xs sm:text-sm font-black text-stone-950 dark:text-white group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors truncate">
                      {dialect === 'davao_bisaya' ? 'Davao Bisaya' : 'Standard Cebuano'}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                  </div>
                </div>
              </button>

              {/* Level Status Area */}
              <div className="text-right shrink-0">
                <div className="text-[10px] font-mono font-black tracking-wider uppercase text-stone-700 dark:text-stone-300 leading-none">
                  LEVEL
                </div>
                <div className="flex items-center justify-end gap-1 mt-0.5">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-stone-100 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-950 dark:text-white text-xs font-black font-mono shadow-2xs">
                    <Award className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>Level 3</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
