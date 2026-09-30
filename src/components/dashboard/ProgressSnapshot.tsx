import React from 'react';
import { ChevronRight, BarChart2, Mic, BookOpen, CheckCircle, Zap } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

interface ProgressSnapshotProps {
  speechAccuracy: number;
  vocabularyCount: number;
  lessonsCompleted: number;
  totalLessons?: number;
  xp: number;
  onViewProgress: () => void;
}

export const ProgressSnapshot: React.FC<ProgressSnapshotProps> = ({
  speechAccuracy,
  vocabularyCount,
  lessonsCompleted,
  totalLessons = 20,
  xp,
  onViewProgress,
}) => {
  const lessonRatio = Math.min(1, lessonsCompleted / Math.max(1, totalLessons));
  const vocabRatio = Math.min(1, vocabularyCount / 60);
  const xpRatio = Math.min(1, xp / 1000);

  const handleClick = () => {
    sounds.playTap();
    onViewProgress();
  };

  return (
    <div className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-xs space-y-3.5 transition-all hover:shadow-sm">
      <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <BarChart2 className="w-3.5 h-3.5" />
          </div>
          <span className="font-display font-extrabold uppercase tracking-wider text-stone-900 text-xs">
            Your Progress
          </span>
        </div>

        <button
          onClick={handleClick}
          className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-0.5 cursor-pointer"
        >
          <span>View Analytics</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="space-y-3 pt-1">
        {/* Metric 1: Speaking Accuracy (Whisper) */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-stone-600 font-medium flex items-center gap-1.5">
              <Mic className="w-3.5 h-3.5 text-blue-600" />
              Speaking Accuracy
            </span>
            <span className="font-mono font-bold text-stone-900">{speechAccuracy}%</span>
          </div>
          <div className="w-full bg-stone-100 rounded-full h-2 p-0.5 overflow-hidden">
            <div
              className="bg-blue-600 h-full rounded-full transition-all duration-700"
              style={{ width: `${speechAccuracy}%` }}
            />
          </div>
        </div>

        {/* Metric 2: Vocabulary Learned */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-stone-600 font-medium flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-teal-600" />
              Vocabulary Mastered
            </span>
            <span className="font-mono font-bold text-stone-900">{vocabularyCount} words</span>
          </div>
          <div className="w-full bg-stone-100 rounded-full h-2 p-0.5 overflow-hidden">
            <div
              className="bg-teal-500 h-full rounded-full transition-all duration-700"
              style={{ width: `${Math.round(vocabRatio * 100)}%` }}
            />
          </div>
        </div>

        {/* Metric 3: Lessons Completed */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-stone-600 font-medium flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              Curriculum Units
            </span>
            <span className="font-mono font-bold text-stone-900">
              {lessonsCompleted} / {totalLessons}
            </span>
          </div>
          <div className="w-full bg-stone-100 rounded-full h-2 p-0.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-700"
              style={{ width: `${Math.round(lessonRatio * 100)}%` }}
            />
          </div>
        </div>

        {/* Metric 4: Total XP */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-stone-600 font-medium flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              Total XP Accumulated
            </span>
            <span className="font-mono font-bold text-stone-900">{xp} XP</span>
          </div>
          <div className="w-full bg-stone-100 rounded-full h-2 p-0.5 overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full transition-all duration-700"
              style={{ width: `${Math.round(xpRatio * 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
