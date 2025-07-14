import React from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import TextReaderPage from '../components/TextReaderPage';

const TextReaderScreen = () => {
  const router = useRouter();
  const { text } = useLocalSearchParams<{ text?: string }>();

  return (
    <TextReaderPage
      text={typeof text === 'string' ? text : ''}
      onBack={() => router.back()}
    />
  );
};

export default TextReaderScreen; 