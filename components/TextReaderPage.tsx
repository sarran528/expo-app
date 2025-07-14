import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
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
  const words = text.split(/(\s+)/); // keep spaces for accurate highlighting
  const lastWordIdxRef = useRef<number>(-1);

  // Reset state when text changes or page is mounted
  useEffect(() => {
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentWordIdx(-1);
    lastWordIdxRef.current = -1;
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
    setCurrentWordIdx(0);
    lastWordIdxRef.current = 0;
    await TTSService.speakWithWordBoundary(text, {}, (wordIdx) => {
      setCurrentWordIdx(wordIdx);
      lastWordIdxRef.current = wordIdx;
      if (wordIdx === -1) {
        setIsPlaying(false);
        setIsPaused(false);
      }
    });
  };

  const pause = async () => {
    setIsPaused(true);
    setIsPlaying(false);
    await TTSService.pause();
  };

  const resume = async () => {
    setIsPaused(false);
    setIsPlaying(true);
    await TTSService.resume();
    // No need to restart highlight, onBoundary will continue
  };

  const stop = async () => {
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentWordIdx(-1);
    lastWordIdxRef.current = -1;
    await TTSService.stop();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      {onBack && (
        <AccessibleButton
          title="Back"
          onPress={onBack}
          style={[styles.backButton, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }] as any}
          textStyle={{ color: colors.text, fontSize: fontSize.medium }}
          accessibilityLabel="Go back"
        />
      )}
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
      <View style={styles.controls}>
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  textContainer: {
    flex: 1,
    marginBottom: 20,
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
  controls: {
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