import React from 'react';
import { Play, BookOpen, Mic, Layers, ChevronRight, Clock, Award } from 'lucide-react';
import { Lesson, ContinueLearningActivity } from '../../types';
import { sounds } from '../../utils/soundEffects';

interface ContinueLearningCardProps {
  activity?: ContinueLearningActivity | null;
  fallbackLesson?: Lesson | null;
  onContinue: (lesson: Lesson) => void;
}

export const ContinueLearningCard: React.FC<ContinueLearningCardProps> = ({
  activity,
  fallbackLesson,
  onContinue,
}) => {
  const currentTitle = activity?.title || fallbackLesson?.title || 'Daily Bisaya Conversation Practice';
  const currentTitleBisaya = activity?.titleBisaya || fallbackLesson?.titleBisaya || 'Pang-adlaw-adlaw nga Panag-estorya';
  const currentDesc = activity?.description || fallbackLesson?.description || 'Build confidence in natural conversation and speaking etiquette.';
  const currentType = activity?.type || 'lesson';
  const currentProgress = activity?.progressPercent ?? (fallbackLesson?.completed ? 100 : 35);
  const currentMinutes = activity?.estimatedMinutes || fallbackLesson?.estimatedMinutes || 6;
  const currentXp = activity?.xpReward || fallbackLesson?.xpReward || 35;
  const currentLevel = activity?.level || fallbackLesson?.level || 'Beginner';

  const handleClick = () => {
    sounds.playTap();
    if (fallbackLesson) {
      onContinue(fallbackLesson);
    }
  };

  const getTypeIcon = () => {
    switch (currentType) {
      case 'voice':
        return <Mic className="w-5 h-5 text-teal-600" />;
      case 'flashcards':
        return <Layers className="w-5 h-5 text-indigo-600" />;
      default:
        return <BookOpen className="w-5 h-5 text-teal-600" />;
    }
  };

  const getTypeBadge = () => {
    switch (currentType) {
      case 'voice':
        return '🗣️ Speaking & ASR Drill';
      case 'flashcards':
        return '🗂️ Vocabulary Deck';
      case 'roleplay':
        return '🎭 Scenario Roleplay';
      default:
        return '📚 Core Curriculum Lesson';
    }
  };

  return (
    <div className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-xs space-y-3.5 transition-all hover:shadow-sm">
      {/* Top Header Tag & Progress */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
            {getTypeIcon()}
          </div>
          <div>
            <span className="text-[10px] font-extrabold tracking-wider uppercase text-teal-700 bg-teal-50/80 px-2 py-0.5 rounded-md">
              {getTypeBadge()}
            </span>
          </div>
        </div>

        <span className="text-xs font-mono font-bold text-teal-800 bg-teal-50/70 border border-teal-200/60 px-2.5 py-0.5 rounded-full">
          +{currentXp} XP
        </span>
      </div>

      {/* Main Title & Localized Subtitle */}
      <div className="space-y-1">
        <h3 className="font-display font-black text-base text-stone-900 leading-snug">
          {currentTitle}
        </h3>
        <p className="text-xs text-stone-600 italic font-medium">
          "{currentTitleBisaya}"
        </p>
        <p className="text-xs text-stone-500 leading-relaxed font-normal pt-0.5">
          {currentDesc}
        </p>
      </div>

      {/* Progress & Meta row */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between text-[11px] text-stone-500">
          <div className="flex items-center gap-2">
            <span className="font-medium text-stone-700">{currentLevel}</span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {currentMinutes} min
            </span>
          </div>
          <span className="font-mono font-bold text-stone-800">{currentProgress}% complete</span>
        </div>

        <div className="w-full bg-stone-100 rounded-full h-2 p-0.5 overflow-hidden border border-stone-200/50 shadow-inner">
          <div
            className="bg-teal-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.max(currentProgress, 5)}%` }}
          />
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={handleClick}
        className="w-full min-h-[46px] bg-stone-900 hover:bg-stone-800 text-white rounded-2xl text-xs font-black py-2.5 px-4 flex items-center justify-between transition-all btn-3d-dark cursor-pointer"
      >
        <span className="font-display">Continue Activity</span>
        <div className="flex items-center gap-1 text-teal-400">
          <Play className="w-3.5 h-3.5 fill-current" />
        </div>
      </button>
    </div>
  );
};
