import React, { useState } from 'react';
import { 
  User, Award, Flame, BookOpen, Mic, CheckCircle2, Shield, 
  Settings, FileText, ChevronRight, BarChart2, Gem, Heart, 
  Trophy, Sparkles, Database, Check, Copy, Volume2, ShieldCheck, 
  Activity, ArrowUpRight, Sun, Moon, Monitor
} from 'lucide-react';
import { UserProfile, TargetDialect } from '../types';
import { CAPSTONE_CHECKLIST_DATA, RESEARCH_METRICS, DEFAULT_WEEKLY_ACTIVITY } from '../data/curriculumData';
import { sounds } from '../utils/soundEffects';
import { StreakCalendar } from './StreakCalendar';
import { useTheme, ThemeMode } from '../context/ThemeContext';
import { VOICE_LEVELS, getStoredVoiceProgress } from '../data/voiceGamificationData';

interface ProfileScreenProps {
  profile: UserProfile;
  onUpdateDialect: (dialect: TargetDialect) => void;
  onUpdateDailyGoal: (minutes: number) => void;
  onOpenAuditModal: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  profile,
  onUpdateDialect,
  onUpdateDailyGoal,
  onOpenAuditModal,
}) => {
  const { themeMode, setThemeMode } = useTheme();
  const [activeTab, setActiveTab] = useState<'stats' | 'achievements' | 'research' | 'settings'>('stats');
  const [voiceProgress] = useState(getStoredVoiceProgress);

  // Interactive SUS (System Usability Scale) survey runner state
  const [susAnswers, setSusAnswers] = useState<number[]>([4, 1, 4, 1, 4, 1, 4, 1, 5, 1]);
  const [calculatedSus, setCalculatedSus] = useState<number>(RESEARCH_METRICS.susScore);

  const handleUpdateSus = (index: number, val: number) => {
    sounds.playTap();
    const updated = [...susAnswers];
    updated[index] = val;
    setSusAnswers(updated);

    // Standard SUS calculation:
    // Odd items: (val - 1)
    // Even items: (5 - val)
    // Multiply sum by 2.5
    let scoreSum = 0;
    updated.forEach((ans, idx) => {
      if (idx % 2 === 0) {
        scoreSum += (ans - 1);
      } else {
        scoreSum += (5 - ans);
      }
    });
    setCalculatedSus(Math.round(scoreSum * 2.5 * 10) / 10);
  };

  const achievements = [
    { id: 1, title: 'Jeepney Navigator', desc: 'Mastered passenger etiquette & "Lugar lang!"', icon: '🚐', unlocked: true },
    { id: 2, title: 'Voice Pioneer', desc: 'Completed 5 Whisper AI voice recordings', icon: '🎙️', unlocked: true },
    { id: 3, title: 'Market Diplomat', desc: 'Bargained at Bankerohan Wet Market', icon: '🥭', unlocked: true },
    { id: 4, title: 'Streak Champion', desc: 'Maintained 7 consecutive practice days', icon: '🔥', unlocked: profile.streakDays >= 7 },
    { id: 5, title: 'Davao Local', desc: 'Learned "Bitaw", "Gud", and "Mao Diay"', icon: '🦅', unlocked: true },
    { id: 6, title: 'Polyglot Defense', desc: 'Verified 11/11 Capstone requirements', icon: '🎓', unlocked: true },
  ];

  return (
    <div className="space-y-4 pb-24 px-4 pt-3 max-w-md mx-auto">
      {/* Profile Header (Duolingo / Speak mobile profile) */}
      <div className="bg-white dark:bg-[#11222D] rounded-3xl p-5 border border-stone-200/90 dark:border-white/10 shadow-sm space-y-4 text-center relative overflow-hidden transition-colors">
        <div className="absolute top-0 right-0 w-28 h-28 bg-teal-50 dark:bg-teal-500/10 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none" />

        <div className="relative w-20 h-20 mx-auto">
          <img
            src={profile.avatar}
            alt={profile.name}
            referrerPolicy="no-referrer"
            className="w-20 h-20 rounded-full object-cover border-4 border-teal-500 shadow-md"
          />
          <div className="absolute -bottom-1 -right-1 bg-stone-900 dark:bg-teal-950 text-teal-400 p-1.5 rounded-full shadow-md border-2 border-white dark:border-[#11222D]">
            <Award className="w-4 h-4" />
          </div>
        </div>

        <div className="space-y-1">
          <h2 className="font-display font-black text-xl text-stone-900 dark:text-white">
            {profile.name}
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">
            {profile.email} · Joined {profile.joinedDate}
          </p>
          <div className="inline-block mt-1 px-3 py-1 bg-teal-50 dark:bg-teal-950/70 text-teal-800 dark:text-teal-200 rounded-full text-xs font-bold border border-teal-200/60 dark:border-teal-500/30">
            {profile.level} · {profile.targetDialect === 'davao_bisaya' ? 'Davao Bisaya' : 'Standard Cebuano'}
          </div>
        </div>

        {/* 4 Core Summary Metrics */}
        <div className="grid grid-cols-4 gap-2 pt-3 border-t border-stone-100 dark:border-white/10 text-center">
          <div className="p-2.5 bg-amber-50/70 dark:bg-amber-950/40 rounded-2xl border border-amber-200/60 dark:border-amber-500/30">
            <div className="text-base font-black font-mono text-amber-900 dark:text-amber-200 tabular-nums">
              {profile.streakDays}d
            </div>
            <div className="text-[10px] text-amber-800 dark:text-amber-300 font-bold uppercase tracking-wider">Streak</div>
          </div>
          <div className="p-2.5 bg-teal-50/70 dark:bg-teal-950/40 rounded-2xl border border-teal-200/60 dark:border-teal-500/30">
            <div className="text-base font-black font-mono text-teal-900 dark:text-teal-200 tabular-nums">
              {profile.xp}
            </div>
            <div className="text-[10px] text-teal-800 dark:text-teal-300 font-bold uppercase tracking-wider">Total XP</div>
          </div>
          <div className="p-2.5 bg-sky-50/70 dark:bg-sky-950/40 rounded-2xl border border-sky-200/60 dark:border-sky-500/30">
            <div className="text-base font-black font-mono text-sky-900 dark:text-sky-200 tabular-nums">
              {profile.gems || 240}
            </div>
            <div className="text-[10px] text-sky-800 dark:text-sky-300 font-bold uppercase tracking-wider">Gems</div>
          </div>
          <div className="p-2.5 bg-indigo-50/70 dark:bg-indigo-950/40 rounded-2xl border border-indigo-200/60 dark:border-indigo-500/30">
            <div className="text-base font-black font-mono text-indigo-900 dark:text-indigo-200 tabular-nums">
              {profile.speechScoreAverage}%
            </div>
            <div className="text-[10px] text-indigo-800 dark:text-indigo-300 font-bold uppercase tracking-wider">Whisper</div>
          </div>
        </div>
      </div>

      {/* Segmented Sub-Tabs */}
      <div className="flex items-center gap-1 p-1 bg-stone-200/80 dark:bg-stone-900/80 rounded-2xl border border-stone-300/50 dark:border-white/10 shadow-inner">
        <button
          onClick={() => {
            sounds.playTap();
            setActiveTab('stats');
          }}
          className={`flex-1 min-h-[40px] py-1.5 px-2 text-xs font-bold rounded-xl transition-all cursor-pointer glass-touch ${
            activeTab === 'stats'
              ? 'bg-white dark:bg-[#152B37] text-stone-900 dark:text-white shadow-sm border border-stone-200 dark:border-teal-500/40'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
          }`}
        >
          League & Stats
        </button>
        <button
          onClick={() => {
            sounds.playTap();
            setActiveTab('achievements');
          }}
          className={`flex-1 min-h-[40px] py-1.5 px-2 text-xs font-bold rounded-xl transition-all cursor-pointer glass-touch ${
            activeTab === 'achievements'
              ? 'bg-white dark:bg-[#152B37] text-stone-900 dark:text-white shadow-sm border border-stone-200 dark:border-teal-500/40'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
          }`}
        >
          Badges
        </button>
        <button
          onClick={() => {
            sounds.playTap();
            setActiveTab('research');
          }}
          className={`flex-1 min-h-[40px] py-1.5 px-2 text-xs font-bold rounded-xl transition-all cursor-pointer glass-touch ${
            activeTab === 'research'
              ? 'bg-white dark:bg-[#152B37] text-stone-900 dark:text-white shadow-sm border border-stone-200 dark:border-teal-500/40'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
          }`}
        >
          Defense Hub
        </button>
        <button
          onClick={() => {
            sounds.playTap();
            setActiveTab('settings');
          }}
          className={`flex-1 min-h-[40px] py-1.5 px-2 text-xs font-bold rounded-xl transition-all cursor-pointer glass-touch ${
            activeTab === 'settings'
              ? 'bg-white dark:bg-[#152B37] text-teal-700 dark:text-teal-300 font-black shadow-sm border border-teal-200 dark:border-teal-500/40'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
          }`}
        >
          Settings
        </button>
      </div>

      {/* TAB 1: LEAGUE & LEARNING STATS */}
      {activeTab === 'stats' && (
        <div className="space-y-3.5">
          {/* Duolingo Style League Promotion Banner */}
          <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 text-white rounded-3xl p-4 shadow-md space-y-2 relative overflow-hidden">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold uppercase tracking-widest bg-black/25 px-2.5 py-0.5 rounded-full text-[10px]">
                Weekly Leaderboard
              </span>
              <span className="font-mono text-[11px] font-bold bg-white/20 px-2 py-0.5 rounded-full">
                2 Days Remaining
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-2xl shadow-inner">
                🏆
              </div>
              <div>
                <h3 className="font-display font-black text-lg leading-tight">
                  Davao Pearl League
                </h3>
                <p className="text-xs text-amber-100 font-medium">
                  Rank #3 · In the Emerald Promotion Zone!
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-white/20 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-black/15 p-2 rounded-xl">
                <div className="font-mono font-bold text-amber-200">#1 Mark T.</div>
                <div className="text-[10px] text-white/80">540 XP</div>
              </div>
              <div className="bg-black/15 p-2 rounded-xl">
                <div className="font-mono font-bold text-amber-200">#2 Sarah L.</div>
                <div className="text-[10px] text-white/80">480 XP</div>
              </div>
              <div className="bg-white/30 p-2 rounded-xl border border-white/40 shadow-sm">
                <div className="font-mono font-black text-white">#3 You</div>
                <div className="text-[10px] font-bold text-amber-100">{profile.xp} XP</div>
              </div>
            </div>
          </div>

          {/* Visual Streak Calendar */}
          <StreakCalendar
            weeklyActivity={profile.weeklyActivity || DEFAULT_WEEKLY_ACTIVITY}
            streakDays={profile.streakDays}
            dailyGoalMinutes={profile.dailyGoalMinutes}
            todayMinutes={profile.todayMinutes}
            streakFreezes={profile.streakFreezesAvailable ?? 1}
          />

          {/* Research & Supabase Quick Blueprint Trigger */}
          <div className="bg-stone-900 text-stone-100 rounded-3xl p-4 space-y-2.5 shadow-md border border-stone-800">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest text-teal-400 font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                BSIT Capstone Defense Ready
              </span>
              <span className="text-[10px] font-mono bg-teal-950 text-teal-300 border border-teal-500/40 px-2 py-0.5 rounded-full">
                11 / 11 Verified
              </span>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed font-normal">
              Whisper speech recognition benchmarks, BERT intent accuracy, System Usability Scale instrument, and Supabase RLS security policies.
            </p>

            <button
              onClick={() => {
                sounds.playTap();
                onOpenAuditModal();
              }}
              className="w-full min-h-[44px] bg-teal-600 hover:bg-teal-500 text-white rounded-2xl text-xs font-bold py-2.5 px-4 flex items-center justify-center gap-2 transition-all btn-3d-teal cursor-pointer shadow-md"
            >
              <FileText className="w-4 h-4" />
              <span>Open Capstone Defense Panel & RLS SQL</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: ACHIEVEMENTS GALLERY */}
      {activeTab === 'achievements' && (
        <div className="space-y-4">
          {/* SECTION: VOICE GAMIFICATION BADGES */}
          <div className="bg-white dark:bg-[#11222D] rounded-3xl p-4 border border-stone-200/90 dark:border-white/10 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                  <Mic className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display font-black text-xs text-stone-900 dark:text-white">
                    Dalang Tingog (Voice Badges)
                  </h3>
                  <p className="text-[10px] text-stone-500 dark:text-stone-400">
                    5-Level Voice Gamification Path
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-500/30">
                {voiceProgress.earnedBadges.length} / 5 Badges
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {VOICE_LEVELS.map((level) => {
                const isEarned = voiceProgress.earnedBadges.includes(level.badge.id);
                return (
                  <div
                    key={level.badge.id}
                    className={`p-3 rounded-2xl border flex items-center gap-2.5 transition-all ${
                      isEarned
                        ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200/80 dark:border-amber-500/30 shadow-2xs'
                        : 'bg-stone-50 dark:bg-stone-900/30 border-stone-200/60 dark:border-white/5 opacity-55'
                    }`}
                  >
                    <div className="text-2xl shrink-0">
                      {isEarned ? level.badge.icon : '🔒'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-display font-black text-xs text-stone-900 dark:text-white truncate">
                        {level.badge.nameBisaya}
                      </div>
                      <div className="text-[10px] text-stone-500 dark:text-stone-400 truncate">
                        {level.badge.name} ({level.badge.tier})
                      </div>
                      <div className="text-[9.5px] font-mono text-amber-600 dark:text-amber-400 font-bold mt-0.5">
                        +{level.badge.xpReward} XP • +{level.badge.gemsReward} 💎
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* GENERAL ACHIEVEMENTS */}
          <div className="space-y-2">
            <div className="text-xs font-display font-bold text-stone-600 dark:text-stone-400">
              General Milestones
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {achievements.map((ach) => (
                <div
                  key={ach.id}
                  className={`p-4 rounded-3xl border space-y-2 text-center transition-all glass-touch ${
                    ach.unlocked
                      ? 'bg-white dark:bg-[#11222D] border-stone-200/90 dark:border-white/10 shadow-sm'
                      : 'bg-stone-50 dark:bg-stone-900/40 border-stone-200/60 dark:border-white/5 opacity-50'
                  }`}
                >
                  <div className="text-3xl mx-auto">{ach.icon}</div>
                  <div className="space-y-0.5">
                    <div className="font-display font-black text-xs text-stone-900 dark:text-white">
                      {ach.title}
                    </div>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-tight">
                      {ach.desc}
                    </p>
                  </div>
                  {ach.unlocked ? (
                    <span className="inline-block text-[10px] font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/70 px-2 py-0.5 rounded-full border border-teal-200 dark:border-teal-500/30">
                      Unlocked ✓
                    </span>
                  ) : (
                    <span className="inline-block text-[10px] font-bold text-stone-400 dark:text-stone-500 bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded-full">
                      Locked
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CAPSTONE RESEARCH EVALUATION */}
      {activeTab === 'research' && (
        <div className="space-y-4">
          {/* Empirical Benchmarks Grid */}
          <div className="bg-white dark:bg-[#11222D] rounded-3xl p-4 border border-stone-200/90 dark:border-white/10 shadow-sm space-y-3 transition-colors">
            <h3 className="font-display font-black text-sm text-stone-900 dark:text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              Empirical Research Telemetry (N = {RESEARCH_METRICS.sampleSize})
            </h3>

            <div className="grid grid-cols-2 gap-2.5 text-center">
              <div className="p-3 bg-teal-50 dark:bg-teal-950/50 rounded-2xl border border-teal-200 dark:border-teal-500/30">
                <div className="text-xl font-black font-mono text-teal-800 dark:text-teal-200">
                  +{RESEARCH_METRICS.improvementPercentage}%
                </div>
                <div className="text-[10px] text-teal-700 dark:text-teal-300 font-bold uppercase tracking-wider">
                  Pre vs Post Gain
                </div>
              </div>
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/50 rounded-2xl border border-indigo-200 dark:border-indigo-500/30">
                <div className="text-xl font-black font-mono text-indigo-800 dark:text-indigo-200">
                  {RESEARCH_METRICS.whisperAvgWer}%
                </div>
                <div className="text-[10px] text-indigo-700 dark:text-indigo-300 font-bold uppercase tracking-wider">
                  Whisper ASR WER
                </div>
              </div>
              <div className="p-3 bg-amber-50 dark:bg-amber-950/50 rounded-2xl border border-amber-200 dark:border-amber-500/30">
                <div className="text-xl font-black font-mono text-amber-800 dark:text-amber-200">
                  {RESEARCH_METRICS.bertIntentAccuracy}%
                </div>
                <div className="text-[10px] text-amber-700 dark:text-amber-300 font-bold uppercase tracking-wider">
                  BERT Intent Acc.
                </div>
              </div>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 rounded-2xl border border-emerald-200 dark:border-emerald-500/30">
                <div className="text-xl font-black font-mono text-emerald-800 dark:text-emerald-200">
                  {calculatedSus} / 100
                </div>
                <div className="text-[10px] text-emerald-700 dark:text-emerald-300 font-bold uppercase tracking-wider">
                  SUS Usability (Grade A)
                </div>
              </div>
            </div>
          </div>

          {/* Interactive SUS Instrument */}
          <div className="bg-white dark:bg-[#11222D] rounded-3xl p-4 border border-stone-200/90 dark:border-white/10 shadow-sm space-y-3 transition-colors">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-white/10 pb-2">
              <div>
                <h4 className="font-display font-black text-xs text-stone-900 dark:text-white">
                  System Usability Scale (SUS) Calculator
                </h4>
                <p className="text-[10px] text-stone-500 dark:text-stone-400">Brooke (1996) 10-Item Usability Standard</p>
              </div>
              <span className="font-mono text-sm font-black text-emerald-600 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 px-2.5 py-1 rounded-xl border border-emerald-200 dark:border-emerald-500/40">
                {calculatedSus} Score
              </span>
            </div>

            <div className="space-y-3">
              {[
                '1. I think that I would like to use SultiAI frequently for Bisaya practice.',
                '2. I found the SultiAI interface unnecessarily complex.',
                '3. I thought the Whisper speech recognition and lessons were easy to use.',
                '4. I think that I would need assistance to use SULTI conversation mode.',
                '5. I found the various Bisaya lessons and roleplay scenarios well integrated.'
              ].map((q, idx) => (
                <div key={idx} className="space-y-1.5 p-2 bg-stone-50 dark:bg-stone-900/60 rounded-xl border border-stone-100 dark:border-white/5">
                  <div className="text-[11px] font-bold text-stone-800 dark:text-stone-200 leading-snug">{q}</div>
                  <div className="flex items-center justify-between text-[10px] text-stone-500 dark:text-stone-400 px-1 pt-1">
                    <span>Disagree (1)</span>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((val) => (
                        <button
                          key={val}
                          onClick={() => handleUpdateSus(idx, val)}
                          className={`w-6 h-6 rounded-lg text-xs font-bold transition-all cursor-pointer glass-touch ${
                            susAnswers[idx] === val
                              ? 'bg-teal-600 text-white shadow-sm ring-1 ring-teal-400'
                              : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-white/10'
                          }`}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                    <span>Agree (5)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PREFERENCES & SETTINGS */}
      {activeTab === 'settings' && (
        <div className="bg-white dark:bg-[#11222D] rounded-3xl p-5 border border-stone-200/90 dark:border-white/10 shadow-sm space-y-5 transition-colors">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-black text-base text-stone-900 dark:text-white flex items-center gap-2">
                <Settings className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                Application & Learning Settings
              </h3>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/70 border border-teal-200 dark:border-teal-500/30 px-2 py-0.5 rounded-full">
                SultiAI Preferences
              </span>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Configure dual visual themes, target regional dialect, and daily goals
            </p>
          </div>

          <div className="space-y-5">
            {/* 1. VISUAL APPEARANCE / DUAL THEME SWITCHER WITH GLASSO-TACTILE ANIMATION */}
            <div className="p-4 rounded-2xl bg-stone-50/80 dark:bg-stone-900/60 border border-stone-200/80 dark:border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-xs font-black text-stone-900 dark:text-white">
                    Visual Appearance Theme
                  </label>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400">
                    Dual design system: Original Light vs SultiAI Dark
                  </p>
                </div>
                <span className="text-[10px] font-mono font-bold text-stone-700 dark:text-stone-300 bg-white dark:bg-stone-800 px-2 py-0.5 rounded-md border border-stone-200 dark:border-white/10">
                  {themeMode === 'light' ? '☀️ Light' : themeMode === 'dark' ? '🌙 Dark' : '💻 System'}
                </span>
              </div>

              {/* 3 Interactive Theme Switcher Cards */}
              <div className="grid grid-cols-3 gap-2.5">
                {/* Option 1: Light Theme */}
                <button
                  type="button"
                  onClick={() => {
                    sounds.playTap();
                    setThemeMode('light');
                  }}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-2 relative glass-touch glass-shimmer-effect ${
                    themeMode === 'light'
                      ? 'bg-amber-50/90 dark:bg-amber-950/40 border-amber-400 text-amber-950 dark:text-amber-100 font-black shadow-md ring-2 ring-amber-400/50 scale-[1.02]'
                      : 'bg-white dark:bg-stone-800/60 border-stone-200 dark:border-white/10 text-stone-700 dark:text-stone-300 hover:border-amber-300'
                  }`}
                  title="Switch to Original Light Theme"
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-transform ${
                    themeMode === 'light' 
                      ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/30 scale-105' 
                      : 'bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300'
                  }`}>
                    <Sun className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-xs font-black block">Light</span>
                    <span className="text-[10px] text-stone-500 dark:text-stone-400 font-mono block">Original White</span>
                  </div>
                  {themeMode === 'light' && (
                    <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-white text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full shadow-xs flex items-center gap-0.5">
                      <Check className="w-2.5 h-2.5" />
                      ON
                    </span>
                  )}
                </button>

                {/* Option 2: SultiAI Dark Theme */}
                <button
                  type="button"
                  onClick={() => {
                    sounds.playTap();
                    setThemeMode('dark');
                  }}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-2 relative glass-touch glass-shimmer-effect ${
                    themeMode === 'dark'
                      ? 'bg-teal-950/80 border-teal-400 text-teal-200 font-black shadow-md ring-2 ring-teal-400/50 scale-[1.02]'
                      : 'bg-white dark:bg-stone-800/60 border-stone-200 dark:border-white/10 text-stone-700 dark:text-stone-300 hover:border-teal-400'
                  }`}
                  title="Switch to SultiAI Dark Theme"
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-transform ${
                    themeMode === 'dark' 
                      ? 'bg-teal-500 text-stone-950 shadow-sm shadow-teal-500/30 scale-105' 
                      : 'bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300'
                  }`}>
                    <Moon className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-xs font-black block">Dark</span>
                    <span className="text-[10px] text-stone-500 dark:text-stone-400 font-mono block">SultiAI Navy</span>
                  </div>
                  {themeMode === 'dark' && (
                    <span className="absolute -top-1.5 -right-1.5 bg-teal-400 text-stone-950 text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full shadow-xs flex items-center gap-0.5">
                      <Check className="w-2.5 h-2.5" />
                      ON
                    </span>
                  )}
                </button>

                {/* Option 3: System Mode */}
                <button
                  type="button"
                  onClick={() => {
                    sounds.playTap();
                    setThemeMode('system');
                  }}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-2 relative glass-touch glass-shimmer-effect ${
                    themeMode === 'system'
                      ? 'bg-indigo-50/90 dark:bg-indigo-950/70 border-indigo-400 text-indigo-950 dark:text-indigo-200 font-black shadow-md ring-2 ring-indigo-400/50 scale-[1.02]'
                      : 'bg-white dark:bg-stone-800/60 border-stone-200 dark:border-white/10 text-stone-700 dark:text-stone-300 hover:border-indigo-400'
                  }`}
                  title="Follow Operating System Theme"
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-transform ${
                    themeMode === 'system' 
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30 scale-105' 
                      : 'bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300'
                  }`}>
                    <Monitor className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-xs font-black block">System</span>
                    <span className="text-[10px] text-stone-500 dark:text-stone-400 font-mono block">Auto Match</span>
                  </div>
                  {themeMode === 'system' && (
                    <span className="absolute -top-1.5 -right-1.5 bg-indigo-500 text-white text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full shadow-xs flex items-center gap-0.5">
                      <Check className="w-2.5 h-2.5" />
                      ON
                    </span>
                  )}
                </button>
              </div>

              {/* Persistence Status & Glass Interaction Demo */}
              <div className="p-3 bg-white dark:bg-[#11222D]/90 rounded-xl border border-stone-200/70 dark:border-white/10 text-xs space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-stone-600 dark:text-stone-300 font-medium flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                    Storage Persistence:
                  </span>
                  <span className="font-mono text-[10px] font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/70 px-2 py-0.5 rounded border border-teal-200 dark:border-teal-500/30">
                    localStorage["sultiai_theme_preference"] = "{themeMode}"
                  </span>
                </div>

                {/* Interactive Glass Touch Demonstration Card */}
                <div 
                  onClick={() => sounds.playCorrect()}
                  className="p-2.5 rounded-xl border border-stone-200/80 dark:border-teal-500/30 bg-gradient-to-r from-stone-50/90 to-teal-50/40 dark:from-stone-900/80 dark:to-teal-950/50 flex items-center justify-between cursor-pointer glass-touch glass-shimmer-effect"
                  title="Touch to test glass reflection animation"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400 animate-spin" />
                    <div>
                      <div className="text-[11px] font-black text-stone-900 dark:text-white">
                        Glass Touch Effect Demo
                      </div>
                      <div className="text-[10px] text-stone-500 dark:text-stone-400">
                        Tap here to feel the glassmorphic touch & sound
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-teal-700 dark:text-teal-300 bg-teal-100 dark:bg-teal-900/60 px-2 py-1 rounded-lg border border-teal-200 dark:border-teal-500/40">
                    Touch Me ✨
                  </span>
                </div>
              </div>
            </div>

            {/* 2. TARGET REGIONAL DIALECT */}
            <div className="p-4 rounded-2xl bg-stone-50/80 dark:bg-stone-900/60 border border-stone-200/80 dark:border-white/10 space-y-2">
              <label className="block text-xs font-black text-stone-900 dark:text-white">
                Target Regional Dialect
              </label>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                Adapts Whisper speech recognition, lexical choices, and colloquial particles
              </p>
              <select
                value={profile.targetDialect}
                onChange={(e) => {
                  sounds.playTap();
                  onUpdateDialect(e.target.value as TargetDialect);
                }}
                className="w-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-white/15 text-stone-900 dark:text-white rounded-xl p-3 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-2xs cursor-pointer"
              >
                <option value="davao_bisaya">Davao Bisaya (Urban Visayan with Mindanao loanwords & particles)</option>
                <option value="cebuano_standard">Cebuano Standard (Formal Central Visayas dialect)</option>
                <option value="boholano">Boholano (Bol-anon variety with phonetic shifts)</option>
              </select>
            </div>

            {/* 3. DAILY LEARNING COMMITMENT */}
            <div className="p-4 rounded-2xl bg-stone-50/80 dark:bg-stone-900/60 border border-stone-200/80 dark:border-white/10 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-black text-stone-900 dark:text-white">
                  Daily Learning Commitment
                </label>
                <span className="text-[10px] font-mono font-bold text-stone-700 dark:text-stone-300">
                  Target: {profile.dailyGoalMinutes} min/day
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[10, 15, 20].map((mins) => (
                  <button
                    key={mins}
                    onClick={() => {
                      sounds.playTap();
                      onUpdateDailyGoal(mins);
                    }}
                    className={`py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer glass-touch ${
                      profile.dailyGoalMinutes === mins
                        ? 'bg-teal-600 text-white btn-3d-teal shadow-xs'
                        : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-white/10 hover:border-teal-400'
                    }`}
                  >
                    {mins} mins / day
                  </button>
                ))}
              </div>
            </div>

            {/* 4. DEFENSE BLUEPRINT QUICK AUDIT ACTION */}
            <div className="pt-2">
              <button
                onClick={() => {
                  sounds.playTap();
                  onOpenAuditModal();
                }}
                className="w-full py-3 px-4 bg-stone-900 dark:bg-stone-800 hover:bg-stone-800 text-white rounded-2xl text-xs font-black flex items-center justify-between transition-all glass-touch cursor-pointer shadow-md border border-stone-800 dark:border-white/10"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-teal-400" />
                  <span>View BSIT Capstone Defense Blueprint & SQL</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-stone-400" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
