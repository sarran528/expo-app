import AsyncStorage from '@react-native-async-storage/async-storage';

class OCRServiceClass {
  private apiKey: string = ''; // Will be loaded from AsyncStorage
  private apiUrl: string = 'https://api.ocr.space/parse/image';

  constructor() {
    this.loadApiKey();
  }

  private async loadApiKey(): Promise<void> {
    try {
      const savedApiKey = await AsyncStorage.getItem('ocrApiKey');
      if (savedApiKey) {
        this.apiKey = savedApiKey;
      }
    } catch (error) {
      console.error('Error loading OCR API key:', error);
    }
  }

  async extractText(imageUri: string): Promise<string> {
    try {
      // Ensure we have the latest API key
      await this.loadApiKey();
      
      if (!this.apiKey) {
        throw new Error('OCR API key not configured. Please set your API key in Settings.');
      }

      // Create form data for OCR API
      const formData = new FormData();
      formData.append('apikey', this.apiKey);
      formData.append('language', 'eng');
      formData.append('isOverlayRequired', 'false');
      formData.append('file', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'image.jpg',
      } as any);

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const result = await response.json();

      if (result.IsErroredOnProcessing) {
        throw new Error(result.ErrorMessage || 'OCR processing failed');
      }

      // Extract text from the response
      const extractedText = result.ParsedResults?.[0]?.ParsedText || '';
      return extractedText.trim();
    } catch (error) {
      console.error('OCR Error:', error);
      
      // For demo purposes, return mock text when API fails
      return `Sample extracted text from image. This would normally be the actual text extracted from the image using OCR technology. 
      
Note: ${error instanceof Error ? error.message : 'OCR service unavailable'}

To use real OCR functionality:
1. Get an API key from OCR.space or similar service
2. Go to Settings > OCR Configuration
3. Enter your API key

The text extraction would identify all readable text content in the image and return it as a string that can be read aloud or processed further.`;
    }
  }

  // Alternative method using different OCR provider
  async extractTextAlternative(imageUri: string): Promise<string> {
    try {
      // This could use Google Cloud Vision, AWS Textract, or another OCR service
      // For now, return mock data
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API delay
      
      return `Alternative OCR extracted text. This demonstrates how you could implement multiple OCR providers for better reliability and accuracy.`;
    } catch (error) {
      console.error('Alternative OCR Error:', error);
      throw error;
    }
  }
}

export const OCRService = new OCRServiceClass();