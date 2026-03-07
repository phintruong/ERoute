import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';

type Props = NativeStackScreenProps<RootStackParamList, 'Booking'>;

export default function BookingScreen({ route }: Props) {
  const { clinicName, clinicAddress } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{clinicName}</Text>
      <Text style={styles.address}>{clinicAddress}</Text>

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Book Appointment</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryButton} onPress={() => Linking.openURL(`tel:`)}>
        <Text style={styles.secondaryButtonText}>Call Clinic</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#F5F7FA' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#0066CC', marginBottom: 8 },
  address: { fontSize: 16, color: '#555', marginBottom: 32 },
  button: { backgroundColor: '#0066CC', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginBottom: 12 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  secondaryButton: { backgroundColor: '#E8F0FE', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  secondaryButtonText: { color: '#0066CC', fontSize: 16, fontWeight: '600' },
});
