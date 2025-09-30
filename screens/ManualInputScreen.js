import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  Switch,
} from 'react-native';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { theme } from '../components/theme'; 
import AppButton from '../components/AppButton';

// Screen to manually add fixed monthly expenses
export default function ManualInputScreen() {
  // Local state for form inputs
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [isRecurring, setIsRecurring] = useState(true); // default true

  // Save expense into dataBase
  const handleAddExpense = async () => {
    if (!category || !amount) {
      Alert.alert('Error', 'Please fill in both fields');
      return;
    }

    try {
      await addDoc(collection(db, 'fixed_expenses'), {
        category,
        amount: parseFloat(amount), // convert string to number
        isRecurring,
        createdAt: serverTimestamp(),
      });

      // Reset state and show success
      Alert.alert('Success', 'Fixed expense added!');
      setCategory('');
      setAmount('');
      setIsRecurring(true);
    } catch (error) {
      console.error('❌ Error adding expense:', error);
      Alert.alert('Error', 'Something went wrong.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Screen title */}
      <Text style={styles.title}>Add Fixed Monthly Expense</Text>

      {/* Input for expense category */}
      <TextInput
        style={styles.input}
        placeholder="Category (e.g., Rent)"
        value={category}
        onChangeText={setCategory}
      />

      {/* Input for expense amount */}
      <TextInput
        style={styles.input}
        placeholder="Amount (USD)"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />

      {/* Toggle for recurring expense */}
      <View style={styles.switchRow}>
        <Text>Recurring Monthly Expense</Text>
        <Switch
          value={isRecurring}
          onValueChange={setIsRecurring}
          trackColor={{
            false: '#ccc', // background when off
            true: theme.colors.primary, // background when on
          }}
          thumbColor={isRecurring ? '#fff' : '#eee'} // the knob color
        />
      </View>

      <AppButton title="Add Expense" onPress={handleAddExpense} />
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    borderColor: theme.colors.muted,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    color: theme.colors.text,
  },
});