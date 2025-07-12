import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { GalleryVertical as Gallery, Camera, FileText, Settings } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';

export default function TabLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 80,
          paddingBottom: 20,
          paddingTop: 8,
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
  );
}