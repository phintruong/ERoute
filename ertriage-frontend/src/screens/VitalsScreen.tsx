import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import VitalsMeter from '../components/VitalsMeter';
import { useStore } from '../store';

type Props = NativeStackScreenProps<RootStackParamList, 'Vitals'>;

export default function VitalsScreen({ navigation, route }: Props) {
  const [presageFailed, setPresageFailed] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const setVitals = useStore((s) => s.setVitals);

  // Manual input fallback
  const [manualHR, setManualHR] = useState('');
  const [manualRR, setManualRR] = useState('');

  const [currentVitals, setCurrentVitals] = useState({
    heartRate: 0,
    respiratoryRate: 0,
    stressIndex: 0,
    emotionState: 'neutral',
  });

  useEffect(() => {
    // TODO: Initialize Presage SmartSpectra SDK
    // On failure, set presageFailed = true
    initializePresage();
  }, []);

  async function initializePresage() {
    try {
      // TODO: Replace with actual Presage SDK initialization
      // const token = await PresageSDK.initialize(PRESAGE_API_KEY);
      // if (!token) setPresageFailed(true);
    } catch {
      setPresageFailed(true);
    }
  }

  function startScan() {
    setScanning(true);
    // 30-second capture window
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setScanning(false);
          return 100;
        }
        return prev + 100 / 30;
      });
    }, 1000);
  }

  function handleContinue() {
    const vitals = presageFailed
      ? {
          heartRate: parseInt(manualHR) || 72,
          respiratoryRate: parseInt(manualRR) || 16,
          stressIndex: 0,
          emotionState: 'unknown',
        }
      : currentVitals;

    setVitals(vitals);
    navigation.navigate('Symptoms', { memberId: route.params?.memberId });
  }

  if (presageFailed) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Enter Your Vitals</Text>
        <Text style={styles.label}>Heart Rate (bpm)</Text>
        <TextInput style={styles.input} keyboardType="numeric" value={manualHR} onChangeText={setManualHR} placeholder="e.g. 72" />
        <Text style={styles.label}>Respiratory Rate (breaths/min)</Text>
        <TextInput style={styles.input} keyboardType="numeric" value={manualRR} onChangeText={setManualRR} placeholder="e.g. 16" />
        <TouchableOpacity style={styles.button} onPress={handleContinue}>
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Vitals Scan</Text>
      <Text style={styles.subtitle}>Hold your face steady in front of the camera</Text>

      <VitalsMeter heartRate={currentVitals.heartRate} respiratoryRate={currentVitals.respiratoryRate} stressIndex={currentVitals.stressIndex} />

      {!scanning && progress === 0 && (
        <TouchableOpacity style={styles.button} onPress={startScan}>
          <Text style={styles.buttonText}>Start Scan</Text>
        </TouchableOpacity>
      )}

      {scanning && (
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${progress}%` }]} />
          <Text style={styles.progressText}>{Math.round(progress)}%</Text>
        </View>
      )}

      {!scanning && progress >= 100 && (
        <TouchableOpacity style={styles.button} onPress={handleContinue}>
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#F5F7FA' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#0066CC', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '500', color: '#333', marginBottom: 4, marginTop: 16 },
  input: { borderWidth: 1, borderColor: '#DDD', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#fff' },
  button: { backgroundColor: '#0066CC', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 24 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  progressContainer: { marginTop: 24, backgroundColor: '#E0E0E0', borderRadius: 8, height: 24, overflow: 'hidden' },
  progressBar: { backgroundColor: '#0066CC', height: '100%', borderRadius: 8 },
  progressText: { position: 'absolute', alignSelf: 'center', lineHeight: 24, fontWeight: '600', color: '#333' },
});
