import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Button, 
  Image, 
  ActivityIndicator, 
  Alert, 
  StyleSheet 
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { parseReceiptWithGPT } from '../utils/gptParser';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import AppButton from '../components/AppButton';
import { theme } from '../components/theme';
import { GOOGLE_API_KEY } from '@env';
import BackgroundWrapper from '../components/BackgroundWrapper';

export default function ScanReceiptScreen() {
  // State for image URI
  const [image, setImage] = useState(null);
  // State for raw OCR text output
  const [textOutput, setTextOutput] = useState('');
  // State for loading spinner
  const [loading, setLoading] = useState(false);

  // Opens the camera, takes a photo, and sends it to Vision API
  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Camera permission required');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 1,
      base64: true,
    });

    if (!result.canceled) {
      const base64 = result.assets[0].base64;
      setImage(result.assets[0].uri);
      await sendToVisionAPI(base64);
    }
  };

  // Opens gallery picker, selects image, and sends it to Vision API
  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Gallery access is needed.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
        base64: true,
      });

      if (!result.canceled && result.assets?.length > 0) {
        const base64 = result.assets[0].base64;
        setImage(result.assets[0].uri);
        await sendToVisionAPI(base64);
      } else {
        console.log('🛑 No image selected.');
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image.');
    }
  };

  // Sends the base64 image to Google Vision API, extracts text, and saves data
  const sendToVisionAPI = async (base64) => {
    setLoading(true);
    setTextOutput('');
    console.log("📤 Sending image to Google Vision API...");

    try {
      // Request body for Vision API
      const body = {
        requests: [
          {
            image: { content: base64 },
            features: [{ type: 'DOCUMENT_TEXT_DETECTION' }],
          },
        ],
      };

      // POST request to Vision API
      const response = await fetch(GOOGLE_API_KEY, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const result = await response.json();
      console.log("✅ Raw Vision API response:", JSON.stringify(result, null, 2));

      // Extract text from Vision API response
      const extractedText = result.responses?.[0]?.fullTextAnnotation?.text || 'No text found.';
      console.log("✅ Extracted Text:", extractedText);

      setTextOutput(extractedText);

      // Use GPT to parse extracted text into structured values
      const { amount, category, date } = await parseReceiptWithGPT(extractedText);

      // Sanitize parsed values
      const validAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
      const validCategory = typeof category === 'string' ? category : 'Other';
      const validDate = typeof date === 'string' ? date : null;

      console.log(`💰 Amount: $${validAmount}`);
      console.log(`📂 Category: ${validCategory}`);
      console.log(`📅 Date: ${validDate}`);

      // Show extracted info in an alert
      Alert.alert('Scan Result', `Amount: $${amount}\nCategory: ${category}\nDate: ${date ?? 'Not found'}`);

      // Save parsed data to Firestore
      try {
        await addDoc(collection(db, 'expenses'), {
          amount: validAmount,
          category: validCategory,
          date: validDate,
          createdAt: serverTimestamp(),
        });
        console.log("✅ Receipt saved to Firebase.");
      } catch (err) {
        console.error("❌ Failed to save to Firebase:", err);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to process receipt.');
      console.error("❌ Vision API Error:", err);
    }

    setLoading(false);
  };

  return (
    <BackgroundWrapper>
    <View style={styles.container}>
      <Text style={styles.title}>Scan a Receipt</Text>

      {/* Buttons for camera or gallery input */}
      <AppButton title="📷 Take Photo" onPress={takePhoto} />
      <AppButton title="🖼️ Choose from Gallery" onPress={pickImage} />

      {/* Preview selected image */}
      {image && <Image source={{ uri: image }} style={styles.image} />}
      {/* Loading spinner */}
      {loading && <ActivityIndicator size="large" style={{ marginTop: 16 }} />}

      {/* Display extracted OCR text */}
      {textOutput !== '' && (
        <View style={styles.result}>
          <Text style={styles.resultText}>🧾 Receipt Text:</Text>
          <Text>{textOutput}</Text>
        </View>
      )}
    </View>
    </BackgroundWrapper>
  );
}

// Styles
const styles = StyleSheet.create({
  container: { 
    padding: 24, 
    flex: 1, 
    gap: 12, 
    // backgroundColor: theme.colors.background,
    backgroundColor: 'transparent',

  },
  title: { 
    fontSize: 22, 
    textAlign: 'center', 
    marginBottom: 16 
  },
  image: { 
    width: '100%', 
    height: 250, 
    resizeMode: 'contain', 
    marginTop: 16 
  },
  result: { 
    marginTop: 20 
  },
  resultText: { 
    fontWeight: 'bold', 
    marginBottom: 8 
  },
});
