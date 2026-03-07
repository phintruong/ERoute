import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FamilyMember } from '../../../shared/types';

interface Props {
  member: FamilyMember;
  onTriage: () => void;
}

export default function FamilyMemberCard({ member, onTriage }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.info}>
        <Text style={styles.name}>{member.name}</Text>
        <Text style={styles.detail}>{member.relation}{member.dob ? ` — ${member.dob}` : ''}</Text>
        {member.notes && <Text style={styles.notes}>{member.notes}</Text>}
      </View>
      <TouchableOpacity style={styles.triageButton} onPress={onTriage}>
        <Text style={styles.triageButtonText}>Triage</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 10, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: '600', color: '#333' },
  detail: { fontSize: 13, color: '#666', marginTop: 2 },
  notes: { fontSize: 12, color: '#999', marginTop: 4, fontStyle: 'italic' },
  triageButton: { backgroundColor: '#0066CC', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8 },
  triageButtonText: { color: '#fff', fontWeight: '600', fontSize: 14 },
});
