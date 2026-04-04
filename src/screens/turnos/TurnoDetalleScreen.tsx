import React from 'react';
import { View, Text, Button, Alert, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTurnosStore } from '../../stores/turnosStore';
import { useAuthStore } from '../../stores/authStore';
import { updateTurnoApi, cancelarTurnoApi } from '../../services/turnosService';
import { styles } from '../../theme/styles';

export default function TurnoDetalleScreen() {
  const route = useRoute();
  // @ts-ignore
  const { turnoId } = route.params || {};
  const navigation = useNavigation();
  const turno = useTurnosStore((s) => s.turnos.find((t) => t.id === turnoId));
  const user = useAuthStore((s) => s.user);

  if (!turno) return (
    <View style={[styles.container, { paddingTop: 20 }]}>
      <Text>Turno no encontrado</Text>
    </View>
  );

  // Restricción: ciudadano no puede ver turnos de otros
  if (user && user.rol === 'CIUDADANO' && turno.propietarioId && String(turno.propietarioId) !== String(user.id)) {
    return (
      <View style={[styles.container, { paddingTop: 20 }]}> 
        <Text>No autorizado para ver este turno</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: 20 }]}> 
      <Text style={styles.headingLarge}>Detalle del turno</Text>
      <View style={styles.card}>
        <Text style={{ fontWeight: '800', fontSize: 18 }}>{turno.tramite}</Text>
        <Text style={{ color: '#666', marginTop: 8 }}>{turno.fecha} · {turno.hora}</Text>
        <Text style={{ marginTop: 8 }}>Número: {turno.numero ?? '-'}</Text>
        <Text style={{ marginTop: 8 }}>Estado: {turno.estado ?? 'PENDIENTE'}</Text>
      </View>

      {/* Acciones según rol/propietario */}
      <View style={{ marginTop: 14 }}>
        {user?.rol === 'FUNCIONARIO' && (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <TouchableOpacity onPress={async () => {
              try {
                useTurnosStore.getState().actualizarTurno(turno.id, { estado: 'EN_ATENCION' as any });
                // @ts-ignore
                const token = useAuthStore.getState().token;
                await updateTurnoApi(turno.id, { estado: 'EN_ATENCION' }, token || undefined);
              } catch (e: any) {
                Alert.alert('Error', e?.message || 'No se pudo cambiar el estado');
              }
            }} style={{ flex: 1, marginRight: 8 }}>
              <View style={[styles.primaryButton, { backgroundColor: '#0b63d4', paddingVertical: 12 }] as any}>
                <Text style={[styles.primaryButtonText, { color: '#fff', textAlign: 'center' }]}>ATENDER</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={async () => {
              try {
                useTurnosStore.getState().actualizarTurno(turno.id, { estado: 'COMPLETADO' });
                // @ts-ignore
                const token = useAuthStore.getState().token;
                await updateTurnoApi(turno.id, { estado: 'COMPLETADO' }, token || undefined);
              } catch (e: any) {
                Alert.alert('Error', e?.message || 'No se pudo completar el turno');
              }
            }} style={{ flex: 1, marginLeft: 8 }}>
              <View style={[styles.primaryButton, { backgroundColor: '#0b8546', paddingVertical: 12 }] as any}>
                <Text style={[styles.primaryButtonText, { color: '#fff', textAlign: 'center' }]}>COMPLETADO</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Cancelar: funcionario o propietario (ciudadano) */}
        {((user?.rol === 'FUNCIONARIO') || (turno.propietarioId && String(turno.propietarioId) === String(user?.id))) && (
          <View style={{ marginTop: 12 }}>
            <TouchableOpacity onPress={async () => {
              try {
                // @ts-ignore
                const token = useAuthStore.getState().token;
                await cancelarTurnoApi(turno.id, token || undefined);
                useTurnosStore.getState().cancelarTurno(turno.id);
                Alert.alert('Cancelado', 'Turno cancelado correctamente');
                // volver atrás
                // @ts-ignore
                navigation.goBack?.();
              } catch (e: any) {
                useTurnosStore.getState().cancelarTurno(turno.id);
                Alert.alert('Atención', e?.message || 'No se pudo cancelar en el servidor. Se canceló localmente.');
              }
            }}>
              <View style={[styles.primaryButton, { backgroundColor: '#dc3545', paddingVertical: 12 }] as any}>
                <Text style={[styles.primaryButtonText, { color: '#fff', textAlign: 'center' }]}>CANCELAR</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
      </View>
      {/* Edición eliminada: usar 'Modificar' desde la lista Mis Turnos */}
    </View>
  );
}
