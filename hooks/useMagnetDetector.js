import { useState, useEffect, useRef } from 'react';
import { Magnetometer, Accelerometer } from 'expo-sensors'; 
import * as Haptics from 'expo-haptics';
import { useNotifications } from './useNotifications';
import { useVibration } from './useVibration';

export const useMagnetDetector = () => {
  const { 
      notificationsEnabled, setNotificationsEnabled, sendNotification,
      notifTitle, setNotifTitle, notifBody, setNotifBody
  } = useNotifications();
  
  const { 
    vibCount, setVibCount, 
    vibIntensity, setVibIntensity, 
    pulseDelay, setPulseDelay, 
    cooldownTime, setCooldownTime,
    heavyType, setHeavyType, 
    triggerVibration, isVibrating 
  } = useVibration();

  const [data, setData] = useState({ x: 0, y: 0, z: 0 });
  const [baseline, setBaseline] = useState(0); 
  const [isMagicMode, setIsMagicMode] = useState(false);
  
  const lastMagnitude = useRef(0);    
  const currentDeviceMotion = useRef(0); 
  const lastAccel = useRef({ x: 0, y: 0, z: 0 });

  const [detectMode, setDetectMode] = useState('proximity'); 
  const [sensitivity, setSensitivity] = useState(15);
  
  // Estado para el umbral de movimiento (Editable)
  // Valor por defecto 0.15 Gs
  const [motionThreshold, setMotionThreshold] = useState(0.15); 

  useEffect(() => {
    setHeavyType('STANDARD'); // Valor por defecto para el modo fuerte
    Magnetometer.setUpdateInterval(100); 
    const magSub = Magnetometer.addListener(handleSensorData);

    Accelerometer.setUpdateInterval(30);
    const accelSub = Accelerometer.addListener(handleAccelData);

    return () => {
      magSub.remove();
      accelSub.remove();
    };
  }, [baseline, sensitivity, isMagicMode, detectMode, notificationsEnabled, vibCount, vibIntensity, pulseDelay, cooldownTime, heavyType, motionThreshold]); 

  const handleAccelData = ({ x, y, z }) => {
      const change = Math.abs(x - lastAccel.current.x) + 
                     Math.abs(y - lastAccel.current.y) + 
                     Math.abs(z - lastAccel.current.z);
      
      currentDeviceMotion.current = change;
      lastAccel.current = { x, y, z };
  };

  const handleSensorData = (result) => { 
    if (isVibrating.current) return; 

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
    } 
    else {
        // USAMOS EL NUEVO VALOR PARAMETRIZABLE
        if (currentDeviceMotion.current > motionThreshold) {
            lastMagnitude.current = currentMagnitude; 
            return; 
        }

        const change = Math.abs(currentMagnitude - lastMagnitude.current);
        const magneticTrigger = Math.max(2, sensitivity / 3); 
        
        if (change > magneticTrigger) shouldTrigger = true;
    }

    lastMagnitude.current = currentMagnitude;

    if (shouldTrigger) {
      handleDetection();
    }
  };

  const handleDetection = () => {
    console.log("¡Objeto Detectado!");
    sendNotification();
    triggerVibration();
  };

  const calibrate = (silent = false) => {
    const currentMag = Math.sqrt(Math.pow(data.x, 2) + Math.pow(data.y, 2) + Math.pow(data.z, 2));
    setBaseline(currentMag);
    lastMagnitude.current = currentMag; 
    isVibrating.current = false;
    
    if (silent) {
       Haptics.selectionAsync();
    } else {
       Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  return {
    data, baseline, calibrate,
    isMagicMode, setIsMagicMode,
    detectMode, setDetectMode,
    sensitivity, setSensitivity,
    notificationsEnabled, setNotificationsEnabled,
    notifTitle, setNotifTitle,
    notifBody, setNotifBody,
    vibCount, setVibCount,
    vibIntensity, setVibIntensity,
    pulseDelay, setPulseDelay,
    cooldownTime, setCooldownTime,
    heavyType, setHeavyType,
    motionThreshold, setMotionThreshold
  };
};