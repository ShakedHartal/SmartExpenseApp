import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import {theme} from '../components/theme'

export default function ViewExpensesScreen() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        // One-time expenses
        const oneTimeQuery = query(collection(db, 'expenses'), orderBy('createdAt', 'desc'));
        const oneTimeSnapshot = await getDocs(oneTimeQuery);
        const oneTimeExpenses = oneTimeSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          type: 'one-time',
        }));

        // Fixed monthly expenses
        const fixedSnapshot = await getDocs(collection(db, 'fixed_expenses'));
        const fixedExpenses = fixedSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          type: 'fixed',
          // Add createdAt if needed for sorting; use today’s date as fallback
          createdAt: { toDate: () => new Date() }
        }));

        // Combine and sort
        const combined = [...oneTimeExpenses, ...fixedExpenses].sort((a, b) => {
          const dateA = a.createdAt?.toDate?.() || new Date(0);
          const dateB = b.createdAt?.toDate?.() || new Date(0);
          return dateB - dateA;
        });

        setExpenses(combined);
      } catch (error) {
        console.error('❌ Error loading expenses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.amount}>💰 ${item.amount?.toFixed(2) || '0.00'}</Text>
      <Text style={styles.category}>📂 {item.category || 'Other'} {item.type === 'fixed' ? '(Fixed)' : ''}</Text>
      <Text style={styles.date}>📅 {item.date || 'Unknown'}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📄 Your Expenses</Text>
      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <FlatList
          data={expenses}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 , backgroundColor: theme.colors.background},
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  card: {
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  amount: { fontSize: 18, fontWeight: 'bold' },
  category: { marginTop: 4, color: '#555' },
  date: { marginTop: 4, color: '#777' },
});
