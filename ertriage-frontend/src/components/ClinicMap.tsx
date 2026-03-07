import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  lat: number;
  lng: number;
}

export default function ClinicMap({ lat, lng }: Props) {
  // TODO: Integrate Mapbox GL for web, card list for mobile
  return (
    <View style={styles.container}>
      <Text style={styles.placeholder}>Map view — {lat.toFixed(4)}, {lng.toFixed(4)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { height: 200, backgroundColor: '#E0E0E0', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  placeholder: { color: '#666', fontSize: 14 },
});
