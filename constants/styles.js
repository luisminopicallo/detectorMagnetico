import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  // FONDOS Y CONTENEDORES PRINCIPALES
  container: { flex: 1, backgroundColor: '#000000' }, // Fondo negro total
  scrollContent: { padding: 20, alignItems: 'center', paddingBottom: 100 },
  magicContainer: { flex: 1, backgroundColor: '#000000' }, // Mantiene la magia
  invisibleButton: { flex: 1, width: '100%' },
  
  // TÍTULOS Y TEXTOS
  headerTitle: { fontSize: 28, fontWeight: '900', color: '#FFFFFF', textAlign: 'center', marginVertical: 10 },
  label: { fontSize: 16, color: '#8E8E93', marginBottom: 5 }, // Gris suave para etiquetas
  value: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' }, // Blanco para valores
  hint: { fontSize: 11, color: '#636366', textAlign: 'center', marginTop: 5 },

  // TARJETAS (CARDS) - Ahora Gris Oscuro
  card: { 
    backgroundColor: '#1C1C1E', 
    padding: 15, 
    borderRadius: 15, 
    width: '100%', 
    marginBottom: 20, 
    // Sombra sutil oscura
    shadowColor: "#000", 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.5, 
    shadowRadius: 4, 
    elevation: 5 // Para Android
  },
  
  // ELEMENTOS DENTRO DE TARJETAS
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5, alignItems: 'center' },
  rowCenter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  
  // BOTONES PEQUEÑOS
  smallBtn: { marginTop: 10, backgroundColor: '#2C2C2E', padding: 10, borderRadius: 8, alignItems: 'center' },
  smallBtnText: { color: '#0A84FF', fontWeight: '600'}, // Azul iOS Dark Mode
  
  // GRUPOS DE CONTROL
  controlGroup: { 
    width: '100%', 
    marginBottom: 20, 
    backgroundColor: '#1C1C1E', // Gris Oscuro
    padding: 15, 
    borderRadius: 12 
  },
  groupTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12, color: '#FFFFFF' },
  groupTitleNoMargin: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF' },

  // SLIDERS
  slider: { width: '100%', height: 40 },

  // BOTONES DE SEGMENTO (TABS)
  segmentContainer: { flexDirection: 'row', backgroundColor: '#000000', borderRadius: 8, padding: 2 },
  segmentBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 6 },
  segmentBtnActive: { backgroundColor: '#636366' }, // Gris medio para activo
  segmentText: { fontSize: 13, fontWeight: '500', color: '#8E8E93' },
  segmentTextActive: { color: '#FFFFFF', fontWeight: 'bold' },
  
  // INPUTS DE TEXTO
  input: {
    backgroundColor: '#000000',
    color: '#FFFFFF',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#333333',
    marginBottom: 10
  },

  // BOTÓN MÁGICO FLOTANTE
  floatButtonContainer: { position: 'absolute', bottom: 30, left: 0, right: 0, alignItems: 'center' },
  magicBtn: { 
    backgroundColor: '#FFFFFF', // Botón blanco para resaltar en la oscuridad
    paddingVertical: 18, 
    paddingHorizontal: 30, 
    borderRadius: 30, 
    shadowColor: "#FFFFFF", // Resplandor blanco
    shadowOffset: { width: 0, height: 0 }, 
    shadowOpacity: 0.2, 
    shadowRadius: 10, 
    elevation: 5 
  },
  magicBtnText: { color: '#000000', fontSize: 18, fontWeight: 'bold' },
});