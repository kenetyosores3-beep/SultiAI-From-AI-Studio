import React, { useState } from 'react';
import { 
  X, GraduationCap, Check, Share2, Sparkles, Trophy 
} from 'lucide-react';
import { Module, Lesson, UserProfile } from '../types';
import { CourseData, COURSES } from '../data/coursesData';
import { LearnDashboard } from './learn/LearnDashboard';
import { CourseRoadmapView } from './learn/CourseRoadmapView';
import { QuickPracticeModal } from './learn/QuickPracticeModal';
import { sounds } from '../utils/soundEffects';

interface LearnScreenProps {
  modules: Module[];
  completedLessons: string[];
  onStartLesson: (lesson: Lesson) => void;
  onOpenSulti?: (prefillPrompt?: string) => void;
  profile?: UserProfile;
  onAddPracticeMinutes?: (mins: number) => void;
  onGoToProfile?: () => void;
}

export const LearnScreen: React.FC<LearnScreenProps> = ({
  modules,
  completedLessons,
  onStartLesson,
  onOpenSulti,
  profile,
  onAddPracticeMinutes,
  onGoToProfile,
}) => {
  // Navigation View: 'dashboard' = "Where am I and what should I do next?"
  //                  'course_view' = "What am I learning and what is my roadmap?"
  const [currentView, setCurrentView] = useState<'dashboard' | 'course_view'>('dashboard');
  const [selectedCourse, setSelectedCourse] = useState<CourseData>(COURSES[0]);
  const [activeQuickTool, setActiveQuickTool] = useState<string | null>(null);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [copiedCert, setCopiedCert] = useState(false);

  // Flatten all lessons across modules to find the next active lesson
  const allLessons = modules.flatMap((m) => m.lessons);
  const nextLessonToLearn: Lesson = allLessons.find((l) => !completedLessons.includes(l.id)) || allLessons[0];
  const nextLessonModule = modules.find((m) => m.lessons.some((l) => l.id === nextLessonToLearn?.id)) || modules[0];

  const handleSelectCourse = (course: CourseData) => {
    setSelectedCourse(course);
    setCurrentView('course_view');
  };

  const handleCopyCertCode = () => {
    sounds.playTap();
    navigator.clipboard?.writeText('SULTI-JMC-2026-GD88');
    setCopiedCert(true);
    setTimeout(() => setCopiedCert(false), 2000);
  };

  return (
    <div className="pb-24 px-4 pt-1 max-w-md mx-auto select-none space-y-4">
      {/* ========================================================================= */}
      {/* 1. LEARN DASHBOARD ("Where am I and what should I do next?")              */}
      {/* ========================================================================= */}
      {currentView === 'dashboard' && (
        <LearnDashboard
          profile={profile}
          nextLesson={nextLessonToLearn}
          nextLessonModule={nextLessonModule}
          courses={COURSES}
          onStartLesson={onStartLesson}
          onSelectCourse={handleSelectCourse}
          onOpenQuickPractice={(tool) => setActiveQuickTool(tool)}
          onOpenSulti={onOpenSulti}
          onGoToProfile={onGoToProfile}
        />
      )}

      {/* ========================================================================= */}
      {/* 2. COURSE DETAIL & ROADMAP ("What am I learning and what is my roadmap?")  */}
      {/* ========================================================================= */}
      {currentView === 'course_view' && (
        <CourseRoadmapView
          course={selectedCourse}
          modules={modules}
          completedLessons={completedLessons}
          onBackToDashboard={() => setCurrentView('dashboard')}
          onStartLesson={onStartLesson}
          onOpenSulti={onOpenSulti}
          onOpenCertificateModal={() => setShowCertificateModal(true)}
        />
      )}

      {/* ========================================================================= */}
      {/* 3. INDEPENDENT QUICK PRACTICE MODAL (Voice, Scenarios, Flashcards, Phrasebook) */}
      {/* ========================================================================= */}
      <QuickPracticeModal
        isOpen={Boolean(activeQuickTool)}
        tool={activeQuickTool}
        onClose={() => setActiveQuickTool(null)}
        onOpenSulti={onOpenSulti}
      />

      {/* ========================================================================= */}
      {/* 4. VERIFIED ACADEMIC CREDENTIAL CERTIFICATE MODAL                         */}
      {/* ========================================================================= */}
      {showCertificateModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-[#11222D] rounded-3xl p-6 shadow-2xl border border-stone-200 dark:border-white/10 space-y-4 text-center relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                sounds.playTap();
                setShowCertificateModal(false);
              }}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 dark:hover:text-white p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Official Academic Seal */}
            <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-950/70 text-amber-500 border-2 border-amber-300 dark:border-amber-600 flex items-center justify-center mx-auto shadow-inner">
              <GraduationCap className="w-8 h-8 text-amber-600 dark:text-amber-400" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-teal-800 dark:text-teal-300 font-extrabold bg-teal-50 dark:bg-teal-950/80 px-2.5 py-0.5 rounded-full border border-teal-200 dark:border-teal-700">
                Jose Maria College Foundation, Inc.
              </span>
              <h3 className="font-display font-black text-lg text-stone-900 dark:text-white pt-1">
                Certificate of Bisaya Foundations
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                Conferred to <span className="font-bold text-stone-900 dark:text-white">{profile?.name || 'Genesis Diaz'}</span> for successful completion and 92% mastery of Davao & Cebuano Bisaya fundamentals.
              </p>
            </div>

            {/* Detailed Academic Verification Data */}
            <div className="bg-stone-50 dark:bg-[#152B37] rounded-2xl p-3.5 border border-stone-200 dark:border-white/10 text-left space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-stone-600 dark:text-stone-300">
                <span>Curriculum:</span>
                <span className="font-bold text-stone-900 dark:text-white">5 Modules · 10 Lessons</span>
              </div>
              <div className="flex justify-between text-stone-600 dark:text-stone-300">
                <span>Acoustic Accuracy:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">92% Whisper Concordance</span>
              </div>
              <div className="flex justify-between text-stone-600 dark:text-stone-300">
                <span>Situational Fluency:</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">86% Conversational</span>
              </div>
              <div className="flex justify-between text-stone-600 dark:text-stone-300 pt-1 border-t border-stone-200 dark:border-white/10">
                <span>Verification Code:</span>
                <span className="font-mono text-[10px] font-bold text-stone-800 dark:text-stone-200">SULTI-JMC-2026-GD88</span>
              </div>
            </div>

            {/* Verification Actions */}
            <div className="flex gap-2">
              <button
                onClick={handleCopyCertCode}
                className="flex-1 py-2.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95"
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
