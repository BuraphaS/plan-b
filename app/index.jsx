import React from 'react';
import { View, StyleSheet } from 'react-native';
import CourtBoard from '../src/CourtBoard';

export default function Home() {
  return (
    <View style={styles.container}>
      <CourtBoard />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
});
