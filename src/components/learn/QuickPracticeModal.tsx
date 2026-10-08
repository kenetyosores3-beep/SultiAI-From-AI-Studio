import React, { useState } from 'react';
import { 
  X, Mic, MessageSquare, Layers, BookOpen, Volume2, 
  Sparkles, Check, ArrowRight, RotateCcw, Bus, ShoppingBag, 
  UtensilsCrossed, Stethoscope, Search, Bookmark, Target, 
  BookMarked, Headphones, Edit3, BookOpenCheck, RefreshCw, 
  Globe2, RotateCw, Play, CheckCircle2 
} from 'lucide-react';
import { ROLEPLAY_SCENARIOS } from '../../data/curriculumData';
import { TOOLKIT_MODULES, ToolkitModule } from '../../data/toolkitModulesData';
import { speakBisaya } from '../../utils/audio';
import { sounds } from '../../utils/soundEffects';

interface QuickPracticeModalProps {
  isOpen: boolean;
  tool: string | null;
  onClose: () => void;
  onOpenSulti?: (prompt?: string) => void;
}

const SAMPLE_FLASHCARDS = [
  { id: 'fc_1', bisaya: 'Palihog ko sa plete, Nong.', english: 'Please pass my fare, driver.', context: 'Jeepney Commuting', audio: 'Palihog ko sa plete, Nong.' },
  { id: 'fc_2', bisaya: 'Tagpila man ni, Nang?', english: 'How much is this, ma\'am?', context: 'Market Bargaining', audio: 'Tagpila man ni, Nang?' },
  { id: 'fc_3', bisaya: 'Puyde hangyo gamay?', english: 'Can I ask for a small discount?', context: 'Palengke Etiquette', audio: 'Puyde hangyo gamay?' },
  { id: 'fc_4', bisaya: 'Lugar lang, Nong!', english: 'Stop here, driver!', context: 'Pulling Over', audio: 'Lugar lang, Nong!' },
  { id: 'fc_5', bisaya: 'Bitaw no? Lami gyud!', english: 'I know right? Truly delicious!', context: 'Conversational Agreement', audio: 'Bitaw no? Lami gyud!' },
];

const COLLOQUIAL_PHRASES = [
  { bisaya: 'Lugar lang, Nong!', english: 'Stop here, driver!', category: 'Jeepney', note: 'Polite way to ask driver to pull over' },
  { bisaya: 'Palihog ko sa plete, Nong.', english: 'Please pass my fare, sir.', category: 'Jeepney', note: 'Pass fare politely along passengers' },
  { bisaya: 'Naa bay sukli ang singkwenta?', english: 'Is there change for 50 pesos?', category: 'Jeepney', note: 'Ask beforehand for larger bills' },
  { bisaya: 'Tagpila ang kilo sa mangga?', english: 'How much is a kilo of mangoes?', category: 'Market', note: 'Ask price per unit' },
  { bisaya: 'Puyde hangyo, Nang?', english: 'May I request a discount, ma\'am?', category: 'Market', note: 'Friendly discount request' },
  { bisaya: 'Pila tanan among nabayran?', english: 'How much is our bill in total?', category: 'Dining', note: 'Settling carenderia bill' },
  { bisaya: 'Asa dapit ang parmasya?', english: 'Where is the pharmacy located?', category: 'Directions', note: 'Inquiring for landmarks' },
  { bisaya: 'Salamat kaayo!', english: 'Thank you very much!', category: 'Etiquette', note: 'Heartfelt Visayan gratitude' },
];

