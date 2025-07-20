import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  Alert,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { CameraView, CameraType } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { AppIcon, AppIcons } from '@/components/AppIcon';
import { useTheme } from '@/hooks/useTheme';
import { AccessibleButton } from '../buttons/AccessibleButton';
import { OCRService, extractTextFromImage } from '@/services/OCRService';
import { useRouter } from 'expo-router';
import { useOCRScanner } from '../../../app/(tabs)/_layout';

interface OCRScannerProps {
  onTextExtracted: (text: string, imageUri: string) => void;
  onClose: () => void;
  visible: boolean;
}

export function OCRScanner({ onTextExtracted, onClose, visible }: OCRScannerProps) {
  const { colors, fontSize } = useTheme();
  const [facing, setFacing] = useState<CameraType>('back');
  const [flash, setFlash] = useState<'off' | 'on'>('off');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const cameraRef = useRef<CameraView>(null);
  const router = useRouter();
  const { setCameraActive } = useOCRScanner();

  useEffect(() => {
    if (visible) {
      setCameraActive(true);
    }
    return () => {
      setCameraActive(false);
    };
  }, [visible, setCameraActive]);

  if (!visible) return null;

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const toggleFlash = () => {
    setFlash(current => (current === 'off' ? 'on' : 'off'));
  };

  const takePicture = async () => {
    if (!cameraRef.current) return;

    try {
      setProcessingStatus('Capturing image...');
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.5, // Lowered from 0.8 for efficiency
        base64: false,
      });

      if (photo) {
        setCapturedImage(photo.uri);
        await processImageForOCR(photo.uri);
      }
    } catch (error) {
      console.error('Error taking picture:', error);
      Alert.alert('Error', 'Failed to capture image. Please try again.');
    }
  };

  const pickImageFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.5, // Lowered from 0.8 for efficiency
        allowsEditing: true,
      });

      if (!result.canceled && result.assets[0]) {
        setCapturedImage(result.assets[0].uri);
        await processImageForOCR(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image from gallery.');
    }
  };

  const processImageForOCR = async (imageUri: string) => {
    try {
      setIsProcessing(true);
      setProcessingStatus('Optimizing image...');

      // Resize image to max 1024px on the longest side for efficiency
      const manipResult = await ImageManipulator.manipulateAsync(
        imageUri,
        [{ resize: { width: 1024 } }], // You can adjust to height: 1024 if needed
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );

      setProcessingStatus('Processing image...');
      const extractedText = await extractTextFromImageLocal(manipResult.uri);

      if (extractedText.trim()) {
        onTextExtracted(extractedText, manipResult.uri);
        router.push({ pathname: '/text-reader', params: { text: extractedText } });
      } else {
        Alert.alert('No Text Found', 'No readable text was detected in this image. Please try with a clearer image.');
      }
    } catch (error) {
      console.error('OCR processing error:', error);
      Alert.alert(
        'OCR Error', 
        error instanceof Error ? error.message : 'Failed to extract text from image. Please try again.'
      );
    } finally {
      setIsProcessing(false);
      setProcessingStatus('');
    }
  };

  const extractTextFromImageLocal = async (imageUri: string): Promise<string> => {
    try {
      setProcessingStatus('Preparing image for OCR...');
      // Prepare the image (resize, compress, get base64)
      const processedImage = await ImageManipulator.manipulateAsync(
        imageUri,
        [{ resize: { width: 1200 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG, base64: true }
      );
      setProcessingStatus('Uploading image to OCR API...');
      // Use the service function for OCR
      return await extractTextFromImage(processedImage.base64!);
    } catch (error) {
      console.error('OCR API error:', error);
      return '';
    }
  };

  const resetScanner = () => {
    setCapturedImage(null);
    setIsProcessing(false);
    setProcessingStatus('');
  };

  const retryOCR = () => {
    if (capturedImage) {
      processImageForOCR(capturedImage);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      {/* Main Content */}
      <View style={styles.content}>
        {capturedImage ? (
          // Image Preview Mode
          <View style={styles.previewContainer}>
            <Image
              source={{ uri: capturedImage }}
              style={styles.previewImage}
              resizeMode="contain"
              accessible={true}
              accessibilityLabel="Captured image for OCR processing"
            />
            
            {isProcessing ? (
              <View style={[styles.processingOverlay, { backgroundColor: colors.overlay }]}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[styles.processingText, { color: colors.text, fontSize: fontSize.medium }]}>
                  {processingStatus}
                </Text>
              </View>
            ) : (
              <View style={styles.previewControls}>
                <AccessibleButton
                  title="Retake"
                  onPress={resetScanner}
                  style={[styles.controlButton, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]as any}
                  textStyle={{ color: colors.text, fontSize: fontSize.medium }}
                  accessibilityLabel="Retake photo"
                />
                
                <AccessibleButton
                  title="Process OCR"
                  onPress={retryOCR}
                  style={[styles.controlButton, { backgroundColor: colors.primary }]as any}
                  textStyle={{ color: colors.onPrimary, fontSize: fontSize.medium }}
                  accessibilityLabel="Process image with OCR"
                  icon={<AppIcons.Eye />}
                />
              </View>
            )}
          </View>
        ) : (
          // Camera Mode
          <View style={styles.cameraContainer}>
            <CameraView
              ref={cameraRef}
              style={styles.camera}
              facing={facing}
              flash={flash}
              accessible={false}
            />
            <View style={[styles.cameraOverlay, { backgroundColor: colors.overlay }]}> 
              {/* Top Controls: Flash left, X right */}
              <View style={styles.topControlsRowBetween}>
                <AccessibleButton
                  onPress={toggleFlash}
                  style={[styles.overlayButton, { backgroundColor: colors.surface }] as any}
                  accessibilityLabel={`Flash is ${flash === 'on' ? 'on' : 'off'}. Tap to toggle`}
                  icon={flash === 'on' ? (
                    <AppIcons.Zap />
                  ) : (
                    <AppIcons.ZapOff />
                  )}
                />
                <AccessibleButton
                  onPress={onClose}
                  style={[styles.overlayButton, { backgroundColor: colors.surface }] as any}
                  accessibilityLabel="Close OCR scanner"
                  icon={<AppIcons.X />}
                />
              </View>
              {/* Bottom Controls: Evenly spaced */}
              <View style={styles.bottomControlsRow}>
                <AccessibleButton
                  onPress={pickImageFromGallery}
                  style={[styles.overlayButton, { backgroundColor: colors.surface }] as any}
                  accessibilityLabel="Import image from gallery"
                  icon={<AppIcons.ImageIcon />}
                />
                <AccessibleButton
                  onPress={takePicture}
                  disabled={isProcessing}
                  style={[styles.captureButton, { backgroundColor: colors.primary }] as any}
                  accessibilityLabel="Capture photo for OCR"
                  icon={<AppIcons.Camera />}
                />
                <AccessibleButton
                  onPress={toggleCameraFacing}
                  style={[styles.overlayButton, { backgroundColor: colors.surface }] as any}
                  accessibilityLabel={`Switch to ${facing === 'back' ? 'front' : 'back'} camera`}
                  icon={<AppIcons.RotateCcw />}
                />
              </View>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    flex: 1,
    fontWeight: '700',
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
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
  overlayButton: {
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
  spacer: {
    width: 56,
  },
  previewContainer: {
    flex: 1,
    position: 'relative',
  },
  previewImage: {
    flex: 1,
    width: '100%',
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingText: {
    marginTop: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  previewControls: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 16,
  },
  controlButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
  },
  instructions: {
    padding: 16,
    borderTopWidth: 1,
  },
  instructionText: {
    textAlign: 'center',
    lineHeight: 20,
  },
  topControlsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 8,
    marginRight: 8,
  },
  bottomControlsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-evenly',
    marginBottom: 24,
    marginRight: 8,
    gap: 12,
  },
  topControlsRowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginHorizontal: 8,
  },
});