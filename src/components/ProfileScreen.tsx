import React, { useState } from 'react';
import { 
  User, Award, Flame, BookOpen, Mic, CheckCircle2, Shield, 
  Settings, FileText, ChevronRight, BarChart2, Gem, Heart, 
  Trophy, Sparkles, Database, Check, Copy, Volume2, ShieldCheck, 
  Activity, ArrowUpRight
} from 'lucide-react';
import { UserProfile, TargetDialect } from '../types';
import { CAPSTONE_CHECKLIST_DATA, RESEARCH_METRICS, DEFAULT_WEEKLY_ACTIVITY } from '../data/curriculumData';
import { sounds } from '../utils/soundEffects';
import { StreakCalendar } from './StreakCalendar';

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
  const [activeTab, setActiveTab] = useState<'stats' | 'achievements' | 'research' | 'settings'>('stats');

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
      <div className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-sm space-y-4 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-28 h-28 bg-teal-50 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none" />

        <div className="relative w-20 h-20 mx-auto">
          <img
            src={profile.avatar}
            alt={profile.name}
            referrerPolicy="no-referrer"
            className="w-20 h-20 rounded-full object-cover border-4 border-teal-500 shadow-md"
          />
          <div className="absolute -bottom-1 -right-1 bg-stone-900 text-teal-400 p-1.5 rounded-full shadow-md border-2 border-white">
            <Award className="w-4 h-4" />
          </div>
        </div>

        <div className="space-y-1">
          <h2 className="font-display font-black text-xl text-stone-900">
            {profile.name}
          </h2>
          <p className="text-xs text-stone-500 font-medium">
            {profile.email} · Joined {profile.joinedDate}
          </p>
          <div className="inline-block mt-1 px-3 py-1 bg-teal-50 text-teal-800 rounded-full text-xs font-bold border border-teal-200/60">
            {profile.level} · {profile.targetDialect === 'davao_bisaya' ? 'Davao Bisaya' : 'Standard Cebuano'}
          </div>
        </div>

        {/* 4 Core Summary Metrics */}
        <div className="grid grid-cols-4 gap-2 pt-3 border-t border-stone-100 text-center">
          <div className="p-2.5 bg-amber-50/70 rounded-2xl border border-amber-200/60">
            <div className="text-base font-black font-mono text-amber-900 tabular-nums">
              {profile.streakDays}d
            </div>
            <div className="text-[10px] text-amber-800 font-bold uppercase tracking-wider">Streak</div>
          </div>
          <div className="p-2.5 bg-teal-50/70 rounded-2xl border border-teal-200/60">
            <div className="text-base font-black font-mono text-teal-900 tabular-nums">
              {profile.xp}
            </div>
            <div className="text-[10px] text-teal-800 font-bold uppercase tracking-wider">Total XP</div>
          </div>
          <div className="p-2.5 bg-sky-50/70 rounded-2xl border border-sky-200/60">
            <div className="text-base font-black font-mono text-sky-900 tabular-nums">
              {profile.gems || 240}
            </div>
            <div className="text-[10px] text-sky-800 font-bold uppercase tracking-wider">Gems</div>
          </div>
          <div className="p-2.5 bg-indigo-50/70 rounded-2xl border border-indigo-200/60">
            <div className="text-base font-black font-mono text-indigo-900 tabular-nums">
              {profile.speechScoreAverage}%
            </div>
            <div className="text-[10px] text-indigo-800 font-bold uppercase tracking-wider">Whisper</div>
          </div>
        </div>
      </div>

      {/* Segmented Sub-Tabs */}
      <div className="flex items-center gap-1 p-1 bg-stone-200/80 rounded-2xl border border-stone-300/50 shadow-inner">
        <button
          onClick={() => {
            sounds.playTap();
            setActiveTab('stats');
          }}
          className={`flex-1 min-h-[40px] py-1.5 px-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'stats'
              ? 'bg-white text-stone-900 shadow-sm border border-stone-200'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          League & Stats
        </button>
        <button
          onClick={() => {
            sounds.playTap();
            setActiveTab('achievements');
          }}
          className={`flex-1 min-h-[40px] py-1.5 px-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'achievements'
              ? 'bg-white text-stone-900 shadow-sm border border-stone-200'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          Badges
        </button>
        <button
          onClick={() => {
            sounds.playTap();
            setActiveTab('research');
          }}
          className={`flex-1 min-h-[40px] py-1.5 px-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'research'
              ? 'bg-white text-stone-900 shadow-sm border border-stone-200'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          Defense Hub
        </button>
        <button
          onClick={() => {
            sounds.playTap();
            setActiveTab('settings');
          }}
          className={`flex-1 min-h-[40px] py-1.5 px-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'settings'
              ? 'bg-white text-stone-900 shadow-sm border border-stone-200'
              : 'text-stone-600 hover:text-stone-900'
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
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2.5">
            {achievements.map((ach) => (
              <div
                key={ach.id}
                className={`p-4 rounded-3xl border space-y-2 text-center transition-all ${
                  ach.unlocked
                    ? 'bg-white border-stone-200/90 shadow-sm'
                    : 'bg-stone-50 border-stone-200/60 opacity-50'
                }`}
              >
                <div className="text-3xl mx-auto">{ach.icon}</div>
                <div className="space-y-0.5">
                  <div className="font-display font-black text-xs text-stone-900">
                    {ach.title}
                  </div>
                  <p className="text-[11px] text-stone-500 leading-tight">
                    {ach.desc}
                  </p>
                </div>
                {ach.unlocked ? (
                  <span className="inline-block text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                    Unlocked ✓
                  </span>
                ) : (
                  <span className="inline-block text-[10px] font-bold text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">
                    Locked
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: CAPSTONE RESEARCH EVALUATION */}
      {activeTab === 'research' && (
        <div className="space-y-4">
          {/* Empirical Benchmarks Grid */}
          <div className="bg-white rounded-3xl p-4 border border-stone-200/90 shadow-sm space-y-3">
            <h3 className="font-display font-black text-sm text-stone-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-600" />
              Empirical Research Telemetry (N = {RESEARCH_METRICS.sampleSize})
            </h3>

            <div className="grid grid-cols-2 gap-2.5 text-center">
              <div className="p-3 bg-teal-50 rounded-2xl border border-teal-200">
                <div className="text-xl font-black font-mono text-teal-800">
                  +{RESEARCH_METRICS.improvementPercentage}%
                </div>
                <div className="text-[10px] text-teal-700 font-bold uppercase tracking-wider">
                  Pre vs Post Gain
                </div>
              </div>
              <div className="p-3 bg-indigo-50 rounded-2xl border border-indigo-200">
                <div className="text-xl font-black font-mono text-indigo-800">
                  {RESEARCH_METRICS.whisperAvgWer}%
                </div>
                <div className="text-[10px] text-indigo-700 font-bold uppercase tracking-wider">
                  Whisper ASR WER
                </div>
              </div>
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200">
                <div className="text-xl font-black font-mono text-amber-800">
                  {RESEARCH_METRICS.bertIntentAccuracy}%
                </div>
                <div className="text-[10px] text-amber-700 font-bold uppercase tracking-wider">
                  BERT Intent Acc.
                </div>
              </div>
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200">
                <div className="text-xl font-black font-mono text-emerald-800">
                  {calculatedSus} / 100
                </div>
                <div className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider">
                  SUS Usability (Grade A)
                </div>
              </div>
            </div>
          </div>

          {/* Interactive SUS Instrument */}
          <div className="bg-white rounded-3xl p-4 border border-stone-200/90 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
              <div>
                <h4 className="font-display font-black text-xs text-stone-900">
                  System Usability Scale (SUS) Calculator
                </h4>
                <p className="text-[10px] text-stone-500">Brooke (1996) 10-Item Usability Standard</p>
              </div>
              <span className="font-mono text-sm font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
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
                <div key={idx} className="space-y-1.5 p-2 bg-stone-50 rounded-xl">
                  <div className="text-[11px] font-bold text-stone-800 leading-snug">{q}</div>
                  <div className="flex items-center justify-between text-[10px] text-stone-500 px-1 pt-1">
                    <span>Disagree (1)</span>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((val) => (
                        <button
                          key={val}
                          onClick={() => handleUpdateSus(idx, val)}
                          className={`w-6 h-6 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            susAnswers[idx] === val
                              ? 'bg-teal-600 text-white shadow-sm'
                              : 'bg-white text-stone-700 border border-stone-200'
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
        <div className="bg-white rounded-3xl p-4 border border-stone-200/90 shadow-sm space-y-4">
          <div className="space-y-1">
            <h3 className="font-display font-black text-sm text-stone-900">
              Learning Settings
            </h3>
            <p className="text-xs text-stone-500">Configure target dialect and daily goal</p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Target Regional Dialect
              </label>
              <select
                value={profile.targetDialect}
                onChange={(e) => {
                  sounds.playTap();
                  onUpdateDialect(e.target.value as TargetDialect);
                }}
                className="w-full bg-stone-50 border border-stone-200 text-stone-900 rounded-xl p-3 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="davao_bisaya">Davao Bisaya (Urban Visayan with Mindanao loanwords)</option>
                <option value="cebuano_standard">Cebuano Standard (Formal Central Visayas)</option>
                <option value="boholano">Boholano (Bol-anon with 'y' to 'j' sound shifts)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Daily Learning Commitment
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[10, 15, 20].map((mins) => (
                  <button
                    key={mins}
                    onClick={() => {
                      sounds.playTap();
                      onUpdateDailyGoal(mins);
                    }}
                    className={`py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      profile.dailyGoalMinutes === mins
                        ? 'bg-teal-600 text-white btn-3d-teal'
                        : 'bg-stone-50 text-stone-700 border border-stone-200'
                    }`}
                  >
                    {mins} mins / day
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
