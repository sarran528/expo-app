import * as Speech from 'expo-speech';
import { Platform } from 'react-native';

class TTSServiceClass {
  private currentUtteranceId: string | null = null;
  private isPlaying: boolean = false;
  private speechRate: number = 0.75;
  private speechPitch: number = 1.0;
  private boundaryCallback: ((wordIndex: number) => void) | null = null;
  private words: string[] = [];

  async speak(text: string, options?: {
    rate?: number;
    pitch?: number;
    voice?: string;
  }): Promise<void> {
    try {
      await this.stop();
      const speechOptions: Speech.SpeechOptions = {
        language: 'en-US',
        pitch: options?.pitch || this.speechPitch,
        rate: options?.rate || this.speechRate,
        onStart: () => {
          this.isPlaying = true;
        },
        onDone: () => {
          this.isPlaying = false;
          this.currentUtteranceId = null;
        },
        onStopped: () => {
          this.isPlaying = false;
          this.currentUtteranceId = null;
        },
        onError: (error) => {
          console.error('TTS Error:', error);
          this.isPlaying = false;
          this.currentUtteranceId = null;
        },
      };
      if (options?.voice) {
        speechOptions.voice = options.voice;
      }
      Speech.speak(text, speechOptions);
      this.isPlaying = true;
    } catch (error) {
      console.error('TTS Speak Error:', error);
      throw error;
    }
  }

  /**
   * Speak with word boundary highlighting support.
   * @param text The text to speak.
   * @param options TTS options.
   * @param onBoundary Callback(wordIndex) when a word boundary is reached.
   */
  async speakWithWordBoundary(text: string, options: {
    rate?: number;
    pitch?: number;
    voice?: string;
  } = {}, onBoundary?: (wordIndex: number) => void) {
    await this.stop();
    this.words = text.split(/(\s+)/);
    this.boundaryCallback = onBoundary || null;
    let wordIdx = 0;
    const speechOptions: Speech.SpeechOptions = {
      language: 'en-US',
      pitch: options?.pitch || this.speechPitch,
      rate: options?.rate || this.speechRate,
      onStart: () => {
        this.isPlaying = true;
        if (this.boundaryCallback) this.boundaryCallback(0);
      },
      onDone: () => {
        this.isPlaying = false;
        this.currentUtteranceId = null;
        if (this.boundaryCallback) this.boundaryCallback(-1);
      },
      onStopped: () => {
        this.isPlaying = false;
        this.currentUtteranceId = null;
        if (this.boundaryCallback) this.boundaryCallback(-1);
      },
      onError: (error) => {
        console.error('TTS Error:', error);
        this.isPlaying = false;
        this.currentUtteranceId = null;
        if (this.boundaryCallback) this.boundaryCallback(-1);
      },
    };
    if (options?.voice) {
      speechOptions.voice = options.voice;
    }
    // Use onBoundary if available (iOS/Android)
    if (typeof Speech.speak === 'function' && Platform.OS !== 'web') {
      // @ts-ignore: onBoundary is not in types but is supported
      speechOptions.onBoundary = (event: any) => {
        if (event?.charIndex != null) {
          // Find which word this charIndex is in
          let acc = 0;
          for (let i = 0; i < this.words.length; i++) {
            acc += this.words[i].length;
            if (event.charIndex < acc) {
              if (this.boundaryCallback) this.boundaryCallback(i);
              break;
            }
          }
        }
      };
    }
    Speech.speak(text, speechOptions);
    this.isPlaying = true;
  }

  async stop(): Promise<void> {
    try {
      if (this.isPlaying) {
        Speech.stop();
        this.isPlaying = false;
        this.currentUtteranceId = null;
      }
    } catch (error) {
      console.error('TTS Stop Error:', error);
      throw error;
    }
  }

  async pause(): Promise<void> {
    try {
      if (this.isPlaying && Platform.OS === 'ios') {
        Speech.pause();
      }
    } catch (error) {
      console.error('TTS Pause Error:', error);
      throw error;
    }
  }

  async resume(): Promise<void> {
    try {
      if (Platform.OS === 'ios') {
        Speech.resume();
      }
    } catch (error) {
      console.error('TTS Resume Error:', error);
      throw error;
    }
  }

  setSpeechRate(rate: number): void {
    this.speechRate = Math.max(0.1, Math.min(1.0, rate));
  }

  setSpeechPitch(pitch: number): void {
    this.speechPitch = Math.max(0.5, Math.min(2.0, pitch));
  }

  getSpeechRate(): number {
    return this.speechRate;
  }

  getSpeechPitch(): number {
    return this.speechPitch;
  }

  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  async getAvailableVoices(): Promise<Speech.Voice[]> {
    try {
      const voices = await Speech.getAvailableVoicesAsync();
      return voices;
    } catch (error) {
      console.error('Error getting available voices:', error);
      return [];
    }
  }

  async isSpeechAvailable(): Promise<boolean> {
    try {
      return await Speech.isSpeakingAsync();
    } catch (error) {
      console.error('Error checking speech availability:', error);
      return false;
    }
  }
}

export const TTSService = new TTSServiceClass();