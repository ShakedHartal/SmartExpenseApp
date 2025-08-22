// components/AppInput.js
import React from 'react';
import { TextInput, StyleSheet } from 'react-native';
import { theme } from './theme';

export default function AppInput({ value, onChangeText, placeholder, style = {}, ...rest }) {
  return (
    <TextInput
      style={[styles.input, style]}
      placeholder={placeholder}
      placeholderTextColor={theme.textSecondary}
      value={value}
      onChangeText={onChangeText}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: theme.textSecondary,
    padding: 12,
    borderRadius: 10,
    fontSize: 16,
    color: theme.textPrimary,
    backgroundColor: '#fff',
  },
});