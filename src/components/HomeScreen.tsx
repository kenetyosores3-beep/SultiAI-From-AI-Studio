import React, { useState } from 'react';
import { 
  Globe, Sparkles, Volume2, ChevronRight, Award, Compass, Gift, X, Flame 
} from 'lucide-react';
import { UserProfile, Lesson, DayActivity, ContinueLearningActivity, SultiRecommendation } from '../types';
import { speakBisaya } from '../utils/audio';
import { sounds } from '../utils/soundEffects';
import { StreakCalendar } from './StreakCalendar';

// Modular Dashboard Subcomponents
import { DailyMissionCard } from './dashboard/DailyMissionCard';
import { ContinueLearningCard } from './dashboard/ContinueLearningCard';
import { QuickPracticeRow } from './dashboard/QuickPracticeRow';
import { ProgressSnapshot } from './dashboard/ProgressSnapshot';
import { SultiRecommendationCard } from './dashboard/SultiRecommendationCard';
import { CompactStreakStrip } from './dashboard/CompactStreakStrip';

interface HomeScreenProps {
  profile: UserProfile;
  weeklyActivity?: DayActivity[];
  nextLesson: Lesson;
  onStartLesson: (lesson: Lesson) => void;
  onOpenSulti: (prefillPrompt?: string) => void;
  onGoToLearn: () => void;
  onGoToProfile?: () => void;
  onUseStreakFreeze?: () => void;
  onOpenDialectModal?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  profile,
  weeklyActivity = [],
  nextLesson,
  onStartLesson,
  onOpenSulti,
  onGoToLearn,
  onGoToProfile,
  onUseStreakFreeze,
  onOpenDialectModal,
}) => {
  const [isPlayingExpression, setIsPlayingExpression] = useState(false);
  const [showRewardToast, setShowRewardToast] = useState<string | null>(null);
  const [showStreakModal, setShowStreakModal] = useState(false);

  // Determine time-aware greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    const firstName = profile.name.split(' ')[0] || 'Learner';
    if (hour < 12) {
      return { bisaya: `Maayong buntag, ${firstName} 👋`, english: 'Good morning' };
    } else if (hour < 18) {
      return { bisaya: `Maayong hapon, ${firstName} 👋`, english: 'Good afternoon' };
    } else {
      return { bisaya: `Maayong gabi-i, ${firstName} 👋`, english: 'Good evening' };
    }
  };

  const greeting = getGreeting();

  // Dynamic Continue Learning activity based on next lesson or profile history
  const continueActivity: ContinueLearningActivity = {
    id: 'cont_' + nextLesson.id,
    lessonId: nextLesson.id,
    title: nextLesson.title,
    titleBisaya: nextLesson.titleBisaya,
    description: nextLesson.description,
    type: nextLesson.title.toLowerCase().includes('speak') || nextLesson.title.toLowerCase().includes('conversation') 
      ? 'voice' 
      : 'lesson',
    categoryLabel: nextLesson.level === 'Beginner' ? 'Fundamental Bisaya' : 'Conversational Fluency',
    level: nextLesson.level,
    progressPercent: profile.completedLessons.includes(nextLesson.id) ? 100 : 45,
    estimatedMinutes: nextLesson.estimatedMinutes,
    xpReward: nextLesson.xpReward,
  };

  // Sulti AI Adaptive Recommendation tying speech and NLP
  const sultiRecommendation: SultiRecommendation = {
    id: 'rec_market_bargain',
    title: 'Speaking Fluency Recommendation',
    rationale: 'You recognize common vocabulary accurately, but hesitate on conversational bargaining phrases.',
    targetPhrase: 'Tagpila ni, Nang? Puyde hangyo gamay?',
    targetPhraseEnglish: 'How much is this, ma\'am? May I ask for a small discount?',
    contextScenario: 'Inquiring about fruit prices at Bankerohan Public Market',
    actionPrompt: 'Gusto kong magpraktis unsaon paghangyo sa merkado.',
  };

  const handlePlayExpression = async () => {
    setIsPlayingExpression(true);
    sounds.playTap();
    await speakBisaya('Kaya ra na nimo! Ayaw kaluya.');
    setIsPlayingExpression(false);
  };

  return (
    <div className="space-y-4 pb-24 px-4 pt-1 max-w-md mx-auto relative select-none">
      {/* Toast Notification */}
      {showRewardToast && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white font-bold text-xs px-4 py-2 rounded-2xl shadow-xl flex items-center gap-2 border border-emerald-400 animate-bounce">
          <Gift className="w-4 h-4" />
          <span>{showRewardToast}</span>
        </div>
      )}

      {/* ZONE 2: TODAY'S MISSION (HERO COMPONENT ⭐) */}
      <DailyMissionCard
        todayMinutes={profile.todayMinutes}
        goalMinutes={profile.dailyGoalMinutes}
        streakDays={profile.streakDays}
        onContinuePractice={() => onStartLesson(nextLesson)}
      />

      {/* ZONE 3: CONTINUE LEARNING (PRIMARY LEARNING ACTION ⭐) */}
      <ContinueLearningCard
        activity={continueActivity}
        fallbackLesson={nextLesson}
        onContinue={(lesson) => onStartLesson(lesson)}
      />

      {/* ZONE 4: QUICK PRACTICE ROW */}
      <QuickPracticeRow
        onStartVoice={() => onOpenSulti('Gusto kong magpraktis og pagsulti sa Bisaya.')}
        onStartVocabulary={() => onGoToLearn()}
        onStartChat={() => onOpenSulti()}
      />

      {/* ZONE 5: PROGRESS SNAPSHOT */}
      <ProgressSnapshot
        speechAccuracy={profile.speechScoreAverage}
        vocabularyCount={profile.vocabularyMastered}
        lessonsCompleted={profile.completedLessons.length}
        totalLessons={20}
        xp={profile.xp}
        onViewProgress={() => onGoToProfile?.()}
      />

      {/* ZONE 6: SULTI'S ADAPTIVE RECOMMENDATION (AI INTELLIGENCE) */}
      <SultiRecommendationCard
        recommendation={sultiRecommendation}
        onPracticeWithSulti={(prompt) => onOpenSulti(prompt)}
      />

      {/* ZONE 7: COMPACT STREAK STRIP */}
      <CompactStreakStrip
        streakDays={profile.streakDays}
        weeklyActivity={weeklyActivity}
        todayMinutes={profile.todayMinutes}
        dailyGoalMinutes={profile.dailyGoalMinutes}
        streakFreezes={profile.streakFreezesAvailable ?? 1}
        onViewStreakDetails={() => setShowStreakModal(true)}
      />

      {/* Visual Streak Calendar Modal */}
      {showStreakModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-md max-h-[92vh] overflow-y-auto bg-white dark:bg-[#11222D] rounded-3xl p-5 shadow-2xl space-y-4 border border-stone-200 dark:border-white/10 transition-colors">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
                <h3 className="font-display font-black text-base text-stone-900 dark:text-white">
                  Weekly Streak & Activity Calendar
                </h3>
              </div>
              <button
                onClick={() => {
                  sounds.playTap();
                  setShowStreakModal(false);
                }}
                className="p-1.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 dark:text-stone-400 cursor-pointer transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <StreakCalendar
              weeklyActivity={weeklyActivity}
              streakDays={profile.streakDays}
              dailyGoalMinutes={profile.dailyGoalMinutes}
              todayMinutes={profile.todayMinutes}
              streakFreezes={profile.streakFreezesAvailable ?? 1}
              onQuickPractice={() => {
                setShowStreakModal(false);
                onStartLesson(nextLesson);
              }}
              onUseStreakFreeze={onUseStreakFreeze}
            />
          </div>
        </div>
      )}

      {/* CULTURAL EXPRESSION OF THE DAY */}
      <div className="bg-stone-50 dark:bg-[#11222D] border border-stone-200/80 dark:border-white/10 rounded-3xl p-4 space-y-2 shadow-2xs transition-colors">
        <div className="flex items-center justify-between text-xs text-stone-700 dark:text-stone-300 font-bold">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span className="font-display font-black text-stone-900 dark:text-white text-xs">
              Bisaya Expression of the Day
            </span>
          </div>
          <button 
            onClick={handlePlayExpression}
            disabled={isPlayingExpression}
            className={`p-1.5 rounded-xl text-stone-700 dark:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-700 min-h-[36px] min-w-[36px] flex items-center justify-center transition-all cursor-pointer glass-touch ${
              isPlayingExpression ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-200 animate-pulse' : 'bg-white dark:bg-stone-800 border border-stone-200 dark:border-white/10'
            }`}
            title="Listen to native audio"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-0.5 bg-white dark:bg-stone-800/70 p-3 rounded-2xl border border-stone-200/60 dark:border-white/10 shadow-2xs">
          <div className="text-xs font-black text-stone-900 dark:text-white font-display">
            "Kaya ra na nimo! Ayaw kaluya."
          </div>
          <div className="text-[11px] text-stone-500 dark:text-stone-400 italic">
            "You can do it! Don't lose heart."
          </div>
          <p className="text-[10px] text-stone-500 dark:text-stone-400 leading-relaxed pt-1">
            <span className="font-bold text-stone-700 dark:text-stone-200">Cultural Etiquette:</span> Warm encouragement common before tests and challenges in Mindanao and Central Visayas.
          </p>
        </div>
      </div>

      {/* Navigation Shortcut to Full Curriculum */}
      <button
        onClick={() => {
          sounds.playTap();
          onGoToLearn();
        }}
        className="w-full py-3 px-4 rounded-2xl border border-stone-200/90 dark:border-white/10 bg-white dark:bg-[#11222D] hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-800 dark:text-white text-xs font-bold flex items-center justify-between transition-all glass-touch cursor-pointer shadow-2xs"
      >
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <span className="font-display">Browse All 4 Curriculum Units & Phrasebook</span>
        </div>
        <ChevronRight className="w-4 h-4 text-stone-400" />
      </button>
    </div>
  );
};
