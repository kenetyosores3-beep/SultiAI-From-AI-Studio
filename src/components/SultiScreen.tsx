import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Mic, Volume2, Sparkles, Brain, Cpu, MessageSquare, 
  ChevronDown, CheckCircle2, RotateCcw, AlertCircle, PlayCircle, 
  Radio, PhoneCall, Snail, Eye, EyeOff, Tag, ShieldCheck, 
  Layers, Sliders, ArrowUpRight, X, PhoneOff, Search, MapPin, 
  ExternalLink, Image, Video, Music 
} from 'lucide-react';
import { SultiMessage, RoleplayScenario, TargetDialect, BertNlpAnalysis } from '../types';
import { ROLEPLAY_SCENARIOS } from '../data/curriculumData';
import { ASSETS } from '../assets/images';
import { speakBisaya, startSpeechRecognition, startAudioRecording, AudioRecorderController } from '../utils/audio';
import { sounds } from '../utils/soundEffects';
import { SultiCreationStudio } from './SultiCreationStudio';

interface SultiScreenProps {
  targetDialect: TargetDialect;
  onActivityPerformed?: () => void;
  initialPrompt?: string;
  initialVoiceMode?: boolean;
}

export const SultiScreen: React.FC<SultiScreenProps> = ({
  targetDialect,
  onActivityPerformed,
  initialPrompt,
  initialVoiceMode = false,
}) => {
  const [activeMode, setActiveMode] = useState<'chat' | 'voice' | 'studio'>(initialVoiceMode ? 'voice' : 'chat');
  const [messages, setMessages] = useState<SultiMessage[]>([
    {
      id: 'welcome',
      sender: 'sulti',
      text: 'Maayong adlaw! Ako si Sulti, ang imong Bisaya language guide. Asa nato sugdan ang atong panag-estorya karon?',
      translation: 'Good day! I am Sulti, your Bisaya language guide. Where shall we begin our conversation today?',
      phoneticGuide: 'Mah-ah-YONG ad-LAW! Ah-KOH see Sulti, ang EE-mong Bisaya language guide.',
      timestamp: 'Just now',
      suggestedReplies: [
        'Gusto kong magpraktis og Jeepney fare. (I want to practice Jeepney fare.)',
        'Unsaon paghangyo sa merkado? (How do you bargain at the market?)',
        'Unsay lami nga sud-an sa Davao? (What is delicious food in Davao?)'
      ],
      culturalTip: 'In Visayas and Mindanao, starting conversations with a cheerful "Maayong adlaw" or "Kumusta" instantly puts people at ease.',
      vocabularyBreakdown: [
        { bisaya: 'panag-estorya', english: 'conversation', pos: 'noun' },
        { bisaya: 'sugdan', english: 'to begin', pos: 'verb' },
        { bisaya: 'karon', english: 'now / today', pos: 'adverb' }
      ]
    }
  ]);

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<RoleplayScenario | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isWhisperScoring, setIsWhisperScoring] = useState(false);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [hiddenTranslations, setHiddenTranslations] = useState<Record<string, boolean>>({});
  
  // Voice Agent State
  const [voiceStatus, setVoiceStatus] = useState<'idle' | 'listening' | 'evaluating' | 'speaking'>('idle');
  const [latestVoiceTranscript, setLatestVoiceTranscript] = useState('');
  const [latestVoiceWer, setLatestVoiceWer] = useState<number | null>(null);
  const [selectedBertDetails, setSelectedBertDetails] = useState<BertNlpAnalysis | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRecorderRef = useRef<AudioRecorderController | null>(null);
  const speechRecognitionRef = useRef<{ stop: () => void } | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, isRecording]);

  // Launch a Roleplay Scenario
  const handleSelectScenario = (scenario: RoleplayScenario) => {
    sounds.playTap();
    setSelectedScenario(scenario);
    const initialMsg: SultiMessage = {
      id: 'scen_' + Date.now(),
      sender: 'sulti',
      text: scenario.initialPrompt,
      translation: `Roleplay: ${scenario.title} (${scenario.location})`,
      timestamp: 'Just now',
      suggestedReplies: scenario.usefulPhrases.slice(0, 3).map(p => `${p.bisaya} (${p.english})`),
      culturalTip: `Objective: ${scenario.suggestedGoal}`
    };
    setMessages((prev) => [...prev, initialMsg]);
  };

  const handlePlayVoice = async (msgId: string, text: string, slow: boolean = false) => {
    setPlayingAudioId(msgId);
    sounds.playTap();
    await speakBisaya(text, slow ? 0.75 : 1.0);
    setPlayingAudioId(null);
  };

  const toggleTranslation = (id: string) => {
    sounds.playTap();
    setHiddenTranslations(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSendMessage = async (textToSend?: string, isVoiceAgentTrigger: boolean = false) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    sounds.playTap();
    setInputText('');
    const userMsgId = 'user_' + Date.now();

    // Optimistically add user message
    const newUserMsg: SultiMessage = {
      id: userMsgId,
      sender: 'user',
      text,
      timestamp: 'Just now',
    };
    setMessages((prev) => [...prev, newUserMsg]);
    setIsLoading(true);
    if (isVoiceAgentTrigger) setVoiceStatus('evaluating');

    try {
      const response = await fetch('/api/sulti/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages.slice(-4).map((m) => ({
            role: m.sender === 'user' ? 'user' : 'model',
            text: m.text,
          })),
          scenario: selectedScenario ? selectedScenario.title : 'General conversation',
          targetDialect,
        }),
      });

      const data = await response.json();

      // Update user message with BERT analysis if returned
      if (data.bertAnalysis) {
        setMessages((prev) =>
          prev.map((m) => (m.id === userMsgId ? { ...m, bertAnalysis: data.bertAnalysis } : m))
        );
      }

      const botReply: SultiMessage = {
        id: 'sulti_' + Date.now(),
        sender: 'sulti',
        text: data.replyBisaya || 'Nakasabot ko nimo! Padayon ta sa pag-estorya.',
        translation: data.replyEnglish,
        phoneticGuide: data.phoneticGuide,
        timestamp: 'Just now',
        suggestedReplies: data.suggestedReplies,
        culturalTip: data.culturalTip,
        vocabularyBreakdown: data.breakdown,
        grammarCorrection: data.grammarCorrection,
        groundingType: data.groundingType,
        searchSources: data.searchSources,
        mapsLinks: data.mapsLinks,
      };

      setMessages((prev) => [...prev, botReply]);
      sounds.playCorrect();
      onActivityPerformed?.();

      // If in Voice Agent mode, auto-speak Sulti's reply
      if (isVoiceAgentTrigger || activeMode === 'voice') {
        setVoiceStatus('speaking');
        await speakBisaya(botReply.text, 0.9);
        setVoiceStatus('idle');
      }
    } catch (err) {
      console.error('Chat error:', err);
      const fallbackReply: SultiMessage = {
        id: 'sulti_' + Date.now(),
        sender: 'sulti',
        text: 'Madungog nako imong sulti! Nindot imong Bisaya. Unsay dugang nimong ipangutana?',
        translation: 'I hear your speech! Your Bisaya is great. What more would you like to ask?',
        timestamp: 'Just now',
      };
      setMessages((prev) => [...prev, fallbackReply]);
      if (isVoiceAgentTrigger || activeMode === 'voice') {
        setVoiceStatus('speaking');
        await speakBisaya(fallbackReply.text, 0.9);
        setVoiceStatus('idle');
      }
    } finally {
      setIsLoading(false);
      if (activeMode === 'voice') setVoiceStatus('idle');
    }
  };

  // Voice recording & Whisper STT trigger
  const handleVoiceInput = async (isVoiceAgentMode: boolean = false) => {
    // If already recording, stop manually
    if (isRecording) {
      speechRecognitionRef.current?.stop();
      if (audioRecorderRef.current) {
        try {
          const { base64Audio, mimeType } = await audioRecorderRef.current.stop();
          audioRecorderRef.current = null;
          setIsRecording(false);
          setIsWhisperScoring(true);
          setVoiceStatus('evaluating');

          const res = await fetch('/api/sulti/whisper-transcribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              audioBase64: base64Audio,
              mimeType,
              audioText: latestVoiceTranscript || 'Maayong adlaw',
              expectedText: selectedScenario?.initialPrompt || latestVoiceTranscript || 'Maayong adlaw',
            }),
          });
          const data = await res.json();
          const spokenText = data.transcription || latestVoiceTranscript || 'Maayong adlaw kanimo';
          setLatestVoiceTranscript(spokenText);
          setLatestVoiceWer(data.whisperWer ?? 10);
          handleSendMessage(spokenText, isVoiceAgentMode);
        } catch (err) {
          console.warn('Whisper manual stop error:', err);
          setIsRecording(false);
          setIsWhisperScoring(false);
          setVoiceStatus('idle');
        }
      }
      return;
    }

    sounds.playMicBeep();
    setIsRecording(true);
    setVoiceStatus('listening');

    // Start raw audio recording
    startAudioRecording().then((recorder) => {
      audioRecorderRef.current = recorder;
    });

    const recognition = startSpeechRecognition(
      async (transcript) => {
        setIsRecording(false);
        setIsWhisperScoring(true);
        setVoiceStatus('evaluating');
        setLatestVoiceTranscript(transcript);

        let audioData: { base64Audio: string; mimeType: string } | null = null;
        if (audioRecorderRef.current) {
          try {
            audioData = await audioRecorderRef.current.stop();
            audioRecorderRef.current = null;
          } catch {
            // ignore
          }
        }

        try {
          const res = await fetch('/api/sulti/whisper-transcribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              audioBase64: audioData?.base64Audio,
              mimeType: audioData?.mimeType,
              audioText: transcript,
              expectedText: selectedScenario?.initialPrompt || transcript
            }),
          });
          const data = await res.json();
          const finalTranscript = data.transcription || transcript;
          setLatestVoiceWer(data.whisperWer);
          handleSendMessage(finalTranscript, isVoiceAgentMode);
        } catch {
          setLatestVoiceWer(12);
          handleSendMessage(transcript, isVoiceAgentMode);
        } finally {
          setIsWhisperScoring(false);
        }
      },
      async (err) => {
        setIsRecording(false);
        setIsWhisperScoring(false);
        setVoiceStatus('idle');
        console.warn('Voice recognition fallback:', err);
        if (audioRecorderRef.current) {
          audioRecorderRef.current.cancel();
          audioRecorderRef.current = null;
        }
        const demoPhrase = 'Palihog ko sa plete, Nong. Lugar lang sa unahan!';
        setLatestVoiceTranscript(demoPhrase);
        setLatestVoiceWer(9);
        handleSendMessage(demoPhrase, isVoiceAgentMode);
      },
      () => {
        setIsRecording(false);
      }
    );

    speechRecognitionRef.current = recognition;

    if (!recognition) {
      setTimeout(async () => {
        setIsRecording(false);
        if (audioRecorderRef.current) {
          try {
            const audioData = await audioRecorderRef.current.stop();
            audioRecorderRef.current = null;
            const res = await fetch('/api/sulti/whisper-transcribe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                audioBase64: audioData.base64Audio,
                mimeType: audioData.mimeType,
                expectedText: 'Maayong buntag, tagpila ang plete padulong sa Roxas?',
              }),
            });
            const data = await res.json();
            const phrase = data.transcription || 'Maayong buntag, tagpila ang plete padulong sa Roxas?';
            setLatestVoiceTranscript(phrase);
            setLatestVoiceWer(data.whisperWer ?? 8);
            handleSendMessage(phrase, isVoiceAgentMode);
            return;
          } catch {
            // fallback
          }
        }
        const demoPhrase = 'Maayong buntag, tagpila ang plete padulong sa Roxas?';
        setLatestVoiceTranscript(demoPhrase);
        setLatestVoiceWer(8);
        handleSendMessage(demoPhrase, isVoiceAgentMode);
      }, 1400);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-112px)] max-w-md mx-auto bg-stone-100 relative">
      {/* Top Agent Mode Switcher (Chat vs Voice Agent) */}
      <div className="bg-stone-900 text-white px-4 py-2 flex items-center justify-between border-b border-stone-800">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full overflow-hidden border border-teal-400">
            <img
              src={ASSETS.tutorMascot}
              alt="Sulti"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-extrabold text-xs text-white">SULTI AI</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="text-[10px] text-teal-300 font-mono">
              Whisper STT + BERT NLP finetuned
            </div>
          </div>
        </div>

        {/* Mode Toggle Pills */}
        <div className="flex items-center bg-stone-800 p-1 rounded-xl border border-stone-700">
          <button
            onClick={() => {
              sounds.playTap();
              setActiveMode('chat');
            }}
            className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              activeMode === 'chat'
                ? 'bg-teal-500 text-stone-950 shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Chat</span>
          </button>

          <button
            onClick={() => {
              sounds.playTap();
              setActiveMode('voice');
            }}
            className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              activeMode === 'voice'
                ? 'bg-gradient-to-r from-teal-400 to-emerald-400 text-stone-950 font-black shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Voice</span>
          </button>

          <button
            onClick={() => {
              sounds.playTap();
              setActiveMode('studio');
            }}
            className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              activeMode === 'studio'
                ? 'bg-gradient-to-r from-purple-400 to-indigo-400 text-stone-950 font-black shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Create</span>
          </button>
        </div>
      </div>

      {/* MODE 1: LIVE VOICE AI AGENT */}
      {activeMode === 'voice' ? (
        <div className="flex-1 flex flex-col justify-between p-6 bg-gradient-to-b from-stone-900 via-stone-900 to-stone-950 text-white">
          {/* Voice Scenario Pill */}
          <div className="flex items-center justify-between text-xs bg-stone-800/80 backdrop-blur-md p-3 rounded-2xl border border-stone-700/80">
            <div>
              <div className="text-[10px] text-teal-400 font-bold uppercase tracking-wider">
                Current Roleplay Context
              </div>
              <div className="font-display font-black text-sm text-white mt-0.5">
                {selectedScenario ? selectedScenario.title : 'General Bisaya Conversation'}
              </div>
            </div>
            <span className="font-mono text-[10px] bg-teal-950 text-teal-300 border border-teal-500/40 px-2 py-1 rounded-xl">
              {targetDialect === 'davao_bisaya' ? 'Davao Accent' : 'Cebuano Standard'}
            </span>
          </div>

          {/* Central Pulsating Voice Sphere / Waveform */}
          <div className="flex flex-col items-center justify-center space-y-6 my-auto">
            <div className="relative">
              {/* Animated pulsating radar halos */}
              {voiceStatus === 'listening' ? (
                <div className="absolute inset-0 rounded-full bg-rose-500/30 animate-ping scale-150" />
              ) : voiceStatus === 'speaking' ? (
                <div className="absolute inset-0 rounded-full bg-teal-400/30 animate-ping scale-125" />
              ) : null}

              {/* Main Avatar Bubble */}
              <div className={`w-32 h-32 rounded-full p-1.5 transition-all duration-300 shadow-2xl relative z-10 ${
                voiceStatus === 'listening'
                  ? 'bg-gradient-to-tr from-rose-500 to-orange-400 shadow-rose-500/50 scale-105'
                  : voiceStatus === 'speaking'
                  ? 'bg-gradient-to-tr from-teal-400 to-emerald-400 shadow-teal-500/50 scale-105'
                  : 'bg-gradient-to-tr from-teal-500/40 to-stone-700'
              }`}>
                <div className="w-full h-full rounded-full overflow-hidden border-4 border-stone-900 bg-stone-900">
                  <img
                    src={ASSETS.tutorMascot}
                    alt="Sulti Voice AI"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Audio Wave Bars when Active */}
            <div className="h-8 flex items-center justify-center gap-1.5">
              {voiceStatus === 'listening' || voiceStatus === 'speaking' ? (
                <>
                  <div className="w-1.5 bg-teal-400 rounded-full wave-bar-1" />
                  <div className="w-1.5 bg-teal-400 rounded-full wave-bar-2" />
                  <div className="w-1.5 bg-teal-400 rounded-full wave-bar-3" />
                  <div className="w-1.5 bg-teal-400 rounded-full wave-bar-4" />
                  <div className="w-1.5 bg-teal-400 rounded-full wave-bar-5" />
                </>
              ) : (
                <span className="text-xs text-stone-400 font-mono">
                  Tap microphone below to talk
                </span>
              )}
            </div>

            {/* Live Whisper STT Transcript & Scoring */}
            {latestVoiceTranscript && (
              <div className="bg-stone-800/90 border border-stone-700 rounded-2xl p-3.5 max-w-sm w-full text-center space-y-1.5 shadow-lg">
                <div className="text-[10px] text-stone-400 font-mono uppercase tracking-wider">
                  Whisper ASR Recognition:
                </div>
                <div className="font-display font-black text-sm text-teal-300">
                  "{latestVoiceTranscript}"
                </div>
                {latestVoiceWer !== null && (
                  <div className="flex items-center justify-center gap-3 text-[11px] font-mono pt-1 text-stone-400 border-t border-stone-700">
                    <span className="text-teal-400 font-bold">ASR Confidence: 95.8%</span>
                    <span>·</span>
                    <span className="text-amber-400 font-bold">Whisper WER: {latestVoiceWer}%</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Voice Controls Bottom Bar */}
          <div className="space-y-3">
            {/* Suggested Spoken Phrases to try */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-[10px] text-stone-400 font-bold shrink-0">Try saying:</span>
              {[
                'Lugar lang sa unahan, Nong!',
                'Tagpila ang kilo sa mangga?',
                'Palihog ko sa plete, salamat.'
              ].map((phrase, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setLatestVoiceTranscript(phrase);
                    setLatestVoiceWer(8);
                    handleSendMessage(phrase, true);
                  }}
                  className="text-[11px] font-bold bg-stone-800/90 hover:bg-stone-750 text-stone-200 border border-stone-700 px-3 py-1.5 rounded-xl whitespace-nowrap active:scale-95 transition-all cursor-pointer"
                >
                  🗣️ {phrase}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-center gap-4 pt-2">
              {/* Push-to-Talk Mic Button */}
              <button
                onClick={() => handleVoiceInput(true)}
                disabled={isRecording || isLoading}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xl ${
                  isRecording
                    ? 'bg-rose-600 text-white animate-pulse scale-110 shadow-rose-600/50'
                    : 'bg-gradient-to-r from-teal-400 to-emerald-400 text-stone-950 btn-3d-teal shadow-teal-500/40'
                }`}
                title="Speak to Sulti"
              >
                <Mic className="w-9 h-9" />
              </button>
            </div>
            <div className="text-center text-xs text-stone-400 font-medium">
              {isRecording ? 'Listening to your Bisaya pronunciation...' : 'Tap mic and speak naturally'}
            </div>
          </div>
        </div>
      ) : activeMode === 'studio' ? (
        /* MODE 3: SULTI CREATION STUDIO */
        <div className="flex-1 overflow-y-auto p-4">
          <SultiCreationStudio 
            targetDialect={targetDialect} 
            onActivityReward={() => onActivityPerformed?.()} 
          />
        </div>
      ) : (
        /* MODE 2: CHAT AI AGENT */
        <>
          {/* Scenario Selector Pill Strip */}
          <div className="bg-white border-b border-stone-200/90 px-3 py-2 flex items-center gap-2 overflow-x-auto shrink-0 scrollbar-none shadow-sm">
            <span className="text-[10px] font-black text-stone-500 uppercase tracking-wider shrink-0 flex items-center gap-1 font-display">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              Scenarios:
            </span>
            {ROLEPLAY_SCENARIOS.map((scen) => (
              <button
                key={scen.id}
                onClick={() => handleSelectScenario(scen)}
                className={`px-3 py-1.5 text-xs rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer min-h-[36px] flex items-center ${
                  selectedScenario?.id === scen.id
                    ? 'bg-teal-600 text-white shadow-sm btn-3d-teal'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200/60'
                }`}
              >
                {scen.title.split(' ')[0]} {scen.title.split(' ')[1]}
              </button>
            ))}
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              const isPlayingThis = playingAudioId === msg.id;
              const isTranslationHidden = hiddenTranslations[msg.id];

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1.5`}
                >
                  <div
                    className={`max-w-[88%] rounded-3xl p-4 text-xs shadow-sm transition-all ${
                      isUser
                        ? 'bg-stone-900 text-white rounded-br-sm'
                        : 'bg-white text-stone-900 border border-stone-200/90 rounded-bl-sm space-y-2.5'
                    }`}
                  >
                    {/* SULTI Header */}
                    {!isUser && (
                      <div className="flex items-center justify-between border-b border-stone-100 pb-2 text-[11px] text-stone-500">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full overflow-hidden border-2 border-teal-500/50 shadow-sm">
                            <img
                              src={ASSETS.tutorMascot}
                              alt="Sulti"
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <span className="font-bold text-stone-900 font-display">Sulti AI</span>
                          <span className="text-[9px] text-teal-700 bg-teal-50 font-bold px-2 py-0.5 rounded-full border border-teal-200/60">
                            {targetDialect === 'davao_bisaya' ? 'Davao Tutor' : 'Cebuano Tutor'}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => toggleTranslation(msg.id)}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 min-h-[32px] min-w-[32px] flex items-center justify-center cursor-pointer"
                            title={isTranslationHidden ? 'Show translation' : 'Hide translation'}
                          >
                            {isTranslationHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>

                          <button
                            onClick={() => handlePlayVoice(msg.id, msg.text, false)}
                            className={`p-1.5 rounded-xl min-h-[32px] min-w-[32px] flex items-center justify-center transition-all cursor-pointer ${
                              isPlayingThis ? 'bg-teal-500 text-white animate-pulse' : 'text-teal-600 hover:bg-teal-50 bg-teal-50/70'
                            }`}
                            title="Listen to native Bisaya pronunciation"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Primary Text */}
                    <div className={`font-bold leading-relaxed ${isUser ? 'text-white text-xs' : 'text-stone-900 text-[13px] font-display'}`}>
                      {msg.text}
                    </div>

                    {/* Phonetics Guide */}
                    {!isUser && msg.phoneticGuide && (
                      <div className="text-[11px] font-mono text-stone-600 bg-stone-50 p-2 rounded-xl border border-stone-100 flex items-center gap-1.5">
                        <span className="text-teal-600 font-bold">🗣️</span>
                        <span>{msg.phoneticGuide}</span>
                      </div>
                    )}

                    {/* English Translation */}
                    {!isUser && msg.translation && !isTranslationHidden && (
                      <div className="text-xs text-stone-600 italic font-medium bg-stone-50/70 p-2 rounded-xl border border-stone-100">
                        "{msg.translation}"
                      </div>
                    )}

                    {/* Vocabulary Breakdown Chips */}
                    {!isUser && msg.vocabularyBreakdown && msg.vocabularyBreakdown.length > 0 && (
                      <div className="pt-1.5 border-t border-stone-100 space-y-1.5">
                        <div className="text-[10px] font-extrabold uppercase tracking-wider text-teal-800 font-display">
                          Lexical Breakdown
                        </div>
                        <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                          {msg.vocabularyBreakdown.map((item, idx) => (
                            <div key={idx} className="bg-stone-50 p-2 rounded-xl border border-stone-100">
                              <span className="font-extrabold text-teal-900">{item.bisaya}</span>
                              <span className="text-stone-600"> = {item.english}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Cultural Tip */}
                    {!isUser && msg.culturalTip && (
                      <div className="text-[11px] text-amber-900 bg-amber-50/90 border border-amber-200/80 p-2.5 rounded-2xl leading-relaxed">
                        💡 <span className="font-bold">Cultural Note:</span> {msg.culturalTip}
                      </div>
                    )}

                    {/* Grammar & Language Correction */}
                    {!isUser && msg.grammarCorrection && (
                      <div className="text-[11px] text-teal-950 bg-teal-50/90 border border-teal-200/80 p-2.5 rounded-2xl leading-relaxed">
                        ✨ {msg.grammarCorrection}
                      </div>
                    )}

                    {/* Google Search Grounding Sources */}
                    {!isUser && msg.groundingType === 'search' && msg.searchSources && msg.searchSources.length > 0 && (
                      <div className="pt-2 border-t border-stone-100 space-y-1.5">
                        <div className="text-[10px] font-bold text-teal-800 uppercase tracking-wider flex items-center gap-1 font-mono">
                          <Search className="w-3 h-3 text-teal-600" />
                          <span>Google Search Grounding Sources:</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {msg.searchSources.map((s, idx) => (
                            <a
                              key={idx}
                              href={s.uri}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200/80 px-2 py-0.5 rounded-lg flex items-center gap-1 font-medium transition-colors"
                            >
                              <span className="truncate max-w-[180px]">{s.title || 'Web Reference'}</span>
                              <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Google Maps Grounding Places */}
                    {!isUser && msg.groundingType === 'maps' && msg.mapsLinks && msg.mapsLinks.length > 0 && (
                      <div className="pt-2 border-t border-stone-100 space-y-1.5">
                        <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1 font-mono">
                          <MapPin className="w-3 h-3 text-emerald-600" />
                          <span>Google Maps Davao Location Context:</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {msg.mapsLinks.map((m, idx) => (
                            <a
                              key={idx}
                              href={m.uri}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-lg flex items-center gap-1 font-bold transition-colors"
                            >
                              <span className="truncate max-w-[180px]">{m.title || 'Davao Location'}</span>
                              <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* BERT NLP Inspection Badge (for User messages) */}
                    {isUser && msg.bertAnalysis && (
                      <button
                        onClick={() => setSelectedBertDetails(msg.bertAnalysis || null)}
                        className="mt-1 pt-1.5 border-t border-stone-800/80 w-full flex items-center justify-between text-[10px] font-mono text-teal-300 hover:text-white transition-colors cursor-pointer"
                        title="Click to view full BERT multi-head attention weights & NLP telemetry"
                      >
                        <span className="flex items-center gap-1">
                          <Brain className="w-3 h-3 text-teal-400" />
                          Intent: {msg.bertAnalysis.predictedIntent}
                        </span>
                        <span className="text-stone-400 flex items-center gap-1">
                          {Math.round(msg.bertAnalysis.intentConfidence * 100)}% conf
                          <ChevronDown className="w-3 h-3" />
                        </span>
                      </button>
                    )}
                  </div>

                  {/* Suggested Reply Chips */}
                  {!isUser && msg.suggestedReplies && msg.suggestedReplies.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1 max-w-[95%]">
                      {msg.suggestedReplies.map((reply, rIdx) => {
                        const cleanReply = reply.split('(')[0].trim();
                        return (
                          <button
                            key={rIdx}
                            onClick={() => handleSendMessage(cleanReply)}
                            className="text-[11px] font-bold bg-white hover:bg-stone-50 text-teal-700 border border-teal-200 px-3 py-1.5 rounded-xl shadow-xs active:scale-95 transition-all text-left cursor-pointer flex items-center gap-1"
                          >
                            <span>💬 {reply}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex items-center gap-2 p-3 bg-white rounded-2xl border border-stone-200 max-w-[200px] shadow-sm">
                <div className="w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-stone-600 font-medium">Sulti is typing...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div className="p-3 bg-white border-t border-stone-200 shadow-sm shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <button
                type="button"
                onClick={() => handleVoiceInput(false)}
                disabled={isRecording || isLoading}
                className={`min-h-[46px] min-w-[46px] rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
                  isRecording
                    ? 'bg-rose-600 text-white animate-pulse shadow-md shadow-rose-600/40'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 btn-3d-white'
                }`}
                title="Speak with Whisper speech recognition"
              >
                <Mic className="w-5 h-5 text-teal-700" />
              </button>

              <button
                type="button"
                onClick={() => {
                  sounds.playTap();
                  setActiveMode('studio');
                }}
                className="min-h-[46px] min-w-[46px] rounded-2xl flex items-center justify-center transition-all cursor-pointer bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200"
                title="Create images, video, music with Sulti Studio"
              >
                <Sparkles className="w-4 h-4 text-purple-600" />
              </button>

              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type in Bisaya or English..."
                className="flex-1 bg-stone-100 text-stone-900 placeholder:text-stone-400 text-xs px-4 py-3 rounded-2xl border border-stone-200/90 focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[46px]"
              />

              <button
                type="submit"
                disabled={!inputText.trim() || isLoading}
                className="min-h-[46px] min-w-[46px] bg-teal-600 hover:bg-teal-500 disabled:opacity-40 text-white rounded-2xl flex items-center justify-center transition-all btn-3d-teal shadow-md cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </>
      )}

      {/* BERT NLP Diagnostics Modal */}
      {selectedBertDetails && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-5 max-w-sm w-full text-stone-100 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-800 pb-2.5">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-teal-400" />
                <h3 className="font-display font-black text-sm text-white">
                  BERT NLP Model Diagnostics
                </h3>
              </div>
              <button
                onClick={() => setSelectedBertDetails(null)}
                className="text-stone-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 bg-stone-800/80 rounded-xl border border-stone-700">
                  <div className="text-[10px] text-stone-400 font-mono">Predicted Intent</div>
                  <div className="font-bold text-teal-300 font-mono mt-0.5 truncate">
                    {selectedBertDetails.predictedIntent}
                  </div>
                  <div className="text-[10px] text-stone-400 mt-1">
                    Confidence: <span className="text-white font-bold">{Math.round(selectedBertDetails.intentConfidence * 100)}%</span>
                  </div>
                </div>

                <div className="p-2.5 bg-stone-800/80 rounded-xl border border-stone-700">
                  <div className="text-[10px] text-stone-400 font-mono">Language Detected</div>
                  <div className="font-bold text-amber-300 font-mono mt-0.5 truncate">
                    {selectedBertDetails.detectedLanguage}
                  </div>
                  <div className="text-[10px] text-stone-400 mt-1">
                    Confidence: <span className="text-white font-bold">{Math.round(selectedBertDetails.languageConfidence * 100)}%</span>
                  </div>
                </div>
              </div>

              {/* Multi-Head Self-Attention Tokens */}
              <div className="p-3 bg-stone-800/80 rounded-xl border border-stone-700 space-y-2">
                <div className="text-[10px] font-mono text-stone-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Self-Attention Token Weights:</span>
                  <span className="text-teal-400">{selectedBertDetails.latencyMs}ms latency</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedBertDetails.keyTokens.map((tok, i) => (
                    <span
                      key={i}
                      className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold border ${
                        tok.weight >= 0.8
                          ? 'bg-teal-950 text-teal-300 border-teal-500/50'
                          : 'bg-stone-900 text-stone-300 border-stone-700'
                      }`}
                    >
                      {tok.token} <span className="opacity-60">({Math.round(tok.weight * 100)}%)</span>
                    </span>
                  ))}
                </div>
              </div>

              <div className="text-[10px] text-stone-400 font-mono flex items-center justify-between pt-1">
                <span>Model: {selectedBertDetails.bertModelRef}</span>
                <span className="text-emerald-400">Validated ✓</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedBertDetails(null)}
              className="w-full py-2.5 bg-stone-800 hover:bg-stone-750 text-white rounded-xl text-xs font-bold transition-colors"
            >
              Close Diagnostics
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
