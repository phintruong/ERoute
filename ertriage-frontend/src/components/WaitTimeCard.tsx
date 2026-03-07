import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  waitTime: string;
}

export default function WaitTimeCard({ waitTime }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>Estimated ER Wait Time</Text>
      <Text style={styles.value}>{waitTime}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#FFF8E1', padding: 16, borderRadius: 12, marginBottom: 16 },
  label: { fontSize: 13, color: '#F57F17', fontWeight: '500' },
  value: { fontSize: 20, fontWeight: 'bold', color: '#F57F17', marginTop: 4 },
});
