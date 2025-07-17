import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  StyleSheet,
  RefreshControl,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { Share, Trash2, Eye } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { AppHeader } from '../../components/AppHeader';
import { AccessibleButton } from '@/components/AccessibleButton';
import { ImageModal } from '@/components/ImageModal';
import { OCRService } from '@/services/OCRService';
import { TTSService } from '@/services/TTSService';

interface ImageItem {
  id: string;
  uri: string;
  filename: string;
  creationTime: number;
  ocrText?: string;
}

export default function GalleryScreen() {
  const { colors, fontSize } = useTheme();
  const [images, setImages] = useState<ImageItem[]>([]);
  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [sortModalVisible, setSortModalVisible] = useState(false);

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant media library access to view images');
        return;
      }

      const media = await MediaLibrary.getAssetsAsync({
        mediaType: 'photo',
        first: 50,
        sortBy: 'creationTime',
      });

      const imageItems: ImageItem[] = media.assets.map(asset => ({
        id: asset.id,
        uri: asset.uri,
        filename: asset.filename,
        creationTime: asset.creationTime,
      }));

      setImages(imageItems);
    } catch (error) {
      Alert.alert('Error', 'Failed to load images');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const handleImagePress = (image: ImageItem) => {
    setSelectedImage(image);
  };

  const handleOCR = async (image: ImageItem) => {
    try {
      const ocrText = await OCRService.extractText(image.uri);
      const updatedImage = { ...image, ocrText };
      setSelectedImage(updatedImage);
      
      // Update the image in the list
      setImages(prev => prev.map(img => 
        img.id === image.id ? updatedImage : img
      ));
    } catch (error) {
      Alert.alert('OCR Error', 'Failed to extract text from image');
    }
  };

  const handleTTS = async (text: string) => {
    try {
      await TTSService.speak(text);
    } catch (error) {
      Alert.alert('TTS Error', 'Failed to read text aloud');
    }
  };

  const handleDelete = async (image: ImageItem) => {
    try {
      await MediaLibrary.deleteAssetsAsync([image.id]);
      setImages(prev => prev.filter(img => img.id !== image.id));
      setSelectedImage(null);
    } catch (error) {
      Alert.alert('Delete Error', 'Failed to delete image');
    }
  };

  const handleShare = async (image: ImageItem) => {
    try {
      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert('Sharing not available on this device');
        return;
      }
      await Sharing.shareAsync(image.uri, {
        mimeType: 'image/jpeg',
        dialogTitle: `Share ${image.filename}`,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share image');
    }
  };

  const handleSort = (by: 'name' | 'date' | 'size') => {
    if (sortBy === by) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(by);
      setSortOrder('asc');
    }
  };

  const sortedImages = [...images].sort((a, b) => {
    let cmp = 0;
    if (sortBy === 'name') {
      cmp = a.filename.localeCompare(b.filename);
    } else if (sortBy === 'date') {
      cmp = a.creationTime - b.creationTime;
    } else if (sortBy === 'size') {
      // No size info, fallback to name
      cmp = a.filename.localeCompare(b.filename);
    }
    return sortOrder === 'asc' ? cmp : -cmp;
  });

  function getSortLabel(sortBy: 'name' | 'date' | 'size', sortOrder: 'asc' | 'desc') {
    if (sortBy === 'date') return sortOrder === 'asc' ? 'First Uploaded' : 'Recently Added';
    if (sortBy === 'name') return sortOrder === 'asc' ? 'Alphabetical Order' : 'Reverse Alphabetical';
    if (sortBy === 'size') return sortOrder === 'asc' ? 'Smallest Files First' : 'Biggest Files First';
    return '';
  }

  const renderImageItem = ({ item }: { item: ImageItem }) => (
    <TouchableOpacity
      style={[styles.imageContainer, { borderColor: colors.border }]}
      onPress={() => handleImagePress(item)}
      accessible={true}
      accessibilityLabel={`Image ${item.filename}`}
      accessibilityHint="Double tap to view image details"
      accessibilityRole="button"
    >
      <Image
        source={{ uri: item.uri }}
        style={styles.thumbnailImage}
        accessible={false}
      />
      <Text 
        style={[styles.imageTitle, { color: colors.text, fontSize: fontSize.small }]}
        numberOfLines={1}
      >
        {item.filename}
      </Text>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.centered}>
          <Text style={[styles.loadingText, { color: colors.text, fontSize: fontSize.large }]}>
            Loading images...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}> 
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4, paddingHorizontal: 16 }}>
        <Text style={{ color: colors.text, fontWeight: '600', fontSize: fontSize.medium }}>
          {getSortLabel(sortBy, sortOrder) || ' '}
        </Text>
        <TouchableOpacity onPress={() => setSortModalVisible(true)} style={{ padding: 4 }} accessibilityLabel="Sort Images">
          <Text style={{ color: colors.primary, fontWeight: 'bold' }}>Sort</Text>
        </TouchableOpacity>
      </View>
      {sortedImages.length === 0 ? (
        <View style={styles.centered}>
          <Text style={[styles.emptyText, { color: colors.textSecondary, fontSize: fontSize.large }]}>
            No images found
          </Text>
          <Text style={[styles.emptySubtext, { color: colors.textSecondary, fontSize: fontSize.medium }]}>
            Take some photos with the camera to see them here
          </Text>
        </View>
      ) : (
        <FlatList
          data={sortedImages}
          renderItem={renderImageItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.imageGrid}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                loadImages();
              }}
              tintColor={colors.primary}
            />
          }
          accessible={true}
          accessibilityLabel="Image gallery grid"
        />
      )}
      {selectedImage && (
        <ImageModal
          image={selectedImage}
          onClose={() => setSelectedImage(null)}
          onOCR={() => handleOCR(selectedImage)}
          onTTS={handleTTS}
          onDelete={() => handleDelete(selectedImage)}
          onShare={() => handleShare(selectedImage)}
        />
      )}
      {/* Sort Modal */}
      <Modal
        visible={sortModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSortModalVisible(false)}
      >
        <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'center', alignItems: 'center' }} activeOpacity={1} onPress={() => setSortModalVisible(false)}>
          <View style={{ width: 220, borderRadius: 12, borderWidth: 1, paddingVertical: 8, alignItems: 'stretch', elevation: 4, backgroundColor: colors.surface, borderColor: colors.border }}>
            {['name', 'date', 'size'].map((by) => (
              <TouchableOpacity
                key={by}
                style={{ paddingVertical: 14, paddingHorizontal: 20 }}
                onPress={() => {
                  handleSort(by as 'name' | 'date' | 'size');
                  setSortModalVisible(false);
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: '500', color: colors.text }}>
                  Sort by {by.charAt(0).toUpperCase() + by.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={{ paddingVertical: 14, paddingHorizontal: 20 }}
              onPress={() => {
                setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
                setSortModalVisible(false);
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: '500', color: colors.text }}>
                Invert Order
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
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
  loadingText: {
    textAlign: 'center',
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    textAlign: 'center',
  },
  imageGrid: {
    padding: 16,
  },
  imageContainer: {
    flex: 1,
    margin: 8,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    minHeight: 120,
  },
  thumbnailImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  imageTitle: {
    padding: 8,
    fontWeight: '500',
  },
});