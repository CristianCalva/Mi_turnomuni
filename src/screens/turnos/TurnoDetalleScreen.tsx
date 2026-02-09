import React from 'react';
import { View, Text, Button } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTurnosStore } from '../../stores/turnosStore';
import { useAuthStore } from '../../stores/authStore';
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

      {/* Edición eliminada: usar 'Modificar' desde la lista Mis Turnos */}
    </View>
  );
}
