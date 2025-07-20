import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  Platform,
  ActionSheetIOS,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { AppIcon, AppIcons } from '@/components/AppIcon';
import * as Sharing from 'expo-sharing';

interface PDFDocument {
  uri: string;
  name: string;
  size: number;
  date: string; // ISO string
  extractedText?: string;
}

interface PDFListSectionProps {
  pdfs: PDFDocument[];
  onSelect: (pdf: PDFDocument) => void;
  selectedPDF: PDFDocument | null;
  onDelete?: (pdf: PDFDocument) => void;
  onShare?: (pdf: PDFDocument) => void;
  onSort?: (by: 'name' | 'date' | 'size') => void;
  onInvertSort?: () => void;
  sortBy?: 'name' | 'date' | 'size';
  sortOrder?: 'asc' | 'desc';
}

export const PDFListSection: React.FC<PDFListSectionProps> = ({
  pdfs = [],
  onSelect,
  selectedPDF,
  onDelete,
  onShare,
  onSort,
  onInvertSort,
  sortBy = 'date',
  sortOrder = 'desc',
}) => {
  const { colors, fontSize } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalPDF, setModalPDF] = useState<PDFDocument | null>(null);
  const [sortModalVisible, setSortModalVisible] = useState(false);

  const safePdfs = Array.isArray(pdfs) ? pdfs : [];

  if (!safePdfs.length) {
    return (
      <View style={[styles.container, { alignItems: 'center', justifyContent: 'center', minHeight: 120 }]}>
        <Text style={{ color: colors.textSecondary, fontSize: fontSize.medium, textAlign: 'center', marginTop: 32 }}>
          No PDF documents found. Import a PDF to get started.
        </Text>
      </View>
    );
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (iso: string) => {
    const date = new Date(iso);
    const now = new Date();
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
    });
  };

  const showOptions = (pdf: PDFDocument) => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Open', 'Share', 'Delete'],
          destructiveButtonIndex: 3,
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) onSelect(pdf);
          if (buttonIndex === 2 && onShare) onShare(pdf);
          if (buttonIndex === 3 && onDelete) {
            Alert.alert('Delete PDF', 'Are you sure you want to delete this PDF?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete', style: 'destructive', onPress: () => onDelete(pdf) },
            ]);
          }
        }
      );
    } else {
      setModalPDF(pdf);
      setModalVisible(true);
    }
  };

  const handleModalAction = (action: 'open' | 'share' | 'delete') => {
    if (!modalPDF) return;
    if (action === 'open') onSelect(modalPDF);
    if (action === 'share' && onShare) onShare(modalPDF);
    if (action === 'delete' && onDelete) {
      Alert.alert('Delete PDF', 'Are you sure you want to delete this PDF?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => onDelete(modalPDF) },
      ]);
    }
    setModalVisible(false);
    setModalPDF(null);
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

  const getSortLabel = (sortBy: 'name' | 'date' | 'size', sortOrder: 'asc' | 'desc') => {
    if (sortBy === 'date') return sortOrder === 'asc' ? 'First Uploaded' : 'Recently Added';
    if (sortBy === 'name') return sortOrder === 'asc' ? 'Alphabetical Order' : 'Reverse Alphabetical';
    if (sortBy === 'size') return sortOrder === 'asc' ? 'Smallest Files First' : 'Biggest Files First';
    return '';
  };

  return (
    <View style={[styles.container, { backgroundColor: 'transparent' }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <Text style={[styles.title, { color: colors.text, fontSize: fontSize.medium }]}>
          {getSortLabel(sortBy, sortOrder) || ' '}
        </Text>
        <TouchableOpacity onPress={() => setSortModalVisible(true)} style={{ padding: 4 }} accessibilityLabel="Sort PDFs">
          <Text style={{ color: colors.primary, fontWeight: 'bold' }}>Sort</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={{ maxHeight: 400 }} contentContainerStyle={{ gap: 0 }} showsVerticalScrollIndicator={false}>
        {safePdfs.map((item, idx) => (
          <React.Fragment key={item.uri}>
            <TouchableOpacity
              style={[
                styles.item,
                {
                  backgroundColor: 'transparent',
                  borderColor: selectedPDF?.uri === item.uri ? colors.primary : 'transparent',
                },
              ]}
              onPress={() => onSelect(item)}
              accessibilityLabel={`Select PDF: ${item.name}`}
            >
              <View style={styles.row}>
                <View style={styles.iconContainer}>
                  <View style={styles.pdfIconWrap}>
                    <AppIcon icon={AppIcons.FileText} color={colors.error} fill={colors.error} />
                    <Text style={styles.pdfLabel}>PDF</Text>
                  </View>
                </View>
                <View style={styles.infoContainer}>
                  <Text style={[styles.name, { color: colors.text, fontSize: fontSize.medium }]} numberOfLines={1}>
                    {item.name || 'No name'}
                  </Text>
                  <Text
                    style={[styles.meta, { color: colors.textSecondary, fontSize: fontSize.small }]}
                    numberOfLines={1}
                  >
                    {`${formatDate(item.date)}, ${formatFileSize(item.size)}, PDF document`}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.actionContainer}
                  onPress={() => showOptions(item)}
                  accessibilityLabel={`More options for ${item.name}`}
                >
                  <AppIcon icon={AppIcons.MoreVertical} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
            {idx < safePdfs.length - 1 && <View style={[styles.separator, { borderBottomColor: colors.border }]} />}
          </React.Fragment>
        ))}
      </ScrollView>

      {/* Android Modal */}
      {Platform.OS !== 'ios' && (
        <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setModalVisible(false)}>
            <View style={[styles.modalContent, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <TouchableOpacity style={styles.modalOption} onPress={() => handleModalAction('open')}>
                <Text style={[styles.modalOptionText, { color: colors.text }]}>Open</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalOption} onPress={() => handleModalAction('share')}>
                <Text style={[styles.modalOptionText, { color: colors.text }]}>Share</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalOption} onPress={() => handleModalAction('delete')}>
                <Text style={[styles.modalOptionText, { color: colors.error }]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      )}

      {/* Sort Modal */}
      <Modal visible={sortModalVisible} transparent animationType="fade" onRequestClose={() => setSortModalVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setSortModalVisible(false)}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {['name', 'date', 'size'].map((by) => (
              <TouchableOpacity
                key={by}
                style={styles.modalOption}
                onPress={() => {
                  onSort && onSort(by as 'name' | 'date' | 'size');
                  setSortModalVisible(false);
                }}
              >
                <Text style={[styles.modalOptionText, { color: colors.text }]}>
                  Sort by {by.charAt(0).toUpperCase() + by.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => {
                onInvertSort && onInvertSort();
                setSortModalVisible(false);
              }}
            >
              <Text style={[styles.modalOptionText, { color: colors.text }]}>Invert Order</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
    paddingHorizontal: 0,
  },
  title: {
    fontWeight: '600',
    marginBottom: 4,
    marginLeft: 2,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 0,
    borderWidth: 1,
    borderColor: 'transparent',
    paddingVertical: 8,
    paddingHorizontal: 0,
    minWidth: 0,
    backgroundColor: 'transparent',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minHeight: 48,
  },
  iconContainer: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  pdfIconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pdfLabel: {
    color: '#fff',
    backgroundColor: '#D32F2F',
    fontWeight: 'bold',
    fontSize: 10,
    paddingHorizontal: 4,
    borderRadius: 3,
    marginTop: -8,
    zIndex: 1,
    overflow: 'hidden',
    letterSpacing: 1,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
    minWidth: 0,
  },
  name: {
    fontWeight: '600',
    marginBottom: 2,
    textAlign: 'left',
    flexShrink: 1,
    maxWidth: '100%',
  },
  meta: {
    fontWeight: '400',
    textAlign: 'left',
    flexShrink: 1,
    maxWidth: '100%',
  },
  actionContainer: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  separator: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginLeft: 48,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: 220,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 0,
    alignItems: 'stretch',
    elevation: 4,
  },
  modalOption: {
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  modalOptionText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
