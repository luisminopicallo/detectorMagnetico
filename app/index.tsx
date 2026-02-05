import React from 'react';
import { View, Text, TouchableOpacity, StatusBar, ScrollView, Switch } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import Slider from '@react-native-community/slider';
import * as Haptics from 'expo-haptics';

import { styles } from '../constants/styles';
import { useMagnetDetector } from '../hooks/useMagnetDetector';

export default function App() {
  const logic = useMagnetDetector();

  if (logic.isMagicMode) {
    return (
      <View style={styles.magicContainer}>
        <StatusBar hidden={true} />
        <TouchableOpacity 
          style={styles.invisibleButton} 
          activeOpacity={1} 
          onPress={() => logic.calibrate(true)}
          onLongPress={() => logic.setIsMagicMode(false)}
          delayLongPress={2000} 
        />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
          <StatusBar barStyle="dark-content" />
          <Text style={styles.headerTitle}>🧲 Configuración</Text>

          <ScrollView contentContainerStyle={styles.scrollContent}>
            
            <View style={styles.card}>
                <View style={styles.row}>
                    <Text style={styles.label}>Sensor:</Text>
                    <Text style={styles.value}>
                      {Math.sqrt(Math.pow(logic.data.x, 2) + Math.pow(logic.data.y, 2) + Math.pow(logic.data.z, 2)).toFixed(0)} µT
                    </Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Base:</Text>
                    <Text style={styles.value}>{logic.baseline.toFixed(0)} µT</Text>
                </View>
                <TouchableOpacity style={styles.smallBtn} onPress={() => logic.calibrate(false)}>
                    <Text style={styles.smallBtnText}>Recalibrar</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.controlGroup}>
                <View style={styles.rowCenter}>
                    <Text style={styles.groupTitleNoMargin}>Notificaciones (Watch)</Text>
                    <Switch 
                        trackColor={{ false: "#767577", true: "#34C759" }}
                        thumbColor={logic.notificationsEnabled ? "#fff" : "#f4f3f4"}
                        onValueChange={logic.setNotificationsEnabled}
                        value={logic.notificationsEnabled}
                    />
                </View>
                <Text style={styles.hint}>Envía una alerta al detectar el imán.</Text>
            </View>

            <View style={styles.controlGroup}>
                <Text style={styles.groupTitle}>Modo de Operación</Text>
                <View style={styles.segmentContainer}>
                    <TouchableOpacity 
                        style={[styles.segmentBtn, logic.detectMode === 'proximity' && styles.segmentBtnActive]}
                        onPress={() => logic.setDetectMode('proximity')}
                    >
                        <Text style={[styles.segmentText, logic.detectMode === 'proximity' && styles.segmentTextActive]}>Detección</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.segmentBtn, logic.detectMode === 'motion' && styles.segmentBtnActive]}
                        onPress={() => logic.setDetectMode('motion')}
                    >
                        <Text style={[styles.segmentText, logic.detectMode === 'motion' && styles.segmentTextActive]}>Cambio</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.controlGroup}>
                <Text style={styles.groupTitle}>Sensibilidad ({logic.sensitivity})</Text>
                <Slider
                    style={styles.slider}
                    minimumValue={5} maximumValue={50} step={1}
                    value={logic.sensitivity}
                    onValueChange={logic.setSensitivity}
                    minimumTrackTintColor="#007AFF"
                />
            </View>

            <View style={styles.controlGroup}>
                <Text style={styles.groupTitle}>Nº de Vibraciones: {logic.vibCount}</Text>
                <Slider
                    style={styles.slider}
                    minimumValue={1} maximumValue={10} step={1}
                    value={logic.vibCount}
                    onValueChange={logic.setVibCount}
                    minimumTrackTintColor="#34C759"
                />
            </View>

            <View style={styles.controlGroup}>
                <Text style={styles.groupTitle}>Intensidad</Text>
                <View style={styles.segmentContainer}>
                    {['Light', 'Medium', 'Heavy'].map((level) => (
                        <TouchableOpacity 
                            key={level}
                            style={[styles.segmentBtn, logic.vibIntensity === level && styles.segmentBtnActive]}
                            onPress={() => {
                                logic.setVibIntensity(level);
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                            }}
                        >
                            <Text style={[styles.segmentText, logic.vibIntensity === level && styles.segmentTextActive]}>
                                {level === 'Heavy' ? 'Fuerte' : level === 'Medium' ? 'Media' : 'Suave'}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View style={styles.controlGroup}>
                <Text style={styles.groupTitle}>Ritmo ({logic.pulseDelay}ms)</Text>
                <Slider
                    style={styles.slider}
                    minimumValue={100} maximumValue={1000} step={50}
                    value={logic.pulseDelay}
                    onValueChange={logic.setPulseDelay}
                    minimumTrackTintColor="#FF9500"
                />
            </View>

            <View style={styles.controlGroup}>
                <Text style={styles.groupTitle}>Pausa ({logic.cooldownTime/1000}s)</Text>
                <Slider
                    style={styles.slider}
                    minimumValue={500} maximumValue={5000} step={500}
                    value={logic.cooldownTime}
                    onValueChange={logic.setCooldownTime}
                    minimumTrackTintColor="#FF3B30"
                />
            </View>

            <View style={{height: 100}} /> 
          </ScrollView>

          <View style={styles.floatButtonContainer}>
            <TouchableOpacity style={styles.magicBtn} onPress={() => logic.setIsMagicMode(true)}>
                <Text style={styles.magicBtnText}>🔮 ACTIVAR MODO MAGIA</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
    </SafeAreaProvider>
  );
}