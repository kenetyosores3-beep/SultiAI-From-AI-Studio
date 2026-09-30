import React from 'react';
import { Target, ArrowRight, CheckCircle2, Flame, Sparkles } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

interface DailyMissionCardProps {
  todayMinutes: number;
  goalMinutes: number;
  streakDays: number;
  onContinuePractice: () => void;
}

export const DailyMissionCard: React.FC<DailyMissionCardProps> = ({
  todayMinutes,
  goalMinutes,
  streakDays,
  onContinuePractice,
}) => {
  const progressRatio = Math.min(1, todayMinutes / Math.max(1, goalMinutes));
  const progressPercent = Math.round(progressRatio * 100);
  const isGoalMet = todayMinutes >= goalMinutes;

  const handleClick = () => {
    sounds.playTap();
    onContinuePractice();
  };

  return (
    <div className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-xs space-y-4 relative overflow-hidden transition-all hover:shadow-sm">
      {/* Subtle brand tint background */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50/60 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none" />

      {/* Header Row */}
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
            <Target className="w-4 h-4 text-teal-600" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold tracking-wider uppercase text-teal-700 bg-teal-50/80 px-2 py-0.5 rounded-md">
              Today's Mission
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-mono font-bold">
          {isGoalMet ? (
            <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Goal Reached!
            </span>
          ) : (
            <span className="text-stone-700 bg-stone-100 px-2.5 py-0.5 rounded-full">
              <span className="text-teal-700 font-black">{todayMinutes}</span> / {goalMinutes} min
            </span>
          )}
        </div>
      </div>

      {/* Mission Title & Narrative */}
      <div className="space-y-1 relative z-10">
        <h2 className="font-display font-black text-lg text-stone-900 leading-snug">
          {isGoalMet
            ? "Bulahan! You hit today's practice target."
            : `Practice speaking & vocabulary for ${goalMinutes} minutes`}
        </h2>
        <p className="text-xs text-stone-500 leading-relaxed font-normal">
          {isGoalMet
            ? "Your Bisaya retention is accelerating. Continue with extra drills or conversational practice."
            : `${Math.max(0, goalMinutes - todayMinutes)} minutes remaining to maintain your ${streakDays}-day streak.`}
        </p>
      </div>

      {/* Progress Bar with Bevel */}
      <div className="space-y-1.5 relative z-10">
        <div className="w-full bg-stone-100 rounded-full h-3 p-0.5 overflow-hidden border border-stone-200/60 shadow-inner">
          <div
            className={`h-full rounded-full transition-all duration-700 shadow-xs ${
              isGoalMet
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                : 'bg-gradient-to-r from-teal-500 to-teal-600'
            }`}
            style={{ width: `${Math.max(progressPercent, 4)}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[11px] font-mono text-stone-500">
          <span>{todayMinutes} of {goalMinutes} mins</span>
          <span className="font-bold text-stone-800">{progressPercent}%</span>
        </div>
      </div>

      {/* Primary Hero CTA */}
      <button
        onClick={handleClick}
        className="w-full min-h-[48px] bg-teal-600 hover:bg-teal-500 text-white rounded-2xl text-xs font-black py-3 px-4 flex items-center justify-center gap-2 transition-all btn-3d-teal shadow-sm cursor-pointer relative z-10"
      >
        <span>{isGoalMet ? 'Keep Practicing (Bonus XP)' : 'Continue Today\'s Mission'}</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};
