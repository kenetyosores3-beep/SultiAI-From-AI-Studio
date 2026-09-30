import React, { useState } from 'react';
import { 
  BookOpen, CheckCircle, ChevronRight, Volume2, Sparkles, 
  Star, Search, Bookmark, Lock, Play, Bus, ShoppingBag, 
  HandHeart, Layers, ListFilter, RotateCcw, Check, Zap, Crown
} from 'lucide-react';
import { Module, Lesson } from '../types';
import { speakBisaya } from '../utils/audio';
import { sounds } from '../utils/soundEffects';

interface LearnScreenProps {
  modules: Module[];
  completedLessons: string[];
  onStartLesson: (lesson: Lesson) => void;
  onOpenSultiScenario?: (scenarioId: string) => void;
}

export const LearnScreen: React.FC<LearnScreenProps> = ({
  modules,
  completedLessons,
  onStartLesson,
}) => {
  const [activeTab, setActiveTab] = useState<'path' | 'modules' | 'phrasebook' | 'culture'>('path');
  const [phraseSearch, setPhraseSearch] = useState('');
  const [bookmarkedPhrases, setBookmarkedPhrases] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('sulti_bookmarked_phrases');
      return saved ? JSON.parse(saved) : ['Lugar lang, Nong!'];
    } catch {
      return ['Lugar lang, Nong!'];
    }
  });
  const [playingPhrase, setPlayingPhrase] = useState<string | null>(null);

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

  // Flatten all lessons for the Duolingo Path view
  const allLessons = modules.flatMap((m) => m.lessons);

  return (
    <div className="space-y-4 pb-24 px-4 pt-3 max-w-md mx-auto">
      {/* Segmented Duolingo Style Pill Tabs */}
      <div className="flex items-center gap-1 p-1 bg-stone-200/90 rounded-2xl border border-stone-300/50 shadow-inner">
        <button
          onClick={() => {
            sounds.playTap();
            setActiveTab('path');
          }}
          className={`flex-1 min-h-[40px] py-1.5 px-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'path'
              ? 'bg-white text-stone-900 shadow-sm border border-stone-200'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          Learning Path
        </button>
        <button
          onClick={() => {
            sounds.playTap();
            setActiveTab('modules');
          }}
          className={`flex-1 min-h-[40px] py-1.5 px-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'modules'
              ? 'bg-white text-stone-900 shadow-sm border border-stone-200'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          Units ({modules.length})
        </button>
        <button
          onClick={() => {
            sounds.playTap();
            setActiveTab('phrasebook');
          }}
          className={`flex-1 min-h-[40px] py-1.5 px-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'phrasebook'
              ? 'bg-white text-stone-900 shadow-sm border border-stone-200'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          Phrasebook
        </button>
        <button
          onClick={() => {
            sounds.playTap();
            setActiveTab('culture');
          }}
          className={`flex-1 min-h-[40px] py-1.5 px-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'culture'
              ? 'bg-white text-stone-900 shadow-sm border border-stone-200'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          Culture
        </button>
      </div>

      {/* TAB 1: DUOLINGO-STYLE INTERACTIVE LEARNING PATH */}
      {activeTab === 'path' && (
        <div className="space-y-6 pt-2">
          {modules.map((mod, modIdx) => {
            const completedInMod = mod.lessons.filter((l) => completedLessons.includes(l.id)).length;
            const isModComplete = completedInMod === mod.lessons.length && mod.lessons.length > 0;

            return (
              <div key={mod.id} className="space-y-4">
                {/* Unit Header Card */}
                <div className="bg-gradient-to-r from-teal-600 via-teal-700 to-emerald-700 rounded-3xl p-4 text-white shadow-md space-y-1 relative overflow-hidden">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold uppercase tracking-widest bg-black/25 px-2.5 py-0.5 rounded-full text-[10px]">
                      UNIT {modIdx + 1}
                    </span>
                    <span className="font-mono text-[11px] font-bold bg-white/20 px-2 py-0.5 rounded-full">
                      {completedInMod}/{mod.lessons.length} Mastered
                    </span>
                  </div>
                  <h3 className="font-display font-black text-base text-white">
                    {mod.title}
                  </h3>
                  <p className="text-xs text-white/80 italic font-medium">
                    "{mod.titleBisaya}"
                  </p>
                </div>

                {/* Duolingo Winding Stepper Nodes */}
                <div className="relative flex flex-col items-center py-3 space-y-7">
                  {/* Subtle winding connecting line */}
                  <div className="absolute top-4 bottom-4 w-1.5 bg-stone-200 rounded-full -z-0" />

                  {mod.lessons.map((lesson, lessonIdx) => {
                    const isDone = completedLessons.includes(lesson.id);
                    // Next active lesson is the first uncompleted one
                    const isNextToLearn = !isDone && (lessonIdx === 0 || completedLessons.includes(mod.lessons[lessonIdx - 1]?.id));
                    
                    // Stepper zig-zag offset (-24px, 0px, 24px)
                    const offsets = ['translate-x-0', '-translate-x-8', 'translate-x-8', 'translate-x-0'];
                    const currentOffset = offsets[lessonIdx % offsets.length];

                    return (
                      <div
                        key={lesson.id}
                        className={`relative z-10 flex flex-col items-center transition-all ${currentOffset}`}
                      >
                        {/* Start Here floating indicator */}
                        {isNextToLearn && (
                          <div className="absolute -top-7 bg-stone-900 text-white text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md animate-bounce border border-teal-400/50 flex items-center gap-1 whitespace-nowrap">
                            <Sparkles className="w-3 h-3 text-teal-400" />
                            <span>Start Here!</span>
                          </div>
                        )}

                        {/* Interactive Node Button */}
                        <button
                          onClick={() => {
                            sounds.playTap();
                            onStartLesson(lesson);
                          }}
                          className={`w-16 h-16 rounded-full flex flex-col items-center justify-center transition-transform active:scale-90 cursor-pointer shadow-md relative ${
                            isDone
                              ? 'bg-amber-400 text-amber-950 border-4 border-amber-300 shadow-amber-300/40'
                              : isNextToLearn
                              ? 'bg-teal-500 text-white border-4 border-teal-300 animate-radar shadow-teal-500/40'
                              : 'bg-stone-200 text-stone-500 border-4 border-stone-300'
                          }`}
                          title={lesson.title}
                        >
                          {isDone ? (
                            <Crown className="w-7 h-7 fill-amber-950 text-amber-950" />
                          ) : isNextToLearn ? (
                            <Play className="w-7 h-7 fill-current ml-0.5" />
                          ) : (
                            <Lock className="w-5 h-5 text-stone-400" />
                          )}
                        </button>

                        {/* Node Label Below */}
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

      {/* TAB 2: DETAILED MODULE CARDS */}
      {activeTab === 'modules' && (
        <div className="space-y-4">
          {modules.map((mod, modIdx) => {
            const completedCount = mod.lessons.filter((l) => completedLessons.includes(l.id)).length;

            const accentGradients = [
              'from-teal-600 to-teal-700',
              'from-amber-600 to-amber-700',
              'from-emerald-600 to-emerald-700',
              'from-indigo-600 to-indigo-700',
            ];
            const headerGradient = accentGradients[modIdx % accentGradients.length];

            return (
              <div key={mod.id} className="bg-white rounded-3xl overflow-hidden border border-stone-200/90 shadow-sm space-y-3">
                {/* Module Banner Header */}
                <div className={`bg-gradient-to-r ${headerGradient} p-4 text-white space-y-1`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black tracking-widest uppercase bg-black/20 px-2.5 py-0.5 rounded-full">
                      UNIT {modIdx + 1}
                    </span>
                    <span className="text-xs font-mono font-bold bg-white/20 px-2 py-0.5 rounded-full">
                      {completedCount} / {mod.lessons.length} Completed
                    </span>
                  </div>
                  <h2 className="font-display font-black text-lg text-white">
                    {mod.title}
                  </h2>
                  <p className="text-xs text-white/80 italic font-medium">
                    "{mod.titleBisaya}"
                  </p>
                </div>

                <div className="p-4 pt-0 space-y-2.5">
                  <p className="text-xs text-stone-600 leading-relaxed font-normal">
                    {mod.description}
                  </p>

                  {/* Connected Lesson Stepping Stones */}
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
                          className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer btn-3d-white ${
                            isDone
                              ? 'bg-teal-50/50 border-teal-200'
                              : 'bg-white hover:bg-stone-50 border-stone-200/90'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold shadow-sm ${
                              isDone ? 'bg-teal-600 text-white' : 'bg-stone-100 text-stone-600 border border-stone-200'
                            }`}>
                              {isDone ? <CheckCircle className="w-5 h-5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                            </div>
                            <div>
                              <div className="text-xs font-extrabold text-stone-900 font-display">
                                {lesson.title}
                              </div>
                              <div className="text-[11px] text-stone-500 font-medium">
                                {lesson.estimatedMinutes} mins · <span className="text-amber-700 font-bold">+{lesson.xpReward} XP</span>
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

      {/* TAB 3: PHRASEBOOK */}
      {activeTab === 'phrasebook' && (
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={phraseSearch}
              onChange={(e) => setPhraseSearch(e.target.value)}
              placeholder="Search phrases (e.g. plete, discount, buntag)..."
              className="w-full bg-white text-stone-900 placeholder:text-stone-400 text-xs pl-10 pr-4 py-3 rounded-2xl border border-stone-200/90 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm"
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
              <div key={i} className="bg-white rounded-3xl p-4 border border-stone-200/90 shadow-sm space-y-3">
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

      {/* TAB 4: CULTURE & PARTICLES */}
      {activeTab === 'culture' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-teal-900 to-stone-900 text-teal-50 rounded-3xl p-5 space-y-2 shadow-md border border-teal-800/60">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-300" />
              <h3 className="font-display font-black text-sm text-white">
                Pragmatic Nuance in Visayan Languages
              </h3>
            </div>
            <p className="text-xs text-teal-100/90 leading-relaxed font-normal">
              Spoken by over 20 million Filipinos across Mindanao and Visayas, Bisaya conveys warmth and humor through expressive discourse particles rather than honorific words.
            </p>
          </div>

          {cultureNotes.map((note, idx) => (
            <div key={idx} className="bg-white rounded-3xl p-4 border border-stone-200/90 shadow-sm space-y-2.5">
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
    </div>
  );
};
