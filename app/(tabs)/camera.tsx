import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, CameraType, useCameraPermissions, FlashMode } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { Camera as CameraIcon, RotateCcw, Zap, ZapOff, Image as ImageIcon, Volume2 } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { Header } from '@/components/Header';
import { AccessibleButton } from '@/components/AccessibleButton';
import { OCRService } from '@/services/OCRService';
import { TTSService } from '@/services/TTSService';
import { LoadingModal } from '@/components/LoadingModal';

export default function CameraScreen() {
  const { colors, fontSize } = useTheme();
  const [facing, setFacing] = useState<CameraType>('back');
  const [flash, setFlash] = useState<FlashMode>('off');
  const [permission, requestPermission] = useCameraPermissions();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    const cameraPermission = await requestPermission();
    const mediaLibraryPermission = await MediaLibrary.requestPermissionsAsync();
    
    if (!cameraPermission?.granted || mediaLibraryPermission.status !== 'granted') {
      Alert.alert(
        'Permissions Required',
        'Camera and media library permissions are needed to use this feature'
      );
    }
  };

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const toggleFlash = () => {
    setFlash(current => (current === 'off' ? 'on' : 'off'));
  };

  const takePicture = async () => {
    if (!cameraRef.current) return;

    try {
      setIsLoading(true);
      setLoadingText('Capturing image...');

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });

      if (photo) {
        await MediaLibrary.saveToLibraryAsync(photo.uri);
        await processImageForOCR(photo.uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take picture');
    } finally {
      setIsLoading(false);
    }
  };

  const pickImageFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: true,
      });

      if (!result.canceled && result.assets[0]) {
        await processImageForOCR(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const processImageForOCR = async (imageUri: string) => {
    Alert.alert(
      'Apply OCR?',
      'Would you like to extract text from this image?',
      [
        {
          text: 'Skip',
          style: 'cancel',
        },
        {
          text: 'Extract Text',
          onPress: async () => {
            try {
              setIsLoading(true);
              setLoadingText('Extracting text...');
              
              const extractedText = await OCRService.extractText(imageUri);
              
              if (extractedText.trim()) {
                Alert.alert(
                  'Text Extracted',
                  extractedText,
                  [
                    {
                      text: 'Close',
                      style: 'cancel',
                    },
                    {
                      text: 'Read Aloud',
                      onPress: () => TTSService.speak(extractedText),
                    },
                  ]
                );
              } else {
                Alert.alert('No Text Found', 'No readable text was detected in this image');
              }
            } catch (error) {
              Alert.alert('OCR Error', 'Failed to extract text from image');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  if (!permission) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Header title="Camera" />
        <View style={styles.centered}>
          <Text style={[styles.permissionText, { color: colors.text, fontSize: fontSize.large }]}>
            Loading camera...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Header title="Camera" />
        <View style={styles.centered}>
          <Text style={[styles.permissionText, { color: colors.text, fontSize: fontSize.large }]}>
            Camera permission is required
          </Text>
          <AccessibleButton
            title="Grant Permission"
            onPress={requestPermission}
            style={[styles.permissionButton, { backgroundColor: colors.primary }] as any}
            textStyle={{ color: colors.onPrimary, fontSize: fontSize.large }}
            accessibilityLabel="Grant camera permission"
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Camera" />
      
      <View style={styles.cameraContainer}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing={facing}
          flash={flash}
          accessible={false}
        />
        
        <View style={[styles.controlsOverlay, { backgroundColor: colors.overlay }]}>
          <View style={styles.topControls}>
            <AccessibleButton
              onPress={toggleFlash}
              style={[styles.controlButton, { backgroundColor: colors.surface }] as any}
              accessibilityLabel={`Flash is ${flash === 'on' ? 'on' : 'off'}. Tap to toggle`}
            >
              {flash === 'on' ? (
                <Zap size={28} color={colors.primary} strokeWidth={2.5} />
              ) : (
                <ZapOff size={28} color={colors.textSecondary} strokeWidth={2.5} />
              )}
            </AccessibleButton>
          </View>
          
          <View style={styles.bottomControls}>
            <AccessibleButton
              onPress={pickImageFromGallery}
              style={[styles.controlButton, { backgroundColor: colors.surface }] as any}
              accessibilityLabel="Import image from gallery"
            >
              <ImageIcon size={28} color={colors.text} strokeWidth={2.5} />
            </AccessibleButton>
            
            <AccessibleButton
              onPress={takePicture}
              style={[styles.captureButton, { backgroundColor: colors.primary }] as any}
              accessibilityLabel="Capture photo"
            >
              <CameraIcon size={32} color={colors.onPrimary} strokeWidth={2.5} />
            </AccessibleButton>
            
            <AccessibleButton
              onPress={toggleCameraFacing}
              style={[styles.controlButton, { backgroundColor: colors.surface }] as any}
              accessibilityLabel={`Switch to ${facing === 'back' ? 'front' : 'back'} camera`}
            >
              <RotateCcw size={28} color={colors.text} strokeWidth={2.5} />
            </AccessibleButton>
          </View>
        </View>
      </View>

      <LoadingModal 
        visible={isLoading} 
        text={loadingText}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  permissionText: {
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '600',
  },
  permissionButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  controlsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
    padding: 24,
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
});