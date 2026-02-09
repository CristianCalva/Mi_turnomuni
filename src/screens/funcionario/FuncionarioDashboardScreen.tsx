import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Modal, Alert } from 'react-native';
import { styles } from '../../theme/styles';
import { useTurnosStore, Turno } from '../../stores/turnosStore';
import { useAuthStore } from '../../stores/authStore';
import { getTurnos, updateTurnoApi, cancelarTurnoApi } from '../../services/turnosService';

const REASONS = [
  'Cierre de oficina',
  'Emergencia interna',
  'Documentación incompleta',
  'Otro',
];

export default function FuncionarioDashboardScreen() {
  const user = useAuthStore((s) => s.user);
  const { turnos, actualizarTurno } = useTurnosStore();
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Turno | null>(null);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [reason, setReason] = useState(REASONS[0]);

  useEffect(() => {
    // load today's turnos for this ventanilla
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        // @ts-ignore
        const token = useAuthStore.getState().token;
        const remote = await getTurnos(token ?? undefined);
        if (!mounted) return;
        // Map and store (reuse existing mapping logic)
        const mapped = (remote || []).map((r: any) => ({
          id: String(r.id ?? r._id ?? r.uuid ?? `${r.fecha}-${r.hora}`),
          tramite: r.tramite_nombre || r.tramite || r.nombre || 'Trámite',
          fecha: r.fecha || r.date || '',
          hora: r.hora || r.time || '',
          numero: r.numero || r.nro || undefined,
          estado: r.estado || r.status || 'PENDIENTE',
          propietarioId: r.ciudadano_id || r.usuario_id || r.owner_id || r.propietarioId || r.propietario_id || undefined,
          ventanillaId: r.ventanilla_id || r.vId || r.ventanillaId || undefined,
          // additional citizen data passed from backend if available
          ciudadanoNombre: r.ciudadano_nombre || r.nombre_ciudadano || undefined,
          ciudadanoCedula: r.ciudadano_cedula || r.cedula || undefined,
        } as any));
        useTurnosStore.getState().setTurnos(mapped as any);
      } catch (e) {
        // ignore
      } finally {
        setLoading(false);
      }
    };

    load();
    return () => { mounted = false; };
  }, []);

  const today = useMemo(() => {
    const d = new Date();
    const iso = d.toISOString().split('T')[0];
    return iso;
  }, []);

  // Filter: only turnos for today and for user's ventanilla
  const myTurnos = useMemo(() => {
    if (!user) return [] as Turno[];
    return turnos.filter((t) => (t.fecha === today) && (!user.ventanillaId || String(t.ventanillaId) === String(user.ventanillaId)));
  }, [turnos, user, today]);

  const pendientes = myTurnos.filter((t) => t.estado !== 'COMPLETADO' && t.estado !== 'CANCELADO').length;
  const atendidos = myTurnos.filter((t) => t.estado === 'COMPLETADO').length;

  const startAttention = async (t: Turno) => {
    try {
      // optimista: marcar localmente
      actualizarTurno(t.id, { estado: 'EN_ATENCION' as any });
      // backend call (try common update)
      // @ts-ignore
      const token = useAuthStore.getState().token;
      await updateTurnoApi(t.id, { estado: 'EN_ATENCION' }, token || undefined);
    } catch (e) {
      Alert.alert('Error', 'No se pudo notificar al servidor. La pantalla continúa en modo offline.');
    }
  };

  const finishAttention = async (t: Turno) => {
    try {
      actualizarTurno(t.id, { estado: 'COMPLETADO' });
      // @ts-ignore
      const token = useAuthStore.getState().token;
      await updateTurnoApi(t.id, { estado: 'COMPLETADO' }, token || undefined);
    } catch (e) {
      Alert.alert('Error', 'No se pudo notificar al servidor. La pantalla continúa en modo offline.');
    }
  };

  const openCancel = (t: Turno) => {
    setSelected(t);
    setReason(REASONS[0]);
    setCancelModalVisible(true);
  };

  const confirmCancel = async () => {
    if (!selected) return setCancelModalVisible(false);
    try {
      // @ts-ignore
      const token = useAuthStore.getState().token;
      await cancelarTurnoApi(selected.id, token || undefined);
      actualizarTurno(selected.id, { estado: 'CANCELADO' });
      setCancelModalVisible(false);
      setSelected(null);
    } catch (e) {
      actualizarTurno(selected.id, { estado: 'CANCELADO' });
      setCancelModalVisible(false);
      setSelected(null);
      Alert.alert('Atención', 'No se pudo cancelar en el servidor. Se canceló localmente.');
    }
  };

  const renderItem = ({ item }: { item: Turno }) => {
    return (
      <View style={[styles.cardTurno, { marginBottom: 10 }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={{ fontWeight: '800', fontSize: 18 }}>{item.tramite}</Text>
            <Text style={{ color: '#666', marginTop: 6 }}>{item.fecha} · {item.hora}</Text>
            <Text style={{ marginTop: 6 }}>Número: {item.numero ?? '-'}</Text>
          </View>

          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontWeight: '800' }}>{item.ciudadanoNombre ?? '—'}</Text>
            <Text style={{ color: '#666' }}>{item.ciudadanoCedula ?? '—'}</Text>
            <Text style={{ marginTop: 8, fontWeight: '700' }}>{item.estado}</Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
          <TouchableOpacity
            onPress={() => startAttention(item)}
            style={{ flex: 1, backgroundColor: '#0b63d4', paddingVertical: 14, borderRadius: 10, marginRight: 8, alignItems: 'center' }}
          >
            <Text style={{ color: '#fff', fontWeight: '800' }}>ATENDER</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => finishAttention(item)}
            style={{ flex: 1, backgroundColor: '#0b8546', paddingVertical: 14, borderRadius: 10, marginLeft: 8, alignItems: 'center' }}
          >
            <Text style={{ color: '#fff', fontWeight: '800' }}>COMPLETADO</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => openCancel(item)}
            style={{ marginLeft: 8, paddingVertical: 12, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: '#dc3545' }}
          >
            <Text style={{ color: '#dc3545', fontWeight: '700' }}>CANCELAR</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: 12 }]}>
      <View style={{ marginBottom: 12 }}>
        <Text style={{ fontSize: 20, fontWeight: '800' }}>Turnos - Ventanilla</Text>
        <Text style={{ color: '#666', marginTop: 4 }}>Atendidos: {atendidos}  /  Pendientes: {pendientes}</Text>
      </View>

      {loading ? (
        <ActivityIndicator />
      ) : (
        <FlatList
          data={myTurnos}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListEmptyComponent={<Text style={{ color: '#666' }}>No hay turnos asignados para hoy</Text>}
        />
      )}

      <Modal visible={cancelModalVisible} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', padding: 20 }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: '800', marginBottom: 8 }}>Cancelar turno</Text>
            <Text style={{ color: '#666', marginBottom: 12 }}>Seleccioná motivo:</Text>
            {REASONS.map((r) => (
              <TouchableOpacity key={r} onPress={() => setReason(r)} style={{ paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8, backgroundColor: reason === r ? '#e9f3ff' : '#fff', marginBottom: 8 }}>
                <Text style={{ color: reason === r ? '#0b63d4' : '#333' }}>{r}</Text>
              </TouchableOpacity>
            ))}

            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 }}>
              <TouchableOpacity onPress={() => setCancelModalVisible(false)} style={{ marginRight: 8, paddingVertical: 10 }}>
                <Text style={{ color: '#6b6b6b' }}>Volver</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={confirmCancel} style={{ backgroundColor: '#dc3545', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8 }}>
                <Text style={{ color: '#fff', fontWeight: '700' }}>Cancelar Turno</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
