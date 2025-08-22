// screens/SummaryScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { analyzeExpensesWithGPT } from '../utils/gptAnalyzer'; // we'll create this file

export default function SummaryScreen() {
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAndAnalyze = async () => {
      try {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const expensesSnap = await getDocs(collection(db, 'expenses'));
        const fixedSnap = await getDocs(collection(db, 'fixed_expenses'));

        const combined = [...expensesSnap.docs, ...fixedSnap.docs];

        const categoryTotals = {};

        combined.forEach((doc) => {
          const { amount, category, date } = doc.data();
          const d = new Date(date);
          if (!isNaN(d) && d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
            categoryTotals[category] = (categoryTotals[category] || 0) + amount;
          }
        });

        const formatted = Object.entries(categoryTotals).map(([category, amount]) => ({
          category,
          amount,
        }));

        const response = await analyzeExpensesWithGPT(formatted, now.toLocaleString('default', { month: 'long' }));
        setSummary(response);
      } catch (e) {
        console.error('❌ Error generating summary:', e);
        setSummary('Could not generate insights. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAndAnalyze();
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.title}>🧠 Smart Summary</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#666" style={{ marginTop: 50 }} />
      ) : (
        <View style={styles.card}>
          <Text style={styles.summary}>{summary}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
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
});
