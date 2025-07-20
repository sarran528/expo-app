import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import { FileText, Upload, Volume2, VolumeX, Play, Pause, Square, ArrowLeft } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { AppHeader } from '@/components/headers/AppHeader';
import { AccessibleButton } from '@/components/buttons/AccessibleButton';
import { TTSService } from '@/services/TTSService';
import { LoadingModal } from '@/components/modals/LoadingModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PDFListSection } from '@/components/documents/PDFListSection';
import Pdf from 'react-native-pdf';
import { usePDFViewer } from './_layout';
import { useFocusEffect } from '@react-navigation/native';
import { BackHandler } from 'react-native';

interface PDFDocument {
  uri: string;
  name: string;
  size: number;
  date: string; // ISO string
  extractedText?: string;
}

function PDFScreen() {
  const { colors, fontSize } = useTheme();
  const [selectedPDF, setSelectedPDF] = useState<PDFDocument | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [pdfList, setPdfList] = useState<PDFDocument[]>([]);
  const { setPdfOpen } = usePDFViewer();
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Load PDFs from storage on mount
  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem('uploadedPDFs');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Ensure all PDFs have a 'date' field
        const withDate = parsed.map((pdf: any) => ({
          ...pdf,
          date: pdf.date || new Date().toISOString(),
        }));
        setPdfList(withDate);
      }
    })();
  }, []);

  // Save PDFs to storage when pdfList changes
  useEffect(() => {
    AsyncStorage.setItem('uploadedPDFs', JSON.stringify(pdfList));
  }, [pdfList]);

  useEffect(() => {
    setPdfOpen(!!selectedPDF);
    return () => setPdfOpen(false);
  }, [selectedPDF]);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (selectedPDF) {
          setSelectedPDF(null);
          return true; // Prevent default back action
        }
        return false; // Allow default back action
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => {
        subscription.remove();
      };
    }, [selectedPDF])
  );

  const handlePDFSelect = (pdf: PDFDocument) => {
    setSelectedPDF(pdf);
  };

  const pickPDF = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const localUri = asset.uri;
        if (typeof localUri !== 'string' || !localUri) {
          Alert.alert('Error', 'No file URI found for the selected PDF.');
          return;
        }
        const fileName = asset.name ? asset.name : `pdf_${Date.now()}.pdf`;
        let finalUri = localUri; // Now always a string
        // For Expo Go, we cannot use react-native-pdf, so just use the uri as is for WebView
        const pdfDoc: PDFDocument = {
          uri: finalUri,
          name: fileName,
          size: asset.size || 0,
          date: new Date().toISOString(), // Add current date
        };
        Alert.alert(
          "Open PDF",
          "Do you want to open this PDF?",
          [
            {
              text: "No",
              onPress: () => {
                setPdfList(prev => [pdfDoc, ...prev.filter(p => p.uri !== pdfDoc.uri)]);
              },
              style: "cancel"
            },
            {
              text: "Yes",
              onPress: () => {
                setPdfList(prev => [pdfDoc, ...prev.filter(p => p.uri !== pdfDoc.uri)]);
                setSelectedPDF(pdfDoc);
              }
            }
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick PDF document');
    }
  };

  const handlePlayPause = async () => {
    if (!selectedPDF?.extractedText) return;
    try {
      if (isPlaying) {
        await TTSService.stop();
        setIsPlaying(false);
      } else {
        await TTSService.speak(selectedPDF.extractedText);
        setIsPlaying(true);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to control text-to-speech');
      setIsPlaying(false);
    }
  };

  const handleStop = async () => {
    try {
      await TTSService.stop();
      setIsPlaying(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to stop text-to-speech');
    }
  };

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
    // In a real implementation, you would adjust TTS volume
  };

  const handleDeletePDF = async (pdf: PDFDocument) => {
    // Remove from state
    setPdfList(prev => prev.filter(p => p.uri !== pdf.uri));
    // Remove from AsyncStorage
    const updatedList = pdfList.filter(p => p.uri !== pdf.uri);
    await AsyncStorage.setItem('uploadedPDFs', JSON.stringify(updatedList));
    // If the deleted PDF was open, close it
    if (selectedPDF?.uri === pdf.uri) setSelectedPDF(null);
  };

  const handleSharePDF = async (pdf: PDFDocument) => {
    try {
      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert('Sharing not available on this device');
        return;
      }
      await Sharing.shareAsync(pdf.uri, {
        mimeType: 'application/pdf',
        dialogTitle: `Share ${pdf.name}`,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share PDF');
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

  const sortedPDFs = [...pdfList].sort((a, b) => {
    let cmp = 0;
    if (sortBy === 'name') {
      cmp = a.name.localeCompare(b.name);
    } else if (sortBy === 'date') {
      cmp = new Date(a.date).getTime() - new Date(b.date).getTime();
    } else if (sortBy === 'size') {
      cmp = a.size - b.size;
    }
    return sortOrder === 'asc' ? cmp : -cmp;
  });

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}> 
      {/* PDF Viewer Fullscreen */}
      {selectedPDF ? (
        <View style={{ flex: 1, backgroundColor: colors.background , paddingTop: -20 }}>
          {/* Top bar */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingTop: 18,
              paddingBottom: 12,
              paddingHorizontal: 12,
              backgroundColor: colors.background,
              height: 64, // Fixed height for the top bar
            }}
          >
            <TouchableOpacity
              onPress={() => setSelectedPDF(null)}
              accessibilityLabel="Go back"
              style={{
                width: 40,
                height: 40,
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 20,
                backgroundColor: colors.surface,
                elevation: 2,
                marginRight: 12,
                
              }}
            >
              <ArrowLeft size={28} color={colors.primary} />
            </TouchableOpacity>
            <Text
              style={{
                color: colors.text,
                fontWeight: '600',
                fontSize: fontSize.large,
                flexShrink: 1,
              }}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {selectedPDF.name}
            </Text>
          </View>
          {/* PDF fills the rest */}
          <Pdf
            source={{ uri: selectedPDF.uri }}
            style={{ flex: 1, backgroundColor: colors.background ,height: 180}}
            onError={(error) => {
              Alert.alert('PDF Error', (error as any).message || String(error));
            }}
            trustAllCerts={false}
          />
        </View>
      ) : (
        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          accessible={true}
          accessibilityLabel="PDF viewer content"
        >
          <PDFListSection
            pdfs={sortedPDFs}
            onSelect={handlePDFSelect}
            selectedPDF={selectedPDF}
            onDelete={handleDeletePDF}
            onShare={handleSharePDF}
            onSort={handleSort}
            onInvertSort={() => setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'))}
            sortBy={sortBy}
            sortOrder={sortOrder}
          />
          <View style={styles.emptyState}>
            <TouchableOpacity
              onPress={pickPDF}
              accessibilityLabel="Import PDF document"
              style={{
                width: 72,
                height: 72,
                borderRadius: 36,
                backgroundColor: colors.primary,
                justifyContent: 'center',
                alignItems: 'center',
                shadowColor: '#000',
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 4,
                marginTop: 200,
              }}
            >
              <Text style={{ color: colors.onPrimary, fontSize: 48, fontWeight: 'bold', marginTop: -4 }}>+</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
      <LoadingModal 
        visible={isLoading} 
        text="Extracting text from PDF..."
      />
    </SafeAreaView>
  );
}

export default PDFScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    padding: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  importButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pdfViewer: {
    flex: 1,
  },
  pdfHeader: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  pdfTitle: {
    fontWeight: '600',
    marginBottom: 4,
  },
  pdfSize: {
    fontWeight: '500',
  },
  textControls: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    gap: 12,
    justifyContent: 'center',
  },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    maxHeight: 300,
  },
  extractedText: {
    lineHeight: 24,
  },
  changeButton: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    alignSelf: 'center',
  },
});