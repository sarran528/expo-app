import React, { useState } from 'react';
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
import { Header } from '@/components/Header';
import { AccessibleButton } from '@/components/AccessibleButton';
import { TTSService } from '@/services/TTSService';
import { LoadingModal } from '@/components/LoadingModal';

interface PDFDocument {
  uri: string;
  name: string;
  size: number;
  extractedText?: string;
}

export default function PDFScreen() {
  const { colors, fontSize } = useTheme();
  const [selectedPDF, setSelectedPDF] = useState<PDFDocument | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

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
        };
        
        setSelectedPDF(pdfDoc);
        await extractTextFromPDF(pdfDoc);
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
      <Header title="PDF Viewer" />
      
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        accessible={true}
        accessibilityLabel="PDF viewer content"
      >
        {!selectedPDF ? (
          <View style={styles.emptyState}>
            <FileText 
              size={64} 
              color={colors.textSecondary} 
              strokeWidth={1.5}
              accessible={false}
            />
            <Text style={[styles.emptyTitle, { color: colors.text, fontSize: fontSize.large }]}>
              No PDF Selected
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary, fontSize: fontSize.medium }]}>
              Import a PDF document to view and hear its content
            </Text>
            
            <AccessibleButton
              title="Import PDF"
              onPress={pickPDF}
              style={[styles.importButton, { backgroundColor: colors.primary }]as any}
              textStyle={{ color: colors.onPrimary, fontSize: fontSize.large }}
              accessibilityLabel="Import PDF document"
              icon={<Upload size={24} color={colors.onPrimary} strokeWidth={2.5} />}
            />
          </View>
        ) : (
          <View style={styles.pdfViewer}>
            <View style={[styles.pdfHeader, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text 
                style={[styles.pdfTitle, { color: colors.text, fontSize: fontSize.large }]}
                accessible={true}
                accessibilityLabel={`PDF document: ${selectedPDF.name}`}
              >
                {selectedPDF.name}
              </Text>
              <Text 
                style={[styles.pdfSize, { color: colors.textSecondary, fontSize: fontSize.small }]}
                accessible={true}
                accessibilityLabel={`File size: ${formatFileSize(selectedPDF.size)}`}
              >
                {formatFileSize(selectedPDF.size)}
              </Text>
            </View>

            {selectedPDF.extractedText && (
              <>
                <View style={[styles.textControls, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <AccessibleButton
                    onPress={handlePlayPause}
                    style={[styles.controlButton, { backgroundColor: colors.primary }]as any}
                    accessibilityLabel={isPlaying ? 'Pause reading' : 'Start reading'}
                  >
                    {isPlaying ? (
                      <Pause size={24} color={colors.onPrimary} strokeWidth={2.5} />
                    ) : (
                      <Play size={24} color={colors.onPrimary} strokeWidth={2.5} />
                    )}
                  </AccessibleButton>
                  
                  <AccessibleButton
                    onPress={handleStop}
                    style={[styles.controlButton, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]as any}
                    accessibilityLabel="Stop reading"
                  >
                    <Square size={24} color={colors.text} strokeWidth={2.5} />
                  </AccessibleButton>
                  
                  <AccessibleButton
                    onPress={handleMuteToggle}
                    style={[styles.controlButton, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]as any}
                    accessibilityLabel={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? (
                      <VolumeX size={24} color={colors.textSecondary} strokeWidth={2.5} />
                    ) : (
                      <Volume2 size={24} color={colors.text} strokeWidth={2.5} />
                    )}
                  </AccessibleButton>
                </View>

                <View style={[styles.textContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Text 
                    style={[styles.extractedText, { color: colors.text, fontSize: fontSize.medium }]}
                    accessible={true}
                    accessibilityLabel="Extracted PDF text"
                    selectable={true}
                  >
                    {selectedPDF.extractedText}
                  </Text>
                </View>
              </>
            )}

            <AccessibleButton
              title="Import Different PDF"
              onPress={pickPDF}
              style={[styles.changeButton, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]as any}
              textStyle={{ color: colors.text, fontSize: fontSize.medium }}
              accessibilityLabel="Import a different PDF document"
            />
          </View>
        )}
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