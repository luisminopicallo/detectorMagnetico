import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  scrollContent: { padding: 20, alignItems: 'center' },
  magicContainer: { flex: 1, backgroundColor: '#000000' },
  invisibleButton: { flex: 1, width: '100%' },
  headerTitle: { fontSize: 28, fontWeight: '900', color: '#333', textAlign: 'center', marginVertical: 10 },
  card: { backgroundColor: 'white', padding: 15, borderRadius: 15, width: '100%', marginBottom: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  label: { fontSize: 16, color: '#666' },
  value: { fontSize: 18, fontWeight: 'bold' },
  smallBtn: { marginTop: 10, backgroundColor: '#E5E5EA', padding: 8, borderRadius: 8, alignItems: 'center' },
  smallBtnText: { color: '#007AFF', fontWeight: '600'},
  
  controlGroup: { width: '100%', marginBottom: 25, backgroundColor: '#fff', padding: 15, borderRadius: 12 },
  groupTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, color: '#333' },
  
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