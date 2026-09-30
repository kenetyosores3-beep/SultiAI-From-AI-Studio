import React, { useState, useEffect } from 'react';
import { NavTab, Navigation } from './components/Navigation';
import { TopHeader } from './components/TopHeader';
import { HomeScreen } from './components/HomeScreen';
import { LearnScreen } from './components/LearnScreen';
import { SultiScreen } from './components/SultiScreen';
import { CommunityScreen } from './components/CommunityScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { LessonPlayer } from './components/LessonPlayer';
import { CapstoneAuditModal } from './components/CapstoneAuditModal';
import { DialectModal } from './components/DialectModal';
import { UserProfile, Lesson, TargetDialect, Module, DayActivity } from './types';
import { INITIAL_MODULES, DEFAULT_WEEKLY_ACTIVITY } from './data/curriculumData';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [modules, setModules] = useState<Module[]>(INITIAL_MODULES);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [showDialectModal, setShowDialectModal] = useState(false);

  // Persistent User Profile State
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('sultiai_user_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (!parsed.weeklyActivity) {
          parsed.weeklyActivity = DEFAULT_WEEKLY_ACTIVITY;
        }
        return parsed;
      } catch {
        // ignore
      }
    }
    return {
      id: 'usr_genesis',
      name: 'Genesis Diaz',
      email: 'genesis.diaz@jmc.edu.ph',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=240&q=80',
      targetDialect: 'davao_bisaya' as TargetDialect,
      dailyGoalMinutes: 15,
      todayMinutes: 8,
      xp: 420,
      gems: 240,
      hearts: 5,
      maxHearts: 5,
      streakDays: 7,
      streakFreezesAvailable: 1,
      weeklyActivity: DEFAULT_WEEKLY_ACTIVITY,
      level: 'Level 3: Bisaya Explorer',
      completedLessons: ['les_1_1'],
      vocabularyMastered: 38,
      speechScoreAverage: 91,
      joinedDate: 'September 2026',
    };
  });

  useEffect(() => {
    localStorage.setItem('sultiai_user_profile', JSON.stringify(profile));
  }, [profile]);

  // Find the next recommended incomplete lesson
  const allLessons = modules.flatMap((m) => m.lessons);
  const nextLesson = allLessons.find((l) => !profile.completedLessons.includes(l.id)) || allLessons[0];

  // Handle lesson start
  const handleStartLesson = (lesson: Lesson) => {
    setActiveLesson(lesson);
  };

  // Handle lesson completion
  const handleCompleteLesson = (lessonId: string, earnedXp: number, score: number) => {
    setProfile((prev) => {
      const alreadyCompleted = prev.completedLessons.includes(lessonId);
      const newCompleted = alreadyCompleted ? prev.completedLessons : [...prev.completedLessons, lessonId];
      const newXp = prev.xp + earnedXp;
      const newGems = (prev.gems || 240) + 15;
      const newVocab = prev.vocabularyMastered + 4;
      const newTodayMins = prev.todayMinutes + 5;
      const newAvgSpeech = Math.round((prev.speechScoreAverage * 4 + score) / 5);

      const updatedWeekly = (prev.weeklyActivity || DEFAULT_WEEKLY_ACTIVITY).map((d) => {
        if (d.isToday) {
          const m = d.minutes + 5;
          return {
            ...d,
            minutes: m,
            xpEarned: d.xpEarned + earnedXp,
            lessonsCompleted: d.lessonsCompleted + 1,
            goalMet: m >= d.goalMinutes,
          };
        }
        return d;
      });

      return {
        ...prev,
        xp: newXp,
        gems: newGems,
        completedLessons: newCompleted,
        vocabularyMastered: newVocab,
        todayMinutes: newTodayMins,
        speechScoreAverage: newAvgSpeech,
        weeklyActivity: updatedWeekly,
      };
    });
  };

  // Refill Hearts
  const handleRefillHearts = () => {
    setProfile((prev) => ({
      ...prev,
      hearts: 5,
    }));
  };

  // Use Streak Freeze
  const handleUseStreakFreeze = () => {
    setProfile((prev) => ({
      ...prev,
      streakFreezesAvailable: Math.max(0, (prev.streakFreezesAvailable ?? 1) - 1),
    }));
  };

  // Handle SULTI conversation activity
  const handleSultiActivity = () => {
    setProfile((prev) => {
      const newTodayMins = Math.min(prev.dailyGoalMinutes, prev.todayMinutes + 2);
      const updatedWeekly = (prev.weeklyActivity || DEFAULT_WEEKLY_ACTIVITY).map((d) => {
        if (d.isToday) {
          const m = d.minutes + 2;
          return {
            ...d,
            minutes: m,
            xpEarned: d.xpEarned + 10,
            goalMet: m >= d.goalMinutes,
          };
        }
        return d;
      });

      return {
        ...prev,
        xp: prev.xp + 10,
        todayMinutes: newTodayMins,
        weeklyActivity: updatedWeekly,
      };
    });
  };

  // Update Dialect
  const handleUpdateDialect = (newDialect: TargetDialect) => {
    setProfile((prev) => ({
      ...prev,
      targetDialect: newDialect,
    }));
  };

  // Update Daily Goal
  const handleUpdateDailyGoal = (mins: number) => {
    setProfile((prev) => ({
      ...prev,
      dailyGoalMinutes: mins,
    }));
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col justify-between selection:bg-teal-500 selection:text-white">
      {/* Top Mobile App Bar */}
      <TopHeader
        streak={profile.streakDays}
        xp={profile.xp}
        gems={profile.gems}
        hearts={profile.hearts}
        dialect={profile.targetDialect}
        onOpenDialectModal={() => setShowDialectModal(true)}
        onOpenAuditModal={() => setShowAuditModal(true)}
        onRefillHearts={handleRefillHearts}
      />

      {/* Main Viewport Content */}
      <main className="flex-1 w-full max-w-md mx-auto">
        {currentTab === 'home' && (
          <HomeScreen
            profile={profile}
            weeklyActivity={profile.weeklyActivity || DEFAULT_WEEKLY_ACTIVITY}
            nextLesson={nextLesson}
            onStartLesson={handleStartLesson}
            onOpenSulti={() => setCurrentTab('sulti')}
            onGoToLearn={() => setCurrentTab('learn')}
            onGoToProfile={() => setCurrentTab('profile')}
            onUseStreakFreeze={handleUseStreakFreeze}
          />
        )}

        {currentTab === 'learn' && (
          <LearnScreen
            modules={modules}
            completedLessons={profile.completedLessons}
            onStartLesson={handleStartLesson}
          />
        )}

        {currentTab === 'sulti' && (
          <SultiScreen
            targetDialect={profile.targetDialect}
            onActivityPerformed={handleSultiActivity}
          />
        )}

        {currentTab === 'community' && <CommunityScreen />}

        {currentTab === 'profile' && (
          <ProfileScreen
            profile={profile}
            onUpdateDialect={handleUpdateDialect}
            onUpdateDailyGoal={handleUpdateDailyGoal}
            onOpenAuditModal={() => setShowAuditModal(true)}
          />
        )}
      </main>

      {/* Fixed Bottom Tab Navigation */}
      <Navigation
        currentTab={currentTab}
        onTabChange={(tab) => setCurrentTab(tab)}
      />

      {/* Interactive Lesson Player Modal */}
      {activeLesson && (
        <LessonPlayer
          lesson={activeLesson}
          onClose={() => setActiveLesson(null)}
          onComplete={handleCompleteLesson}
        />
      )}

      {/* Capstone Project Blueprint & Audit Modal */}
      {showAuditModal && (
        <CapstoneAuditModal onClose={() => setShowAuditModal(false)} />
      )}

      {/* Regional Dialect Selector Modal */}
      {showDialectModal && (
        <DialectModal
          currentDialect={profile.targetDialect}
          onSelect={handleUpdateDialect}
          onClose={() => setShowDialectModal(false)}
        />
      )}
    </div>
  );
}
