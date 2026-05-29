export interface VocalAssistantOptions {
  onTranscript?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  onListeningStateChange?: (isListening: boolean) => void;
  onSpeakingStateChange?: (isSpeaking: boolean) => void;
}

export class VocalAssistant {
  private recognition: any = null;
  private isListening = false;
  private isSpeaking = false;
  private voices: SpeechSynthesisVoice[] = [];
  private preferredVoice: SpeechSynthesisVoice | null = null;

  constructor(private options: VocalAssistantOptions = {}) {
    this.initSpeechRecognition();
    this.initSpeechSynthesis();
  }

  private initSpeechRecognition() {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn("Speech recognition is not supported in this browser.");
      return;
    }

    try {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = "en-US";

      this.recognition.onstart = () => {
        this.isListening = true;
        this.options.onListeningStateChange?.(true);
      };

      this.recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        this.options.onError?.(event.error);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        this.options.onListeningStateChange?.(false);
      };

      this.recognition.onresult = (event: any) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        if (finalTranscript.trim() && this.options.onTranscript) {
          this.options.onTranscript(finalTranscript.trim(), true);
        } else if (interimTranscript.trim() && this.options.onTranscript) {
          this.options.onTranscript(interimTranscript.trim(), false);
        }
      };
    } catch (err) {
      console.error("Failed to initialize speech recognition:", err);
    }
  }

  private initSpeechSynthesis() {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      console.warn("Speech synthesis is not supported in this browser.");
      return;
    }

    const loadVoices = () => {
      this.voices = window.speechSynthesis.getVoices();
      // Try to find a premium, natural-sounding English voice
      this.preferredVoice =
        this.voices.find(
          (v) =>
            v.lang.startsWith("en") &&
            (v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("Premium"))
        ) ||
        this.voices.find((v) => v.lang.startsWith("en")) ||
        this.voices[0] ||
        null;
    };

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }

  public startListening() {
    if (!this.recognition) {
      this.options.onError?.("Speech recognition not supported in this environment");
      return;
    }
    if (this.isListening) return;

    try {
      // Pause speaking if speaking
      if (this.isSpeaking) {
        this.stopSpeaking();
      }
      this.recognition.start();
    } catch (err) {
      console.error("Error starting speech recognition:", err);
      this.options.onError?.(String(err));
    }
  }

  public stopListening() {
    if (!this.recognition || !this.isListening) return;
    try {
      this.recognition.stop();
    } catch (err) {
      console.error("Error stopping speech recognition:", err);
    }
  }

  public speak(text: string, callback?: () => void) {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      this.options.onError?.("Speech synthesis not supported");
      callback?.();
      return;
    }

    // Cancel active speak
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    if (this.preferredVoice) {
      utterance.voice = this.preferredVoice;
    }
    utterance.rate = 1.0; // natural pacing
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      this.isSpeaking = true;
      this.options.onSpeakingStateChange?.(true);
    };

    const handleEnd = () => {
      this.isSpeaking = false;
      this.options.onSpeakingStateChange?.(false);
      callback?.();
    };

    utterance.onend = handleEnd;
    utterance.onerror = (e) => {
      console.error("Speech synthesis error:", e);
      handleEnd();
    };

    window.speechSynthesis.speak(utterance);
  }

  public stopSpeaking() {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      this.isSpeaking = false;
      this.options.onSpeakingStateChange?.(false);
    }
  }

  public getActiveListeningState() {
    return this.isListening;
  }

  public getActiveSpeakingState() {
    return this.isSpeaking;
  }

  public isSupported(): boolean {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    return !!SpeechRecognition && !!(window as any).speechSynthesis;
  }
}
