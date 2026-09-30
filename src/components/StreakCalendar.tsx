import React, { useState } from 'react';
import { 
  Flame, Check, Calendar, Shield, Zap, Sparkles, 
  ChevronRight, Clock, Award, Info, Heart, ArrowUpRight, 
  ChevronLeft, BarChart3, Trophy, Target, AlertCircle
} from 'lucide-react';
import { DayActivity } from '../types';
import { sounds } from '../utils/soundEffects';

interface StreakCalendarProps {
  weeklyActivity: DayActivity[];
  streakDays: number;
  dailyGoalMinutes: number;
  todayMinutes: number;
  streakFreezes?: number;
  onQuickPractice?: () => void;
  onUseStreakFreeze?: () => void;
}

export const StreakCalendar: React.FC<StreakCalendarProps> = ({
  weeklyActivity,
  streakDays,
  dailyGoalMinutes,
  todayMinutes,
  streakFreezes = 1,
  onQuickPractice,
  onUseStreakFreeze,
}) => {
  const [selectedDayId, setSelectedDayId] = useState<string | null>(() => {
    const today = weeklyActivity.find((d) => d.isToday);
    return today ? today.id : weeklyActivity[weeklyActivity.length - 1]?.id || null;
  });
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [freezeApplied, setFreezeApplied] = useState(false);

  const selectedDay = weeklyActivity.find((d) => d.id === selectedDayId) || weeklyActivity[weeklyActivity.length - 1];
  const isTodayGoalMet = todayMinutes >= dailyGoalMinutes;
  
  // Calculate weekly statistics
  const daysGoalMetCount = weeklyActivity.filter((d) => d.goalMet || (d.isToday && isTodayGoalMet)).length;
  const totalWeeklyMinutes = weeklyActivity.reduce((acc, d) => acc + (d.isToday ? todayMinutes : d.minutes), 0);
  const totalWeeklyXp = weeklyActivity.reduce((acc, d) => acc + d.xpEarned, 0);

  const handleSelectDay = (day: DayActivity) => {
    sounds.playTap();
    setSelectedDayId(day.id);
  };

  const handleApplyFreeze = () => {
    if (streakFreezes <= 0 || freezeApplied) return;
    sounds.playCorrect();
    setFreezeApplied(true);
    onUseStreakFreeze?.();
  };

  // Mock 30-day month data based on current streak
  const monthDays = Array.from({ length: 30 }, (_, i) => {
    const dayNum = i + 1;
    const isMet = dayNum >= 24; // Past 7 days streak
    const isCurToday = dayNum === 30;
    return {
      dayNum,
      isMet,
      isCurToday,
      label: dayNum.toString(),
    };
  });

  return (
    <div className="bg-white rounded-3xl p-5 shadow-xs border border-stone-200/90 space-y-4 relative overflow-hidden">
      {/* Background ambient decorative glow */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-amber-50/70 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />

      {/* Header with Streak Status */}
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center font-bold shadow-md shadow-amber-500/30">
            <Flame className="w-7 h-7 fill-white text-white animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-display font-black text-base text-stone-900">
                {streakDays} Day Streak!
              </h3>
              <span className="text-[10px] font-extrabold text-amber-700 bg-amber-50 border border-amber-200/70 px-2 py-0.5 rounded-full">
                Active 🔥
              </span>
            </div>
            <p className="text-xs text-stone-500 font-medium">
              Learning goal met on <span className="font-bold text-stone-800">{daysGoalMetCount} of 7 days</span> this week
            </p>
          </div>
        </div>

        {/* Streak Freeze Badge */}
        <div className="flex items-center gap-1 text-xs font-bold text-sky-700 bg-sky-50 border border-sky-200/80 px-2.5 py-1 rounded-xl shadow-2xs">
          <Shield className="w-3.5 h-3.5 text-sky-600 fill-sky-200" />
          <span>{freezeApplied ? 'Protected' : `${streakFreezes} Freeze`}</span>
        </div>
      </div>

      {/* View Switcher Tabs (Week vs Month) */}
      <div className="flex items-center justify-between border-t border-stone-100 pt-3">
        <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl">
          <button
            onClick={() => {
              sounds.playTap();
              setViewMode('week');
            }}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              viewMode === 'week'
                ? 'bg-white text-stone-900 shadow-2xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Weekly Activity
          </button>
          <button
            onClick={() => {
              sounds.playTap();
              setViewMode('month');
            }}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              viewMode === 'month'
                ? 'bg-white text-stone-900 shadow-2xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            30-Day View
          </button>
        </div>

        <div className="text-[11px] font-mono text-stone-500 flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
          <span>Goal: {dailyGoalMinutes} min/day</span>
        </div>
      </div>

      {/* VIEW 1: 7-DAY WEEKLY VISUAL CALENDAR */}
      {viewMode === 'week' && (
        <div className="space-y-3">
          {/* Week Goal Completion Summary Bar */}
          <div className="p-3 bg-gradient-to-r from-amber-50 to-teal-50/50 rounded-2xl border border-amber-200/60 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-600" />
              <div>
                <span className="font-bold text-stone-800">
                  {daysGoalMetCount === 7 ? 'Full Week Perfect Streak!' : `${daysGoalMetCount}/7 Days Goal Achieved`}
                </span>
                <p className="text-[10px] text-stone-500 font-medium">
                  {totalWeeklyMinutes} mins practiced · +{totalWeeklyXp} XP earned this week
                </p>
              </div>
            </div>
            <span className="font-mono text-[11px] font-bold text-emerald-700 bg-emerald-100/70 border border-emerald-300 px-2 py-0.5 rounded-full">
              {Math.round((daysGoalMetCount / 7) * 100)}%
            </span>
          </div>

          {/* 7 Interactive Day Nodes */}
          <div className="grid grid-cols-7 gap-1.5 pt-1">
            {weeklyActivity.map((day) => {
              const isSelected = selectedDayId === day.id;
              const isToday = Boolean(day.isToday);
              const goalMet = day.goalMet || (isToday && isTodayGoalMet);
              const curMins = isToday ? todayMinutes : day.minutes;
              const progressRatio = Math.min(1, curMins / day.goalMinutes);

              return (
                <button
                  key={day.id}
                  onClick={() => handleSelectDay(day)}
                  className={`flex flex-col items-center py-2 px-1 rounded-2xl transition-all relative cursor-pointer ${
                    isSelected
                      ? 'bg-stone-900 text-white shadow-md scale-105 ring-2 ring-stone-900 ring-offset-2'
                      : goalMet
                      ? 'bg-amber-50/80 hover:bg-amber-100/90 text-stone-800 border border-amber-300/80 shadow-2xs'
                      : isToday
                      ? 'bg-teal-50/80 hover:bg-teal-100/90 text-stone-800 border border-teal-300 shadow-2xs'
                      : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200/60'
                  }`}
                >
                  {/* Day Label (M, T, W, T, F, S, S / Bisaya) */}
                  <span className={`text-[10px] font-black uppercase tracking-tight ${
                    isSelected ? 'text-stone-300' : 'text-stone-600'
                  }`}>
                    {day.dayOfWeek[0]}
                  </span>

                  {/* Day Number */}
                  <span className={`text-xs font-mono font-bold my-0.5 ${
                    isSelected ? 'text-white' : 'text-stone-800'
                  }`}>
                    {day.dayNumber}
                  </span>

                  {/* Status Indicator Bubble */}
                  <div className="relative w-8 h-8 flex items-center justify-center mt-1">
                    {goalMet ? (
                      /* Radiant Flame Icon for Goal Met Day */
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform ${
                        isSelected 
                          ? 'bg-gradient-to-tr from-amber-400 to-amber-300 text-stone-950 shadow-md shadow-amber-400/50 scale-110' 
                          : 'bg-gradient-to-tr from-amber-400 to-orange-400 text-white shadow-xs'
                      }`}>
                        <Flame className="w-4 h-4 fill-current text-current" />
                      </div>
                    ) : isToday ? (
                      /* Today's In-Progress Circular Gauge */
                      <div className="relative w-8 h-8 flex items-center justify-center">
                        <svg className="w-8 h-8 -rotate-90">
                          <circle
                            cx="16"
                            cy="16"
                            r="12"
                            className="stroke-stone-200 fill-none"
                            strokeWidth="2.5"
                          />
                          <circle
                            cx="16"
                            cy="16"
                            r="12"
                            className="stroke-teal-500 fill-none transition-all duration-500"
                            strokeWidth="2.5"
                            strokeDasharray={75.4}
                            strokeDashoffset={75.4 * (1 - progressRatio)}
                            strokeLinecap="round"
                          />
                        </svg>
                        <span className="absolute text-[9px] font-mono font-black text-teal-600">
                          {Math.round(progressRatio * 100)}%
                        </span>
                      </div>
                    ) : (
                      /* Missed / Rest Day */
                      <div className="w-7 h-7 rounded-full bg-stone-200 flex items-center justify-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-stone-400" />
                      </div>
                    )}
                  </div>

                  {/* Goal Met Check Badge or In-Progress Minutes */}
                  <div className="mt-1">
                    {goalMet ? (
                      <span className={`text-[8px] font-mono font-bold px-1 rounded-sm ${
                        isSelected ? 'text-amber-300' : 'text-amber-700 bg-amber-100'
                      }`}>
                        {curMins}m
                      </span>
                    ) : isToday ? (
                      <span className={`text-[8px] font-mono font-bold px-1 rounded-sm ${
                        isSelected ? 'text-teal-300' : 'text-teal-700 bg-teal-100'
                      }`}>
                        {curMins}m
                      </span>
                    ) : (
                      <span className="text-[8px] font-mono text-stone-400">
                        {curMins}m
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: 30-DAY MONTH CALENDAR GRID */}
      {viewMode === 'month' && (
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
            <span>September 2026 Consistency</span>
            <span className="text-amber-600 font-bold">🔥 7-Day Current Streak</span>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((l, i) => (
              <span key={i} className="text-[10px] font-bold text-stone-400 uppercase py-1">
                {l}
              </span>
            ))}
            {monthDays.map((d) => (
              <div
                key={d.dayNum}
                className={`p-2 rounded-xl text-xs font-mono font-bold flex flex-col items-center justify-center gap-0.5 border ${
                  d.isCurToday
                    ? 'border-teal-500 bg-teal-50 text-teal-800 ring-2 ring-teal-500/20'
                    : d.isMet
                    ? 'border-amber-300 bg-amber-50 text-amber-900'
                    : 'border-stone-100 bg-stone-50 text-stone-400'
                }`}
              >
                <span>{d.label}</span>
                {d.isMet ? (
                  <Flame className="w-3 h-3 text-orange-500 fill-orange-500" />
                ) : (
                  <span className="w-1 h-1 rounded-full bg-stone-300" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selected Day Activity Details Drawer */}
      {selectedDay && (
        <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-teal-600" />
              <span className="font-bold text-stone-900 font-display">
                {selectedDay.dayBisaya} ({selectedDay.dayOfWeek}), {selectedDay.date}
                {selectedDay.isToday && ' · Karon (Today)'}
              </span>
            </div>

            {selectedDay.goalMet || (selectedDay.isToday && isTodayGoalMet) ? (
              <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100/90 px-2.5 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                Learning Goal Met!
              </span>
            ) : selectedDay.isToday ? (
              <span className="text-[10px] font-extrabold text-amber-800 bg-amber-100/90 px-2.5 py-0.5 rounded-full border border-amber-300">
                In Progress ({todayMinutes}/{dailyGoalMinutes}m)
              </span>
            ) : (
              <span className="text-[10px] font-bold text-stone-500 bg-stone-200 px-2 py-0.5 rounded-full">
                Rest Day
              </span>
            )}
          </div>

          {/* Metrics Breakdown for Selected Day */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2.5 bg-white rounded-xl border border-stone-200/70 shadow-2xs">
              <div className="text-stone-500 text-[10px] font-medium flex items-center justify-center gap-1">
                <Clock className="w-3 h-3 text-teal-600" />
                <span>Time Spent</span>
              </div>
              <div className="text-sm font-black font-mono text-stone-900 mt-0.5">
                {selectedDay.isToday ? todayMinutes : selectedDay.minutes} / {selectedDay.goalMinutes} min
              </div>
            </div>

            <div className="p-2.5 bg-white rounded-xl border border-stone-200/70 shadow-2xs">
              <div className="text-stone-500 text-[10px] font-medium flex items-center justify-center gap-1">
                <Zap className="w-3 h-3 text-amber-500" />
                <span>XP Earned</span>
              </div>
              <div className="text-sm font-black font-mono text-amber-700 mt-0.5">
                +{selectedDay.isToday ? selectedDay.xpEarned + (todayMinutes > 0 ? 20 : 0) : selectedDay.xpEarned} XP
              </div>
            </div>

            <div className="p-2.5 bg-white rounded-xl border border-stone-200/70 shadow-2xs">
              <div className="text-stone-500 text-[10px] font-medium flex items-center justify-center gap-1">
                <Award className="w-3 h-3 text-indigo-500" />
                <span>Lessons</span>
              </div>
              <div className="text-sm font-black font-mono text-indigo-700 mt-0.5">
                {selectedDay.lessonsCompleted} Completed
              </div>
            </div>
          </div>

          {/* Quick Practice Trigger for Today if not yet met */}
          {selectedDay.isToday && !isTodayGoalMet && onQuickPractice && (
            <button
              onClick={() => {
                sounds.playTap();
                onQuickPractice();
              }}
              className="w-full py-2.5 px-3 bg-gradient-to-r from-teal-600 to-emerald-500 hover:from-teal-500 hover:to-emerald-400 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all btn-3d-teal shadow-xs cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Practice {dailyGoalMinutes - todayMinutes} more mins to hit today's streak goal!</span>
              <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
            </button>
          )}

          {/* Streak Freeze Option if missed */}
          {!selectedDay.goalMet && !selectedDay.isToday && streakFreezes > 0 && !freezeApplied && (
            <button
              onClick={handleApplyFreeze}
              className="w-full py-2 px-3 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5 text-sky-600" />
              <span>Apply Streak Freeze to protect your {streakDays}-day streak</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
