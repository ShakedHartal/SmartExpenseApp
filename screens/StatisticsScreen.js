import React, { useEffect, useState } from 'react';
import {
  View, Text, Dimensions, StyleSheet, ScrollView
} from 'react-native';
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
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());   // Current month
  const [selectedYear, setSelectedYear] = useState(now.getFullYear()); // Current year
  const [chartData, setChartData] = useState([]);                      // Data for pie chart
  const [total, setTotal] = useState(0);                               // Total expenses sum

  // Re-fetch data whenever month or year changes
  useEffect(() => {
    fetchAllExpenses(selectedMonth, selectedYear);
  }, [selectedMonth, selectedYear]);

  // Fetch both one-time and fixed expenses and prepare chart data
  const fetchAllExpenses = async (month, year) => {
    const data = {};
    let totalSum = 0;

    // One-time expenses collection
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

    // Fixed recurring expenses (added every month regardless of date)
    const fixedSnapshot = await getDocs(collection(db, 'fixed_expenses'));
    fixedSnapshot.forEach((doc) => {
      const { amount, category } = doc.data();
      totalSum += amount;
      data[category] = (data[category] || 0) + amount;
    });

    // Format data for PieChart
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

  // Month labels for dropdown
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  // Years to display in picker
  const years = [2024, 2025, 2026];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>📊 Monthly Expense Breakdown</Text>

      {/* Month and Year pickers */}
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

      {/* Show pie chart or fallback message */}
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

// Styles
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: theme.colors.background },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  subtitle: { textAlign: 'center', marginTop: 40, color: '#777' },
  total: { marginTop: 20, fontSize: 18, textAlign: 'center', fontWeight: 'bold' },
  pickerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  picker: { flex: 1, height: 60, marginHorizontal: 5 },
});
