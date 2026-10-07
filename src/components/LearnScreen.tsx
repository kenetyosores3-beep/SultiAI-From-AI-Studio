import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  BookOpen, CheckCircle, ChevronRight, Volume2, Sparkles, 
  Search, Bookmark, Lock, Play, Bus, ShoppingBag, 
  HandHeart, ArrowRight, X, Award, Flame, Mic, 
  Compass, ShieldCheck, MessageSquare, Share2, 
  Download, Trophy, GraduationCap, Check, Target, Zap
} from 'lucide-react';
import { Module, Lesson, RoleplayScenario, UserProfile } from '../types';
import { ROLEPLAY_SCENARIOS } from '../data/curriculumData';
import { speakBisaya } from '../utils/audio';
import { sounds } from '../utils/soundEffects';

interface LearnScreenProps {
  modules: Module[];
  completedLessons: string[];
  onStartLesson: (lesson: Lesson) => void;
  onOpenSulti?: (prefillPrompt?: string) => void;
  profile?: UserProfile;
  onAddPracticeMinutes?: (mins: number) => void;
}

export const LearnScreen: React.FC<LearnScreenProps> = ({
  modules,
  completedLessons,
  onStartLesson,
  onOpenSulti,
  profile,
  onAddPracticeMinutes,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'path' | 'modules' | 'scenarios' | 'phrasebook' | 'culture'>('overview');
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [phraseSearch, setPhraseSearch] = useState('');
  const [playingPhrase, setPlayingPhrase] = useState<string | null>(null);
  const [copiedCert, setCopiedCert] = useState(false);

  // Daily Minute Goal & Positive Reinforcement Progress State
  const dailyGoalMinutes = profile?.dailyGoalMinutes ?? 15;
  const [localTodayMinutes, setLocalTodayMinutes] = useState<number>(() => profile?.todayMinutes ?? 8);
  const isGoalHit = localTodayMinutes >= dailyGoalMinutes;
  const [isBadgeCelebrating, setIsBadgeCelebrating] = useState(false);
  const hasTriggeredInitialRef = useRef(false);

  // Keep local minutes synchronized when profile updates externally
  useEffect(() => {
    if (profile?.todayMinutes !== undefined && profile.todayMinutes !== localTodayMinutes) {
      setLocalTodayMinutes(profile.todayMinutes);
    }
  }, [profile?.todayMinutes]);

  // Confetti and positive reinforcement celebration animation trigger
  const fireCelebrationConfetti = () => {
    sounds.playFanfare();
    setIsBadgeCelebrating(true);

    try {
      // Primary burst from center
      confetti({
        particleCount: 75,
        spread: 70,
        origin: { y: 0.65 },
        colors: ['#14b8a6', '#10b981', '#f59e0b', '#38bdf8', '#fbbf24', '#a855f7'],
        disableForReducedMotion: true,
      });

      // Side fireworks burst for extra delight
      setTimeout(() => {
        confetti({
          particleCount: 45,
          angle: 60,
          spread: 60,
          origin: { x: 0.1, y: 0.7 },
          colors: ['#14b8a6', '#f59e0b', '#10b981'],
          disableForReducedMotion: true,
        });
        confetti({
          particleCount: 45,
          angle: 120,
          spread: 60,
          origin: { x: 0.9, y: 0.7 },
          colors: ['#38bdf8', '#10b981', '#f59e0b'],
          disableForReducedMotion: true,
        });
      }, 250);

      // Final golden sparkle shower
      setTimeout(() => {
        confetti({
          particleCount: 35,
          spread: 90,
          origin: { y: 0.5 },
          colors: ['#fbbf24', '#f59e0b', '#14b8a6'],
          disableForReducedMotion: true,
        });
      }, 500);
    } catch {
      // Fallback
    }

    setTimeout(() => {
      setIsBadgeCelebrating(false);
    }, 2800);
  };

  // Quick practice minute handler with instant positive reinforcement
  const handleAddMinutes = (added: number) => {
    sounds.playTap();
    const newMins = localTodayMinutes + added;
    setLocalTodayMinutes(newMins);
    onAddPracticeMinutes?.(added);

    if (newMins >= dailyGoalMinutes && !isGoalHit) {
      setTimeout(() => {
        fireCelebrationConfetti();
      }, 200);
    }
  };

  // Instant goal completion for demonstration and celebratory testing
  const handleCompleteGoal = () => {
    sounds.playTap();
    const needed = Math.max(1, dailyGoalMinutes - localTodayMinutes);
    const newMins = dailyGoalMinutes;
    setLocalTodayMinutes(newMins);
    onAddPracticeMinutes?.(needed);
    fireCelebrationConfetti();
  };

  // Bookmarking with local storage persistence
  const [bookmarkedPhrases, setBookmarkedPhrases] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('sulti_bookmarked_phrases');
      return saved ? JSON.parse(saved) : ['Lugar lang, Nong!', 'Palihog ko sa plete, Nong.'];
    } catch {
      return ['Lugar lang, Nong!'];
    }
  });

  const toggleBookmark = (phrase: string) => {
    sounds.playTap();
    setBookmarkedPhrases((prev) => {
      const next = prev.includes(phrase) ? prev.filter((p) => p !== phrase) : [...prev, phrase];
      localStorage.setItem('sulti_bookmarked_phrases', JSON.stringify(next));
      return next;
    });
  };

  const handlePlayAudio = async (text: string) => {
    setPlayingPhrase(text);
    sounds.playTap();
    await speakBisaya(text);
    setPlayingPhrase(null);
  };

  // Flatten all lessons across modules
  const allLessons = modules.flatMap((m) => m.lessons);
  const completedCount = completedLessons.length;
  const totalLessons = allLessons.length;
  const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  // Determine the next lesson to learn
  const nextLessonToLearn: Lesson = allLessons.find((l) => !completedLessons.includes(l.id)) || allLessons[0];
  const nextLessonModule = modules.find((m) => m.lessons.some((l) => l.id === nextLessonToLearn?.id)) || modules[0];

  const phrasebookCategories = [
    {
      category: 'Jeepney & Commuting',
      icon: Bus,
      phrases: [
        { bisaya: 'Lugar lang, Nong!', english: 'Stop here, driver!', note: 'Polite Visayan way to ask vehicle to pull over.' },
        { bisaya: 'Palihog ko sa plete, Nong.', english: 'Please pass my fare, sir.', note: 'Communal fare passing etiquette.' },
        { bisaya: 'Naa bay sukli ang singkwenta?', english: 'Is there change for fifty pesos?', note: 'Ask beforehand for bills > ₱50.' },
        { bisaya: 'Tagpila ang plete padulong Matina?', english: 'How much is the fare bound for Matina?', note: 'Standard fare price inquiry.' }
      ]
    },
    {
      category: 'Market & Bargaining',
      icon: ShoppingBag,
      phrases: [
        { bisaya: 'Tagpila ang kilo sa mangga?', english: 'How much per kilo for the mangoes?', note: 'Use "tagpila" for price per unit.' },
        { bisaya: 'Puyde hangyo gamay, Nang?', english: 'May I ask for a small discount, ma\'am?', note: 'Warm bargaining tone.' },
        { bisaya: 'Presko pa ba ni?', english: 'Is this still fresh?', note: 'Common wet market check.' },
        { bisaya: 'Kuha kog usa ka kilo.', english: 'I will take one kilo.', note: 'Confirming your purchase order.' }
      ]
    },
    {
      category: 'Daily Greetings & Social',
      icon: HandHeart,
      phrases: [
        { bisaya: 'Maayong buntag / hapon / gabii.', english: 'Good morning / afternoon / evening.', note: 'Vary greeting by time of day.' },
        { bisaya: 'Kumusta ka? Maayo man, ikaw?', english: 'How are you? I\'m fine, how about you?', note: 'Polite casual greeting response.' },
        { bisaya: 'Daghan kaayong salamat!', english: 'Thank you very much!', note: '"Kaayo" intensifies (very/so).' },
        { bisaya: 'Amping kanunay!', english: 'Take care always!', note: 'Heartfelt parting wish.' }
      ]
    }
  ];

  const cultureNotes = [
    {
      title: 'Why isn\'t "Po" and "Opo" used in Bisaya?',
      sample: 'Palihog lang, Nong.',
      explanation: 'In Tagalog, "po" and "opo" indicate respect. However, Bisaya does not use these words. Politeness is expressed via friendly intonation, warm titles ("Nong", "Nang", "Kuya", "Ate"), and softening particles like "palihog" (please) and "man". Saying "po" in Visayas or Mindanao marks you as a Tagalog speaker!'
    },
    {
      title: 'Understanding the particle "Bitaw"',
      sample: 'Bitaw no? Lami gyud!',
      explanation: '"Bitaw" expresses genuine affirmation, equivalent to "Indeed!", "I know, right?!", or "That\'s true!". For example: "Lami bitaw ang pagkaon diri" (The food here is indeed delicious!).'
    },
    {
      title: 'The expressive power of "Gud / Gyud"',
      sample: 'Ngano gud tawn? Gwapa gyud!',
      explanation: 'In Cebuano, "gyud" means "really" or "definitely" (e.g. Gwapa gyud = truly pretty). In Davao Bisaya, "gud" acts as an expressive particle: "Ngano gud tawn?" (Why on earth?). It adds distinct local emotion.'
    },
    {
      title: 'Surprise & Realization: "Diay"',
      sample: 'Ikaw diay na! Mao diay!',
      explanation: '"Diay" marks sudden realization, surprise, or newly discovered news. "Ikaw diay na!" = "Oh, it\'s you!" and "Mao diay!" = "So that\'s why!".'
    }
  ];

  const handleCopyCertCode = () => {
    sounds.playTap();
    navigator.clipboard?.writeText('SULTI-JMC-2026-GD88');
    setCopiedCert(true);
    setTimeout(() => setCopiedCert(false), 2000);
  };

  return (
    <div className="space-y-4 pb-24 px-4 pt-2 max-w-md mx-auto select-none">
      {/* SULTIAI PRODUCT-ALIGNED EDITORIAL NAVIGATION */}
      <div className="flex items-center gap-1 p-1 bg-stone-900 rounded-2xl border border-stone-800 shadow-sm overflow-x-auto scrollbar-none">
        <button
          onClick={() => {
            sounds.playTap();
            setActiveTab('overview');
          }}
          className={`flex-1 min-h-[38px] py-1.5 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'overview'
              ? 'bg-teal-500 text-stone-950 font-black shadow-sm'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          Curriculum
        </button>
        <button
          onClick={() => {
            sounds.playTap();
            setActiveTab('path');
          }}
          className={`flex-1 min-h-[38px] py-1.5 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'path'
              ? 'bg-teal-500 text-stone-950 font-black shadow-sm'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          Path
        </button>
        <button
          onClick={() => {
            sounds.playTap();
            setActiveTab('modules');
          }}
          className={`flex-1 min-h-[38px] py-1.5 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'modules'
              ? 'bg-teal-500 text-stone-950 font-black shadow-sm'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          Modules ({modules.length})
        </button>
        <button
          onClick={() => {
            sounds.playTap();
            setActiveTab('scenarios');
          }}
          className={`flex-1 min-h-[38px] py-1.5 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'scenarios'
              ? 'bg-teal-500 text-stone-950 font-black shadow-sm'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          Scenarios
        </button>
        <button
          onClick={() => {
            sounds.playTap();
            setActiveTab('phrasebook');
          }}
          className={`flex-1 min-h-[38px] py-1.5 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'phrasebook'
              ? 'bg-teal-500 text-stone-950 font-black shadow-sm'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          Phrasebook
        </button>
        <button
          onClick={() => {
            sounds.playTap();
            setActiveTab('culture');
          }}
          className={`flex-1 min-h-[38px] py-1.5 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'culture'
              ? 'bg-teal-500 text-stone-950 font-black shadow-sm'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          Culture
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 0: EDITORIAL SULTIAI CURRICULUM OVERVIEW (MATCHING SULTIAI.NETLIFY.APP) */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-4 animate-in fade-in">
          {/* SECTION 01: HERO NEXT UP / CONTINUE LEARNING (Answers "What should I learn next?") */}
          <div className="bg-stone-900 rounded-3xl p-5 text-white shadow-md border border-stone-800 space-y-4 relative overflow-hidden">
            {/* Subtle decorative glow */}
            <div className="absolute top-0 right-0 w-44 h-44 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-black tracking-widest uppercase text-teal-400 bg-teal-950/80 border border-teal-500/30 px-2 py-0.5 rounded-md">
                  01 / NEXT UP
                </span>
                <span className="text-xs text-stone-400 font-medium">
                  {nextLessonModule?.title}
                </span>
              </div>
              <span className="font-mono text-xs font-bold text-amber-300 bg-amber-950/80 border border-amber-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <span>+{nextLessonToLearn?.xpReward || 40} XP</span>
              </span>
            </div>

            <div className="space-y-1 relative z-10">
              <h2 className="font-display font-black text-xl text-white tracking-tight">
                {nextLessonToLearn?.title}
              </h2>
              <p className="text-xs text-teal-300/90 font-mono italic">
                "{nextLessonToLearn?.titleBisaya}"
              </p>
              <p className="text-xs text-stone-300 font-normal leading-relaxed pt-1">
                {nextLessonToLearn?.description}
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-stone-800 relative z-10">
              <div className="text-[11px] font-mono text-stone-400">
                Est. {nextLessonToLearn?.estimatedMinutes || 5} mins · {nextLessonToLearn?.level}
              </div>
              <button
                onClick={() => {
                  sounds.playTap();
                  if (nextLessonToLearn) onStartLesson(nextLessonToLearn);
                }}
                className="px-4 py-2 bg-teal-500 hover:bg-teal-400 active:scale-95 text-stone-950 text-xs font-black rounded-xl transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <span>Start Lesson</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* SECTION 02: CURRENT COURSE & PATHWAY (Answers "What is my current course?" & "What have I completed?") */}
          <div className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-black tracking-widest uppercase text-stone-400">
                  02 / CURRENT COURSE
                </span>
                <h3 className="font-display font-black text-base text-stone-900 mt-0.5">
                  Everyday Bisaya & Davao Colloquial
                </h3>
              </div>
              <span className="font-mono text-xs font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-full">
                LEVEL 03
              </span>
            </div>

            <p className="text-xs text-stone-500 leading-relaxed font-normal">
              Foundational grammar, public transportation dialogue, marketplace bargaining, and expressive local particles.
            </p>

            {/* Course Progress Bar */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-stone-700">Course Completion</span>
                <span className="font-mono font-black text-teal-600">{progressPercent}%</span>
              </div>
              <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden border border-stone-200">
                <div 
                  className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(progressPercent, 15)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-stone-400 font-mono pt-0.5">
                <span>{completedCount} of {totalLessons} lessons mastered</span>
                <span>8 Modules · 32 Lessons</span>
              </div>
            </div>

            {/* Structured Track Selectors */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => {
                  sounds.playTap();
                  setActiveTab('path');
                }}
                className="p-3 bg-stone-50 hover:bg-stone-100 rounded-2xl border border-stone-200/80 text-left transition-all cursor-pointer active:scale-98"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded">
                    UNIT 01-04
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
                </div>
                <div className="text-xs font-black text-stone-900 mt-1.5 font-display">
                  Foundations
                </div>
                <div className="text-[10px] text-stone-500 mt-0.5">Greetings & Transit</div>
              </button>

              <button
                onClick={() => {
                  sounds.playTap();
                  setActiveTab('modules');
                }}
                className="p-3 bg-stone-50 hover:bg-stone-100 rounded-2xl border border-stone-200/80 text-left transition-all cursor-pointer active:scale-98"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-stone-600 bg-stone-200/60 px-1.5 py-0.5 rounded">
                    UNIT 05-08
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
                </div>
                <div className="text-xs font-black text-stone-900 mt-1.5 font-display">
                  Social & Slang
                </div>
                <div className="text-[10px] text-stone-500 mt-0.5">Particles: Gud, Bitaw</div>
              </button>
            </div>
          </div>

          {/* SECTION 03: SULTIAI CONTEXT-AWARE LOOP (Capstone Theoretical Model) */}
          <div className="bg-stone-900 text-stone-100 rounded-3xl p-5 border border-stone-800 space-y-3 shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-black tracking-widest uppercase text-teal-400">
                03 / SULTIAI LEARNING LOOP
              </span>
              <span className="text-[10px] font-mono text-stone-400">Context-Aware NLP</span>
            </div>
            
            <div className="space-y-1">
              <h3 className="font-display font-black text-sm text-white">
                How SultiAI Builds Conversational Confidence
              </h3>
              <p className="text-xs text-stone-400 leading-relaxed">
                Rather than rote flashcards, SultiAI evaluates your acoustic speech, regional context, and pragmatic intent.
              </p>
            </div>

            {/* Visual Learning Chain */}
            <div className="p-3 bg-stone-850 rounded-2xl border border-stone-750 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono text-stone-300 overflow-x-auto gap-2 scrollbar-none py-1">
                <span className="px-2 py-0.5 bg-teal-950 text-teal-300 rounded border border-teal-800/40 shrink-0">Speech</span>
                <span className="text-stone-600">→</span>
                <span className="px-2 py-0.5 bg-stone-800 text-stone-300 rounded shrink-0">Context</span>
                <span className="text-stone-600">→</span>
                <span className="px-2 py-0.5 bg-stone-800 text-stone-300 rounded shrink-0">Intent</span>
                <span className="text-stone-600">→</span>
                <span className="px-2 py-0.5 bg-stone-800 text-stone-300 rounded shrink-0">Situation</span>
                <span className="text-stone-600">→</span>
                <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 rounded border border-emerald-800/40 shrink-0">Confidence</span>
              </div>
            </div>
          </div>

          {/* SECTION 04: YOUR PROGRESS & DAILY GOAL REINFORCEMENT (Answers "How am I improving?") */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-mono font-black uppercase tracking-widest text-stone-400">
                04 / YOUR PROGRESS
              </span>
              <span className="text-[10px] text-teal-600 font-bold font-mono">
                {isGoalHit ? '🎯 Daily Goal Achieved' : 'Daily Goal Active'}
              </span>
            </div>

            {/* Daily Practice Minute Goal & Achievement Celebration Card */}
            <div className={`rounded-3xl p-4.5 border transition-all duration-300 relative overflow-hidden ${
              isGoalHit
                ? 'bg-gradient-to-br from-emerald-50/90 via-teal-50/40 to-amber-50/60 border-emerald-300/90 shadow-sm'
                : 'bg-white border-stone-200/90 shadow-2xs'
            }`}>
              {/* Background ambient celebratory glow when goal is reached */}
              {isGoalHit && (
                <div className="absolute -right-8 -bottom-8 w-44 h-44 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none" />
              )}

              {/* Goal Progress Header */}
              <div className="flex items-center justify-between gap-2 relative z-10">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 transition-transform ${
                    isGoalHit
                      ? 'bg-emerald-500 text-white shadow-xs scale-105 animate-bounce ring-2 ring-emerald-300'
                      : 'bg-teal-50 text-teal-700 border border-teal-200/60'
                  }`}>
                    {isGoalHit ? <Trophy className="w-4.5 h-4.5 fill-current" /> : <Target className="w-4.5 h-4.5" />}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-display font-black text-xs sm:text-sm text-stone-900 leading-tight">
                      Daily Practice Goal
                    </h4>
                    <p className="text-[11px] text-stone-500 font-medium truncate">
                      {isGoalHit 
                        ? 'Goal reached! Consistency builds fluency.'
                        : `${Math.max(0, dailyGoalMinutes - localTodayMinutes)} mins left to complete today's mission`}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className={`font-mono font-black text-xs sm:text-sm ${
                    isGoalHit ? 'text-emerald-700' : 'text-teal-700'
                  }`}>
                    {localTodayMinutes} / {dailyGoalMinutes} min
                  </span>
                  <div className="text-[10px] font-mono text-stone-400 uppercase">
                    {Math.min(100, Math.round((localTodayMinutes / dailyGoalMinutes) * 100))}%
                  </div>
                </div>
              </div>

              {/* Goal Progress Bar */}
              <div className="mt-3 w-full h-2.5 bg-stone-100 rounded-full overflow-hidden border border-stone-200/80 p-0.5 relative z-10">
                <div 
                  className={`h-full rounded-full transition-all duration-700 ${
                    isGoalHit 
                      ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 shadow-xs' 
                      : 'bg-gradient-to-r from-teal-500 to-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, Math.round((localTodayMinutes / dailyGoalMinutes) * 100))}%` }}
                />
              </div>

              {/* ACHIEVED STATE: ANIMATED ACHIEVEMENT BADGE & POSITIVE REINFORCEMENT */}
              {isGoalHit ? (
                <div className={`mt-3.5 pt-3.5 border-t border-emerald-200/80 relative z-10 transition-all ${
                  isBadgeCelebrating ? 'scale-[1.02] duration-300' : ''
                }`}>
                  <div className="bg-white/95 backdrop-blur-xs rounded-2xl p-3 border border-emerald-300 shadow-2xs flex items-center justify-between gap-3 animate-in zoom-in-95 duration-500">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 to-emerald-400 text-stone-950 flex items-center justify-center shrink-0 shadow-xs ring-2 ring-emerald-300/60 animate-pulse">
                        <Award className="w-5 h-5 fill-stone-950" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            UNLOCKED BADGE
                          </span>
                          <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-50 px-1 py-0.5 rounded">+50 XP Bonus</span>
                        </div>
                        <div className="font-display font-black text-xs text-stone-900 mt-0.5 truncate">
                          Consistent Learner
                        </div>
                        <div className="text-[10px] text-stone-500 font-medium">
                          Target of {dailyGoalMinutes} mins hit today!
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={fireCelebrationConfetti}
                      className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white rounded-xl text-[11px] font-black transition-all shadow-xs shrink-0 flex items-center gap-1 cursor-pointer"
                      title="Replay celebration confetti and fanfare"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>Celebrate 🎉</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* IN-PROGRESS STATE: QUICK ACTIONS TO HIT GOAL */
                <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between gap-2 relative z-10">
                  <span className="text-[11px] text-stone-500 font-medium">
                    Practice to complete goal:
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleAddMinutes(5)}
                      className="px-2.5 py-1 bg-stone-100 hover:bg-teal-50 hover:text-teal-700 text-stone-700 text-[11px] font-bold rounded-lg border border-stone-200 transition-all cursor-pointer active:scale-95"
                      title="Add 5 practice minutes"
                    >
                      +5 min
                    </button>
                    <button
                      onClick={handleCompleteGoal}
                      className="px-2.5 py-1 bg-teal-600 hover:bg-teal-500 text-white text-[11px] font-black rounded-lg transition-all cursor-pointer active:scale-95 shadow-2xs flex items-center gap-1"
                      title="Complete daily goal and trigger celebration"
                    >
                      <Target className="w-3 h-3" />
                      <span>Hit Goal 🎯</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 4-Metric Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="bg-white p-3.5 rounded-2xl border border-stone-200/90 shadow-2xs">
                <div className="text-[10px] font-mono font-bold text-stone-400 uppercase">Bahandi XP</div>
                <div className="font-display font-black text-lg text-teal-600 mt-0.5">
                  {profile?.xp ? profile.xp.toLocaleString() : '1,240'}
                </div>
                <div className="text-[10px] text-stone-500 mt-0.5 font-medium">Rank: Explorer</div>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-stone-200/90 shadow-2xs">
                <div className="text-[10px] font-mono font-bold text-stone-400 uppercase">Daily Streak</div>
                <div className="font-display font-black text-lg text-amber-500 mt-0.5 flex items-center gap-1">
                  <span>{profile?.streakDays ?? 7}</span>
                  <Flame className="w-4 h-4 fill-amber-500 text-amber-500 inline" />
                </div>
                <div className="text-[10px] text-stone-500 mt-0.5 font-medium">Freeze active</div>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-stone-200/90 shadow-2xs">
                <div className="text-[10px] font-mono font-bold text-stone-400 uppercase">Acoustic WER</div>
                <div className="font-display font-black text-lg text-emerald-600 mt-0.5">92%</div>
                <div className="text-[10px] text-stone-500 mt-0.5 font-medium">Whisper Accuracy</div>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-stone-200/90 shadow-2xs">
                <div className="text-[10px] font-mono font-bold text-stone-400 uppercase">Confidence</div>
                <div className="font-display font-black text-lg text-indigo-600 mt-0.5">86%</div>
                <div className="text-[10px] text-stone-500 mt-0.5 font-medium">Context Mastery</div>
              </div>
            </div>
          </div>

          {/* SECTION 05: SPEAKING PRACTICE & SCENARIOS (Answers "How can I practice speaking?") */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-mono font-black uppercase tracking-widest text-stone-400">
                05 / PRACTICE SPEAKING & SITUATIONS
              </span>
              <button
                onClick={() => {
                  sounds.playTap();
                  setActiveTab('scenarios');
                }}
                className="text-[10px] font-bold text-teal-700 hover:underline cursor-pointer"
              >
                View all 12 scenarios →
              </button>
            </div>

            {/* High-Impact Voice Action Card */}
            <div className="bg-gradient-to-r from-teal-900 to-stone-900 rounded-3xl p-4 text-white border border-teal-800/60 shadow-md flex items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <Mic className="w-4 h-4 text-teal-400" />
                  <span className="text-[10px] font-mono font-black uppercase tracking-wider text-teal-300">
                    SULTI AI VOICE COMPANION
                  </span>
                </div>
                <h4 className="font-display font-black text-sm text-white">
                  Real-time Speaking Practice
                </h4>
                <p className="text-[11px] text-stone-300 font-normal">
                  Speak freely in Bisaya with instant pronunciation guidance and grammar feedback.
                </p>
              </div>

              <button
                onClick={() => {
                  sounds.playTap();
                  onOpenSulti?.('Gusto kong magpraktis og pagsulti sa Bisaya.');
                }}
                className="px-3.5 py-2.5 bg-teal-500 hover:bg-teal-400 active:scale-95 text-stone-950 text-xs font-black rounded-xl transition-all flex items-center gap-1 shrink-0 shadow-md cursor-pointer"
              >
                <span>Talk Now</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Quick-Launch Scenarios Grid */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  sounds.playTap();
                  onOpenSulti?.('Gusto kong magpraktis sa Jeepney multicab commute gikan Roxas padulong Matina.');
                }}
                className="p-3 bg-white hover:bg-stone-50 rounded-2xl border border-stone-200/90 text-left transition-all cursor-pointer shadow-2xs group active:scale-98"
              >
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center mb-2">
                  <Bus className="w-3.5 h-3.5" />
                </div>
                <div className="text-xs font-black text-stone-900 group-hover:text-teal-700 font-display">
                  Jeepney Commuting
                </div>
                <div className="text-[10px] text-stone-500 mt-0.5">"Lugar lang, Nong!"</div>
              </button>

              <button
                onClick={() => {
                  sounds.playTap();
                  onOpenSulti?.('Gusto kong magpraktis sa paghangyo sa Bankerohan Public Market.');
                }}
                className="p-3 bg-white hover:bg-stone-50 rounded-2xl border border-stone-200/90 text-left transition-all cursor-pointer shadow-2xs group active:scale-98"
              >
                <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center mb-2">
                  <ShoppingBag className="w-3.5 h-3.5" />
                </div>
                <div className="text-xs font-black text-stone-900 group-hover:text-teal-700 font-display">
                  Market Bargaining
                </div>
                <div className="text-[10px] text-stone-500 mt-0.5">"Puyde hangyo gamay?"</div>
              </button>
            </div>
          </div>

          {/* SECTION 06: CERTIFICATES & CREDENTIALS (Answers "Where are my certificates?") */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-mono font-black uppercase tracking-widest text-stone-400">
                06 / ACADEMIC CERTIFICATES & AUDIT
              </span>
              <span className="text-[10px] font-mono text-emerald-600 font-bold">1 Verified</span>
            </div>

            <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border border-amber-200/90 rounded-3xl p-4 flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center font-bold shadow-xs shrink-0">
                  <Trophy className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <div className="font-display font-black text-xs text-stone-900 truncate">
                    Certificate of Bisaya Foundations
                  </div>
                  <div className="text-[11px] text-amber-900 font-medium truncate">
                    Jose Maria College · 92% Mastery
                  </div>
                  <span className="text-[10px] font-mono text-stone-500">
                    ID: SULTI-JMC-2026-GD88
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  sounds.playTap();
                  setShowCertificateModal(true);
                }}
                className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-amber-950 text-xs font-black rounded-xl transition-all shadow-xs cursor-pointer shrink-0 active:scale-95"
              >
                View →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: DUOLINGO-STYLE INTERACTIVE LEARNING PATH */}
      {/* ========================================================================= */}
      {activeTab === 'path' && (
        <div className="space-y-6 pt-2 animate-in fade-in">
          {modules.map((mod, modIdx) => {
            const completedInMod = mod.lessons.filter((l) => completedLessons.includes(l.id)).length;

            return (
              <div key={mod.id} className="space-y-4">
                {/* Unit Header Card */}
                <div className="bg-stone-900 rounded-3xl p-4 text-white shadow-md space-y-1 relative overflow-hidden border border-stone-800">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-extrabold uppercase tracking-widest bg-teal-950 text-teal-300 border border-teal-800/40 px-2.5 py-0.5 rounded-full text-[10px]">
                      UNIT 0{modIdx + 1}
                    </span>
                    <span className="font-mono text-[11px] font-bold bg-stone-800 text-stone-300 px-2 py-0.5 rounded-full">
                      {completedInMod}/{mod.lessons.length} Mastered
                    </span>
                  </div>
                  <h3 className="font-display font-black text-base text-white">
                    {mod.title}
                  </h3>
                  <p className="text-xs text-teal-300/80 italic font-medium font-mono">
                    "{mod.titleBisaya}"
                  </p>
                </div>

                {/* Duolingo Winding Stepper Nodes */}
                <div className="relative flex flex-col items-center py-3 space-y-7">
                  {/* Subtle winding connecting line */}
                  <div className="absolute top-4 bottom-4 w-1.5 bg-stone-200 rounded-full -z-0" />

                  {mod.lessons.map((lesson, lessonIdx) => {
                    const isDone = completedLessons.includes(lesson.id);
                    const isNextToLearn = !isDone && (lessonIdx === 0 || completedLessons.includes(mod.lessons[lessonIdx - 1]?.id));
                    
                    const offsets = ['translate-x-0', '-translate-x-8', 'translate-x-8', 'translate-x-0'];
                    const currentOffset = offsets[lessonIdx % offsets.length];

                    return (
                      <div
                        key={lesson.id}
                        className={`relative z-10 flex flex-col items-center transition-all ${currentOffset}`}
                      >
                        {isNextToLearn && (
                          <div className="absolute -top-7 bg-stone-900 text-white text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md animate-bounce border border-teal-400/50 flex items-center gap-1 whitespace-nowrap">
                            <Sparkles className="w-3 h-3 text-teal-400" />
                            <span>Start Here!</span>
                          </div>
                        )}

                        <button
                          onClick={() => {
                            sounds.playTap();
                            onStartLesson(lesson);
                          }}
                          className={`w-16 h-16 rounded-full flex flex-col items-center justify-center transition-transform active:scale-90 cursor-pointer shadow-md relative ${
                            isDone
                              ? 'bg-amber-400 text-amber-950 border-4 border-amber-300 shadow-amber-300/40'
                              : isNextToLearn
                              ? 'bg-teal-500 text-stone-950 border-4 border-teal-300 shadow-teal-500/40'
                              : 'bg-stone-200 text-stone-500 border-4 border-stone-300'
                          }`}
                          title={lesson.title}
                        >
                          {isDone ? (
                            <Check className="w-7 h-7 stroke-[3]" />
                          ) : isNextToLearn ? (
                            <Play className="w-7 h-7 fill-current ml-0.5" />
                          ) : (
                            <Lock className="w-5 h-5 text-stone-400" />
                          )}
                        </button>

                        <div className="mt-2 text-center max-w-[130px]">
                          <span className="text-[11px] font-bold text-stone-800 line-clamp-1">
                            {lesson.title}
                          </span>
                          <span className="text-[10px] text-stone-500 font-mono">
                            +{lesson.xpReward} XP
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: DETAILED MODULE CARDS (13 Units) */}
      {/* ========================================================================= */}
      {activeTab === 'modules' && (
        <div className="space-y-4 animate-in fade-in">
          {modules.map((mod, modIdx) => {
            const completedInMod = mod.lessons.filter((l) => completedLessons.includes(l.id)).length;

            return (
              <div key={mod.id} className="bg-white rounded-3xl overflow-hidden border border-stone-200/90 shadow-2xs space-y-3">
                <div className="bg-stone-900 p-4 text-white space-y-1 border-b border-stone-800">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-black tracking-widest uppercase bg-teal-950 text-teal-300 border border-teal-800/40 px-2.5 py-0.5 rounded-full">
                      UNIT 0{modIdx + 1}
                    </span>
                    <span className="text-xs font-mono font-bold bg-stone-800 text-stone-300 px-2 py-0.5 rounded-full">
                      {completedInMod} / {mod.lessons.length} Completed
                    </span>
                  </div>
                  <h3 className="font-display font-black text-lg text-white">
                    {mod.title}
                  </h3>
                  <p className="text-xs text-teal-300/80 italic font-mono font-medium">
                    "{mod.titleBisaya}"
                  </p>
                </div>

                <div className="p-4 pt-0 space-y-2.5">
                  <p className="text-xs text-stone-600 leading-relaxed font-normal">
                    {mod.description}
                  </p>

                  <div className="space-y-2 pt-2 border-t border-stone-100">
                    {mod.lessons.map((lesson) => {
                      const isDone = completedLessons.includes(lesson.id);

                      return (
                        <button
                          key={lesson.id}
                          onClick={() => {
                            sounds.playTap();
                            onStartLesson(lesson);
                          }}
                          className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                            isDone
                              ? 'bg-teal-50/60 border-teal-200'
                              : 'bg-white hover:bg-stone-50 border-stone-200/90'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold shadow-2xs ${
                              isDone ? 'bg-teal-600 text-white' : 'bg-stone-100 text-stone-600 border border-stone-200'
                            }`}>
                              {isDone ? <CheckCircle className="w-5 h-5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                            </div>
                            <div>
                              <div className="text-xs font-black text-stone-900 font-display">
                                {lesson.title}
                              </div>
                              <div className="text-[11px] text-stone-500 font-medium">
                                {lesson.estimatedMinutes} mins · <span className="text-teal-700 font-bold font-mono">+{lesson.xpReward} XP</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 text-stone-400">
                            <ChevronRight className="w-4 h-4" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: REAL-WORLD ROLEPLAY SCENARIOS (12 Situations) */}
      {/* ========================================================================= */}
      {activeTab === 'scenarios' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="bg-stone-900 rounded-3xl p-5 text-white border border-stone-800 space-y-2 shadow-md">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-teal-400" />
              <span className="text-[10px] font-mono font-black tracking-widest uppercase text-teal-400">
                12 SITUATIONAL SIMULATIONS
              </span>
            </div>
            <h3 className="font-display font-black text-lg text-white">
              Real-World Visayan Roleplay
            </h3>
            <p className="text-xs text-stone-400 leading-relaxed font-normal">
              Practice contextual communication with SULTI AI acting as local jeepney drivers, market vendors, carenderia cooks, and Davao residents.
            </p>
          </div>

          <div className="space-y-3">
            {ROLEPLAY_SCENARIOS.map((scen) => (
              <div
                key={scen.id}
                className="bg-white rounded-3xl p-4 border border-stone-200/90 shadow-2xs space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                      {scen.location}
                    </span>
                    <h4 className="font-display font-black text-sm text-stone-900 mt-1">
                      {scen.title}
                    </h4>
                    <p className="text-xs text-stone-500 italic font-mono">
                      "{scen.titleBisaya}"
                    </p>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-stone-600 bg-stone-100 px-2 py-0.5 rounded-full shrink-0">
                    {scen.difficulty}
                  </span>
                </div>

                <p className="text-xs text-stone-600 leading-relaxed">
                  {scen.context}
                </p>

                {/* Useful Phrases */}
                <div className="p-3 bg-stone-50 rounded-2xl border border-stone-100 space-y-1.5">
                  <div className="text-[10px] font-mono font-black text-stone-400 uppercase">
                    Key Vocabulary & Phrases:
                  </div>
                  {scen.usefulPhrases.slice(0, 2).map((phrase, pIdx) => (
                    <div key={pIdx} className="flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-stone-900">{phrase.bisaya}</span>
                        <span className="text-stone-500 ml-1.5">({phrase.english})</span>
                      </div>
                      <button
                        onClick={() => handlePlayAudio(phrase.bisaya)}
                        className="p-1 text-teal-700 hover:text-teal-900 cursor-pointer"
                        title="Listen"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => {
                    sounds.playTap();
                    onOpenSulti?.(`Gusto kong magpraktis sa scenario: ${scen.title}. ${scen.initialPrompt}`);
                  }}
                  className="w-full py-2.5 bg-teal-600 hover:bg-teal-500 active:scale-98 text-white text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Start Roleplay with SULTI →</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: CONTEXT PHRASEBOOK */}
      {/* ========================================================================= */}
      {activeTab === 'phrasebook' && (
        <div className="space-y-4 animate-in fade-in">
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={phraseSearch}
              onChange={(e) => setPhraseSearch(e.target.value)}
              placeholder="Search phrases (e.g. plete, discount, buntag)..."
              className="w-full bg-white text-stone-900 placeholder:text-stone-400 text-xs pl-10 pr-4 py-3 rounded-2xl border border-stone-200/90 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-2xs"
            />
          </div>

          {phrasebookCategories.map((cat, i) => {
            const Icon = cat.icon;
            const filteredPhrases = cat.phrases.filter(
              (p) =>
                p.bisaya.toLowerCase().includes(phraseSearch.toLowerCase()) ||
                p.english.toLowerCase().includes(phraseSearch.toLowerCase()) ||
                p.note.toLowerCase().includes(phraseSearch.toLowerCase())
            );

            if (filteredPhrases.length === 0) return null;

            return (
              <div key={i} className="bg-white rounded-3xl p-4 border border-stone-200/90 shadow-2xs space-y-3">
                <div className="flex items-center gap-2 border-b border-stone-100 pb-2.5">
                  <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="font-display font-black text-sm text-stone-900">
                    {cat.category}
                  </h3>
                </div>

                <div className="space-y-2.5">
                  {filteredPhrases.map((p, pIdx) => {
                    const isBookmarked = bookmarkedPhrases.includes(p.bisaya);
                    const isPlaying = playingPhrase === p.bisaya;

                    return (
                      <div key={pIdx} className="p-3.5 bg-stone-50 rounded-2xl space-y-1.5 border border-stone-100 transition-all hover:border-teal-200">
                        <div className="flex items-center justify-between">
                          <span className="font-black text-xs text-stone-900 font-display">
                            {p.bisaya}
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => toggleBookmark(p.bisaya)}
                              className={`p-1.5 rounded-lg min-h-[36px] min-w-[36px] flex items-center justify-center transition-colors cursor-pointer ${
                                isBookmarked ? 'text-amber-500 hover:bg-amber-50' : 'text-stone-400 hover:text-stone-700'
                              }`}
                              title={isBookmarked ? 'Saved to Bookmarks' : 'Bookmark this phrase'}
                            >
                              <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
                            </button>
                            <button
                              onClick={() => handlePlayAudio(p.bisaya)}
                              className={`p-1.5 rounded-xl min-h-[36px] min-w-[36px] flex items-center justify-center transition-all cursor-pointer ${
                                isPlaying ? 'bg-teal-500 text-white animate-pulse' : 'text-teal-700 hover:bg-teal-50 bg-teal-50/60'
                              }`}
                              title="Listen to native audio"
                            >
                              <Volume2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="text-xs text-stone-700 font-medium">
                          {p.english}
                        </div>

                        <div className="text-[11px] text-stone-500 bg-white p-2 rounded-xl border border-stone-100">
                          💡 <span className="font-semibold text-stone-700">Context:</span> {p.note}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: CULTURE NOTES & DISCOURSE PARTICLES */}
      {/* ========================================================================= */}
      {activeTab === 'culture' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="bg-stone-900 text-teal-50 rounded-3xl p-5 space-y-2 shadow-md border border-stone-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-300" />
              <h3 className="font-display font-black text-sm text-white">
                Pragmatic Nuance in Visayan Languages
              </h3>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed font-normal">
              Spoken by over 20 million Filipinos across Mindanao and Visayas, Bisaya conveys warmth and humor through expressive discourse particles rather than honorific words.
            </p>
          </div>

          {cultureNotes.map((note, idx) => (
            <div key={idx} className="bg-white rounded-3xl p-4 border border-stone-200/90 shadow-2xs space-y-2.5">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-2">
                  <span className="w-6 h-6 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <h4 className="font-black text-xs text-stone-900 font-display">
                    {note.title}
                  </h4>
                </div>
                <button
                  onClick={() => handlePlayAudio(note.sample)}
                  className="p-1 text-teal-600 hover:bg-teal-50 rounded-lg min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer"
                  title="Hear spoken phrase"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              <div className="text-[11px] font-mono font-bold text-teal-800 bg-teal-50 p-2.5 rounded-xl border border-teal-100">
                🗣️ "{note.sample}"
              </div>

              <p className="text-xs text-stone-600 leading-relaxed font-normal">
                {note.explanation}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VERIFIED ACADEMIC CERTIFICATE MODAL */}
      {/* ========================================================================= */}
      {showCertificateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-stone-200 space-y-4 text-center relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                sounds.playTap();
                setShowCertificateModal(false);
              }}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Official Academic Seal */}
            <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-500 border-2 border-amber-300 flex items-center justify-center mx-auto shadow-inner">
              <GraduationCap className="w-8 h-8 text-amber-600" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-teal-800 font-extrabold bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                Jose Maria College Foundation, Inc.
              </span>
              <h3 className="font-display font-black text-lg text-stone-900 pt-1">
                Certificate of Bisaya Foundations
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                Conferred to <span className="font-bold text-stone-900">Genesis Diaz</span> for successful completion and 92% mastery of Davao & Cebuano Bisaya fundamentals.
              </p>
            </div>

            {/* Detailed Academic Verification Data */}
            <div className="bg-stone-50 rounded-2xl p-3.5 border border-stone-200 text-left space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-stone-600">
                <span>Curriculum:</span>
                <span className="font-bold text-stone-900">8 Units · 32 Lessons</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Acoustic Accuracy:</span>
                <span className="font-bold text-emerald-600">92% Whisper WER</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Situational Fluency:</span>
                <span className="font-bold text-indigo-600">86% Conversational</span>
              </div>
              <div className="flex justify-between text-stone-600 pt-1 border-t border-stone-200">
                <span>Verification Code:</span>
                <span className="font-mono text-[10px] font-bold text-stone-800">SULTI-JMC-2026-GD88</span>
              </div>
            </div>

            {/* Verification Actions */}
            <div className="flex gap-2">
              <button
                onClick={handleCopyCertCode}
                className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95"
              >
                {copiedCert ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copiedCert ? 'Copied Code!' : 'Copy Code'}</span>
              </button>
              <button
                onClick={() => {
                  sounds.playTap();
                  setShowCertificateModal(false);
                }}
                className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-black transition-all cursor-pointer active:scale-95"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
