import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  level: 'green' | 'yellow' | 'red';
  compact?: boolean;
}

const COLORS = {
  green: { bg: '#E8F5E9', text: '#2E7D32', label: 'Virtual Care' },
  yellow: { bg: '#FFF8E1', text: '#F57F17', label: 'Urgent Care' },
  red: { bg: '#FFEBEE', text: '#C62828', label: 'Go to ER' },
};

export default function RiskBadge({ level, compact }: Props) {
  const config = COLORS[level];

  if (compact) {
    return (
      <View style={[styles.compactBadge, { backgroundColor: config.bg }]}>
        <Text style={[styles.compactText, { color: config.text }]}>{config.label}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Text style={[styles.label, { color: config.text }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { paddingVertical: 16, paddingHorizontal: 24, borderRadius: 16, alignItems: 'center' },
  label: { fontSize: 22, fontWeight: 'bold' },
  compactBadge: { paddingVertical: 4, paddingHorizontal: 12, borderRadius: 12 },
  compactText: { fontSize: 12, fontWeight: '600' },
});
