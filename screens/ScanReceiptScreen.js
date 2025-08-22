import React, { useState } from 'react';
import { View, Text, Button, Image, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { parseReceiptWithGPT } from '../utils/gptParser';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import AppButton from '../components/AppButton'
import {theme} from '../components/theme'

export default function ScanReceiptScreen() {
  const [image, setImage] = useState(null);
  const [textOutput, setTextOutput] = useState('');
  const [loading, setLoading] = useState(false);

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

  
  const pickImage = async () => {
    try {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Gallery access is needed.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // ✅ Safe fallback
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


  const sendToVisionAPI = async (base64) => {
    setLoading(true);
    setTextOutput('');
    console.log("📤 Sending image to Google Vision API...");

    try {
      const body = {
        requests: [
          {
            image: { content: base64 },
            features: [{ type: 'DOCUMENT_TEXT_DETECTION' }],
          },
        ],
      };

      const response = await fetch(
        'https://vision.googleapis.com/v1/images:annotate?key=AIzaSyDJcvOlxWWOfpj624LFaeH75991I44OCi8',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        }
      );

      const result = await response.json();
      console.log("✅ Raw Vision API response:", JSON.stringify(result, null, 2));

      const extractedText = result.responses?.[0]?.fullTextAnnotation?.text || 'No text found.';
      console.log("✅ Extracted Text:", extractedText);

      setTextOutput(extractedText);

      // ⬇️ NEW: Use GPT to extract info
        const { amount, category, date } = await parseReceiptWithGPT(extractedText);
        
        // ✅ Sanitize values to prevent Firebase errors
        const validAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
        const validCategory = typeof category === 'string' ? category : 'Other';
        const validDate = typeof date === 'string' ? date : null;
        
        console.log(`💰 Amount: $${validAmount}`);
        console.log(`📂 Category: ${validCategory}`);
        console.log(`📅 Date: ${validDate}`);

        Alert.alert('Scan Result', `Amount: $${amount}\nCategory: ${category}\nDate: ${date ?? 'Not found'}`);
      // ✅ Save to Firestore
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
    <View style={styles.container}>
      <Text style={styles.title}>Scan a Receipt</Text>

      <AppButton title="📷 Take Photo" onPress={takePhoto} />
      <AppButton title="🖼️ Choose from Gallery" onPress={pickImage} />

      {image && <Image source={{ uri: image }} style={styles.image} />}
      {loading && <ActivityIndicator size="large" style={{ marginTop: 16 }} />}

      {textOutput !== '' && (
        <View style={styles.result}>
          <Text style={styles.resultText}>🧾 Receipt Text:</Text>
          <Text>{textOutput}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, flex: 1, gap: 12, backgroundColor: theme.colors.background,},
  title: { fontSize: 22, textAlign: 'center', marginBottom: 16 },
  image: { width: '100%', height: 250, resizeMode: 'contain', marginTop: 16 },
  result: { marginTop: 20 },
  resultText: { fontWeight: 'bold', marginBottom: 8 },
});
