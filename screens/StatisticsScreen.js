import React, { useEffect, useState } from 'react';
import {
  View, Text, Dimensions, StyleSheet, ScrollView} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { PieChart } from 'react-native-chart-kit';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { theme } from '../components/theme';

const chartColors = [
  '#f87171', '#60a5fa', '#34d399', '#fbbf24', '#a78bfa', '#f472b6',
];

export default function StatisticsScreen() {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [chartData, setChartData] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchAllExpenses(selectedMonth, selectedYear);
  }, [selectedMonth, selectedYear]);

  const fetchAllExpenses = async (month, year) => {
    const data = {};
    let totalSum = 0;

    // One-time expenses
    const expenseSnapshot = await getDocs(collection(db, 'expenses'));
    expenseSnapshot.forEach((doc) => {
      const { amount, category, date } = doc.data();
      const expenseDate = new Date(date);
      if (
        !isNaN(expenseDate) &&
        expenseDate.getMonth() === month &&
        expenseDate.getFullYear() === year
      ) {
        totalSum += amount;
        data[category] = (data[category] || 0) + amount;
      }
    });

    // Fixed expenses (shown every month)
    const fixedSnapshot = await getDocs(collection(db, 'fixed_expenses'));
    fixedSnapshot.forEach((doc) => {
      const { amount, category } = doc.data();
      totalSum += amount;
      data[category] = (data[category] || 0) + amount;
    });

    const chartFormatted = Object.keys(data).map((cat, idx) => ({
      name: cat,
      amount: data[cat],
      color: chartColors[idx % chartColors.length],
      legendFontColor: '#333',
      legendFontSize: 14,
    }));

    setChartData(chartFormatted);
    setTotal(totalSum);
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const years = [2024, 2025, 2026]; // You can expand if needed

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>📊 Monthly Expense Breakdown</Text>

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

      {chartData.length > 0 ? (
      <View style={{ marginTop: 20, alignItems: 'center' }}>
        <PieChart
          data={chartData.map((item) => ({
            name: item.name,
            population: item.amount,
            color: item.color,
            legendFontColor: item.legendFontColor,
            legendFontSize: item.legendFontSize,
          }))}
          width={Dimensions.get('window').width - 10}
          height={240}
          chartConfig={{
            backgroundGradientFrom: '#fff',
            backgroundGradientTo: '#fff',
            color: () => '#333',
            labelColor: () => '#333',
          }}
          accessor={'population'}
          backgroundColor={'transparent'}
          paddingLeft={'10'}
          absolute
        />
        </View>
      ) : (
        <Text style={styles.subtitle}>No expenses for this month.</Text>
      )}
      <Text style={styles.total}>Total: ${total.toFixed(2)}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: theme.colors.background, },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  subtitle: { textAlign: 'center', marginTop: 40, color: '#777' },
  total: { marginTop: 20, fontSize: 18, textAlign: 'center', fontWeight: 'bold' },
  pickerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  picker: { flex: 1, height: 60,  marginHorizontal: 5,
  },
});
