import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, StatusBar, SafeAreaView, ScrollView, Switch, Platform } from 'react-native';
import { Magnetometer } from 'expo-sensors';
import * as Haptics from 'expo-haptics';
import Slider from '@react-native-community/slider';
import * as Notifications from 'expo-notifications';

// CONFIGURACIÓN DE NOTIFICACIONES
// Esto permite que la notificación salga incluso si la app está abierta en primer plano
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function App() {
  // --- ESTADOS DEL SENSOR ---
  const [data, setData] = useState({ x: 0, y: 0, z: 0 });
  const [baseline, setBaseline] = useState(0); 
  const [isMagicMode, setIsMagicMode] = useState(false);
  
  // Refs para lógica interna (no renderizan)
  const isProcessing = useRef(false); 
  const lastMagnitude = useRef(0);    

  // --- CONFIGURACIÓN PERSONALIZABLE ---
  const [detectMode, setDetectMode] = useState('proximity'); 
  const [sensitivity, setSensitivity] = useState(15);
  const [vibCount, setVibCount] = useState(4);          
  const [vibIntensity, setVibIntensity] = useState('Heavy'); 
  const [pulseDelay, setPulseDelay] = useState(400);    
  const [cooldownTime, setCooldownTime] = useState(2000); 
  
  // NUEVO: ESTADO PARA NOTIFICACIONES
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    // Pedir permisos de notificación al cargar la app
    registerForPushNotificationsAsync();

    Magnetometer.setUpdateInterval(60); 
    const subscription = Magnetometer.addListener(handleSensorData);
    return () => subscription.remove();
  }, [baseline, sensitivity, isMagicMode, vibCount, vibIntensity, pulseDelay, cooldownTime, detectMode, notificationsEnabled]); 

  // Función para pedir permiso en iOS
  async function registerForPushNotificationsAsync() {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.log('Fallo al obtener permisos de notificación');
    }
  }

  const handleSensorData = (result: any) => {
    if (isProcessing.current) return; 

    const currentMagnitude = Math.sqrt(
      Math.pow(result.x, 2) + Math.pow(result.y, 2) + Math.pow(result.z, 2)
    );

    setData(result); 

    if (baseline === 0) {
      setBaseline(currentMagnitude);
      lastMagnitude.current = currentMagnitude;
      return;
    }

    let shouldTrigger = false;
    
    if (detectMode === 'proximity') {
        const diff = Math.abs(currentMagnitude - baseline);
        if (diff > sensitivity) shouldTrigger = true;
    } else {
        const change = Math.abs(currentMagnitude - lastMagnitude.current);
        const motionThreshold = Math.max(2, sensitivity / 3); 
        if (change > motionThreshold) shouldTrigger = true;
    }

    lastMagnitude.current = currentMagnitude;

    if (shouldTrigger) {
      triggerVibrationPattern();
    }
  };

  const triggerVibrationPattern = async () => {
    isProcessing.current = true; 
    console.log("¡Detectado!");

    // --- NUEVO: ENVIAR NOTIFICACIÓN SI ESTÁ ACTIVO ---
    if (notificationsEnabled) {
        await Notifications.scheduleNotificationAsync({
            content: {
                title: "🔮 Sensor Activado",
                body: "Objeto magnético detectado",
                data: { data: 'secret' },
            },
            trigger: null, // Enviar inmediatamente
        });
    }
    // -------------------------------------------------

    let impactStyle = Haptics.ImpactFeedbackStyle.Heavy;
    if (vibIntensity === 'Light') impactStyle = Haptics.ImpactFeedbackStyle.Light;
    if (vibIntensity === 'Medium') impactStyle = Haptics.ImpactFeedbackStyle.Medium;

    for (let i = 0; i < vibCount; i++) {
        await Haptics.impactAsync(impactStyle);
        await new Promise(resolve => setTimeout(resolve, pulseDelay));
    }

    await new Promise(resolve => setTimeout(resolve, cooldownTime));
    
    isProcessing.current = false;
  };

  const calibrate = (silent = false) => {
    const currentMag = Math.sqrt(
      Math.pow(data.x, 2) + Math.pow(data.y, 2) + Math.pow(data.z, 2)
    );
    setBaseline(currentMag);
    lastMagnitude.current = currentMag; 
    isProcessing.current = false;
    
    if (silent) {
       Haptics.selectionAsync();
    } else {
       Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  if (isMagicMode) {
    return (
      <View style={styles.magicContainer}>
        <StatusBar hidden={true} />
        <TouchableOpacity 
          style={styles.invisibleButton} 
          activeOpacity={1} 
          onPress={() => calibrate(true)}
          onLongPress={() => setIsMagicMode(false)}
          delayLongPress={2000} 
        />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Text style={styles.headerTitle}>🧲 Configuración</Text>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* INFO SENSOR */}
        <View style={styles.card}>
            <View style={styles.row}>
                <Text style={styles.label}>Sensor:</Text>
                <Text style={styles.value}>{Math.sqrt(Math.pow(data.x, 2) + Math.pow(data.y, 2) + Math.pow(data.z, 2)).toFixed(0)} µT</Text>
            </View>
            <View style={styles.row}>
                <Text style={styles.label}>Base:</Text>
                <Text style={styles.value}>{baseline.toFixed(0)} µT</Text>
            </View>
            <TouchableOpacity style={styles.smallBtn} onPress={() => calibrate(false)}>
                <Text style={styles.smallBtnText}>Recalibrar</Text>
            </TouchableOpacity>
        </View>

        {/* --- NUEVO BLOQUE: NOTIFICACIONES --- */}
        <View style={styles.controlGroup}>
            <View style={styles.rowCenter}>
                <Text style={styles.groupTitleNoMargin}>Notificaciones (Watch)</Text>
                <Switch 
                    trackColor={{ false: "#767577", true: "#34C759" }}
                    thumbColor={notificationsEnabled ? "#fff" : "#f4f3f4"}
                    onValueChange={setNotificationsEnabled}
                    value={notificationsEnabled}
                />
            </View>
            <Text style={styles.hint}>
                Envía una alerta al Apple Watch al detectar el imán. 
                (Puede tener 1-2s de retraso por Bluetooth).
            </Text>
        </View>
        {/* ------------------------------------ */}

        {/* MODO */}
        <View style={styles.controlGroup}>
            <Text style={styles.groupTitle}>Modo de Operación</Text>
            <View style={styles.segmentContainer}>
                <TouchableOpacity 
                    style={[styles.segmentBtn, detectMode === 'proximity' && styles.segmentBtnActive]}
                    onPress={() => setDetectMode('proximity')}
                >
                    <Text style={[styles.segmentText, detectMode === 'proximity' && styles.segmentTextActive]}>
                        Detección
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.segmentBtn, detectMode === 'motion' && styles.segmentBtnActive]}
                    onPress={() => setDetectMode('motion')}
                >
                    <Text style={[styles.segmentText, detectMode === 'motion' && styles.segmentTextActive]}>
                        Cambio
                    </Text>
                </TouchableOpacity>
            </View>
        </View>

        {/* SENSIBILIDAD */}
        <View style={styles.controlGroup}>
            <Text style={styles.groupTitle}>Sensibilidad (Umbral: {sensitivity})</Text>
            <Slider
                style={styles.slider}
                minimumValue={5}
                maximumValue={50}
                step={1}
                value={sensitivity}
                onValueChange={setSensitivity}
                minimumTrackTintColor="#007AFF"
            />
            <Text style={styles.hint}>
                {detectMode === 'proximity' ? "Umbral sobre la base" : "Umbral de velocidad de cambio"}
            </Text>
        </View>

        {/* VIBRACIONES */}
        <View style={styles.controlGroup}>
            <Text style={styles.groupTitle}>Nº de Vibraciones: {vibCount}</Text>
            <Slider
                style={styles.slider}
                minimumValue={1}
                maximumValue={10}
                step={1}
                value={vibCount}
                onValueChange={setVibCount}
                minimumTrackTintColor="#34C759"
            />
        </View>

        {/* INTENSIDAD */}
        <View style={styles.controlGroup}>
            <Text style={styles.groupTitle}>Intensidad</Text>
            <View style={styles.segmentContainer}>
                {['Light', 'Medium', 'Heavy'].map((level) => (
                    <TouchableOpacity 
                        key={level}
                        style={[styles.segmentBtn, vibIntensity === level && styles.segmentBtnActive]}
                        onPress={() => {
                            setVibIntensity(level);
                            if(level === 'Light') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            if(level === 'Medium') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                            if(level === 'Heavy') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                        }}
                    >
                        <Text style={[styles.segmentText, vibIntensity === level && styles.segmentTextActive]}>
                            {level === 'Heavy' ? 'Fuerte' : level === 'Medium' ? 'Media' : 'Suave'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>

        {/* RITMO */}
        <View style={styles.controlGroup}>
            <Text style={styles.groupTitle}>Ritmo (Pausa: {pulseDelay}ms)</Text>
            <Slider
                style={styles.slider}
                minimumValue={100}
                maximumValue={1000}
                step={50}
                value={pulseDelay}
                onValueChange={setPulseDelay}
                minimumTrackTintColor="#FF9500"
            />
            <Text style={styles.hint}>{"Rápido <-----> Lento"}</Text>
        </View>

        {/* COOLDOWN */}
        <View style={styles.controlGroup}>
            <Text style={styles.groupTitle}>Pausa tras detectar ({cooldownTime/1000}s)</Text>
            <Slider
                style={styles.slider}
                minimumValue={500}
                maximumValue={5000}
                step={500}
                value={cooldownTime}
                onValueChange={setCooldownTime}
                minimumTrackTintColor="#FF3B30"
            />
            <Text style={styles.hint}>Tiempo muerto tras activarse</Text>
        </View>

        <View style={{height: 100}} /> 
      </ScrollView>

      <View style={styles.floatButtonContainer}>
        <TouchableOpacity style={styles.magicBtn} onPress={() => setIsMagicMode(true)}>
            <Text style={styles.magicBtnText}>🔮 ACTIVAR MODO MAGIA</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  scrollContent: { padding: 20, alignItems: 'center' },
  magicContainer: { flex: 1, backgroundColor: '#000000' },
  invisibleButton: { flex: 1, width: '100%' },
  headerTitle: { fontSize: 28, fontWeight: '900', color: '#333', textAlign: 'center', marginVertical: 10 },
  card: { backgroundColor: 'white', padding: 15, borderRadius: 15, width: '100%', marginBottom: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  label: { fontSize: 16, color: '#666' },
  value: { fontSize: 18, fontWeight: 'bold', fontVariant: ['tabular-nums'] },
  smallBtn: { marginTop: 10, backgroundColor: '#E5E5EA', padding: 8, borderRadius: 8, alignItems: 'center' },
  smallBtnText: { color: '#007AFF', fontWeight: '600'},
  
  controlGroup: { width: '100%', marginBottom: 25, backgroundColor: '#fff', padding: 15, borderRadius: 12 },
  groupTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, color: '#333' },
  
  // ESTILOS NUEVOS PARA EL SWITCH
  rowCenter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  groupTitleNoMargin: { fontSize: 16, fontWeight: 'bold', color: '#333' },

  slider: { width: '100%', height: 40 },
  hint: { fontSize: 11, color: '#999', textAlign: 'center', marginTop: -5 },
  segmentContainer: { flexDirection: 'row', backgroundColor: '#E5E5EA', borderRadius: 8, padding: 2 },
  segmentBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 6 },
  segmentBtnActive: { backgroundColor: '#fff', shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 1 },
  segmentText: { fontSize: 13, fontWeight: '500', color: '#666' },
  segmentTextActive: { color: '#000', fontWeight: 'bold' },
  floatButtonContainer: { position: 'absolute', bottom: 30, left: 0, right: 0, alignItems: 'center' },
  magicBtn: { backgroundColor: '#000', paddingVertical: 18, paddingHorizontal: 30, borderRadius: 30, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  magicBtnText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
});