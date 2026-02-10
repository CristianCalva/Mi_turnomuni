import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Turno, useTurnosStore } from '../stores/turnosStore';
import { styles } from '../theme/styles';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../stores/authStore';

type Props = {
  turno: Turno;
  onCancel?: (id: string) => void;
};

export default function TurnoCard({ turno, onCancel }: Props) {
  const navigation = useNavigation();
  const cancelarTurno = useTurnosStore((s) => s.cancelarTurno);
  const user = useAuthStore((s) => s.user);

  const isBeforeTurno = () => {
    try {
      const dateStr = turno.fecha; // expecting YYYY-MM-DD or similar
      const timeStr = turno.hora || '00:00';
      const dt = new Date(`${dateStr}T${timeStr}`);
      return Date.now() < dt.getTime();
    } catch {
      return true; // si no se puede parsear, permitir por defecto de UI (server validará)
    }
  };

  const role = user?.rol || 'CIUDADANO';
  const isOwner = !!(turno.propietarioId && user && String(turno.propietarioId) === String(user.id));
  const canModify = role === 'FUNCIONARIO' ? true : isOwner;
  const canCancel = role === 'FUNCIONARIO' ? true : isOwner && isBeforeTurno();

  const onCancelar = () => {
    if (!canCancel) {
      Alert.alert('No autorizado', 'No puedes cancelar este turno.');
      return;
    }

    if (typeof onCancel === 'function') {
      onCancel(turno.id);
      return;
    }

    cancelarTurno(turno.id);
  };

  const onModificar = () => {
    // Navega al stack "Tramites" y abre la pantalla AgendarTurno en modo edición
    // @ts-ignore
    navigation.navigate('Tramites', { screen: 'AgendarTurno', params: { turnoId: turno.id } });
  };

  const onVerDetalle = () => {
    // Navega al stack "MisTurnos" (TurnosStack) y abre la pantalla TurnoDetalle
    // @ts-ignore
    navigation.navigate('MisTurnos', { screen: 'TurnoDetalle', params: { turnoId: turno.id } });
  };

  const bgColor = turno.estado === 'CANCELADO' ? '#fff0f0' : turno.estado === 'COMPLETADO' ? '#e9fff0' : turno.estado === 'CONFIRMADO' ? '#e7f2ff' : '#ffffff';

  return (
    <View style={[styles.cardTurno, { backgroundColor: bgColor }]}>
      <View style={styles.turnoRow}>
        <View style={styles.numeroCircle}>
          <Text style={styles.numeroText}>{turno.numero ? String(turno.numero) : '?'}</Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.tramiteTitle}>{turno.tramite}</Text>
          <Text style={styles.tramiteSubtitle}>{turno.fecha} · {turno.hora}</Text>

          <View style={[styles.statusPill, { backgroundColor: turno.estado === 'CANCELADO' ? '#ffecec' : turno.estado === 'COMPLETADO' ? '#e6fbef' : turno.estado === 'CONFIRMADO' ? '#e7f2ff' : '#fff9e6' }] }>
            <Text style={[styles.statusText, { color: turno.estado === 'CANCELADO' ? '#c12929' : turno.estado === 'COMPLETADO' ? '#0b8546' : '#0b63d4' }]}>{turno.estado || 'PENDIENTE'}</Text>
          </View>
        </View>
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity onPress={onVerDetalle}>
          <Text style={styles.actionText}>Ver detalles</Text>
        </TouchableOpacity>
        {canModify && (
          <TouchableOpacity onPress={onModificar}>
            <Text style={styles.actionText}>Modificar</Text>
          </TouchableOpacity>
        )}
        {canCancel && (
          <TouchableOpacity onPress={onCancelar}>
            <Text style={[styles.actionText, { color: '#dc3545' }]}>Cancelar</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
