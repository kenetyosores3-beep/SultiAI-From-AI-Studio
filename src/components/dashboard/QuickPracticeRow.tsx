import React from 'react';
import { Mic, Brain, MessageSquare, Music, FileAudio, ArrowRight } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

interface QuickPracticeRowProps {
  onStartVoice: () => void;
  onStartVocabulary: () => void;
  onStartChat: () => void;
  onStartTranscribe?: () => void;
  onStartMusic?: () => void;
}

export const QuickPracticeRow: React.FC<QuickPracticeRowProps> = ({
  onStartVoice,
  onStartVocabulary,
  onStartChat,
  onStartTranscribe,
  onStartMusic,
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="font-display font-extrabold uppercase tracking-wider text-stone-500 text-[11px]">
          Quick Practice & AI Studio
        </span>
        <span className="text-[10px] text-stone-400 font-medium">Fast 3-5 min drills</span>
      </div>

      {/* Row 1: Core Daily Drills */}
      <div className="grid grid-cols-3 gap-2">
        {/* Action 1: Speaking Practice */}
        <button
          onClick={() => {
            sounds.playTap();
            onStartVoice();
          }}
          className="p-3 bg-white hover:bg-stone-50 rounded-2xl border border-stone-200/90 text-left transition-all active:scale-[0.97] cursor-pointer shadow-2xs group flex flex-col justify-between min-h-[92px]"
        >
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
            <Mic className="w-4 h-4" />
          </div>
          <div>
            <div className="font-display font-black text-xs text-stone-900 leading-tight">
              Speak
            </div>
            <div className="text-[10px] text-stone-500 font-medium mt-0.5">
              Live practice
            </div>
          </div>
        </button>

        {/* Action 2: Vocabulary & Words */}
        <button
          onClick={() => {
            sounds.playTap();
            onStartVocabulary();
          }}
          className="p-3 bg-white hover:bg-stone-50 rounded-2xl border border-stone-200/90 text-left transition-all active:scale-[0.97] cursor-pointer shadow-2xs group flex flex-col justify-between min-h-[92px]"
        >
          <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
            <Brain className="w-4 h-4" />
          </div>
          <div>
            <div className="font-display font-black text-xs text-stone-900 leading-tight">
              Words
            </div>
            <div className="text-[10px] text-stone-500 font-medium mt-0.5">
              3 min flashcards
            </div>
          </div>
        </button>

        {/* Action 3: Sulti AI Chat */}
        <button
          onClick={() => {
            sounds.playTap();
            onStartChat();
          }}
          className="p-3 bg-white hover:bg-stone-50 rounded-2xl border border-stone-200/90 text-left transition-all active:scale-[0.97] cursor-pointer shadow-2xs group flex flex-col justify-between min-h-[92px]"
        >
          <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <div className="font-display font-black text-xs text-stone-900 leading-tight">
              Sulti Chat
            </div>
            <div className="text-[10px] text-stone-500 font-medium mt-0.5">
              AI companion
            </div>
          </div>
        </button>
      </div>

      {/* Row 2: AI Multimedia Tools (Audio Transcribe & Music) */}
      <div className="grid grid-cols-2 gap-2">
        {/* Tool 1: Microphone Transcribe (gemini-3.5-transcribe) */}
        <button
          onClick={() => {
            sounds.playTap();
            onStartTranscribe?.();
          }}
          className="p-2.5 bg-gradient-to-r from-blue-50 to-indigo-50/60 hover:from-blue-100/70 hover:to-indigo-100/70 rounded-2xl border border-blue-200/70 text-left transition-all active:scale-[0.98] cursor-pointer shadow-2xs group flex items-center gap-2.5"
        >
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
            <FileAudio className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="font-display font-black text-xs text-stone-900 leading-tight flex items-center gap-1">
              <span>Transcribe Audio</span>
            </div>
            <div className="text-[10px] text-blue-700 font-mono font-medium truncate">
              gemini-3.5-transcribe
            </div>
          </div>
        </button>

        {/* Tool 2: Generate Music (Lyria 3) */}
        <button
          onClick={() => {
            sounds.playTap();
            onStartMusic?.();
          }}
          className="p-2.5 bg-gradient-to-r from-purple-50 to-pink-50/60 hover:from-purple-100/70 hover:to-pink-100/70 rounded-2xl border border-purple-200/70 text-left transition-all active:scale-[0.98] cursor-pointer shadow-2xs group flex items-center gap-2.5"
        >
          <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
            <Music className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="font-display font-black text-xs text-stone-900 leading-tight flex items-center gap-1">
              <span>Generate Music</span>
            </div>
            <div className="text-[10px] text-indigo-700 font-mono font-medium truncate">
              lyria-3-clip / pro
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};
