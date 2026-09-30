import React from 'react';
import { Flame, Globe, ShieldCheck, Zap, Heart, Gem } from 'lucide-react';
import { TargetDialect } from '../types';
import { sounds } from '../utils/soundEffects';

interface TopHeaderProps {
  streak: number;
  xp: number;
  gems?: number;
  hearts?: number;
  dialect: TargetDialect;
  onOpenDialectModal: () => void;
  onOpenAuditModal: () => void;
  onRefillHearts?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  streak,
  xp,
  gems = 240,
  hearts = 5,
  dialect,
  onOpenDialectModal,
  onOpenAuditModal,
  onRefillHearts,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-stone-900/95 backdrop-blur-xl text-stone-100 border-b border-stone-800/80 px-4 py-2.5 max-w-md mx-auto shadow-xs">
      <div className="flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center shadow-md shadow-teal-500/20 text-stone-950 font-black text-xs font-display">
            S
          </div>
          <span className="font-display text-base font-black tracking-tight text-white">
            Sulti<span className="text-teal-400">AI</span>
          </span>
        </div>

        {/* Compact Counters: Streak, Gems, and Defense Blueprint */}
        <div className="flex items-center gap-2">
          {/* Streak Badge */}
          <button
            onClick={() => {
              sounds.playTap();
              onOpenAuditModal();
            }}
            className="flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-950/60 border border-amber-500/30 px-2.5 py-1 rounded-xl active:scale-95 transition-transform cursor-pointer"
            title={`${streak} Days Streak! Keep practicing daily.`}
          >
            <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-500 animate-bounce" />
            <span className="font-mono tabular-nums text-amber-300 text-xs">{streak}</span>
          </button>

          {/* Bahandi Gems */}
          <button
            onClick={() => {
              sounds.playTap();
              onOpenAuditModal();
            }}
            className="flex items-center gap-1.5 text-xs font-bold text-teal-300 bg-teal-950/60 border border-teal-500/30 px-2.5 py-1 rounded-xl active:scale-95 transition-transform cursor-pointer"
            title={`${gems} Bahandi Gems`}
          >
            <Gem className="w-3.5 h-3.5 fill-teal-400/20 text-teal-400" />
            <span className="font-mono tabular-nums text-teal-200 text-xs">{gems}</span>
          </button>

          {/* Blueprint Capstone Shield */}
          <button
            onClick={() => {
              sounds.playTap();
              onOpenAuditModal();
            }}
            className="p-1.5 text-stone-400 hover:text-white bg-stone-800 hover:bg-stone-750 rounded-xl transition-all border border-stone-700/60 active:scale-95 cursor-pointer ml-0.5"
            title="SultiAI Research Blueprint & Supabase RLS"
          >
            <ShieldCheck className="w-4 h-4 text-teal-400" />
          </button>
        </div>
      </div>
    </header>
  );
};

