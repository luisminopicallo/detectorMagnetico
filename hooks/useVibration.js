import { useState, useRef } from 'react';
import { Vibration } from 'react-native'; // Importamos el motor estándar
import * as Haptics from 'expo-haptics';

export const useVibration = () => {
  // --- CONFIGURACIÓN ---
  const [vibCount, setVibCount] = useState(4);          
  const [vibIntensity, setVibIntensity] = useState('Heavy'); 
  const [pulseDelay, setPulseDelay] = useState(400);    
  const [cooldownTime, setCooldownTime] = useState(2000);
  
  // NUEVO: Elegir motor para el modo Fuerte ('HAPTIC' o 'STANDARD')
  const [heavyType, setHeavyType] = useState('HAPTIC'); 

  const isVibrating = useRef(false); 

  const triggerVibration = async () => {
    if (isVibrating.current) return;
    isVibrating.current = true; 
    
    const executeSinglePulse = async () => {
        if (vibIntensity === 'Light') {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        } 
        else if (vibIntensity === 'Medium') {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            await new Promise(r => setTimeout(r, 60));
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        } 
        else {
            // MODO FUERTE: Decidimos según la configuración
            if (heavyType === 'STANDARD') {
                // Opción A: Motor clásico (VIBRATION API)
                // Vibra 150ms. Es ruidoso pero se siente en el bolsillo de un vaquero grueso.
                Vibration.vibrate(150);
            } else {
                // Opción B: Haptic Engine (Ráfaga silenciosa)
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                await new Promise(r => setTimeout(r, 30));
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                await new Promise(r => setTimeout(r, 30));
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            }
        }
    };

    for (let i = 0; i < vibCount; i++) {
        await executeSinglePulse();
        await new Promise(resolve => setTimeout(resolve, pulseDelay));
    }

    await new Promise(resolve => setTimeout(resolve, cooldownTime));
    isVibrating.current = false;
  };

  return {
    vibCount, setVibCount,
    vibIntensity, setVibIntensity,
    pulseDelay, setPulseDelay,
    cooldownTime, setCooldownTime,
    heavyType, setHeavyType, // Exportamos la nueva config
    triggerVibration,
    isVibrating 
  };
};