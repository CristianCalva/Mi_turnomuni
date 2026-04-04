import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Alert, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTurnosStore } from '../../stores/turnosStore';
import { styles } from '../../theme/styles';
import { useAuthStore } from '../../stores/authStore';
import { useNavigation } from '@react-navigation/native';
import TurnoCard from '../../components/TurnoCard';
import CancelTurnoModal from '../../components/CancelTurnoModal';
import { getTurnos, cancelarTurnoApi } from '../../services/turnosService';

export default function MisTurnosScreen() {
  const { turnos, cancelarTurno } = useTurnosStore();
  const { isAuthenticated, user } = useAuthStore();
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [cancelTurnoId, setCancelTurnoId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      // @ts-ignore
      navigation.reset?.({ index: 0, routes: [{ name: 'Login' }] });
    }
  }, [isAuthenticated]);

  useEffect(() => {
    // cargar turnos desde backend al montar
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        // @ts-ignore
        const token = useAuthStore.getState().token;
        const remote = await getTurnos(token ?? undefined);
        if (!mounted) return;
        // mapear respuesta al tipo Turno esperado
        const mapped = (remote || []).map((r: any) => ({
          id: String(r.id ?? r._id ?? r.uuid ?? `${r.fecha}-${r.hora}`),
          tramite: r.tramite_nombre || r.tramite || r.nombre || 'Trámite',
          fecha: r.fecha || r.date || '',
          hora: r.hora || r.time || '',
          numero: r.numero || r.nro || undefined,
          estado: r.estado || r.status || undefined,
          propietarioId: r.ciudadano_id || r.usuario_id || r.owner_id || r.propietarioId || r.propietario_id || undefined,
          ventanillaId: r.ventanilla_id || r.vId || r.ventanillaId || undefined,
        }));
        // Si el servidor responde con lista vacía y tenemos datos locales, limpiar el cache persistido
        if (Array.isArray(mapped) && mapped.length === 0) {
          const existing = useTurnosStore.getState().turnos;
          if (existing && existing.length > 0) {
            try {
              await AsyncStorage.removeItem('turnos-storage');
            } catch (e) {
              // ignore
            }
            useTurnosStore.getState().setTurnos([]);
            // informar al usuario brevemente
            Alert.alert('Sincronizado', 'El cache local de turnos fue limpiado porque el servidor no reporta turnos.');
          } else {
            useTurnosStore.getState().setTurnos(mapped);
          }
        } else {
          useTurnosStore.getState().setTurnos(mapped);
        }
      } catch (e) {
        // Silencioso: se muestra en UI si es necesario
      } finally {
        setLoading(false);
      }
    };

    load();
    return () => { mounted = false; };
  }, []);

  const openCancelModal = (id: string) => {
    const turno = useTurnosStore.getState().turnos.find((t) => t.id === id);
    const user = useAuthStore.getState().user;
    if (!turno) return;

    // Regla nueva: los CIUDADANO no pueden cancelar turnos desde la app.
    if (user?.rol === 'CIUDADANO') {
      Alert.alert('No autorizado', 'Los ciudadanos no pueden cancelar turnos desde la aplicación.');
      return;
    }

    setCancelTurnoId(id);
    setCancelModalVisible(true);
  };

  const closeCancelModal = () => {
    setCancelModalVisible(false);
    setCancelTurnoId(null);
  };

  const handleCancelConfirm = async (reason: string) => {
    if (!cancelTurnoId) return closeCancelModal();
    try {
      // @ts-ignore
      const token = useAuthStore.getState().token;
      await cancelarTurnoApi(String(cancelTurnoId), token ?? undefined);
      cancelarTurno(cancelTurnoId);
      Alert.alert('Cancelado', 'Turno cancelado correctamente');
    } catch (e) {
      cancelarTurno(cancelTurnoId);
      Alert.alert('Atención', 'No se pudo cancelar en el servidor. Se canceló localmente.');
    } finally {
      closeCancelModal();
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // @ts-ignore
      const token = useAuthStore.getState().token;
      const remote = await getTurnos(token ?? undefined);
      const mapped = (remote || []).map((r: any) => ({
        id: String(r.id ?? r._id ?? r.uuid ?? `${r.fecha}-${r.hora}`),
        tramite: r.tramite_nombre || r.tramite || r.nombre || 'Trámite',
        fecha: r.fecha || r.date || '',
        hora: r.hora || r.time || '',
        numero: r.numero || r.nro || undefined,
        estado: r.estado || r.status || undefined,
        propietarioId: r.ciudadano_id || r.usuario_id || r.owner_id || r.propietarioId || r.propietario_id || undefined,
        ventanillaId: r.ventanilla_id || r.vId || r.ventanillaId || undefined,
      }));
      if (Array.isArray(mapped) && mapped.length === 0) {
        const existing = useTurnosStore.getState().turnos;
        if (existing && existing.length > 0) {
          try {
            await AsyncStorage.removeItem('turnos-storage');
          } catch (e) {
            // ignore
          }
          useTurnosStore.getState().setTurnos([]);
          Alert.alert('Sincronizado', 'El cache local de turnos fue limpiado porque el servidor no reporta turnos.');
        } else {
          useTurnosStore.getState().setTurnos(mapped);
        }
      } else {
        useTurnosStore.getState().setTurnos(mapped);
      }
    } catch (e) {
      // ignore
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: 20 }]}>
      {loading ? (
        <>
          {/* 🆕 BOTÓN: Adjuntar Documento */}
          <View style={{ paddingHorizontal: 16 }}>
              <TouchableOpacity
              style={styles.attachDocumentButton}
              onPress={() => navigation.navigate('DocumentCamera')}
            >
              <Text style={styles.attachDocumentButtonIcon}>📄</Text>
              <Text style={styles.attachDocumentButtonText}>
                Adjuntar Documento
              </Text>
            </TouchableOpacity>
          </View>

          <ActivityIndicator size="large" style={{ marginTop: 40 }} />
        </>
      ) : (
        <>
          {/* 🆕 BOTÓN: Adjuntar Documento (también visible cuando hay datos) */}
          <View style={{ paddingHorizontal: 16 }}>
            <TouchableOpacity
              style={styles.attachDocumentButton}
              onPress={() => navigation.navigate('DocumentCamera')}
            >
              <Text style={styles.attachDocumentButtonIcon}>📄</Text>
              <Text style={styles.attachDocumentButtonText}>
                Adjuntar Documento
              </Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={(() => {
              if (!user) return turnos;
              if (user.rol === 'CIUDADANO') return turnos.filter((t) => t.propietarioId && String(t.propietarioId) === String(user.id));
              if (user.rol === 'FUNCIONARIO') {
                // si el funcionario tiene una ventanilla asignada, mostrar solo turnos de esa ventanilla
                if (user.ventanillaId) return turnos.filter((t) => t.ventanillaId && String(t.ventanillaId) === String(user.ventanillaId));
                return turnos; // sin ventanilla, mostrar todos asignados (fallback)
              }
              return turnos;
            })()}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={<Text style={{ color: '#666' }}>No tiene turnos agendados</Text>}
            renderItem={({ item }) => (
              <TurnoCard turno={item} onCancel={() => openCancelModal(item.id)} />
            )}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          />
        </>
      )}

      {/* Modal de cancelación */}
      {cancelModalVisible && (
        // lazy import component to keep render tree simple
        // @ts-ignore
        <CancelTurnoModal visible={cancelModalVisible} onClose={closeCancelModal} onConfirm={handleCancelConfirm} />
      )}
    </View>
  );
}