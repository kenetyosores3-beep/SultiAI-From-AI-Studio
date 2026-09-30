import React from 'react';
import { Flame, ChevronRight } from 'lucide-react';
import { DayActivity } from '../../types';
import { sounds } from '../../utils/soundEffects';

interface CompactStreakStripProps {
  streakDays: number;
  weeklyActivity: DayActivity[];
  todayMinutes: number;
  dailyGoalMinutes: number;
  streakFreezes?: number;
  onViewStreakDetails?: () => void;
}

export const CompactStreakStrip: React.FC<CompactStreakStripProps> = ({
  streakDays,
  weeklyActivity,
  todayMinutes,
  dailyGoalMinutes,
  streakFreezes = 1,
  onViewStreakDetails,
}) => {
  const isTodayGoalMet = todayMinutes >= dailyGoalMinutes;
  const completedCount = weeklyActivity.filter((d) => d.goalMet || (d.isToday && isTodayGoalMet)).length;

  const handleClick = () => {
    sounds.playTap();
    onViewStreakDetails?.();
  };

  return (
    <div className="bg-white rounded-3xl p-4 border border-stone-200/90 shadow-xs space-y-3 transition-all hover:shadow-sm">
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
            <Flame className="w-4 h-4 fill-orange-500 text-orange-600" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-black text-xs text-stone-900 uppercase tracking-tight">
                🔥 {streakDays} Day Streak
              </span>
              <span className="text-[10px] font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
                Active
              </span>
            </div>
            <p className="text-[11px] text-stone-500 font-medium">
              Goal: {completedCount} / 7 days
            </p>
          </div>
        </div>

        {onViewStreakDetails && (
          <button
            onClick={handleClick}
            className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-0.5 cursor-pointer bg-teal-50/80 hover:bg-teal-100/80 px-2.5 py-1 rounded-xl transition-colors border border-teal-200/60"
          >
            <span>View streak</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Compressed 7-Day Dot Strip (M T W T F S S) */}
      <div 
        onClick={handleClick}
        className="grid grid-cols-7 gap-1 pt-1.5 border-t border-stone-100 cursor-pointer group"
        title="Click to view full Visual Streak Calendar"
      >
        {weeklyActivity.map((day) => {
          const isToday = Boolean(day.isToday);
          const goalMet = day.goalMet || (isToday && isTodayGoalMet);
          const dayInitial = day.dayOfWeek ? day.dayOfWeek[0] : 'D';

          return (
            <div
              key={day.id}
              className={`flex flex-col items-center py-1.5 px-0.5 rounded-xl transition-all ${
                isToday 
                  ? 'bg-teal-50/80 border border-teal-200/90' 
                  : goalMet
                  ? 'bg-amber-50/40 hover:bg-amber-50/80'
                  : 'bg-stone-50/60'
              }`}
            >
              {/* Day Initial: M, T, W, T, F, S, S */}
              <span className={`text-[10px] font-black uppercase ${
                isToday ? 'text-teal-800' : 'text-stone-500'
              }`}>
                {dayInitial}
              </span>

              {/* Status Dot / Flame Indicator */}
              <div className="my-1.5 flex items-center justify-center">
                {goalMet ? (
                  <div className="w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-xs">
                    <Flame className="w-3 h-3 fill-current" />
                  </div>
                ) : isToday ? (
                  <div className="w-5 h-5 rounded-full border-2 border-teal-500 border-dashed flex items-center justify-center">
                    <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                  </div>
                ) : (
                  <div className="w-4 h-4 rounded-full bg-stone-200 flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-stone-400" />
                  </div>
                )}
              </div>

              {/* Bisaya Short Day Tag */}
              <span className="text-[9px] font-mono text-stone-500 font-bold">
                {day.dayNumber}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
