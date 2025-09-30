// screens/SummaryScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { analyzeExpensesWithGPT } from '../utils/gptAnalyzer'; // Custom utility for AI-based insights

export default function SummaryScreen() {
  // State to hold GPT-generated summary text
  const [summary, setSummary] = useState('');
  // Loading state for showing spinner while data is fetched and analyzed
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAndAnalyze = async () => {
      try {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        // Fetch one-time and fixed expenses from Firestore
        const expensesSnap = await getDocs(collection(db, 'expenses'));
        const fixedSnap = await getDocs(collection(db, 'fixed_expenses'));

        // Combine documents into a single list
        const combined = [...expensesSnap.docs, ...fixedSnap.docs];

        // Aggregate expenses by category
        const categoryTotals = {};
        combined.forEach((doc) => {
          const { amount, category, date } = doc.data();
          const d = new Date(date);

          // Only include expenses from the current month and year
          if (!isNaN(d) && d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
            categoryTotals[category] = (categoryTotals[category] || 0) + amount;
          }
        });

        // Prepare a clean array of { category, amount } objects
        const formatted = Object.entries(categoryTotals).map(([category, amount]) => ({
          category,
          amount,
        }));

        // Call GPT to generate analysis and insights
        const response = await analyzeExpensesWithGPT(
          formatted,
          now.toLocaleString('default', { month: 'long' })
        );
        setSummary(response);
      } catch (e) {
        console.error('❌ Error generating summary:', e);
        setSummary('Could not generate insights. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    // Run once when the screen mounts
    fetchAndAnalyze();
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.title}>🧠 Smart Summary</Text>
      {loading ? (
        // Show spinner while GPT analysis is in progress
        <ActivityIndicator size="large" color="#666" style={{ marginTop: 50 }} />
      ) : (
        // Display GPT insights in a styled card
        <View style={styles.card}>
          <Text style={styles.summary}>{summary}</Text>
        </View>
      )}
    </ScrollView>
  );
}

// Styles for layout, text, and card appearance
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
