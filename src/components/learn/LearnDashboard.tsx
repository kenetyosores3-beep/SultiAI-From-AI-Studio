import React, { useState } from 'react';
import { 
  Play, ChevronRight, Mic, MessageSquare, Layers, BookOpen, 
  Flame, Award, Zap, Sparkles, Target, ArrowRight, CheckCircle2, 
  Circle, Trophy, BarChart2, Star, ShieldCheck, Compass, Check,
  UserPlus, UserCheck, ExternalLink, Users
} from 'lucide-react';
import { Lesson, UserProfile, Module } from '../../types';
import { CourseData, COURSES } from '../../data/coursesData';
import { TOOLKIT_MODULES, ToolkitModule } from '../../data/toolkitModulesData';
import { sounds } from '../../utils/soundEffects';
import { TutorDirectoryModal } from '../tutor/TutorDirectoryModal';
import { ApplyTutorModal } from '../tutor/ApplyTutorModal';
import { LinkedInIcon } from '../tutor/LinkedInIcon';
import { getApprovedTutors, Tutor, TutorLanguage } from '../../data/tutorsData';

interface LearnDashboardProps {
  profile?: UserProfile;
  nextLesson: Lesson;
  nextLessonModule?: Module;
  courses?: CourseData[];
  onStartLesson: (lesson: Lesson) => void;
  onSelectCourse: (course: CourseData) => void;
  onOpenQuickPractice: (tool: string) => void;
  onOpenSulti?: (prompt?: string) => void;
  onGoToProfile?: () => void;
}

