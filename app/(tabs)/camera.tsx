import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { OCRScanner } from '../../components/OCRScanner';

export default function CameraTabScreen() {
  const [visible, setVisible] = useState(true);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <OCRScanner
        visible={visible}
        onClose={() => setVisible(false)}
        onTextExtracted={() => {}}
      />
    </SafeAreaView>
  );
}