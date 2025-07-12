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
import { X, Eye, Volume2, Share, Download, Trash2 } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { AccessibleButton } from './AccessibleButton';
import { LoadingModal } from './LoadingModal';

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
}

export function ImageModal({ image, onClose, onOCR, onTTS }: ImageModalProps) {
  const { colors, fontSize } = useTheme();
  const [isLoading, setIsLoading] = useState(false);

  const handleShare = async () => {
    // Implement sharing functionality
    Alert.alert('Share', 'Share functionality would be implemented here');
  };

  const handleDownload = async () => {
    // Implement download functionality
    Alert.alert('Download', 'Download functionality would be implemented here');
  };

  const handleDelete = async () => {
    Alert.alert(
      'Delete Image',
      'Are you sure you want to delete this image?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => {
          // Implement delete functionality
          onClose();
        }},
      ]
    );
  };

  const handleOCRPress = async () => {
    setIsLoading(true);
    try {
      await onOCR();
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
            <X size={24} color={colors.text} strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: image.uri }}
              style={styles.image}
              resizeMode="contain"
              accessible={true}
              accessibilityLabel={`Image: ${image.filename}`}
            />
          </View>

          <View style={[styles.actionsContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.actionRow}>
              <AccessibleButton
                onPress={handleOCRPress}
                style={[styles.actionButton, { backgroundColor: colors.primary }]as any}
                accessibilityLabel="Extract text from image using OCR"
                icon={<Eye size={24} color={colors.onPrimary} strokeWidth={2.5} />}
              />
              
              <AccessibleButton
                onPress={handleShare}
                style={[styles.actionButton, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]as any}
                accessibilityLabel="Share image"
                icon={<Share size={24} color={colors.text} strokeWidth={2.5} />}
              />
              
              <AccessibleButton
                onPress={handleDownload}
                style={[styles.actionButton, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]as any}
                accessibilityLabel="Download image"
                icon={<Download size={24} color={colors.text} strokeWidth={2.5} />}
              />
              
              <AccessibleButton
                onPress={handleDelete}
                style={[styles.actionButton, { backgroundColor: colors.error }]as any}
                accessibilityLabel="Delete image"
                icon={<Trash2 size={24} color={colors.onError} strokeWidth={2.5} />}
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
                  style={[styles.ttsButton, { backgroundColor: colors.primary }]as any}
                  accessibilityLabel="Read extracted text aloud"
                  icon={<Volume2 size={20} color={colors.onPrimary} strokeWidth={2.5} />}
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

        <LoadingModal visible={isLoading} text="Processing image..." />
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