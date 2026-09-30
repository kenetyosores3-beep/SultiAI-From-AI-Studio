// Web Speech API and Audio synthesis utilities for Bisaya speech practice

export function speakBisaya(text: string, rate: number = 0.88): Promise<void> {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported in this browser');
      resolve();
      return;
    }

    window.speechSynthesis.cancel(); // Cancel any ongoing speech

    const utterance = new SpeechSynthesisUtterance(text);
    // Find Filipino / Asian / English voices
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => 
      v.lang.includes('fil') || 
      v.lang.includes('tl') || 
      v.lang.includes('id') || 
      v.lang.includes('ms') || 
      v.lang.includes('en-PH')
    ) || voices.find(v => v.lang.includes('en-US')) || voices[0];

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    utterance.rate = rate; // Support normal or slower audio for learners
    utterance.pitch = 1.0;
    
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();

    window.speechSynthesis.speak(utterance);
  });
}

// Browser speech recognition interface
export interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
}

// MediaRecorder Audio Recorder for Whisper / Gemini Audio transcription
export interface AudioRecorderController {
  stop: () => Promise<{ base64Audio: string; mimeType: string }>;
  cancel: () => void;
}

export async function startAudioRecording(): Promise<AudioRecorderController | null> {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    console.warn('getUserMedia not supported in this environment');
    return null;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mimeType = MediaRecorder.isTypeSupported('audio/webm') 
      ? 'audio/webm' 
      : (MediaRecorder.isTypeSupported('audio/mp4') ? 'audio/mp4' : 'audio/ogg');
    
    const mediaRecorder = new MediaRecorder(stream, { mimeType });
    const chunks: Blob[] = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        chunks.push(e.data);
      }
    };

    mediaRecorder.start(100);

    return {
      stop: () => {
        return new Promise<{ base64Audio: string; mimeType: string }>((resolve) => {
          mediaRecorder.onstop = () => {
            // Stop all audio tracks
            stream.getTracks().forEach((track) => track.stop());
            const blob = new Blob(chunks, { type: mimeType });
            const reader = new FileReader();
            reader.onloadend = () => {
              const dataUrl = reader.result as string;
              const base64Audio = dataUrl.split(',')[1] || '';
              resolve({ base64Audio, mimeType });
            };
            reader.readAsDataURL(blob);
          };
          mediaRecorder.stop();
        });
      },
      cancel: () => {
        try {
          stream.getTracks().forEach((track) => track.stop());
          if (mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
          }
        } catch {
          // ignore
        }
      },
    };
  } catch (err) {
    console.warn('Failed to start microphone stream:', err);
    return null;
  }
}

export function startSpeechRecognition(
  onResult: (result: string) => void,
  onError: (err: string) => void,
  onEnd: () => void
): { stop: () => void } | null {
  const SpeechRecognition = 
    (window as any).SpeechRecognition || 
    (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    onError('Speech recognition is not supported in this browser. You can type or tap the quick phrases.');
    return null;
  }

  try {
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'fil-PH'; // Closest native phoneme model for Philippine languages

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    };

    recognition.onerror = (event: any) => {
      onError(event.error || 'Speech capture failed');
    };

    recognition.onend = () => {
      onEnd();
    };

    recognition.start();

    return {
      stop: () => {
        try {
          recognition.stop();
        } catch {
          // ignore
        }
      }
    };
  } catch (err: any) {
    onError(err.message || 'Microphone access denied');
    return null;
  }
}
