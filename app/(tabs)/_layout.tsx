import { Tabs, useSegments } from 'expo-router';
import { View } from 'react-native';
import { GalleryVertical as Gallery, Camera, FileText } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { AppHeader } from '../../components/AppHeader';
import React, { createContext, useContext, useState } from 'react';

const TAB_TITLES: Record<string, string> = {
  gallery: 'Gallery',
  camera: 'Camera',
  pdf: 'PDF Viewer',
};

// Context to control scanner visibility globally
const OCRScannerContext = createContext<{
  cameraActive: boolean;
  setCameraActive: (open: boolean) => void;
}>({ cameraActive: false, setCameraActive: () => {} });

export function useOCRScanner() {
  return useContext(OCRScannerContext);
}

function TabHeader() {
  const segments = useSegments();
  const { cameraActive } = useOCRScanner();
  if (cameraActive) return null;
  const tab = [...segments].reverse().find(seg => seg in TAB_TITLES) || 'gallery';
  const title = TAB_TITLES[tab] || '';
  return <AppHeader title={title} />;
}

export default function TabLayout() {
  const { colors } = useTheme();
  const [cameraActive, setCameraActive] = useState(false);

  return (
    <OCRScannerContext.Provider value={{ cameraActive, setCameraActive }}>
      <View style={{ flex: 1 }}>
        <TabHeader />
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 80,
          paddingBottom: 20,
          paddingTop: 8,
              display: cameraActive ? 'none' : 'flex',
        },
        tabBarLabelStyle: {
          fontSize: 14,
          fontWeight: '600',
          marginTop: 4,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
      }}>
      <Tabs.Screen
        name="gallery"
        options={{
          title: 'Gallery',
          tabBarIcon: ({ size, color }) => (
            <View 
              accessible={true}
              accessibilityLabel="Gallery tab"
              accessibilityRole="button"
            >
              <Gallery size={size} color={color} strokeWidth={2.5} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="camera"
        options={{
          title: 'Camera',
          tabBarIcon: ({ size, color }) => (
            <View 
              accessible={true}
              accessibilityLabel="Camera tab"
              accessibilityRole="button"
            >
              <Camera size={size} color={color} strokeWidth={2.5} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="pdf"
        options={{
          title: 'PDF',
          tabBarIcon: ({ size, color }) => (
            <View 
              accessible={true}
              accessibilityLabel="PDF viewer tab"
              accessibilityRole="button"
            >
              <FileText size={size} color={color} strokeWidth={2.5} />
            </View>
          ),
        }}
      />
    </Tabs>
      </View>
    </OCRScannerContext.Provider>
  );
}