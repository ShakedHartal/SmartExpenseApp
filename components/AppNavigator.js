// AppNavigator.js
import React from 'react';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import SummaryScreen from '../screens/SummaryScreen';
import ScanReceiptScreen from '../screens/ScanReceiptScreen';
import ManualInputScreen from '../screens/ManualInputScreen';
import ViewExpensesScreen from '../screens/ViewExpensesScreen';
import StatisticsScreen from '../screens/StatisticsScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS, // 🎉 animated transitions
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Summary" component={SummaryScreen} />
      <Stack.Screen name="Scan Receipt" component={ScanReceiptScreen} />
      <Stack.Screen name="Manual Input" component={ManualInputScreen} />
      <Stack.Screen name="View Expenses" component={ViewExpensesScreen} />
      <Stack.Screen name="Statistics" component={StatisticsScreen} />
    </Stack.Navigator>
  );
}
