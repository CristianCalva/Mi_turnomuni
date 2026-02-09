import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Alert, ActivityIndicator, RefreshControl } from 'react-native';
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
  const navigation = useNavigation();
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
        const remote = await getTurnos(token);
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
        useTurnosStore.getState().setTurnos(mapped);
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

    // Reglas: Ciudadano solo puede cancelar sus propios turnos antes de la hora
    if (user?.rol === 'CIUDADANO') {
      if (!turno.propietarioId || String(turno.propietarioId) !== String(user.id)) {
        Alert.alert('No autorizado', 'No puedes cancelar turnos de otros ciudadanos');
        return;
      }

      // verificar hora
      try {
        const dt = new Date(`${turno.fecha}T${turno.hora || '00:00'}`);
        if (Date.now() >= dt.getTime()) {
          Alert.alert('No permitido', 'No puedes cancelar un turno después de la hora programada');
          return;
        }
      } catch {
        // si no parsea, permitir que la UI abra el modal y dejar validación al servidor
      }
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
      await cancelarTurnoApi(cancelTurnoId, token);
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
      const remote = await getTurnos(token);
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
      useTurnosStore.getState().setTurnos(mapped);
    } catch (e) {
      // ignore
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: 20 }]}>
      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 40 }} />
      ) : (
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
