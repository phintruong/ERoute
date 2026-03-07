import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';

const PROVINCES = ['ON', 'BC', 'AB', 'QC', 'MB', 'SK', 'NS', 'NB', 'NL', 'PE'] as const;

export default function OHIPScreen() {
  const [selectedProvince, setSelectedProvince] = useState<string>('ON');

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Insurance & Coverage Guide</Text>
      <Text style={styles.subtitle}>Select your province to see coverage details</Text>

      <View style={styles.provinceRow}>
        {PROVINCES.map((p) => (
          <TouchableOpacity
            key={p}
            style={[styles.provincePill, selectedProvince === p && styles.provincePillActive]}
            onPress={() => setSelectedProvince(p)}
          >
            <Text style={[styles.provincePillText, selectedProvince === p && styles.provincePillTextActive]}>{p}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Coverage for {selectedProvince}</Text>
        <Text style={styles.cardText}>
          {/* TODO: Load province-specific OHIP/coverage data from backend */}
          Coverage information for {selectedProvince} will be loaded from the backend.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#F5F7FA' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#0066CC', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 16 },
  provinceRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  provincePill: { backgroundColor: '#E8F0FE', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  provincePillActive: { backgroundColor: '#0066CC' },
  provincePillText: { color: '#0066CC', fontWeight: '500' },
  provincePillTextActive: { color: '#fff' },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  cardTitle: { fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 8 },
  cardText: { fontSize: 14, color: '#555', lineHeight: 22 },
});
