import React from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';

export default function BackgroundWrapper({ children }) {
  return (
    <ImageBackground
      source={require('../assets/background.png')}
      style={styles.background}
      imageStyle={{ opacity: 0.1 }}
      resizeMode="cover"
      accessible={true}
    >
      <View style={styles.overlay}>{children}</View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, width: '100%', height: '100%' },
  overlay: { flex: 1, backgroundColor: 'rgba(255,255,255,0.15)' },
});

