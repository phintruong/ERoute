import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import RiskBadge from '../components/RiskBadge';
import WaitTimeCard from '../components/WaitTimeCard';
import { useStore } from '../store';

type Props = NativeStackScreenProps<RootStackParamList, 'Result'>;

export default function ResultScreen({ navigation }: Props) {
  const result = useStore((s) => s.triageResult);

  if (!result) {
    return (
      <View style={styles.container}>
        <Text>No result available.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <RiskBadge level={result.riskLevel} />

      <Text style={styles.recommendation}>{result.recommendation}</Text>
      <Text style={styles.explanation}>{result.explanation}</Text>

      {result.waitTimeEstimate && (
        <WaitTimeCard waitTime={result.waitTimeEstimate} />
      )}

      {result.nearbyClinics.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nearby Options</Text>
          {result.nearbyClinics.map((clinic, i) => (
            <TouchableOpacity
              key={i}
              style={styles.clinicCard}
              onPress={() => navigation.navigate('Booking', { clinicName: clinic.name, clinicAddress: clinic.address })}
            >
              <Text style={styles.clinicName}>{clinic.name}</Text>
              <Text style={styles.clinicDetail}>{clinic.distance} — {clinic.address}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <TouchableOpacity style={styles.homeButton} onPress={() => navigation.navigate('Home')}>
        <Text style={styles.homeButtonText}>Back to Home</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#F5F7FA' },
  recommendation: { fontSize: 20, fontWeight: '600', color: '#333', marginTop: 16, marginBottom: 8 },
  explanation: { fontSize: 16, color: '#555', lineHeight: 24, marginBottom: 24 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 12 },
  clinicCard: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 8, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  clinicName: { fontSize: 16, fontWeight: '600', color: '#0066CC' },
  clinicDetail: { fontSize: 13, color: '#666', marginTop: 4 },
  homeButton: { backgroundColor: '#E8F0FE', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginBottom: 32 },
  homeButtonText: { color: '#0066CC', fontSize: 16, fontWeight: '600' },
});
