import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Button, ScrollView } from 'react-native';
import { TTSService } from '../services/TTSService';

interface TextReaderPageProps {
  text: string;
  onBack?: () => void;
}

const WORD_DELAY = 350; // ms per word (approximate, can be tuned)

const TextReaderPage: React.FC<TextReaderPageProps> = ({ text, onBack }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentWordIdx, setCurrentWordIdx] = useState<number>(-1);
  const words = text.split(/(\s+)/); // keep spaces for accurate highlighting
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Reset state when text changes or page is mounted
  useEffect(() => {
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentWordIdx(-1);
    clearTimer();
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
    TTSService.speak(text);
    startHighlighting();
  };

  const pause = () => {
    setIsPaused(true);
    setIsPlaying(false);
    TTSService.pause();
    clearTimer();
  };

  const resume = () => {
    setIsPaused(false);
    setIsPlaying(true);
    TTSService.resume();
    startHighlighting(currentWordIdx);
  };

  const stop = () => {
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentWordIdx(-1);
    TTSService.stop();
    clearTimer();
  };

  const startHighlighting = (startIdx = 0) => {
    clearTimer();
    let idx = startIdx;
    timerRef.current = setInterval(() => {
      setCurrentWordIdx((prev) => {
        if (prev + 1 >= words.length) {
          clearTimer();
          return prev;
        }
        return prev + 1;
      });
      idx++;
      if (idx >= words.length) {
        clearTimer();
      }
    }, WORD_DELAY);
  };

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // When playback stops, reset highlight
  useEffect(() => {
    if (!isPlaying && !isPaused) {
      setCurrentWordIdx(-1);
      clearTimer();
    }
  }, [isPlaying, isPaused]);

  return (
    <View style={styles.container}>
      {onBack && <Button title="Back" onPress={onBack} />}
      <ScrollView style={styles.textContainer}>
        <Text style={styles.text}>
          {words.map((word, idx) => (
            <Text
              key={idx}
              style={
                idx === currentWordIdx
                  ? styles.highlightedWord
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
          <Button title="Play" onPress={play} />
        )}
        {isPlaying && (
          <Button title="Pause" onPress={pause} />
        )}
        {isPaused && (
          <Button title="Resume" onPress={resume} />
        )}
        {(isPlaying || isPaused) && (
          <Button title="Stop" onPress={stop} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
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
    backgroundColor: '#ffe066',
    color: '#222',
    fontWeight: 'bold',
  },
  normalWord: {
    color: '#222',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
});

export default TextReaderPage; 