import { useState, useEffect, useRef } from 'react';
import { Magnetometer } from 'expo-sensors';
import * as Haptics from 'expo-haptics';
import { useNotifications } from './useNotifications';
import { useVibration } from './useVibration';

export const useMagnetDetector = () => {
  const { 
      notificationsEnabled, setNotificationsEnabled, sendNotification,
      notifTitle, setNotifTitle,
      notifBody, setNotifBody
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
  const [detectMode, setDetectMode] = useState('proximity'); 
  const [sensitivity, setSensitivity] = useState(15);

  useEffect(() => {
    setHeavyType('STANDARD');
    Magnetometer.setUpdateInterval(60); 
    const subscription = Magnetometer.addListener(handleSensorData);
    return () => subscription.remove();
  }, [baseline, sensitivity, isMagicMode, detectMode, notificationsEnabled, vibCount, vibIntensity, pulseDelay, cooldownTime, heavyType]); 

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
    } else {
        const change = Math.abs(currentMagnitude - lastMagnitude.current);
        const motionThreshold = Math.max(2, sensitivity / 3); 
        if (change > motionThreshold) shouldTrigger = true;
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
    // Notificaciones completas
    notificationsEnabled, setNotificationsEnabled,
    notifTitle, setNotifTitle,
    notifBody, setNotifBody,
    // Vibración completa
    vibCount, setVibCount,
    vibIntensity, setVibIntensity,
    pulseDelay, setPulseDelay,
    cooldownTime, setCooldownTime,
    heavyType, setHeavyType
  };
};