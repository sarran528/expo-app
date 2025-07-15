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
import { FileText, Upload, Volume2, VolumeX, Play, Pause, Square } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { AppHeader } from '../../components/AppHeader';
import { AccessibleButton } from '@/components/AccessibleButton';
import { TTSService } from '@/services/TTSService';
import { LoadingModal } from '@/components/LoadingModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PDFListSection } from '../../components/PDFListSection';

interface PDFDocument {
  uri: string;
  name: string;
  size: number;
  date: string; // ISO string
  extractedText?: string;
}

export default function PDFScreen() {
  const { colors, fontSize } = useTheme();
  const [selectedPDF, setSelectedPDF] = useState<PDFDocument | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [pdfList, setPdfList] = useState<PDFDocument[]>([]);

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
        const pdfDoc: PDFDocument = {
          uri: asset.uri,
          name: asset.name,
          size: asset.size || 0,
          date: new Date().toISOString(), // Add current date
        };
        
        setSelectedPDF(pdfDoc);
        await extractTextFromPDF(pdfDoc);
        setPdfList(prev => [pdfDoc, ...prev.filter(p => p.uri !== pdfDoc.uri)]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick PDF document');
    }
  };

  const extractTextFromPDF = async (pdf: PDFDocument) => {
    try {
      setIsLoading(true);
      
      // Note: In a real implementation, you would use a PDF text extraction library
      // For this demo, we'll simulate text extraction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockExtractedText = `Sample PDF content from ${pdf.name}. This is demonstration text that would normally be extracted from the PDF document. The text would include all readable content from the PDF file, which could then be read aloud using text-to-speech functionality.`;
      
      setSelectedPDF(prev => prev ? { ...prev, extractedText: mockExtractedText } : null);
    } catch (error) {
      Alert.alert('Error', 'Failed to extract text from PDF');
    } finally {
      setIsLoading(false);
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

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}> 
      {/* Header removed, now handled globally */}
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        accessible={true}
        accessibilityLabel="PDF viewer content"
      >
        <PDFListSection pdfs={pdfList} onSelect={handlePDFSelect} selectedPDF={selectedPDF} />
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
            }}
          >
            <Text style={{ color: colors.onPrimary, fontSize: 48, fontWeight: 'bold', marginTop: -4 }}>+</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <LoadingModal 
        visible={isLoading} 
        text="Extracting text from PDF..."
      />
    </SafeAreaView>
  );
}

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
    marginTop: 24,
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