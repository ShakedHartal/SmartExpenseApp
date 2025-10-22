import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { analyzeExpensesWithGPT } from '../utils/gptAnalyzer';
import BackgroundWrapper from '../components/BackgroundWrapper';
import AppButton from '../components/AppButton';

export default function SummaryScreen() {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const years = [2024, 2025, 2026];

const fetchAndAnalyze = async () => {
  setLoading(true);
  try {
    const currentMonth = selectedMonth;
    const currentYear = selectedYear;

    // Step 1: Fetch one-time expenses
    const expensesSnap = await getDocs(collection(db, 'expenses'));
    const oneTime = [];
    expensesSnap.forEach((doc) => {
      const data = doc.data();
      const rawDate = data.date || data.createdAt?.toDate?.();
      const d = new Date(rawDate);
      if (!isNaN(d) && d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
        const amount = parseFloat(data.amount);
        if (data.category && !isNaN(amount)) {
          oneTime.push({ category: data.category, amount });
        }
      }
    });

    // Step 2: Fetch fixed expenses (always included)
    const fixedSnap = await getDocs(collection(db, 'fixed_expenses'));
    const fixed = [];
    fixedSnap.forEach((doc) => {
      const data = doc.data();
      const amount = parseFloat(data.amount);
      if (data.category && !isNaN(amount)) {
        fixed.push({ category: data.category, amount });
      }
    });

    // Log both arrays
    // console.log('🧾 One-time expenses:', oneTime);
    // console.log('📌 Fixed expenses:', fixed);

    // Step 3: Combine both types
    const combined = [...oneTime, ...fixed];

    // Step 4: Group by category
    const categoryTotals = {};
    combined.forEach(({ category, amount }) => {
      if (!category || isNaN(amount)) return;
      categoryTotals[category] = (categoryTotals[category] || 0) + amount;
    });

    const formatted = Object.entries(categoryTotals).map(([category, amount]) => ({
      category,
      amount,
    }));

    // console.log('📦 Data sent to GPT:', formatted);

    // Step 5: Analyze
    const response = await analyzeExpensesWithGPT(
      formatted,
      new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long' })
    );

    setSummary(response);
  } catch (e) {
    console.error('❌ Error generating summary:', e);
    setSummary('Could not generate insights. Please try again later.');
  } finally {
    setLoading(false);
  }
};



  return (
    <BackgroundWrapper>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={styles.title}>Smart Summary</Text>

        {/* Month & Year pickers */}
        <View style={styles.pickerRow}>
          <Picker
            selectedValue={selectedMonth}
            style={styles.picker}
            onValueChange={(itemValue) => setSelectedMonth(itemValue)}
          >
            {months.map((name, idx) => (
              <Picker.Item label={name} value={idx} key={idx} />
            ))}
          </Picker>

          <Picker
            selectedValue={selectedYear}
            style={styles.picker}
            onValueChange={(itemValue) => setSelectedYear(itemValue)}
          >
            {years.map((y) => (
              <Picker.Item label={`${y}`} value={y} key={y} />
            ))}
          </Picker>
        </View>

        {/* Analyze Button */}
        <AppButton onPress={fetchAndAnalyze} title="Analyze" />

        {loading ? (
          <ActivityIndicator size="large" color="#666" style={{ marginTop: 50 }} />
        ) : summary ? (
          <View style={styles.card}>
            <Text style={styles.summary}>{summary}</Text>
          </View>
        ) : (
          <Text style={styles.note}>Select a month and press Analyze to get insights.</Text>
        )}
      </ScrollView>
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  pickerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  picker: { flex: 1, height: 60, marginHorizontal: 5 },
 
  card: {
    backgroundColor: '#f4f4f4',
    padding: 16,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  summary: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  note: {
    fontSize: 15,
    color: '#888',
    textAlign: 'center',
    marginTop: 30,
  },
});
