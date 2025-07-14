import * as ImageManipulator from 'expo-image-manipulator';

export interface OCRResult {
  text: string;
  confidence: number;
  processingTime: number;
}

export interface OCRError {
  code: string;
  message: string;
  details?: any;
}

class OCRServiceClass {
  private apiKey: string = 'K87696567288957';
  private apiUrl: string = 'https://api.ocr.space/parse/image';
  private maxRetries: number = 3;
  private retryDelay: number = 1000;

  async extractText(imageUri: string): Promise<string> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        console.log(`OCR attempt ${attempt}/${this.maxRetries} for:`, imageUri);
        
        const result = await this.performOCR(imageUri);
        
        if (result.text.trim()) {
          console.log(`OCR successful on attempt ${attempt}`);
          return result.text;
        } else if (attempt === this.maxRetries) {
          return 'No text detected in the image. Please try with a clearer image containing readable text.';
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown OCR error');
        console.error(`OCR attempt ${attempt} failed:`, lastError.message);
        
        if (attempt < this.maxRetries) {
          await this.delay(this.retryDelay * attempt);
        }
      }
    }
    
    throw lastError || new Error('OCR processing failed after all retry attempts');
  }

  private async performOCR(imageUri: string): Promise<OCRResult> {
    const startTime = Date.now();
    
    try {
      // Prepare and optimize the image
      const processedImage = await this.prepareImageForOCR(imageUri);
      
      // Create form data for the API request
      const formData = this.createFormData(processedImage.base64!);
      
      // Make the API request
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
      }

      const result = await response.json();
      const processingTime = Date.now() - startTime;
      
      return this.parseOCRResponse(result, processingTime);
    } catch (error) {
      const processingTime = Date.now() - startTime;
      console.error('OCR API error:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('network') || error.message.includes('fetch')) {
          throw new Error('Network error. Please check your internet connection and try again.');
        } else if (error.message.includes('HTTP error')) {
          throw new Error('OCR service is temporarily unavailable. Please try again later.');
        } else {
          throw new Error(`OCR processing failed: ${error.message}`);
        }
      } else {
        throw new Error('An unexpected error occurred during OCR processing.');
      }
    }
  }

  private async prepareImageForOCR(imageUri: string): Promise<ImageManipulator.ImageResult> {
    try {
      // Optimize image for OCR: resize and compress
      const processedImage = await ImageManipulator.manipulateAsync(
        imageUri,
        [
          { resize: { width: 1200 } }, // Optimal width for OCR
        ],
        {
          compress: 0.8,
          format: ImageManipulator.SaveFormat.JPEG,
          base64: true,
        }
      );

      return processedImage;
    } catch (error) {
      console.error('Image preparation error:', error);
      throw new Error('Failed to prepare image for OCR processing');
    }
  }

  private createFormData(base64Image: string): FormData {
    const formData = new FormData();
    
    formData.append('base64Image', `data:image/jpeg;base64,${base64Image}`);
    formData.append('language', 'eng'); // English language
    formData.append('apikey', this.apiKey);
    formData.append('OCREngine', '2'); // More accurate OCR engine
    formData.append('detectOrientation', 'true');
    formData.append('scale', 'true');
    formData.append('isTable', 'false');
    formData.append('isOverlayRequired', 'false');
    
    return formData;
  }

  private parseOCRResponse(result: any, processingTime: number): OCRResult {
    if (result.IsErroredOnProcessing) {
      throw new Error(result.ErrorMessage || 'OCR processing failed on server');
    }

    if (!result.ParsedResults || !result.ParsedResults[0]) {
      throw new Error('Invalid OCR response format');
    }

    const parsedResult = result.ParsedResults[0];
    const extractedText = parsedResult.ParsedText || '';
    const confidence = parsedResult.TextOverlay?.HasOverlay ? 0.8 : 0.6; // Estimate confidence

    return {
      text: extractedText.trim(),
      confidence,
      processingTime,
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Enhanced method with detailed result
  async extractTextWithDetails(imageUri: string): Promise<OCRResult> {
    const result = await this.performOCR(imageUri);
    return result;
  }

  // Method to validate API key
  async validateApiKey(): Promise<boolean> {
    try {
      // Create a simple test image (1x1 pixel base64)
      const testBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI9jU77mgAAAABJRU5ErkJggg==';
      
      const formData = new FormData();
      formData.append('base64Image', `data:image/png;base64,${testBase64}`);
      formData.append('apikey', this.apiKey);
      
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      return !result.IsErroredOnProcessing;
    } catch (error) {
      console.error('API key validation error:', error);
      return false;
    }
  }

  // Get service information
  getServiceInfo(): { provider: string; engine: string; language: string; apiKey: string } {
    return {
      provider: 'OCR.space',
      engine: 'Engine 2 (Advanced)',
      language: 'English',
      apiKey: this.apiKey.substring(0, 8) + '...',
    };
  }

  // Update API key
  updateApiKey(newApiKey: string): void {
    this.apiKey = newApiKey;
  }

  // Get current API key (masked)
  getApiKey(): string {
    return this.apiKey.substring(0, 8) + '...';
  }
}

export const OCRService = new OCRServiceClass();

export const extractTextFromImage = async (base64Image: string): Promise<string> => {
  try {
    const apiUrl = 'https://api.ocr.space/parse/image';
    const apiKey = 'K87696567288957';

    const formData = new FormData();
    formData.append('base64Image', `data:image/jpeg;base64,${base64Image}`);
    formData.append('language', 'eng');
    formData.append('apikey', apiKey);
    formData.append('OCREngine', '2');
    formData.append('detectOrientation', 'true');
    formData.append('scale', 'true');

    const response = await fetch(apiUrl, {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();
    return result?.ParsedResults?.[0]?.ParsedText ?? '';
  } catch (error) {
    console.error('OCR error:', error);
    return '';
  }
};