export const LearnDashboard: React.FC<LearnDashboardProps> = ({
  profile,
  nextLesson,
  nextLessonModule,
  courses = COURSES,
  onStartLesson,
  onSelectCourse,
  onOpenQuickPractice,
  onOpenSulti,
  onGoToProfile,
}) => {
  const currentCourse = courses[0]; // Beginner Bisaya
  const streak = profile?.streakDays ?? 7;
  const xp = profile?.xp ?? 1240;
  const speakingScore = profile?.speechScoreAverage ?? 86;
  const vocabCount = profile?.vocabularyMastered ?? 74;

  // View state for Learning Toolkit: show first 6 or all 13 modules
  const [showAllModules, setShowAllModules] = useState(false);

  // Tutor Hub State
  const [showTutorDirectory, setShowTutorDirectory] = useState(false);
  const [tutorFilter, setTutorFilter] = useState<TutorLanguage | 'all'>('all');
  const [showApplyTutorModal, setShowApplyTutorModal] = useState(false);
  const [activeTutorsList, setActiveTutorsList] = useState<Tutor[]>(() => getApprovedTutors());

  // Time-aware greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    const name = profile?.name?.split(' ')[0] || 'Genesis';
    if (hour < 12) {
      return `Good morning, ${name} 👋`;
    } else if (hour < 18) {
      return `Good afternoon, ${name} 👋`;
    } else {
      return `Good evening, ${name} 👋`;
    }
  };

  const displayedModules = showAllModules ? TOOLKIT_MODULES : TOOLKIT_MODULES.slice(0, 6);

  // Beginner Bisaya Roadmap Milestones
  const ROADMAP_STEPS = [
    { title: 'Foundation', status: 'done' },
    { title: 'Everyday Bisaya', status: 'done' },
    { title: 'Real Conversations', status: 'current' },
    { title: 'Real-World Practice', status: 'locked' },
    { title: 'Speaking Challenge', status: 'locked' },
    { title: 'Assessment', status: 'locked' },
    { title: 'Certificate', status: 'locked' },
  ];

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      
      {/* ========================================================================= */}
      {/* HEADER SECTION                                                           */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-[#11222D] rounded-3xl p-4 sm:p-5 border border-stone-200/90 dark:border-white/10 shadow-xs space-y-3 relative overflow-hidden transition-colors">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="font-display font-black text-lg sm:text-xl text-stone-900 dark:text-white leading-tight truncate">
              {getGreeting()}
            </h1>
            <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">
              Ready to continue? Keep your fluency momentum.
            </p>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-amber-50 dark:bg-amber-950/70 border border-amber-200 dark:border-amber-500/30 text-amber-950 dark:text-amber-200 shrink-0 font-mono font-black text-xs shadow-2xs">
            <Flame className="w-4 h-4 fill-amber-500 text-amber-600 dark:text-amber-400" />
            <span>{streak} Days</span>
          </div>
        </div>

        {/* Quick KPI Stats Bar */}
        <div className="grid grid-cols-3 gap-2 pt-1 border-t border-stone-100 dark:border-white/5 text-center">
          <div className="py-1 px-1.5 bg-stone-50 dark:bg-stone-800/50 rounded-xl">
            <div className="text-[10px] text-stone-400 font-bold uppercase truncate">Daily Goal</div>
            <div className="font-mono font-black text-xs text-teal-700 dark:text-teal-300">
              3 / 5 activities
            </div>
          </div>

          <div className="py-1 px-1.5 bg-stone-50 dark:bg-stone-800/50 rounded-xl">
            <div className="text-[10px] text-stone-400 font-bold uppercase truncate">Weekly Progress</div>
            <div className="font-mono font-black text-xs text-blue-600 dark:text-blue-400">
              72%
            </div>
          </div>

          <div className="py-1 px-1.5 bg-stone-50 dark:bg-stone-800/50 rounded-xl">
            <div className="text-[10px] text-stone-400 font-bold uppercase truncate">Pronunciation</div>
            <div className="font-mono font-black text-xs text-indigo-600 dark:text-indigo-400">
              82% Ring
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. CONTINUE LEARNING — PRIMARY HERO SECTION                               */}
      {/* ========================================================================= */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs px-1">
          <span className="font-display font-black uppercase tracking-wider text-stone-500 dark:text-stone-400 text-[11px]">
            Continue Learning
          </span>
          <span className="text-[10px] text-teal-700 dark:text-teal-300 font-bold font-mono">
            Primary Goal
          </span>
        </div>

        <div className="bg-gradient-to-br from-teal-50/80 via-white to-stone-50/50 dark:from-[#11222D] dark:via-[#132735] dark:to-[#0f1d27] rounded-3xl p-5 border border-teal-200/90 dark:border-teal-500/30 shadow-xs space-y-3.5 relative overflow-hidden transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Module Header */}
          <div className="flex items-center justify-between relative z-10">
            <div>
              <span className="text-[10px] font-mono font-black tracking-wider uppercase text-teal-800 dark:text-teal-300 bg-teal-100/70 dark:bg-teal-950/80 px-2 py-0.5 rounded-md border border-teal-200/60 dark:border-teal-500/30">
                Beginner Bisaya
              </span>
              <p className="text-xs text-stone-500 dark:text-stone-400 font-semibold pt-1">
                Module 03 · Real Conversations
              </p>
            </div>

            <span className="text-[11px] font-mono font-bold text-amber-600 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/70 border border-amber-200 dark:border-amber-500/30 px-2.5 py-0.5 rounded-full">
              ~10 min
            </span>
          </div>

          {/* Current Topic */}
          <div className="space-y-0.5 relative z-10">
            <h2 className="font-display font-black text-xl text-stone-900 dark:text-white leading-tight">
              Asking for Directions
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 italic">
              "Asa dapit ang sakayan padulong Matina?"
            </p>
          </div>

          {/* Visual Progress Bar */}
          <div className="space-y-1 relative z-10">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-stone-500 dark:text-stone-400">Progress</span>
              <span className="font-black text-teal-700 dark:text-teal-300">72% complete</span>
            </div>
            <div className="w-full bg-stone-100 dark:bg-stone-800 rounded-full h-2.5 p-0.5 overflow-hidden border border-stone-200/50 dark:border-white/10 shadow-inner">
              <div
                className="bg-gradient-to-r from-teal-500 to-teal-400 h-full rounded-full transition-all duration-500 shadow-xs"
                style={{ width: '72%' }}
              />
            </div>
          </div>

          {/* Action CTA */}
          <button
            onClick={() => {
              sounds.playTap();
              onStartLesson(nextLesson);
            }}
            className="w-full min-h-[46px] bg-teal-600 hover:bg-teal-500 dark:bg-teal-500 dark:hover:bg-teal-400 text-white dark:text-stone-950 rounded-2xl text-xs font-black py-3 px-4 flex items-center justify-center gap-2 transition-all btn-3d-teal shadow-xs cursor-pointer relative z-10"
          >
            <span>Continue Learning →</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MY COURSES (LEARNING ROADMAP)                                         */}
      {/* ========================================================================= */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs px-1">
          <span className="font-display font-black uppercase tracking-wider text-stone-500 dark:text-stone-400 text-[11px]">
            My Courses & Roadmaps
          </span>
          <button
            onClick={() => {
              sounds.playTap();
              onSelectCourse(currentCourse);
            }}
            className="text-[11px] font-bold text-teal-700 dark:text-teal-300 hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            <span>View Courses →</span>
          </button>
        </div>

        {/* Primary Course: Beginner Bisaya */}
        <div 
          onClick={() => {
            sounds.playTap();
            onSelectCourse(currentCourse);
          }}
          className="p-4 bg-white dark:bg-[#11222D] hover:bg-stone-50 dark:hover:bg-[#152B37] rounded-3xl border border-stone-200/90 dark:border-white/10 shadow-xs transition-all cursor-pointer group space-y-3"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-black text-sm text-stone-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                  Beginner Bisaya
                </h3>
                <span className="px-2 py-0.5 rounded text-[9px] font-mono font-black uppercase bg-teal-50 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 border border-teal-200/60 dark:border-teal-500/30">
                  Active
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 pt-0.5">
                Build your confidence in everyday Cebuano.
              </p>
            </div>

            <span className="font-mono font-black text-xs text-teal-700 dark:text-teal-300 bg-stone-100 dark:bg-stone-800 px-2.5 py-1 rounded-xl shrink-0">
              72%
            </span>
          </div>

          {/* Visual Step Trail */}
          <div className="pt-2 border-t border-stone-100 dark:border-white/5 space-y-1.5">
            <div className="text-[10px] font-mono text-stone-400 dark:text-stone-500 uppercase tracking-wider font-bold">
              Course Roadmap Trail:
            </div>
            <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[10px] font-mono font-medium scrollbar-none">
              {ROADMAP_STEPS.map((step, idx) => (
                <React.Fragment key={step.title}>
                  <span className={`px-2 py-0.5 rounded-md whitespace-nowrap shrink-0 ${
                    step.status === 'done'
                      ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-700/40'
                      : step.status === 'current'
                      ? 'bg-blue-600 text-white font-black shadow-xs ring-1 ring-blue-400'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-400 dark:text-stone-500'
                  }`}>
                    {step.status === 'done' && '✓ '}
                    {step.title}
                  </span>
                  {idx < ROADMAP_STEPS.length - 1 && (
                    <span className="text-stone-300 dark:text-stone-600 text-xs shrink-0">→</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Secondary Course: Everyday Bisaya */}
        <div 
          onClick={() => {
            sounds.playTap();
            if (courses[1]) onSelectCourse(courses[1]);
          }}
          className="p-3.5 bg-stone-50/70 dark:bg-[#11222D]/70 hover:bg-stone-100 dark:hover:bg-[#152B37] rounded-2xl border border-stone-200/80 dark:border-white/5 flex items-center justify-between gap-3 cursor-pointer group transition-all"
        >
          <div>
            <div className="font-display font-black text-xs text-stone-800 dark:text-stone-200 group-hover:text-teal-600">
              Everyday Bisaya
            </div>
            <div className="text-[11px] text-stone-400 font-medium">
              Mindanao street slang & cultural nuances
            </div>
          </div>

          <span className="text-[10px] font-mono font-bold text-stone-400 bg-white dark:bg-stone-800 px-2 py-1 rounded-lg border border-stone-200/60 dark:border-white/10 shrink-0">
            Not started
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2.5 FIND A PERSONAL TUTOR (HUMAN TUTOR HUB)                                */}
      {/* ========================================================================= */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs px-1">
          <div>
            <span className="font-display font-black uppercase tracking-wider text-stone-500 dark:text-stone-400 text-[11px]">
              Find a Tutor
            </span>
            <span className="text-[10px] text-stone-400 block font-medium">
              Practice with a real language tutor and improve your confidence.
            </span>
          </div>

          <button
            onClick={() => {
              sounds.playTap();
              setTutorFilter('all');
              setShowTutorDirectory(true);
            }}
            className="text-[11px] font-bold text-teal-700 dark:text-teal-300 hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            <span>View All Tutors →</span>
          </button>
        </div>

        {/* 2-Column Choice: Bisaya Tutor vs Filipino Tutor */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Bisaya Tutor Card */}
          <div 
            onClick={() => {
              sounds.playTap();
              setTutorFilter('cebuano');
              setShowTutorDirectory(true);
            }}
            className="p-3.5 bg-gradient-to-br from-blue-50/90 to-white dark:from-[#132735] dark:to-[#11222D] hover:from-blue-100/80 dark:hover:from-[#173244] rounded-2xl border border-blue-200/80 dark:border-blue-500/30 shadow-2xs transition-all cursor-pointer group flex flex-col justify-between min-h-[136px]"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xl">🟦</span>
                <span className="px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 text-[9px] font-mono font-bold">
                  Vetted
                </span>
              </div>
              <h4 className="font-display font-black text-xs sm:text-sm text-stone-900 dark:text-white mt-1.5 group-hover:text-blue-600 transition-colors">
                Bisaya Tutor
              </h4>
              <p className="text-[10px] text-stone-500 dark:text-stone-400 font-medium leading-tight mt-0.5">
                Cebuano conversation, pronunciation, grammar
              </p>
            </div>

            <div className="pt-2 flex items-center justify-between text-[11px] font-bold text-blue-700 dark:text-blue-300">
              <span>Find Bisaya Tutor</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </div>

          {/* Filipino Tutor Card */}
          <div 
            onClick={() => {
              sounds.playTap();
              setTutorFilter('filipino');
              setShowTutorDirectory(true);
            }}
            className="p-3.5 bg-gradient-to-br from-amber-50/90 to-white dark:from-[#2a2415] dark:to-[#11222D] hover:from-amber-100/80 dark:hover:from-[#352c17] rounded-2xl border border-amber-200/80 dark:border-amber-500/30 shadow-2xs transition-all cursor-pointer group flex flex-col justify-between min-h-[136px]"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xl">🟨</span>
                <span className="px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300 text-[9px] font-mono font-bold">
                  Vetted
                </span>
              </div>
              <h4 className="font-display font-black text-xs sm:text-sm text-stone-900 dark:text-white mt-1.5 group-hover:text-amber-600 transition-colors">
                Filipino Tutor
              </h4>
              <p className="text-[10px] text-stone-500 dark:text-stone-400 font-medium leading-tight mt-0.5">
                Tagalog conversation, pronunciation, grammar
              </p>
            </div>

            <div className="pt-2 flex items-center justify-between text-[11px] font-bold text-amber-700 dark:text-amber-300">
              <span>Find Filipino Tutor</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </div>
        </div>

        {/* Featured Tutor Spotlight */}
        {activeTutorsList.slice(0, 1).map((topTutor) => (
          <div 
            key={topTutor.id}
            className="p-3 bg-white dark:bg-[#11222D] rounded-2xl border border-stone-200/90 dark:border-white/10 shadow-2xs space-y-2.5"
          >
            <div className="flex items-start justify-between gap-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-black font-display text-xs flex items-center justify-center shrink-0">
                  {topTutor.avatarInitials}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <h5 className="font-display font-bold text-xs text-stone-900 dark:text-white truncate">
                      {topTutor.name}
                    </h5>
                    <span title="SultiAI Academic Vetted">
                      <ShieldCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    </span>
                  </div>
                  <p className="text-[10px] text-stone-500 dark:text-stone-400 truncate">
                    {topTutor.title} · ₱{topTutor.hourlyRatePhp}/hr
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  sounds.playTap();
                  setTutorFilter(topTutor.language === 'both' ? 'all' : topTutor.language);
                  setShowTutorDirectory(true);
                }}
                className="px-2.5 py-1.5 rounded-xl bg-stone-900 dark:bg-white text-white dark:text-stone-900 font-bold text-[10px] flex items-center gap-1 transition-all shrink-0 shadow-2xs cursor-pointer"
              >
                <span>Book Tutor →</span>
              </button>
            </div>
          </div>
        ))}

        {/* Become a Tutor Action Banner */}
        <div className="p-3 bg-stone-50 dark:bg-stone-800/50 rounded-2xl border border-dashed border-stone-300 dark:border-stone-700 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
              <span>👨‍🏫</span>
              <span>Become a Tutor</span>
            </div>
            <p className="text-[10px] text-stone-500 dark:text-stone-400 truncate">
              Teach Bisaya or Filipino · Academic Vetting & Review
            </p>
          </div>

          <button
            onClick={() => {
              sounds.playTap();
              setShowApplyTutorModal(true);
            }}
            className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-[11px] whitespace-nowrap cursor-pointer transition-colors shadow-2xs shrink-0"
          >
            Become a Tutor →
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. LEARNING TOOLKIT — ALL 13 MODULES                                      */}
      {/* ========================================================================= */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs px-1">
          <div>
            <span className="font-display font-black uppercase tracking-wider text-stone-500 dark:text-stone-400 text-[11px]">
              Learning Toolkit
            </span>
            <span className="text-[10px] text-stone-400 block font-medium">
              All 13 Modules · Independent Practice
            </span>
          </div>

          <button
            onClick={() => {
              sounds.playTap();
              setShowAllModules(!showAllModules);
            }}
            className="px-2.5 py-1 rounded-xl text-[11px] font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/70 border border-teal-200 dark:border-teal-500/30 hover:bg-teal-100 transition-colors cursor-pointer"
          >
            {showAllModules ? 'Show Top 6' : 'View All 13 Modules →'}
          </button>
        </div>

        {/* 2-Column Responsive Grid on Mobile */}
        <div className="grid grid-cols-2 gap-2.5">
          {displayedModules.map((mod) => (
            <button
              key={mod.id}
              onClick={() => {
                sounds.playTap();
                onOpenQuickPractice(mod.id);
              }}
              className="p-3 bg-white dark:bg-[#11222D] hover:bg-stone-50 dark:hover:bg-[#152B37] rounded-2xl border border-stone-200/90 dark:border-white/10 text-left transition-all active:scale-[0.98] cursor-pointer shadow-2xs group flex flex-col justify-between min-h-[118px]"
            >
              {/* Header: Module number + icon */}
              <div className="flex items-start justify-between w-full">
                <span className="text-[10px] font-mono font-black text-stone-400 dark:text-stone-500">
                  {mod.num}
                </span>
                <span className="text-lg group-hover:scale-110 transition-transform">
                  {mod.icon}
                </span>
              </div>

              {/* Title & Purpose */}
              <div className="my-1">
                <h4 className="font-display font-black text-xs text-stone-900 dark:text-white leading-tight group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                  {mod.title}
                </h4>
                <p className="text-[10px] text-stone-500 dark:text-stone-400 line-clamp-1 mt-0.5 font-medium">
                  {mod.purpose}
                </p>
              </div>

              {/* Progress Bar + Arrow */}
              <div className="pt-1 w-full space-y-1">
                <div className="w-full bg-stone-100 dark:bg-stone-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-teal-500 h-full rounded-full transition-all"
                    style={{ width: `${mod.progressPercent}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[9px] font-mono text-stone-400">
                  <span>{mod.progressPercent}%</span>
                  <span className="text-teal-600 dark:text-teal-400 font-bold group-hover:translate-x-0.5 transition-transform">
                    →
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. PRACTICE WITH SULTI (PRIMARY COMPANION CTA)                             */}
      {/* ========================================================================= */}
      <div className="p-5 bg-gradient-to-br from-purple-900 via-indigo-900 to-[#11222D] text-white rounded-3xl shadow-lg border border-purple-500/30 space-y-3.5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-36 h-36 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/30 border border-purple-400/40 flex items-center justify-center font-bold text-base">
              🤖
            </div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-purple-300 font-bold">
              AI Speech Companion
            </span>
          </div>

          <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-purple-500/40 text-purple-200 border border-purple-400/30">
            One Companion
          </span>
        </div>

        <div className="space-y-1 relative z-10">
          <h3 className="font-display font-black text-lg text-white leading-tight">
            Practice with SULTI
          </h3>
          <p className="text-xs text-purple-200 leading-relaxed font-normal">
            Speak naturally. Get contextual feedback. Learn from your mistakes. SULTI connects all 13 modules into one cohesive learning companion.
          </p>
        </div>

        {/* Connected Modules Chips */}
        <div className="flex items-center gap-1.5 flex-wrap text-[10px] font-mono text-purple-200 pt-0.5 relative z-10">
          <span className="px-2 py-0.5 rounded-md bg-white/10 border border-white/10">🎙️ Voice</span>
          <span className="px-2 py-0.5 rounded-md bg-white/10 border border-white/10">🎭 Scenario</span>
          <span className="px-2 py-0.5 rounded-md bg-white/10 border border-white/10">🎯 Pronunciation</span>
          <span className="px-2 py-0.5 rounded-md bg-white/10 border border-white/10">🎧 Listening</span>
          <span className="px-2 py-0.5 rounded-md bg-white/10 border border-white/10">🔄 Switch</span>
          <span className="px-2 py-0.5 rounded-md bg-white/10 border border-white/10">🔁 Review</span>
        </div>

        <button
          onClick={() => {
            sounds.playTap();
            onOpenSulti?.('Kumusta SULTI! Gusto kong magpraktis og pagsulti sa Bisaya karon.');
          }}
          className="w-full min-h-[44px] bg-white text-purple-950 hover:bg-purple-50 rounded-2xl text-xs font-black py-2.5 px-4 flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer relative z-10 active:scale-[0.98]"
        >
          <MessageSquare className="w-4 h-4 text-purple-900" />
          <span>Start Speaking →</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 5. YOUR PROGRESS SECTION                                                  */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-[#11222D] rounded-3xl p-4 sm:p-5 border border-stone-200/90 dark:border-white/10 shadow-xs space-y-3.5 transition-colors">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-black text-xs uppercase tracking-wider text-stone-900 dark:text-white">
            Your Progress
          </h3>
          <button
            onClick={() => {
              sounds.playTap();
              onGoToProfile?.();
            }}
            className="text-[11px] font-bold text-teal-700 dark:text-teal-300 hover:underline cursor-pointer"
          >
            View Full Progress →
          </button>
        </div>

        {/* 4 Essential Metrics with Visual Progress Bars */}
        <div className="space-y-2.5 text-xs font-mono">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-stone-500 dark:text-stone-400">COURSE PROGRESS</span>
              <span className="font-black text-stone-900 dark:text-white">72%</span>
            </div>
            <div className="w-full bg-stone-100 dark:bg-stone-800 rounded-full h-2 overflow-hidden">
              <div className="bg-teal-500 h-full rounded-full" style={{ width: '72%' }} />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-stone-500 dark:text-stone-400">SPEAKING</span>
              <span className="font-black text-blue-600 dark:text-blue-400">86%</span>
            </div>
            <div className="w-full bg-stone-100 dark:bg-stone-800 rounded-full h-2 overflow-hidden">
              <div className="bg-blue-500 h-full rounded-full" style={{ width: '86%' }} />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-stone-500 dark:text-stone-400">VOCABULARY</span>
              <span className="font-black text-purple-600 dark:text-purple-400">74%</span>
            </div>
            <div className="w-full bg-stone-100 dark:bg-stone-800 rounded-full h-2 overflow-hidden">
              <div className="bg-purple-500 h-full rounded-full" style={{ width: '74%' }} />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-stone-500 dark:text-stone-400">PRONUNCIATION</span>
              <span className="font-black text-emerald-600 dark:text-emerald-400">82%</span>
            </div>
            <div className="w-full bg-stone-100 dark:bg-stone-800 rounded-full h-2 overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: '82%' }} />
            </div>
          </div>
        </div>

        {/* Milestone Summary Pill Row */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-stone-100 dark:border-white/5 text-center text-xs">
          <div className="p-2 bg-stone-50 dark:bg-stone-800/60 rounded-xl">
            <div className="font-black font-display text-sm text-amber-600 dark:text-amber-400">
              🔥 7 Days
            </div>
            <div className="text-[10px] text-stone-400 font-medium">Daily Streak</div>
          </div>

          <div className="p-2 bg-stone-50 dark:bg-stone-800/60 rounded-xl">
            <div className="font-black font-display text-sm text-teal-600 dark:text-teal-400">
              ⭐ 1,240 XP
            </div>
            <div className="text-[10px] text-stone-400 font-medium">Experience</div>
          </div>

          <div className="p-2 bg-stone-50 dark:bg-stone-800/60 rounded-xl">
            <div className="font-black font-display text-sm text-indigo-600 dark:text-indigo-400">
              🏆 6 Badges
            </div>
            <div className="text-[10px] text-stone-400 font-medium">Achievements</div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 6. DAILY LEARNING GOALS                                                   */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-[#11222D] rounded-3xl p-4 sm:p-5 border border-stone-200/90 dark:border-white/10 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-black text-xs uppercase tracking-wider text-stone-900 dark:text-white flex items-center gap-1.5">
            <Target className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>Today's Learning Goal</span>
          </h3>
          <span className="text-[10px] font-mono font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950 px-2 py-0.5 rounded-full border border-teal-200 dark:border-teal-500/30">
            3 / 5 completed
          </span>
        </div>

        {/* Goal Checklist */}
        <div className="space-y-2">
          <div className="p-2.5 bg-stone-50 dark:bg-stone-800/50 rounded-2xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-base">🎙️</span>
              <span className="font-bold text-stone-800 dark:text-stone-200">Voice Practice</span>
            </div>
            <span className="text-emerald-600 dark:text-emerald-400 font-black flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              <span>Done</span>
            </span>
          </div>

          <div className="p-2.5 bg-stone-50 dark:bg-stone-800/50 rounded-2xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-base">🃏</span>
              <span className="font-bold text-stone-800 dark:text-stone-200">Review Flashcards</span>
            </div>
            <span className="text-emerald-600 dark:text-emerald-400 font-black flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              <span>Done</span>
            </span>
          </div>

          <div className="p-2.5 bg-stone-50 dark:bg-stone-800/50 rounded-2xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-base">🎯</span>
              <span className="font-bold text-stone-800 dark:text-stone-200">Pronunciation Lab</span>
            </div>
            <span className="text-stone-400 font-medium">
              ○ 1 drill left
            </span>
          </div>

          <div className="p-2.5 bg-stone-50 dark:bg-stone-800/50 rounded-2xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-base">📚</span>
              <span className="font-bold text-stone-800 dark:text-stone-200">Learn Vocabulary</span>
            </div>
            <span className="text-stone-400 font-medium">
              ○ 2 words left
            </span>
          </div>
        </div>

        {/* Overall Completion Progress */}
        <div className="pt-1">
          <div className="w-full bg-stone-100 dark:bg-stone-800 rounded-full h-2 overflow-hidden">
            <div className="bg-teal-500 h-full rounded-full transition-all" style={{ width: '60%' }} />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 7. LEARN JOURNEY (THE COMPLETE ROADMAP HIERARCHY)                          */}
      {/* ========================================================================= */}
      <div className="bg-stone-50 dark:bg-[#11222D]/80 rounded-3xl p-4 sm:p-5 border border-stone-200/80 dark:border-white/10 space-y-3 text-center">
        <div className="space-y-0.5">
          <span className="text-[10px] font-mono uppercase tracking-widest text-teal-600 dark:text-teal-400 font-bold">
            Curriculum Architecture
          </span>
          <h4 className="font-display font-black text-xs text-stone-900 dark:text-white">
            Your Complete Learning Journey
          </h4>
        </div>

        {/* Stepped Journey Visualization */}
        <div className="py-2 flex flex-col items-center gap-1 font-mono text-xs">
          <span className="px-3 py-1 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-black text-[10px]">
            START
          </span>
          <span className="text-stone-400">↓</span>
          <span className="font-bold text-stone-700 dark:text-stone-300 text-[11px]">Learn</span>
          <span className="text-stone-400">↓</span>
          <span className="font-bold text-stone-700 dark:text-stone-300 text-[11px]">Practice</span>
          <span className="text-stone-400">↓</span>
          <span className="font-black text-purple-600 dark:text-purple-400 text-xs">Speak with SULTI</span>
          <span className="text-stone-400">↓</span>
          <span className="font-bold text-stone-700 dark:text-stone-300 text-[11px]">Get Feedback</span>
          <span className="text-stone-400">↓</span>
          <span className="font-bold text-stone-700 dark:text-stone-300 text-[11px]">Track Progress</span>
          <span className="text-stone-400">↓</span>
          <span className="font-bold text-stone-700 dark:text-stone-300 text-[11px]">Assessment</span>
          <span className="text-stone-400">↓</span>
          <span className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-black text-[10px] flex items-center gap-1 shadow-2xs">
            🏆 CERTIFICATE
          </span>
        </div>

        <p className="text-[10px] text-stone-400 dark:text-stone-500 max-w-xs mx-auto">
          "13 Modules. One Companion. Continuous Fluency."
        </p>
      </div>

      {/* ========================================================================= */}
      {/* TUTOR DIRECTORY & APPLICATION MODALS                                      */}
      {/* ========================================================================= */}
      <TutorDirectoryModal
        isOpen={showTutorDirectory}
        onClose={() => setShowTutorDirectory(false)}
        initialFilter={tutorFilter}
      />

      <ApplyTutorModal
        isOpen={showApplyTutorModal}
        onClose={() => setShowApplyTutorModal(false)}
        onSuccess={(newTutor) => {
          setActiveTutorsList(getApprovedTutors());
          setShowApplyTutorModal(false);
          setShowTutorDirectory(true);
        }}
      />

    </div>
  );
};
