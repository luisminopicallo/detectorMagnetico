import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StatusBar, ScrollView, Switch, TextInput, Vibration, Platform } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import Slider from '@react-native-community/slider';
import * as Haptics from 'expo-haptics';
import * as NavigationBar from 'expo-navigation-bar';

import { styles } from '../constants/styles';
import { useMagnetDetector } from '../hooks/useMagnetDetector';

export default function App() {
  const logic = useMagnetDetector();

  // --- GESTIÓN DE BARRAS DE SISTEMA (TODO NEGRO SIEMPRE) ---
  useEffect(() => {
    const handleSystemBars = async () => {
      // 1. Asegurar fondo negro en Android siempre
      if (Platform.OS === 'android') {
        await NavigationBar.setBackgroundColorAsync("#000000");
        await NavigationBar.setBorderColorAsync("#000000");
      }

      if (logic.isMagicMode) {
        // === MODO MAGIA ===
        StatusBar.setHidden(true, 'fade'); // Ocultar barra superior
        if (Platform.OS === 'android') {
          await NavigationBar.setVisibilityAsync("hidden"); // Ocultar botones Android
          await NavigationBar.setBehaviorAsync('overlay-swipe');
        }
      } else {
        // === MODO CONFIGURACIÓN (DARK MODE) ===
        StatusBar.setHidden(false, 'fade');
        StatusBar.setBarStyle("light-content"); // Letras blancas sobre fondo negro

        if (Platform.OS === 'android') {
          await NavigationBar.setVisibilityAsync("visible");
          await NavigationBar.setButtonStyleAsync("light"); // Botones blancos (triángulo, círculo, cuadrado)
        }
      }
    };

    handleSystemBars();
  }, [logic.isMagicMode]); 

  // Flash visual sutil (Gris muy oscuro vs Negro)
  const magicBackgroundColor = (logic.isVisualCueActive && logic.vibIntensity !== 'Heavy') ? '#161616' : '#000000';

  return (
    // PROVIDER: Fondo negro total
    <SafeAreaProvider style={{ flex: 1, backgroundColor: '#000000' }}>
      
      {/* StatusBar Global */}
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor="#000000" 
        translucent={true}
        hidden={logic.isMagicMode} 

      />

      {logic.isMagicMode ? (
        // ================= MODO MAGIA =================
        <View style={{ flex: 1, height: '100%', backgroundColor: magicBackgroundColor }}>
           <TouchableOpacity 
            style={styles.invisibleButton} 
            activeOpacity={1} 
            onPress={() => logic.calibrate(true)}      
            onLongPress={() => logic.setIsMagicMode(false)} 
            delayLongPress={2000} 
          />
        </View>
      ) : (
        // ================= MODO CONFIGURACIÓN =================
        // SafeAreaView con fondo NEGRO
        <SafeAreaView style={{ flex: 1, backgroundColor: '#000000', height: '100%' }} edges={['right', 'left']}>
          
          <Text style={[styles.headerTitle, { marginTop: 20 }]}>🧲 Configuración</Text>

          <ScrollView contentContainerStyle={styles.scrollContent}>
            
            {/* TARJETA SENSOR */}
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
                    <Text style={styles.smallBtnText}>Recalibrar Base</Text>
                </TouchableOpacity>
            </View>

            {/* NOTIFICACIONES */}
            <View style={styles.controlGroup}>
                <View style={styles.rowCenter}>
                    <Text style={styles.groupTitleNoMargin}>Notificaciones (Watch)</Text>
                    <Switch 
                        trackColor={{ false: "#333", true: "#34C759" }}
                        thumbColor={logic.notificationsEnabled ? "#fff" : "#f4f3f4"}
                        onValueChange={logic.setNotificationsEnabled}
                        value={logic.notificationsEnabled}
                    />
                </View>
                {logic.notificationsEnabled && (
                  <View style={{marginTop: 10}}>
                    <Text style={styles.label}>Título:</Text>
                    <TextInput 
                      style={styles.input}
                      placeholderTextColor="#666"
                      value={logic.notifTitle}
                      onChangeText={logic.setNotifTitle}
                      placeholder="Ej: Batería Baja"
                    />
                    <Text style={styles.label}>Mensaje:</Text>
                    <TextInput 
                      style={styles.input}
                      placeholderTextColor="#666"
                      value={logic.notifBody}
                      onChangeText={logic.setNotifBody}
                      placeholder="Ej: Conectar cargador"
                    />
                  </View>
                )}
            </View>

            {/* MODO OPERACIÓN */}
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

                {logic.detectMode === 'motion' && (
                    <View style={{marginTop: 20}}>
                        <Text style={[styles.label, {fontSize: 14}]}>
                            Tolerancia al Movimiento: {logic.motionThreshold.toFixed(2)} G
                        </Text>
                        <Slider
                            style={styles.slider}
                            minimumValue={0.05}
                            maximumValue={0.50}
                            step={0.01}
                            value={logic.motionThreshold}
                            onValueChange={logic.setMotionThreshold}
                            minimumTrackTintColor="#8E8E93"
                            maximumTrackTintColor="#333333" 
                            thumbTintColor="#FFFFFF"
                        />
                        <Text style={styles.hint}>
                            Izquierda: Estricto. Derecha: Permisivo.
                        </Text>
                    </View>
                )}
            </View>

            {/* SENSIBILIDAD */}
            <View style={styles.controlGroup}>
                <Text style={styles.groupTitle}>Sensibilidad ({logic.sensitivity})</Text>
                <Slider
                    style={styles.slider}
                    minimumValue={5} maximumValue={50} step={1}
                    value={logic.sensitivity}
                    onValueChange={logic.setSensitivity}
                    minimumTrackTintColor="#0A84FF"
                    maximumTrackTintColor="#333333" 
                    thumbTintColor="#FFFFFF"
                />
            </View>

            {/* INTENSIDAD */}
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

                {logic.vibIntensity === 'Heavy' && (
                  <View style={{marginTop: 15}}>
                     <Text style={[styles.label, {fontSize: 14, marginBottom: 5}]}>Tipo de Motor:</Text>
                     <View style={styles.segmentContainer}>
                        <TouchableOpacity 
                            style={[styles.segmentBtn, logic.heavyType === 'HAPTIC' && styles.segmentBtnActive]}
                            onPress={() => {
                              logic.setHeavyType('HAPTIC');
                              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                            }}
                        >
                            <Text style={[styles.segmentText, logic.heavyType === 'HAPTIC' && styles.segmentTextActive]}>Háptico</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[styles.segmentBtn, logic.heavyType === 'STANDARD' && styles.segmentBtnActive]}
                            onPress={() => {
                              logic.setHeavyType('STANDARD');
                              Vibration.vibrate(100);
                            }}
                        >
                            <Text style={[styles.segmentText, logic.heavyType === 'STANDARD' && styles.segmentTextActive]}>Motor</Text>
                        </TouchableOpacity>
                     </View>
                     <Text style={styles.hint}>
                        {logic.heavyType === 'HAPTIC' ? "Ráfaga rápida (Taptic)." : "Vibración bruta (Motor)."}
                     </Text>
                  </View>
                )}
            </View>

            {/* CONTADORES */}
            <View style={styles.controlGroup}>
                <Text style={styles.groupTitle}>Nº de Vibraciones: {logic.vibCount}</Text>
                <Slider
                    style={styles.slider}
                    minimumValue={1} maximumValue={10} step={1}
                    value={logic.vibCount}
                    onValueChange={logic.setVibCount}
                    minimumTrackTintColor="#30D158"
                    maximumTrackTintColor="#333333" 
                    thumbTintColor="#FFFFFF"
                />
            </View>

            <View style={styles.controlGroup}>
                <Text style={styles.groupTitle}>Ritmo ({logic.pulseDelay}ms)</Text>
                <Slider
                    style={styles.slider}
                    minimumValue={100} maximumValue={1000} step={50}
                    value={logic.pulseDelay}
                    onValueChange={logic.setPulseDelay}
                    minimumTrackTintColor="#FF9F0A"
                    maximumTrackTintColor="#333333" 
                    thumbTintColor="#FFFFFF"
                />
            </View>

            <View style={styles.controlGroup}>
                <Text style={styles.groupTitle}>Pausa ({logic.cooldownTime/1000}s)</Text>
                <Slider
                    style={styles.slider}
                    minimumValue={500} maximumValue={5000} step={500}
                    value={logic.cooldownTime}
                    onValueChange={logic.setCooldownTime}
                    minimumTrackTintColor="#FF453A"
                    maximumTrackTintColor="#333333" 
                    thumbTintColor="#FFFFFF"
                />
            </View>

            <View style={{height: 100}} /> 
          </ScrollView>

          <View style={styles.floatButtonContainer}>
            <TouchableOpacity style={styles.magicBtn} onPress={() => logic.setIsMagicMode(true)}>
                <Text style={styles.magicBtnText}>🔮 MODO MAGIA</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      )}
    </SafeAreaProvider>
  );
}