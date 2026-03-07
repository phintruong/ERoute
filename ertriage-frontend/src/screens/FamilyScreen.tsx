import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import FamilyMemberCard from '../components/FamilyMemberCard';
import { FamilyMember } from '../../../shared/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Family'>;

export default function FamilyScreen({ navigation }: Props) {
  const [members, setMembers] = useState<FamilyMember[]>([]);

  // TODO: fetch family members on mount

  function handleTriageForMember(memberId: string) {
    navigation.navigate('Vitals', { memberId });
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Family Profiles</Text>

      {members.length === 0 ? (
        <Text style={styles.empty}>No family members added yet.</Text>
      ) : (
        <FlatList
          data={members}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <FamilyMemberCard member={item} onTriage={() => handleTriageForMember(item.id)} />
          )}
        />
      )}

      <TouchableOpacity style={styles.addButton}>
        <Text style={styles.addButtonText}>+ Add Family Member</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#F5F7FA' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#0066CC', marginBottom: 16 },
  empty: { color: '#999', fontSize: 16, marginBottom: 24 },
  addButton: { backgroundColor: '#0066CC', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 16 },
  addButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
