import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { TTSService } from '../services/TTSService';
import { useTheme } from '@/hooks/useTheme';
import { AccessibleButton } from './AccessibleButton';

interface TextReaderPageProps {
  text: string;
  onBack?: () => void;
}

const TextReaderPage: React.FC<TextReaderPageProps> = ({ text, onBack }) => {
  const { colors, fontSize } = useTheme();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentWordIdx, setCurrentWordIdx] = useState<number>(-1);
  const [resumeFromIdx, setResumeFromIdx] = useState<number>(0);
  const words = text.split(/(\s+)/); // keep spaces for accurate highlighting
  const lastWordIdxRef = useRef<number>(-1);
  const ttsActiveRef = useRef(false);

  // Reset state when text changes or page is mounted
  useEffect(() => {
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentWordIdx(-1);
    setResumeFromIdx(0);
    lastWordIdxRef.current = -1;
    ttsActiveRef.current = false;
    TTSService.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  useEffect(() => {
    return () => {
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const play = async () => {
    setIsPlaying(true);
    setIsPaused(false);
    setCurrentWordIdx(resumeFromIdx);
    lastWordIdxRef.current = resumeFromIdx;
    ttsActiveRef.current = true;
    await TTSService.speakWithWordBoundary(
      words.slice(resumeFromIdx).join(''),
      {},
      (wordIdx) => {
        if (!ttsActiveRef.current) return;
        if (wordIdx === -1) {
          setIsPlaying(false);
          setIsPaused(false);
          setCurrentWordIdx(-1);
          setResumeFromIdx(0);
          ttsActiveRef.current = false;
        } else {
          setCurrentWordIdx(resumeFromIdx + wordIdx);
          lastWordIdxRef.current = resumeFromIdx + wordIdx;
        }
      }
    );
  };

  const pause = async () => {
    setIsPaused(true);
    setIsPlaying(false);
    ttsActiveRef.current = false;
    if (Platform.OS === 'ios') {
      await TTSService.pause();
    } else {
      // Android: stop and store current word
      await TTSService.stop();
      setResumeFromIdx(lastWordIdxRef.current >= 0 ? lastWordIdxRef.current : 0);
    }
  };

  const resume = async () => {
    setIsPaused(false);
    setIsPlaying(true);
    ttsActiveRef.current = true;
    if (Platform.OS === 'ios') {
      await TTSService.resume();
    } else {
      // Android: restart from last word
      await play();
    }
  };

  const stop = async () => {
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentWordIdx(-1);
    setResumeFromIdx(0);
    lastWordIdxRef.current = -1;
    ttsActiveRef.current = false;
    await TTSService.stop();
  };

  return (
    <View style={[styles.outer, { backgroundColor: colors.background }]}> 
      {onBack && (
        <AccessibleButton
          title="Back"
          onPress={onBack}
          style={[styles.backButton, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }] as any}
          textStyle={{ color: colors.text, fontSize: fontSize.medium }}
          accessibilityLabel="Go back"
        />
      )}
      <View style={[styles.card, { backgroundColor: colors.surface, shadowColor: '#000', borderColor: colors.border }]}> 
        <ScrollView style={styles.textContainer}>
          <Text style={[styles.text, { color: colors.text, fontSize: fontSize.large }]}> 
            {words.map((word, idx) => (
              <Text
                key={idx}
                style={
                  idx === currentWordIdx
                    ? [styles.highlightedWord, { backgroundColor: colors.primary, color: colors.onPrimary }]
                    : styles.normalWord
                }
              >
                {word}
              </Text>
            ))}
          </Text>
        </ScrollView>
        <View style={styles.controlsRow}>
          {!isPlaying && !isPaused && (
            <AccessibleButton
              title="Play"
              onPress={play}
              style={[styles.controlButton, { backgroundColor: colors.primary }] as any}
              textStyle={{ color: colors.onPrimary, fontSize: fontSize.large }}
              accessibilityLabel="Play text to speech"
            />
          )}
          {isPlaying && (
            <AccessibleButton
              title="Pause"
              onPress={pause}
              style={[styles.controlButton, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }] as any}
              textStyle={{ color: colors.text, fontSize: fontSize.large }}
              accessibilityLabel="Pause text to speech"
            />
          )}
          {isPaused && (
            <AccessibleButton
              title="Resume"
              onPress={resume}
              style={[styles.controlButton, { backgroundColor: colors.primary }] as any}
              textStyle={{ color: colors.onPrimary, fontSize: fontSize.large }}
              accessibilityLabel="Resume text to speech"
            />
          )}
          {(isPlaying || isPaused) && (
            <AccessibleButton
              title="Stop"
              onPress={stop}
              style={[styles.controlButton, { backgroundColor: colors.error }] as any}
              textStyle={{ color: colors.onError, fontSize: fontSize.large }}
              accessibilityLabel="Stop text to speech"
            />
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 500,
    borderRadius: 18,
    padding: 24,
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    borderWidth: 1,
    marginTop: 16,
    marginBottom: 16,
  },
  textContainer: {
    maxHeight: 320,
    marginBottom: 24,
  },
  text: {
    fontSize: 20,
    lineHeight: 32,
    flexWrap: 'wrap',
  },
  highlightedWord: {
    fontWeight: 'bold',
    borderRadius: 4,
    paddingHorizontal: 2,
  },
  normalWord: {
    color: '#222',
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
    gap: 12,
  },
  controlButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  backButton: {
    marginBottom: 16,
    borderRadius: 8,
    paddingVertical: 10,
    alignSelf: 'flex-start',
    paddingHorizontal: 20,
  },
});

export default TextReaderPage; 