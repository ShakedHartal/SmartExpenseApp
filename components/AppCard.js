// components/AppCard.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { theme } from './theme';

export default function AppCard({ children, style = {} }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
});