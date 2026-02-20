// C:\Mi_TurnoMuni\src\screens\feriados\HolidaysScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, ActivityIndicator,
  RefreshControl, SafeAreaView, TouchableOpacity, ListRenderItem
} from 'react-native';
import { HolidayService } from '../../services/api';

interface Holiday {
  id: string;
  fecha: string;
  nombreLocal: string;
  tipo: string;
  esNacional: boolean;
  afectaAgendamientos: boolean;
}

const HolidaysScreen: React.FC = () => {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadHolidays = async () => {
    try {
      setError(null);
      const data = await HolidayService.getHolidays();
      setHolidays(data);
    } catch (err: any) {
      setError(err.message || 'No se pudieron cargar los feriados');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadHolidays();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadHolidays();
  };

  const renderItem: ListRenderItem<Holiday> = ({ item }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => console.log('Feriado seleccionado:', item)}
    >
      <View style={styles.dateContainer}>
        <Text style={styles.date}>{new Date(item.fecha).getDate()}</Text>
        <Text style={styles.month}>
          {new Date(item.fecha).toLocaleString('es-EC', { month: 'short' })}
        </Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{item.nombreLocal}</Text>
        <Text style={styles.type} numberOfLines={1}>
          {item.tipo} {item.esNacional ? '• Nacional' : ''}
        </Text>
        {item.afectaAgendamientos && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>⚠️ Sin agendamientos</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>Cargando feriados 2026...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>❌ {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadHolidays}>
          <Text style={styles.retryText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📅 Feriados Ecuador 2026</Text>
        <Text style={styles.subtitle}>
          {holidays.length} días festivos • Mi_Appmovil
        </Text>
      </View>

      <FlatList
        data={holidays}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>No hay feriados registrados</Text>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    padding: 16, backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#eee'
  },
  title: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  subtitle: { fontSize: 14, color: '#666', marginTop: 4 },
  list: { padding: 16 },
  card: {
    flexDirection: 'row', backgroundColor: '#fff',
    borderRadius: 12, padding: 14, marginBottom: 12,
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.1,
    shadowRadius: 4, shadowOffset: { width: 0, height: 2 }
  },
  dateContainer: {
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#0066cc', borderRadius: 8,
    width: 50, height: 50, marginRight: 12
  },
  date: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  month: { color: '#fff', fontSize: 10, textTransform: 'uppercase' },
  info: { flex: 1, justifyContent: 'center' },
  name: { fontSize: 16, fontWeight: '600', color: '#333' },
  type: { fontSize: 13, color: '#666', marginTop: 2 },
  badge: {
    backgroundColor: '#fff3cd', alignSelf: 'flex-start',
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, marginTop: 6
  },
  badgeText: { color: '#856404', fontSize: 11, fontWeight: '500' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  loadingText: { marginTop: 12, color: '#666' },
  error: { color: '#dc3545', textAlign: 'center', marginBottom: 16 },
  retryButton: {
    backgroundColor: '#0066cc', paddingHorizontal: 24,
    paddingVertical: 10, borderRadius: 8
  },
  retryText: { color: '#fff', fontWeight: '600' },
  empty: { textAlign: 'center', color: '#999', marginTop: 40 }
});

export default HolidaysScreen;
