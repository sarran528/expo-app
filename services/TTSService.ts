import * as Speech from 'expo-speech';
import { Platform } from 'react-native';

class TTSServiceClass {
  private currentUtteranceId: string | null = null;
  private isPlaying: boolean = false;
  private speechRate: number = 0.75;
  private speechPitch: number = 1.0;

  async speak(text: string, options?: {
    rate?: number;
    pitch?: number;
    voice?: string;
  }): Promise<void> {
    try {
      // Stop any currently playing speech
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

      // Set voice if specified
      if (options?.voice) {
        speechOptions.voice = options.voice;
      }

      // Start speaking
      Speech.speak(text, speechOptions);
      this.isPlaying = true;
    } catch (error) {
      console.error('TTS Speak Error:', error);
      throw error;
    }
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
        // Note: Pause/resume is only available on iOS
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
        // Note: Pause/resume is only available on iOS
        Speech.resume();
      }
    } catch (error) {
      console.error('TTS Resume Error:', error);
      throw error;
    }
  }

  setSpeechRate(rate: number): void {
    // Rate should be between 0.0 and 1.0
    this.speechRate = Math.max(0.1, Math.min(1.0, rate));
  }

  setSpeechPitch(pitch: number): void {
    // Pitch should be between 0.5 and 2.0
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

  // Utility method to check if speech is available
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