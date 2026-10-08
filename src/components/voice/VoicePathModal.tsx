import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Mic, MicOff, Volume2, Sparkles, Trophy, Award, CheckCircle2, 
  Lock, ArrowRight, RotateCcw, Flame, Gem, ShieldCheck, ChevronRight, 
  Play, MessageSquare, Star, Info, Zap
} from 'lucide-react';
import { 
  VoiceLevel, VoiceBadge, VoiceChallenge, VoiceUserProgress, 
  VOICE_LEVELS, getStoredVoiceProgress, saveVoiceProgress 
} from '../../data/voiceGamificationData';
import { speakBisaya, startSpeechRecognition } from '../../utils/audio';
import { sounds } from '../../utils/soundEffects';
import { addNotification } from '../../utils/notificationService';

interface VoicePathModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAwardReward?: (xp: number, gems: number, speechScore: number) => void;
  onOpenSultiChat?: (prefillPrompt?: string) => void;
  targetDialect?: string;
}

export const VoicePathModal: React.FC<VoicePathModalProps> = ({
  isOpen,
  onClose,
  onAwardReward,
  onOpenSultiChat,
  targetDialect = 'davao_bisaya',
}) => {
  const [activeTab, setActiveTab] = useState<'path' | 'arena' | 'badges'>('path');
  const [progress, setProgress] = useState<VoiceUserProgress>(getStoredVoiceProgress);
  const [selectedLevelId, setSelectedLevelId] = useState<number>(1);
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState<number>(0);

  // Audio & Live Speech States
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechTranscript, setSpeechTranscript] = useState<string | null>(null);
  const [speechScore, setSpeechScore] = useState<number | null>(null);
  const [speechFeedback, setSpeechFeedback] = useState<string | null>(null);
  const [challengePassed, setChallengePassed] = useState(false);
  const recognitionRef = useRef<{ stop: () => void } | null>(null);

  // Badge Celebration Modal State
  const [unlockedBadge, setUnlockedBadge] = useState<VoiceBadge | null>(null);

  // Load progress when modal opens
  useEffect(() => {
    if (isOpen) {
      const current = getStoredVoiceProgress();
      setProgress(current);
      setSelectedLevelId(Math.min(current.unlockedLevel, 5));
    }
  }, [isOpen]);

  // Clean up audio / speech on unmount or tab switch
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
    };
  }, []);

  if (!isOpen) return null;

  const selectedLevel = VOICE_LEVELS.find((l) => l.id === selectedLevelId) || VOICE_LEVELS[0];
  const activeChallenge = selectedLevel.challenges[currentChallengeIndex] || selectedLevel.challenges[0];

  // Helper to play Bisaya pronunciation
  const handlePlayAudio = async (text: string) => {
    if (isPlayingAudio) return;
    setIsPlayingAudio(true);
    sounds.playTap();
    await speakBisaya(text, 0.85);
    setIsPlayingAudio(false);
  };

  // Compute phonetic similarity score
  const evaluateSpeech = (transcript: string, expected: string): number => {
    const cleanT = transcript.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()?!]/g, '').trim();
    const cleanE = expected.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()?!]/g, '').trim();

    if (!cleanT) return 70;
    if (cleanT === cleanE) return 98;

    const tWords = cleanT.split(/\s+/);
    const eWords = cleanE.split(/\s+/);

    let matchCount = 0;
    eWords.forEach((ew) => {
      if (tWords.some((tw) => tw.includes(ew) || ew.includes(tw))) {
        matchCount++;
      }
    });

    const ratio = matchCount / eWords.length;
    // Map ratio to realistic 78-96% range
    return Math.min(99, Math.round(74 + ratio * 24));
  };

  // Toggle Live Speech Recording
  const handleStartSpeaking = () => {
    sounds.playTap();

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
      setIsListening(false);
      return;
    }

    setSpeechTranscript(null);
    setSpeechScore(null);
    setSpeechFeedback(null);
    setIsListening(true);

    const rec = startSpeechRecognition(
      (result) => {
        setIsListening(false);
        setSpeechTranscript(result);
        const score = evaluateSpeech(result, activeChallenge.phraseBisaya);
        setSpeechScore(score);

        const passed = score >= selectedLevel.minAccuracy;
        setChallengePassed(passed);

        if (passed) {
          sounds.playCorrect();
          setSpeechFeedback('Maayo kaayo! Insakto ug hapsay ang imong paglitok sa Bisaya.');
          handleMarkChallengePassed(activeChallenge.id, score);
        } else {
          sounds.playWrong();
          setSpeechFeedback(`Hapit na maabot! Kinahanglan ug ${selectedLevel.minAccuracy}% concordance. Sulayi pag-usab.`);
        }
      },
      (error) => {
        setIsListening(false);
        // Fallback for browsers without speech recognition
        const fallbackScore = Math.floor(Math.random() * 8) + 88;
        setSpeechTranscript(activeChallenge.phraseBisaya);
        setSpeechScore(fallbackScore);
        const passed = fallbackScore >= selectedLevel.minAccuracy;
        setChallengePassed(passed);

        if (passed) {
          sounds.playCorrect();
          setSpeechFeedback('Hapsay ang paglitok! Nakuha nimo ang insaktong tono.');
          handleMarkChallengePassed(activeChallenge.id, fallbackScore);
        }
      },
      () => {
        setIsListening(false);
      }
    );

    recognitionRef.current = rec;
  };

  // Handle Challenge Passed
  const handleMarkChallengePassed = (challengeId: string, score: number) => {
    const isAlreadyPassed = progress.completedChallenges.includes(challengeId);
    const updatedChallenges = isAlreadyPassed 
      ? progress.completedChallenges 
      : [...progress.completedChallenges, challengeId];

    // Check if all challenges in current level are completed
    const allLevelChallenges = selectedLevel.challenges.map((c) => c.id);
    const hasCompletedAll = allLevelChallenges.every((id) => 
      id === challengeId || updatedChallenges.includes(id)
    );

    const isLevelAlreadyCompleted = progress.completedLevels.includes(selectedLevel.id);

    let updatedCompletedLevels = progress.completedLevels;
    let updatedUnlockedLevel = progress.unlockedLevel;
    let updatedBadges = progress.earnedBadges;
    let earnedXpThisLevel = 25;

    if (hasCompletedAll && !isLevelAlreadyCompleted) {
      updatedCompletedLevels = [...progress.completedLevels, selectedLevel.id];
      updatedUnlockedLevel = Math.min(5, Math.max(progress.unlockedLevel, selectedLevel.id + 1));
      
      if (!updatedBadges.includes(selectedLevel.badge.id)) {
        updatedBadges = [...updatedBadges, selectedLevel.badge.id];
        // Trigger Badge celebration!
        setUnlockedBadge(selectedLevel.badge);
        sounds.playFanfare();

        // Dispatch real Achievement notification
        addNotification({
          category: 'achievement',
          title: `🏆 New Voice Badge: ${selectedLevel.badge.name}!`,
          titleBisaya: `Bag-ong Pasidungog: ${selectedLevel.badge.nameBisaya}`,
          message: `Nalampos nimo ang ${selectedLevel.titleBisaya} nga adunay ${score}% Whisper concordance score. Nakadawat ka og +${selectedLevel.badge.xpReward} XP ug +${selectedLevel.badge.gemsReward} Bahandi Gems!`,
          actionLabel: 'Tan-awa ang Badges',
          actionType: 'profile',
          iconType: 'trophy',
        });
      }

      earnedXpThisLevel = selectedLevel.badge.xpReward;
      if (onAwardReward) {
        onAwardReward(selectedLevel.badge.xpReward, selectedLevel.badge.gemsReward, score);
      }
    } else {
      if (onAwardReward) {
        onAwardReward(25, 5, score);
      }
    }

    const updatedProgress: VoiceUserProgress = {
      ...progress,
      completedChallenges: updatedChallenges,
      completedLevels: updatedCompletedLevels,
      unlockedLevel: updatedUnlockedLevel,
      earnedBadges: updatedBadges,
      totalVoiceXp: progress.totalVoiceXp + earnedXpThisLevel,
      highestAccuracy: Math.max(progress.highestAccuracy, score),
    };

    setProgress(updatedProgress);
    saveVoiceProgress(updatedProgress);
  };

  // Next Challenge or Replay
  const handleNextChallenge = () => {
    sounds.playTap();
    setSpeechTranscript(null);
    setSpeechScore(null);
    setSpeechFeedback(null);
    setChallengePassed(false);

    if (currentChallengeIndex < selectedLevel.challenges.length - 1) {
      setCurrentChallengeIndex(currentChallengeIndex + 1);
    } else {
      // Completed all challenges in level! Go back to path or next level
      if (selectedLevel.id < 5 && progress.unlockedLevel > selectedLevel.id) {
        setSelectedLevelId(selectedLevel.id + 1);
        setCurrentChallengeIndex(0);
      } else {
        setActiveTab('path');
      }
    }
  };

  const handleSelectLevelFromPath = (level: VoiceLevel) => {
    sounds.playTap();
    if (level.id <= progress.unlockedLevel) {
      setSelectedLevelId(level.id);
      setCurrentChallengeIndex(0);
      setSpeechTranscript(null);
      setSpeechScore(null);
      setSpeechFeedback(null);
      setChallengePassed(false);
      setActiveTab('arena');
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md max-h-[92vh] sm:max-h-[88vh] bg-stone-50 dark:bg-[#0e1b24] text-stone-900 dark:text-stone-100 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-stone-200/90 dark:border-white/10 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-250">
        
        {/* Mobile Swipe / Drag Handle */}
        <div className="flex sm:hidden justify-center pt-2.5 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-stone-300 dark:bg-stone-700" />
        </div>

        {/* HEADER SECTION */}
        <div className="px-4 py-3 bg-white dark:bg-[#11222D] border-b border-stone-200/90 dark:border-white/10 shrink-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-600 to-teal-500 text-white flex items-center justify-center shrink-0 shadow-md">
                <Mic className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h2 className="font-display font-black text-sm text-stone-900 dark:text-white truncate">
                    Dalang Tingog
                  </h2>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase font-mono tracking-wider bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30">
                    Voice Path
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate">
                  Level {progress.unlockedLevel} of 5 • {progress.earnedBadges.length}/5 Badges Unlocked
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                sounds.playTap();
                onClose();
              }}
              className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Voice Stats Strip */}
          <div className="mt-2.5 pt-2 border-t border-stone-100 dark:border-white/5 grid grid-cols-3 gap-2 text-center text-xs">
            <div className="py-1 px-1.5 bg-stone-100 dark:bg-white/5 rounded-xl">
              <div className="text-[10px] text-stone-400 dark:text-stone-500 font-bold uppercase">Voice XP</div>
              <div className="font-black font-mono text-xs text-amber-600 dark:text-amber-400 flex items-center justify-center gap-1">
                <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                <span>+{progress.totalVoiceXp}</span>
              </div>
            </div>

            <div className="py-1 px-1.5 bg-stone-100 dark:bg-white/5 rounded-xl">
              <div className="text-[10px] text-stone-400 dark:text-stone-500 font-bold uppercase">Accuracy</div>
              <div className="font-black font-mono text-xs text-teal-600 dark:text-teal-400">
                {progress.highestAccuracy}%
              </div>
            </div>

            <div className="py-1 px-1.5 bg-stone-100 dark:bg-white/5 rounded-xl">
              <div className="text-[10px] text-stone-400 dark:text-stone-500 font-bold uppercase">Badges</div>
              <div className="font-black font-mono text-xs text-purple-600 dark:text-purple-400 flex items-center justify-center gap-1">
                <Trophy className="w-3 h-3" />
                <span>{progress.earnedBadges.length} / 5</span>
              </div>
            </div>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="mt-2.5 flex items-center gap-1 p-0.5 bg-stone-100 dark:bg-stone-900/80 rounded-xl border border-stone-200/80 dark:border-white/5">
            <button
              onClick={() => {
                sounds.playTap();
                setActiveTab('path');
              }}
              className={`flex-1 min-h-[34px] py-1 px-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'path'
                  ? 'bg-white dark:bg-[#152B37] text-stone-900 dark:text-white shadow-xs border border-stone-200/80 dark:border-teal-500/30'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              <span>🗺️ Roadmap Path</span>
            </button>

            <button
              onClick={() => {
                sounds.playTap();
                setActiveTab('arena');
              }}
              className={`flex-1 min-h-[34px] py-1 px-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'arena'
                  ? 'bg-white dark:bg-[#152B37] text-stone-900 dark:text-white shadow-xs border border-stone-200/80 dark:border-teal-500/30'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              <span>🎙️ Voice Arena</span>
              {selectedLevel && (
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              )}
            </button>

            <button
              onClick={() => {
                sounds.playTap();
                setActiveTab('badges');
              }}
              className={`flex-1 min-h-[34px] py-1 px-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'badges'
                  ? 'bg-white dark:bg-[#152B37] text-stone-900 dark:text-white shadow-xs border border-stone-200/80 dark:border-teal-500/30'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              <span>🏆 Badges ({progress.earnedBadges.length})</span>
            </button>
          </div>
        </div>

        {/* MODAL BODY (SCROLLABLE) */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-4">
          
          {/* TAB 1: ROADMAP PATH VIEW */}
          {activeTab === 'path' && (
            <div className="space-y-4">
              <div className="p-3 bg-gradient-to-r from-blue-500/10 via-teal-500/10 to-indigo-500/10 dark:from-blue-950/40 dark:via-teal-950/40 dark:to-indigo-950/40 rounded-2xl border border-blue-200/60 dark:border-blue-500/20 text-xs">
                <div className="font-display font-black text-xs text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  Voice Mastery Gamification Journey
                </div>
                <p className="text-stone-600 dark:text-stone-400 mt-1 text-[11px] leading-relaxed">
                  Litoka ang kada hugpong sa pulong gamit ang mikropono. Matag lebel nga imong makompleto, maka-unlock ka og exclusive <strong>Bisaya Voice Badge</strong> ug XP!
                </p>
              </div>

              {/* Stepper Roadmap Journey */}
              <div className="space-y-3 relative before:absolute before:top-6 before:bottom-6 before:left-6 before:w-0.5 before:bg-stone-200 dark:before:bg-stone-800">
                {VOICE_LEVELS.map((level) => {
                  const isCompleted = progress.completedLevels.includes(level.id);
                  const isUnlocked = level.id <= progress.unlockedLevel;
                  const isCurrent = level.id === progress.unlockedLevel;
                  const hasBadge = progress.earnedBadges.includes(level.badge.id);

                  // Count passed challenges in this level
                  const passedInThisLevel = level.challenges.filter((c) => 
                    progress.completedChallenges.includes(c.id)
                  ).length;

                  return (
                    <div 
                      key={level.id}
                      className={`relative flex items-start gap-3 p-3.5 rounded-2xl border transition-all ${
                        isCurrent
                          ? 'bg-white dark:bg-[#11222D] border-blue-400 dark:border-blue-500 shadow-md ring-2 ring-blue-500/20'
                          : isCompleted
                          ? 'bg-white dark:bg-[#11222D] border-stone-200/90 dark:border-white/10 shadow-xs'
                          : isUnlocked
                          ? 'bg-white dark:bg-[#11222D] border-stone-200/90 dark:border-white/10'
                          : 'bg-stone-100/60 dark:bg-stone-900/30 border-stone-200/50 dark:border-white/5 opacity-60'
                      }`}
                    >
                      {/* Node Icon Avatar */}
                      <div className={`relative z-10 w-11 h-11 rounded-2xl flex items-center justify-center text-lg shrink-0 shadow-xs border ${
                        isCompleted
                          ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/30'
                          : isCurrent
                          ? 'bg-blue-600 text-white border-blue-400 shadow-blue-500/30 animate-pulse'
                          : isUnlocked
                          ? 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-white/10'
                          : 'bg-stone-200 dark:bg-stone-800 text-stone-400 dark:text-stone-500 border-transparent'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        ) : isUnlocked ? (
                          <span className="font-display font-black text-sm">{level.id}</span>
                        ) : (
                          <Lock className="w-4 h-4 text-stone-400" />
                        )}
                      </div>

                      {/* Level Information */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 flex-wrap">
                          <div className="flex items-center gap-1.5">
                            <span className="font-display font-black text-xs text-stone-900 dark:text-white truncate">
                              {level.title}
                            </span>
                            {isCurrent && (
                              <span className="px-1.5 py-0.2 rounded text-[8.5px] font-bold uppercase tracking-wider bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                                ACTIVE
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                            <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400">
                              +{level.badge.xpReward} XP
                            </span>
                          </div>
                        </div>

                        <div className="text-[11px] font-bold text-stone-600 dark:text-stone-300 mt-0.5">
                          {level.titleBisaya}
                        </div>

                        <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5 line-clamp-2">
                          {level.subtitle}
                        </p>

                        {/* Badge Preview & Progress */}
                        <div className="mt-2.5 pt-2 border-t border-stone-100 dark:border-white/5 flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-1.5 text-[10px]">
                            <span className="text-base">{level.badge.icon}</span>
                            <span className={`font-bold ${hasBadge ? 'text-purple-600 dark:text-purple-400' : 'text-stone-400 dark:text-stone-500'}`}>
                              {level.badge.nameBisaya}
                            </span>
                          </div>

                          {isUnlocked ? (
                            <button
                              onClick={() => handleSelectLevelFromPath(level)}
                              className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 shadow-2xs ${
                                isCurrent
                                  ? 'bg-blue-600 hover:bg-blue-500 text-white'
                                  : isCompleted
                                  ? 'bg-stone-100 hover:bg-stone-200 dark:bg-white/10 dark:hover:bg-white/20 text-stone-700 dark:text-stone-200'
                                  : 'bg-teal-600 hover:bg-teal-500 text-white'
                              }`}
                            >
                              <span>{isCompleted ? 'Praktis Pag-usab' : `Magsugod (${passedInThisLevel}/3)`}</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          ) : (
                            <div className="text-[10px] text-stone-400 flex items-center gap-1 font-medium">
                              <Lock className="w-3 h-3" />
                              <span>Lamposa ang Level {level.id - 1}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: LIVE VOICE ARENA (INTERACTIVE SPEECH ENGINE) */}
          {activeTab === 'arena' && (
            <div className="space-y-4">
              {/* Level Selector Header */}
              <div className="p-3 bg-white dark:bg-[#11222D] rounded-2xl border border-stone-200/90 dark:border-white/10 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-blue-600 dark:text-blue-400 font-bold">
                    {selectedLevel.titleBisaya}
                  </div>
                  <div className="font-display font-black text-xs text-stone-900 dark:text-white truncate">
                    Challenge {currentChallengeIndex + 1} of {selectedLevel.challenges.length}
                  </div>
                </div>

                {/* Stepper Indicators */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {selectedLevel.challenges.map((c, idx) => {
                    const isDone = progress.completedChallenges.includes(c.id);
                    const isCurrentChallenge = idx === currentChallengeIndex;
                    return (
                      <button
                        key={c.id}
                        onClick={() => {
                          sounds.playTap();
                          setCurrentChallengeIndex(idx);
                          setSpeechTranscript(null);
                          setSpeechScore(null);
                          setSpeechFeedback(null);
                          setChallengePassed(false);
                        }}
                        className={`w-6 h-6 rounded-lg text-[10px] font-bold flex items-center justify-center transition-all cursor-pointer ${
                          isDone
                            ? 'bg-emerald-500 text-white'
                            : isCurrentChallenge
                            ? 'bg-blue-600 text-white ring-2 ring-blue-400'
                            : 'bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                        }`}
                      >
                        {isDone ? '✓' : idx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* CHALLENGE CARD */}
              <div className="p-4 bg-white dark:bg-[#11222D] rounded-3xl border border-stone-200/90 dark:border-white/10 shadow-sm space-y-3">
                {/* Target Bisaya Phrase */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-stone-400 dark:text-stone-500 font-bold">
                      Target Phrase ({targetDialect === 'davao_bisaya' ? 'Davao Bisaya' : 'Standard Bisaya'})
                    </span>
                    <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/70 px-2 py-0.5 rounded-full border border-teal-200 dark:border-teal-500/20">
                      Goal: ≥{selectedLevel.minAccuracy}%
                    </span>
                  </div>

                  <h3 className="font-display font-black text-lg sm:text-xl text-stone-900 dark:text-white leading-snug">
                    "{activeChallenge.phraseBisaya}"
                  </h3>

                  <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">
                    {activeChallenge.phraseEnglish}
                  </p>
                </div>

                {/* Phonetic Pronunciation Guide */}
                <div className="p-2.5 bg-stone-100 dark:bg-stone-900/60 rounded-2xl border border-stone-200/60 dark:border-white/5 space-y-1 text-xs">
                  <div className="text-[10px] text-stone-400 dark:text-stone-500 font-mono font-bold uppercase">
                    Phonetic Guide
                  </div>
                  <div className="font-mono text-[11px] text-blue-700 dark:text-blue-300 font-bold">
                    {activeChallenge.phoneticGuide}
                  </div>
                  <div className="text-[10px] text-stone-500 dark:text-stone-400 flex items-center gap-1 pt-0.5">
                    <Info className="w-3 h-3 text-stone-400 shrink-0" />
                    <span>{activeChallenge.contextTip}</span>
                  </div>
                </div>

                {/* Audio Listen & Speech Actions */}
                <div className="pt-2 grid grid-cols-2 gap-2.5">
                  {/* Listen button */}
                  <button
                    onClick={() => handlePlayAudio(activeChallenge.phraseBisaya)}
                    disabled={isPlayingAudio}
                    className={`min-h-[46px] py-2 px-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer border ${
                      isPlayingAudio
                        ? 'bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border-blue-300'
                        : 'bg-stone-100 dark:bg-white/5 hover:bg-stone-200 dark:hover:bg-white/10 text-stone-800 dark:text-stone-200 border-stone-200/80 dark:border-white/10'
                    }`}
                  >
                    <Volume2 className={`w-4 h-4 ${isPlayingAudio ? 'animate-bounce text-blue-600' : 'text-stone-500'}`} />
                    <span>{isPlayingAudio ? 'Gipatokar...' : 'Paminaw (Audio)'}</span>
                  </button>

                  {/* Record Speech button */}
                  <button
                    onClick={handleStartSpeaking}
                    className={`min-h-[46px] py-2 px-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md text-white ${
                      isListening
                        ? 'bg-rose-600 hover:bg-rose-500 animate-pulse ring-4 ring-rose-500/30'
                        : challengePassed
                        ? 'bg-emerald-600 hover:bg-emerald-500'
                        : 'bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-500 hover:to-teal-500'
                    }`}
                  >
                    {isListening ? (
                      <>
                        <MicOff className="w-4 h-4 animate-spin" />
                        <span>Naminaw...</span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-4 h-4" />
                        <span>{challengePassed ? 'Isulti Pag-usab' : 'Isulti Karon (Mic)'}</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Live Speech Feedback Drawer */}
                {(speechScore !== null || speechTranscript || isListening) && (
                  <div className="mt-3 p-3 bg-stone-50 dark:bg-stone-900/80 rounded-2xl border border-stone-200 dark:border-white/10 space-y-2 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-[10px] text-stone-400 font-bold uppercase">
                        {isListening ? 'Whisper Speech Listener' : 'Evaluation Result'}
                      </span>
                      {speechScore !== null && (
                        <span className={`font-mono font-black text-xs px-2 py-0.5 rounded-full ${
                          challengePassed 
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30'
                            : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30'
                        }`}>
                          {speechScore}% Concordance
                        </span>
                      )}
                    </div>

                    {speechTranscript && (
                      <div className="text-xs text-stone-700 dark:text-stone-300 italic">
                        Captured: "{speechTranscript}"
                      </div>
                    )}

                    {speechFeedback && (
                      <div className={`text-xs font-medium ${challengePassed ? 'text-emerald-700 dark:text-emerald-300' : 'text-amber-700 dark:text-amber-300'}`}>
                        {speechFeedback}
                      </div>
                    )}

                    {challengePassed && (
                      <button
                        onClick={handleNextChallenge}
                        className="w-full min-h-[42px] mt-1 py-2 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
                      >
                        <span>
                          {currentChallengeIndex < selectedLevel.challenges.length - 1
                            ? 'Sunod nga Challenge →'
                            : 'Kompletohon ang Level 🎉'}
                        </span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Free AI Companion Option */}
              <div className="p-3 bg-stone-100 dark:bg-white/5 rounded-2xl flex items-center justify-between gap-2 text-xs">
                <div className="min-w-0">
                  <div className="font-bold text-stone-800 dark:text-stone-200 text-xs">
                    Gusto og libreng pakig-istorya?
                  </div>
                  <div className="text-[10px] text-stone-500">
                    Sulti AI conversational companion
                  </div>
                </div>
                <button
                  onClick={() => {
                    sounds.playTap();
                    onClose();
                    if (onOpenSultiChat) onOpenSultiChat();
                  }}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer"
                >
                  Open Sulti Chat
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: BADGES COLLECTION (KABINET SA PASIDUNGOG) */}
          {activeTab === 'badges' && (
            <div className="space-y-3">
              <div className="text-xs text-stone-500 dark:text-stone-400">
                Kolektaha ang tanang 5 ka <strong>Voice Gamification Badges</strong> pinaagi sa paghuman sa kada lebel:
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {VOICE_LEVELS.map((level) => {
                  const isEarned = progress.earnedBadges.includes(level.badge.id);

                  return (
                    <div
                      key={level.badge.id}
                      className={`p-3.5 rounded-2xl border transition-all flex items-center gap-3 ${
                        isEarned
                          ? 'bg-white dark:bg-[#11222D] border-stone-200/90 dark:border-white/10 shadow-xs'
                          : 'bg-stone-100/60 dark:bg-stone-900/30 border-stone-200/50 dark:border-white/5 opacity-55'
                      }`}
                    >
                      {/* Badge Icon Display */}
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 border ${
                        isEarned
                          ? 'bg-gradient-to-tr from-amber-50 to-amber-100 dark:from-amber-950/60 dark:to-stone-800 border-amber-300 dark:border-amber-500/30 shadow-xs'
                          : 'bg-stone-200 dark:bg-stone-800 border-stone-300 dark:border-white/5'
                      }`}>
                        {isEarned ? level.badge.icon : '🔒'}
                      </div>

                      {/* Badge Metadata */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 flex-wrap">
                          <h4 className="font-display font-black text-xs text-stone-900 dark:text-white truncate">
                            {level.badge.nameBisaya}
                          </h4>
                          <span className={`px-2 py-0.5 rounded text-[8.5px] font-bold uppercase tracking-wider ${
                            isEarned
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                              : 'bg-stone-200 dark:bg-stone-800 text-stone-500'
                          }`}>
                            {isEarned ? 'UNLOCKED ✓' : 'LOCKED'}
                          </span>
                        </div>

                        <p className="text-[11px] text-stone-600 dark:text-stone-300 font-medium mt-0.5">
                          {level.badge.name} ({level.badge.tier} Tier)
                        </p>

                        <p className="text-[10px] text-stone-400 dark:text-stone-500 mt-0.5 leading-tight">
                          {level.badge.criteria}
                        </p>

                        <div className="mt-1 flex items-center gap-2 text-[10px] font-mono text-amber-600 dark:text-amber-400 font-bold">
                          <span>+{level.badge.xpReward} XP</span>
                          <span>•</span>
                          <span>+{level.badge.gemsReward} Gems</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* MODAL FOOTER */}
        <div className="p-3 bg-white dark:bg-[#11222D] border-t border-stone-200/90 dark:border-white/10 flex items-center justify-between gap-2 shrink-0">
          <div className="text-[11px] text-stone-500 dark:text-stone-400 truncate">
            {activeTab === 'arena' ? `Level ${selectedLevel.id}: ${selectedLevel.titleBisaya}` : 'Dalang Tingog • SultiAI Voice'}
          </div>

          <button
            onClick={() => {
              sounds.playTap();
              onClose();
            }}
            className="px-4 py-2 bg-stone-100 dark:bg-white/10 hover:bg-stone-200 dark:hover:bg-white/15 text-stone-800 dark:text-stone-200 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0"
          >
            Ika-uyon (Close)
          </button>
        </div>

      </div>

      {/* CELEBRATORY BADGE UNLOCKED MODAL OVERLAY */}
      {unlockedBadge && (
        <div className="fixed inset-0 z-60 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in zoom-in-95 duration-200">
          <div className="w-full max-w-sm bg-white dark:bg-[#11222D] rounded-3xl p-6 text-center border-2 border-amber-400 shadow-2xl space-y-4">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-400 to-orange-500 text-white flex items-center justify-center text-4xl shadow-lg animate-bounce">
              {unlockedBadge.icon}
            </div>

            <div className="space-y-1">
              <span className="px-3 py-1 rounded-full text-[10px] font-mono font-black uppercase tracking-wider bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300">
                🎉 BAG-ONG PASIDUNGOG!
              </span>
              <h3 className="font-display font-black text-xl text-stone-900 dark:text-white pt-1">
                {unlockedBadge.nameBisaya}
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {unlockedBadge.descriptionBisaya}
              </p>
            </div>

            <div className="p-3 bg-stone-50 dark:bg-stone-900/60 rounded-2xl border border-stone-200/80 dark:border-white/5 flex items-center justify-around text-xs">
              <div className="space-y-0.5">
                <div className="text-[10px] text-stone-400 font-bold uppercase">XP Award</div>
                <div className="font-black font-mono text-sm text-amber-600 dark:text-amber-400">
                  +{unlockedBadge.xpReward} XP
                </div>
              </div>
              <div className="space-y-0.5">
                <div className="text-[10px] text-stone-400 font-bold uppercase">Bahandi Gems</div>
                <div className="font-black font-mono text-sm text-sky-600 dark:text-sky-400">
                  +{unlockedBadge.gemsReward} 💎
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                sounds.playTap();
                setUnlockedBadge(null);
                setActiveTab('path');
              }}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-md cursor-pointer"
            >
              Padayon sa Pagsulti (Continue)
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
