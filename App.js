import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack'; // <-- use this one for animation
import 'react-native-gesture-handler';
import { enableScreens } from 'react-native-screens';
import { theme } from './components/theme';

enableScreens(); // Improves performance

// Screens
import HomeScreen from './screens/HomeScreen';
import ManualInputScreen from './screens/ManualInputScreen';
import ScanReceiptScreen from './screens/ScanReceiptScreen';
import SummaryScreen from './screens/SummaryScreen';
import ViewExpensesScreen from './screens/ViewExpensesScreen';
import StatisticsScreen from './screens/StatisticsScreen';

const Stack = createStackNavigator(); // <-- not createNativeStackNavigator

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.background, // soft blue (or use theme.colors.background)
          borderBottomLeftRadius: 20,
          borderBottomRightRadius: 20,
          elevation: 0,
        },
        headerTintColor: '#1E3A8A', // dark blue text/buttons
        headerTitleStyle: {
          fontWeight: '500',
          fontSize: 18,
          fontFamily: 'System',
        },
        headerTitleAlign: 'center',
      }}

      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Manual Input" component={ManualInputScreen} />
        <Stack.Screen name="Scan Receipt" component={ScanReceiptScreen} />
        <Stack.Screen name="Summary" component={SummaryScreen} />
        <Stack.Screen name="View Expenses" component={ViewExpensesScreen} />
        <Stack.Screen name="Statistics" component={StatisticsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
