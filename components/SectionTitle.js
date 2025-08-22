// components/SectionTitle.js
import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { theme } from './theme';

export default function SectionTitle({ children }) {
  return <Text style={styles.title}>{children}</Text>;
}

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.textPrimary,
    marginBottom: 12,
    textAlign: 'center',
  },
});