export const QuickPracticeModal: React.FC<QuickPracticeModalProps> = ({
  isOpen,
  tool,
  onClose,
  onOpenSulti,
}) => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [playingPhrase, setPlayingPhrase] = useState<string | null>(null);
  const [searchPhrase, setSearchPhrase] = useState('');
  const [micActive, setMicActive] = useState(false);
  const [micTranscript, setMicTranscript] = useState('');
  const [drillCompleted, setDrillCompleted] = useState(false);

  if (!isOpen || !tool) return null;

  const currentModule = TOOLKIT_MODULES.find((m) => m.id === tool);

  const handlePlayAudio = async (text: string) => {
    setPlayingPhrase(text);
    sounds.playTap();
    await speakBisaya(text);
    setPlayingPhrase(null);
  };

  const currentFlashcard = SAMPLE_FLASHCARDS[currentCardIndex];

  const handleNextCard = () => {
    sounds.playTap();
    setIsFlipped(false);
    setCurrentCardIndex((prev) => (prev + 1) % SAMPLE_FLASHCARDS.length);
  };

  const handleSimulateMic = () => {
    sounds.playTap();
    setMicActive(true);
    setMicTranscript('Listening to pronunciation... "Maayong buntag, kumusta ka?"');
    setTimeout(() => {
      setMicActive(false);
      setMicTranscript('✓ Pronunciation concordance: 94% (Whisper ASR: Natural intonation, no hesitation)');
      setDrillCompleted(true);
      sounds.playCorrect();
    }, 1800);
  };

  const filteredPhrases = COLLOQUIAL_PHRASES.filter(
    (p) =>
      p.bisaya.toLowerCase().includes(searchPhrase.toLowerCase()) ||
      p.english.toLowerCase().includes(searchPhrase.toLowerCase()) ||
      p.category.toLowerCase().includes(searchPhrase.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md max-h-[92vh] sm:max-h-[88vh] flex flex-col bg-white dark:bg-[#11222D] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-stone-300 dark:border-white/15 overflow-hidden transition-all animate-in slide-in-from-bottom-4 duration-250">
        
        {/* Mobile Drag Indicator */}
        <div className="flex sm:hidden justify-center pt-2 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-stone-300 dark:bg-stone-700" />
        </div>

        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 dark:border-white/10 flex items-center justify-between bg-stone-50/80 dark:bg-[#152B37]/80 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-lg bg-teal-50 dark:bg-teal-950/80 border border-teal-200 dark:border-teal-500/30 text-teal-800 dark:text-teal-300 shadow-xs shrink-0">
              {currentModule?.icon || '📚'}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-mono font-bold text-teal-600 dark:text-teal-400">
                  Module {currentModule?.num || '01'}
                </span>
                <h3 className="font-display font-black text-sm text-stone-900 dark:text-white truncate">
                  {currentModule?.title || 'Interactive Learning Drill'}
                </h3>
              </div>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 font-medium truncate">
                {currentModule?.purpose || 'Independent practice with SULTI companion'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sounds.playTap();
              onClose();
            }}
            className="w-8 h-8 rounded-full flex items-center justify-center text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors cursor-pointer shrink-0"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-4">
          
          {/* TOOL 1: VOICE DRILL */}
          {tool === 'voice' && (
            <div className="space-y-4 text-center py-2">
              <div className="p-5 bg-blue-50/60 dark:bg-blue-950/40 rounded-3xl border border-blue-200 dark:border-blue-800/60 space-y-3">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-800 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/60 px-2.5 py-0.5 rounded-full">
                  Target Phonetic Phrase
                </span>
                <div className="font-display font-black text-xl text-stone-900 dark:text-white">
                  "Maayong buntag, kumusta ka?"
                </div>
                <div className="text-xs text-stone-500 dark:text-stone-400 italic">
                  "Good morning, how are you?"
                </div>

                <button
                  onClick={() => handlePlayAudio('Maayong buntag, kumusta ka?')}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-stone-800 hover:bg-blue-100 dark:hover:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold text-xs inline-flex items-center gap-1.5 border border-blue-200 dark:border-blue-700 shadow-2xs cursor-pointer active:scale-95"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Listen to Native Audio</span>
                </button>
              </div>

              {/* Big Record Button */}
              <div className="py-2 space-y-3">
                <button
                  onClick={handleSimulateMic}
                  className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95 cursor-pointer ${
                    micActive
                      ? 'bg-rose-600 text-white animate-pulse ring-8 ring-rose-500/30'
                      : 'bg-blue-600 hover:bg-blue-500 text-white btn-3d-teal'
                  }`}
                >
                  <Mic className="w-8 h-8" />
                </button>
                <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">
                  {micActive ? 'Listening to speech...' : 'Tap the microphone to speak this phrase'}
                </p>

                {micTranscript && (
                  <div className="p-3 bg-stone-50 dark:bg-[#152B37] rounded-2xl border border-stone-200 dark:border-white/10 text-xs font-mono text-stone-800 dark:text-stone-200 animate-in fade-in">
                    {micTranscript}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TOOL 2: SCENARIOS */}
          {tool === 'scenario' && (
            <div className="space-y-3">
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Choose a realistic contextual scenario to start live conversational roleplay with SULTI:
              </p>

              <div className="space-y-2">
                {ROLEPLAY_SCENARIOS.map((sc) => (
                  <div
                    key={sc.id}
                    onClick={() => {
                      sounds.playTap();
                      onClose();
                      onOpenSulti?.(`Gusto kong magpraktis sa scenario: ${sc.title} (${sc.context}). Mag-Bisaya ta!`);
                    }}
                    className="p-3.5 bg-stone-50 dark:bg-[#152B37] hover:bg-purple-50 dark:hover:bg-purple-950/40 rounded-2xl border border-stone-200 dark:border-white/10 hover:border-purple-300 dark:hover:border-purple-500/40 transition-all cursor-pointer group flex items-start gap-3"
                  >
                    <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 flex items-center justify-center shrink-0 text-lg">
                      {sc.id === 'sc_market' ? '🛒' : sc.id === 'sc_jeepney' ? '🚙' : sc.id === 'sc_dining' ? '🍲' : '🩺'}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-display font-black text-xs text-stone-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400">
                          {sc.title}
                        </h4>
                        <span className="text-[10px] font-mono text-stone-400">{sc.difficulty}</span>
                      </div>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 line-clamp-1 mt-0.5">
                        {sc.context}
                      </p>
                      <div className="text-[10px] text-purple-600 dark:text-purple-400 font-bold flex items-center gap-1 mt-1">
                        <span>Start SULTI Roleplay</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TOOL 3: FLASHCARDS */}
          {tool === 'flashcards' && (
            <div className="space-y-4 py-2">
              <div className="flex items-center justify-between text-xs text-stone-400 px-1 font-mono">
                <span>Card {currentCardIndex + 1} of {SAMPLE_FLASHCARDS.length}</span>
                <span>Tap to flip</span>
              </div>

              {/* Flashcard container */}
              <div
                onClick={() => {
                  sounds.playTap();
                  setIsFlipped(!isFlipped);
                }}
                className={`min-h-[190px] p-6 rounded-3xl border text-center flex flex-col justify-between transition-all cursor-pointer select-none shadow-sm ${
                  isFlipped
                    ? 'bg-teal-600 text-white border-teal-500'
                    : 'bg-stone-50 dark:bg-[#152B37] border-stone-200 dark:border-white/10 text-stone-900 dark:text-white'
                }`}
              >
                <div className="text-[10px] font-mono uppercase tracking-wider opacity-75">
                  {currentFlashcard.context}
                </div>

                <div className="space-y-1 my-auto">
                  <div className="font-display font-black text-lg sm:text-xl">
                    {isFlipped ? currentFlashcard.english : currentFlashcard.bisaya}
                  </div>
                  <div className="text-xs opacity-80 italic">
                    {isFlipped ? 'English Translation' : 'Bisaya Target Expression'}
                  </div>
                </div>

                {!isFlipped && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlayAudio(currentFlashcard.audio);
                    }}
                    className="p-2 mx-auto rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 hover:bg-teal-200 transition-colors"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  onClick={handleNextCard}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-bold text-xs cursor-pointer"
                >
                  Review Later
                </button>
                <button
                  onClick={handleNextCard}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-black text-xs btn-3d-teal cursor-pointer"
                >
                  I Know This ✓
                </button>
              </div>
            </div>
          )}

          {/* TOOL 4: PHRASEBOOK */}
          {tool === 'phrasebook' && (
            <div className="space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  value={searchPhrase}
                  onChange={(e) => setSearchPhrase(e.target.value)}
                  placeholder="Search Bisaya or English phrases..."
                  className="w-full pl-9 pr-3 py-2 bg-stone-100 dark:bg-stone-800 rounded-xl text-xs text-stone-900 dark:text-white placeholder:text-stone-400 border border-stone-200 dark:border-white/10 outline-none focus:border-teal-500"
                />
              </div>

              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {filteredPhrases.map((phrase, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-white dark:bg-[#152B37] rounded-2xl border border-stone-200/90 dark:border-white/10 flex items-center justify-between gap-3"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="font-display font-black text-xs text-stone-900 dark:text-white">
                        {phrase.bisaya}
                      </div>
                      <div className="text-[11px] text-stone-500 dark:text-stone-400 italic">
                        "{phrase.english}"
                      </div>
                      <div className="text-[9px] font-mono text-teal-700 dark:text-teal-300">
                        {phrase.note}
                      </div>
                    </div>

                    <button
                      onClick={() => handlePlayAudio(phrase.bisaya)}
                      disabled={playingPhrase === phrase.bisaya}
                      className={`p-2 rounded-xl text-stone-700 dark:text-stone-200 hover:bg-teal-50 dark:hover:bg-teal-950 border border-stone-200 dark:border-white/10 shrink-0 cursor-pointer ${
                        playingPhrase === phrase.bisaya ? 'bg-teal-100 dark:bg-teal-950 animate-pulse text-teal-700' : ''
                      }`}
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TOOL 5: PRONUNCIATION LAB */}
          {tool === 'pronunciation' && (
            <div className="space-y-4 py-2">
              <div className="p-4 bg-teal-50 dark:bg-teal-950/40 rounded-2xl border border-teal-200 dark:border-teal-800 space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase text-teal-800 dark:text-teal-300">
                  Target Phonetic Drill
                </span>
                <div className="font-display font-black text-lg text-stone-900 dark:text-white">
                  "Lugar lang sa unahan, Manong!"
                </div>
                <div className="text-xs text-stone-500 italic">
                  "Pull over ahead near the corner, driver!"
                </div>
                <button
                  onClick={() => handlePlayAudio('Lugar lang sa unahan, Manong!')}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-stone-800 text-teal-700 dark:text-teal-300 font-bold text-xs inline-flex items-center gap-1.5 border border-teal-200 shadow-2xs cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Listen Model Audio</span>
                </button>
              </div>

              <div className="text-center py-2 space-y-2">
                <button
                  onClick={handleSimulateMic}
                  className="w-16 h-16 mx-auto rounded-full bg-teal-600 hover:bg-teal-500 text-white flex items-center justify-center shadow-md cursor-pointer"
                >
                  <Mic className="w-7 h-7" />
                </button>
                <p className="text-xs text-stone-500">{micActive ? 'Evaluating pronunciation...' : 'Tap to test acoustic accuracy'}</p>
                {micTranscript && (
                  <div className="p-3 bg-stone-100 dark:bg-stone-800 rounded-xl text-xs font-mono text-stone-800 dark:text-stone-200">
                    {micTranscript}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TOOL 6-13: SPECIALIZED TARGETED TOOL DRILL & SULTI COMPANION BRIDGE */}
          {['grammar', 'vocabulary', 'listening', 'writing', 'reading', 'sulti_switch', 'culture', 'review_center'].includes(tool) && (
            <div className="space-y-4 py-2">
              <div className="p-4 bg-stone-50 dark:bg-stone-800/60 rounded-3xl border border-stone-200 dark:border-white/10 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{currentModule?.icon}</span>
                  <div>
                    <h4 className="font-display font-black text-sm text-stone-900 dark:text-white">
                      {currentModule?.title}
                    </h4>
                    <p className="text-xs text-teal-700 dark:text-teal-300 font-medium">
                      {currentModule?.purpose}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                  {currentModule?.quickDescription}
                </p>

                {/* Interactive Drill Card */}
                <div className="p-3 bg-white dark:bg-[#11222D] rounded-2xl border border-stone-200/80 dark:border-white/5 space-y-2">
                  <div className="text-[10px] font-mono font-bold uppercase text-stone-400">
                    Current Focus Task
                  </div>
                  <div className="text-xs font-bold text-stone-800 dark:text-stone-200">
                    {tool === 'grammar' && 'Understanding topic marker "ang" vs directional "sa"'}
                    {tool === 'vocabulary' && 'Carenderia & Bankerohan Market colloquial terms'}
                    {tool === 'listening' && 'Acoustic differentiation: "Gud" vs "Gyud" in conversational banter'}
                    {tool === 'writing' && 'Drafting a polite text message: "Salamat sa tabang, amping kanunay."'}
                    {tool === 'reading' && 'Reading short folk legend: "Ang Alamat sa Durian"'}
                    {tool === 'sulti_switch' && 'Speed drill: Shift thought instantly from English to Bisaya'}
                    {tool === 'culture' && 'Bisaya hospitality etiquette: "Kaon ta!"'}
                    {tool === 'review_center' && 'Weak phoneme reinforcement: Glottal stops in "wala\'y"'}
                  </div>

                  <button
                    onClick={() => handlePlayAudio(
                      tool === 'culture' ? 'Kaon ta ninyo!' : 'Salamat sa tabang, amping kanunay.'
                    )}
                    className="px-3 py-1 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold text-[11px] inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Play Reference Audio</span>
                  </button>
                </div>
              </div>

              {/* Action Bridge to SULTI AI */}
              <div className="p-4 bg-gradient-to-r from-purple-500/10 via-teal-500/10 to-blue-500/10 dark:from-purple-950/30 dark:via-teal-950/30 dark:to-blue-950/30 rounded-2xl border border-purple-200/60 dark:border-purple-500/20 space-y-2 text-center">
                <div className="text-xs font-bold text-purple-900 dark:text-purple-200">
                  Connect with SULTI AI Companion
                </div>
                <p className="text-[11px] text-stone-600 dark:text-stone-400">
                  Dive into real-time interactive practice with contextual guidance and instant feedback.
                </p>

                <button
                  onClick={() => {
                    sounds.playTap();
                    onClose();
                    onOpenSulti?.(currentModule?.promptSuggestion);
                  }}
                  className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Start Practice with SULTI →</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-3 bg-stone-50 dark:bg-[#152B37] border-t border-stone-200 dark:border-white/10 flex items-center justify-between text-xs shrink-0">
          <span className="text-stone-400 font-mono text-[10px]">
            SULTI Academic & Conversational Toolkit
          </span>
          <button
            onClick={() => {
              sounds.playTap();
              onClose();
            }}
            className="px-4 py-1.5 bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 rounded-xl font-bold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
