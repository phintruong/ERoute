import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  heartRate: number;
  respiratoryRate: number;
  stressIndex: number;
}

export default function VitalsMeter({ heartRate, respiratoryRate, stressIndex }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.metric}>
        <Text style={styles.value}>{heartRate || '--'}</Text>
        <Text style={styles.label}>HR (bpm)</Text>
      </View>
      <View style={styles.metric}>
        <Text style={styles.value}>{respiratoryRate || '--'}</Text>
        <Text style={styles.label}>RR (br/min)</Text>
      </View>
      <View style={styles.metric}>
        <Text style={styles.value}>{stressIndex || '--'}</Text>
        <Text style={styles.label}>Stress</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#fff', padding: 20, borderRadius: 16, marginBottom: 24, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  metric: { alignItems: 'center' },
  value: { fontSize: 32, fontWeight: 'bold', color: '#0066CC' },
  label: { fontSize: 12, color: '#666', marginTop: 4 },
});
