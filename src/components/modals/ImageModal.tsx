import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppIcon, AppIcons } from '@/components/AppIcon';
import { useTheme } from '@/hooks/useTheme';
import { AccessibleButton } from '../buttons/AccessibleButton';
import { LoadingModal } from './LoadingModal';
import ImageCropPicker from 'react-native-image-crop-picker';

interface ImageItem {
  id: string;
  uri: string;
  filename: string;
  creationTime: number;
  ocrText?: string;
}

interface ImageModalProps {
  image: ImageItem;
  onClose: () => void;
  onOCR: () => void;
  onTTS: (text: string) => void;
  onDelete?: () => void;
  onShare?: () => void;
}

export function ImageModal({ image, onClose, onOCR, onTTS, onDelete, onShare }: ImageModalProps) {
  const { colors, fontSize } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [croppedUri, setCroppedUri] = useState<string | null>(null);

  const handleShare = () => {
    if (onShare) onShare();
  };

  const handleDelete = () => {
    if (onDelete) {
      Alert.alert(
        'Delete Image',
        'Are you sure you want to delete this image?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: () => onDelete() },
        ]
      );
    }
  };

  const handleOCRPress = async () => {
    setIsLoading(true);
    try {
      await onOCR();
    } finally {
      setIsLoading(false);
    }
  };

  const handleCrop = async () => {
    try {
      setIsLoading(true);
      const result = await ImageCropPicker.openCropper({
        path: croppedUri || image.uri,
        mediaType: 'photo',
        cropping: true,
        cropperToolbarTitle: 'Crop Image',
      });
      if (result && result.path) {
        setCroppedUri(result.path);
      }
    } catch (error: any) {
      if (error?.message !== 'User cancelled image selection') {
        Alert.alert('Crop Error', 'Failed to crop image');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={true}
      animationType="slide"
      presentationStyle="fullScreen"
      accessible={true}
      accessibilityViewIsModal={true}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <Text 
            style={[styles.headerTitle, { color: colors.text, fontSize: fontSize.large }]}
            numberOfLines={1}
            accessible={true}
            accessibilityRole="header"
          >
            {image.filename}
          </Text>
          <TouchableOpacity
            onPress={onClose}
            style={[styles.closeButton, { backgroundColor: colors.background }]}
            accessible={true}
            accessibilityLabel="Close image viewer"
            accessibilityRole="button"
          >
            <AppIcon icon={AppIcons.X} size={24} color={colors.text} strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
        {editVisible ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
            <Image
              source={{ uri: croppedUri || image.uri }}
              style={{ width: '100%', height: '70%', borderRadius: 12, backgroundColor: colors.surface, transform: [{ rotate: `${rotation}deg` }] }}
              resizeMode="contain"
              accessible={true}
              accessibilityLabel={`Image: ${image.filename}`}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginTop: 24 }}>
              <TouchableOpacity onPress={handleCrop} style={[styles.actionButton, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }] as any} accessibilityLabel="Crop image">
                <AppIcon icon={AppIcons.Crop} size={28} color={colors.text} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setRotation((r) => (r + 90) % 360)} style={[styles.actionButton, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }] as any} accessibilityLabel="Rotate image">
                <AppIcon icon={AppIcons.RotateCcw} size={28} color={colors.text} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => {
                setEditVisible(false);
                if (onDelete) {
                  Alert.alert(
                    'Delete Image',
                    'Are you sure you want to delete this image?',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Delete', style: 'destructive', onPress: () => onDelete() },
                    ]
                  );
                }
              }} style={[styles.actionButton, { backgroundColor: colors.error }] as any} accessibilityLabel="Delete image">
                <AppIcon icon={AppIcons.Trash2} size={28} color={colors.onError} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setEditVisible(false)} style={[styles.actionButton, { backgroundColor: colors.primary }] as any} accessibilityLabel="Close edit">
                <AppIcon icon={AppIcons.X} size={28} color={colors.onPrimary} />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <ScrollView 
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: image.uri }}
                style={{ width: '100%', height: 320, borderRadius: 12, backgroundColor: colors.surface }}
                resizeMode="contain"
                accessible={true}
                accessibilityLabel={`Image: ${image.filename}`}
              />
            </View>
            <View style={[styles.actionsContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
              <View style={styles.actionRow}>
                <AccessibleButton
                  onPress={handleOCRPress}
                  style={[styles.actionButton, { backgroundColor: colors.primary }] as any}
                  accessibilityLabel="Extract text from image using OCR"
                  icon={<AppIcon icon={AppIcons.Eye} size={24} color={colors.onPrimary} strokeWidth={2.5} />}
                />
                <AccessibleButton
                  onPress={() => setEditVisible(true)}
                  style={[styles.actionButton, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }] as any}
                  accessibilityLabel="Edit image"
                  icon={<AppIcon icon={AppIcons.Pencil} size={24} color={colors.text} strokeWidth={2.5} />}
                />
                <AccessibleButton
                  onPress={handleShare}
                  style={[styles.actionButton, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }] as any}
                  accessibilityLabel="Share image"
                  icon={<AppIcon icon={AppIcons.Send} size={24} color={colors.text} strokeWidth={2.5} />}
                />
                <AccessibleButton
                  onPress={() => setDetailsVisible(true)}
                  style={[styles.actionButton, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }] as any}
                  accessibilityLabel="Show image details"
                  icon={<AppIcon icon={AppIcons.Info} size={24} color={colors.text} strokeWidth={2.5} />}
                />
              </View>
            </View>
            {image.ocrText && (
              <View style={[styles.textContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
                <View style={styles.textHeader}>
                  <Text style={[styles.textTitle, { color: colors.text, fontSize: fontSize.large }]}> 
                    Extracted Text
                  </Text>
                  <AccessibleButton
                    onPress={() => onTTS(image.ocrText!)}
                    style={[styles.ttsButton, { backgroundColor: colors.primary }] as any}
                    accessibilityLabel="Read extracted text aloud"
                    icon={<AppIcon icon={AppIcons.Volume2} size={20} color={colors.onPrimary} strokeWidth={2.5} />}
                  />
                </View>
                <ScrollView style={styles.textScrollView} nestedScrollEnabled>
                  <Text 
                    style={[styles.extractedText, { color: colors.text, fontSize: fontSize.medium }]}
                    selectable={true}
                    accessible={true}
                    accessibilityLabel="Extracted text from image"
                  >
                    {image.ocrText}
                  </Text>
                </ScrollView>
              </View>
            )}
          </ScrollView>
        )}

        <LoadingModal visible={isLoading} text="Processing image..." />

        {/* Details Modal */}
        <Modal
          visible={detailsVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setDetailsVisible(false)}
        >
          <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'center', alignItems: 'center' }} activeOpacity={1} onPress={() => setDetailsVisible(false)}>
            <View style={{ width: 300, borderRadius: 12, borderWidth: 1, padding: 20, backgroundColor: colors.surface, borderColor: colors.border }}>
              <Text style={{ fontWeight: 'bold', fontSize: fontSize.large, color: colors.text, marginBottom: 8 }}>Image Details</Text>
              <Text style={{ color: colors.text, marginBottom: 4 }}>Name: {image.filename}</Text>
              <Text style={{ color: colors.text, marginBottom: 4 }}>Date: {new Date(image.creationTime * 1000).toLocaleString()}</Text>
              <Text style={{ color: colors.text, marginBottom: 4 }}>URI: {image.uri}</Text>
              <TouchableOpacity onPress={() => setDetailsVisible(false)} style={{ marginTop: 12, alignSelf: 'flex-end' }}>
                <Text style={{ color: colors.primary, fontWeight: 'bold' }}>Close</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      </SafeAreaView>
    </Modal>
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
    fontWeight: '600',
    marginRight: 16,
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
  contentContainer: {
    padding: 16,
  },
  imageContainer: {
    aspectRatio: 1,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  actionsContainer: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 12,
  },
  actionButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  textHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  textTitle: {
    fontWeight: '600',
  },
  ttsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textScrollView: {
    maxHeight: 200,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  extractedText: {
    lineHeight: 24,
  },
});