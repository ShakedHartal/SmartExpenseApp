import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  Dimensions,
} from 'react-native';
import { theme } from '../components/theme';

const windowHeight = Dimensions.get('window').height;

// Home Screen component
export default function HomeScreen({ navigation }) {
  return (
    // Background image with soft opacity overlay
    <ImageBackground
      source={require('../assets/background.jpg')}
      style={styles.background}
      imageStyle={{ opacity: 0.1 }}
      resizeMode="cover"
      accessible={true}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Smart Expense Manager</Text>

        <View style={styles.grid}>
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Manual Input')}>
            <Text style={styles.buttonText}>📌 Manual Fixed</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Scan Receipt')}>
            <Text style={styles.buttonText}>📷 Scan Receipt</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Summary')}>
            <Text style={styles.buttonText}>🧠 Summary</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('View Expenses')}>
            <Text style={styles.buttonText}>📄 Expenses</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Statistics')}>
            <Text style={styles.buttonText}>📊 Stats</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

// Styles for HomeScreen
const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContainer: {
    paddingVertical: 60,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    fontFamily: 'Snell Roundhand',
    color: theme.colors.text,
    marginBottom: 160, // increase this value to add more space between title and grid
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap', // wraps into 2 rows/columns
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    width: '48%', // ensures 2 buttons per row
    height: 100,
    backgroundColor: theme.colors.primary,
    borderRadius: 20,
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center',
  },
});
