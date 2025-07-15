import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActionSheetIOS, Platform, Modal } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { FileText, MoreVertical } from 'lucide-react-native';

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
  onOCR?: (pdf: PDFDocument) => void;
  onShare?: (pdf: PDFDocument) => void;
}

export const PDFListSection: React.FC<PDFListSectionProps> = ({ pdfs, onSelect, selectedPDF, onDelete, onOCR, onShare }) => {
  const { colors, fontSize } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalPDF, setModalPDF] = useState<PDFDocument | null>(null);

  if (!pdfs.length) return null;
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
      ActionSheetIOS.showActionSheetWithOptions({
        options: ['Cancel', 'Open', 'Apply OCR', 'Share', 'Delete'],
        destructiveButtonIndex: 4,
        cancelButtonIndex: 0,
      }, (buttonIndex) => {
        if (buttonIndex === 1) onSelect(pdf); // Open
        if (buttonIndex === 2 && onOCR) onOCR(pdf);
        if (buttonIndex === 3 && onShare) onShare(pdf);
        if (buttonIndex === 4 && onDelete) onDelete(pdf);
      });
    } else {
      setModalPDF(pdf);
      setModalVisible(true);
    }
  };
  const handleModalAction = (action: 'open' | 'ocr' | 'share' | 'delete') => {
    if (!modalPDF) return;
    if (action === 'open') onSelect(modalPDF);
    if (action === 'ocr' && onOCR) onOCR(modalPDF);
    if (action === 'share' && onShare) onShare(modalPDF);
    if (action === 'delete' && onDelete) onDelete(modalPDF);
    setModalVisible(false);
    setModalPDF(null);
  };
  const renderItem = ({ item }: { item: PDFDocument }) => (
    <TouchableOpacity
      style={[
        styles.item,
        { backgroundColor: 'transparent', borderColor: selectedPDF?.uri === item.uri ? colors.primary : 'transparent' },
      ]}
      onPress={() => onSelect(item)}
      accessibilityLabel={`Select PDF: ${item.name}`}
    >
      <View style={styles.row}>
        {/* PDF Icon with PDF text */}
        <View style={styles.iconContainer}>
          <View style={styles.pdfIconWrap}>
            <FileText size={28} color={colors.error} fill={colors.error} />
            <Text style={styles.pdfLabel}>PDF</Text>
          </View>
        </View>
        <View style={styles.infoContainer}>
          <Text style={[styles.name, { color: colors.text, fontSize: fontSize.medium }]} numberOfLines={1} ellipsizeMode="tail">{item.name}</Text>
          <Text style={[styles.meta, { color: colors.textSecondary, fontSize: fontSize.small }]}
            numberOfLines={1} ellipsizeMode="tail">
            {formatDate(item.date)}
            {', '}{formatFileSize(item.size)}
            {', PDF document'}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.actionContainer}
          onPress={() => showOptions(item)}
          accessibilityLabel={`More options for ${item.name}`}
        >
          <MoreVertical size={22} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
  return (
    <View style={[styles.container, { backgroundColor: 'transparent' }]}> {/* No background color */}
      <Text style={[styles.title, { color: colors.text, fontSize: fontSize.medium }]}>Recent files</Text>
      <FlatList
        data={pdfs}
        keyExtractor={item => item.uri}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={[styles.separator, { borderBottomColor: colors.border }]} />}
        contentContainerStyle={{ gap: 0 }}
        showsVerticalScrollIndicator={false}
      />
      {/* Android Modal for options */}
      {Platform.OS !== 'ios' && (
        <Modal
          visible={modalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}
        >
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setModalVisible(false)}>
            <View style={[styles.modalContent, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
              <TouchableOpacity style={styles.modalOption} onPress={() => handleModalAction('open')}>
                <Text style={[styles.modalOptionText, { color: colors.text }]}>Open</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalOption} onPress={() => handleModalAction('ocr')}>
                <Text style={[styles.modalOptionText, { color: colors.text }]}>Apply OCR</Text>
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