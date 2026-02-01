import React from 'react';
import { View, Text, FlatList, Button } from 'react-native';
import { useTurnosStore } from '../../stores/turnosStore';

export default function GestionTurnosScreen() {
  const { turnos, cancelarTurno } = useTurnosStore();

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 20, marginBottom: 15 }}>
        Turnos Agendados
      </Text>

      <FlatList
        data={turnos}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text>No hay turnos registrados</Text>}
        renderItem={({ item }) => (
          <View
            style={{
              padding: 10,
              borderWidth: 1,
              marginBottom: 10,
              borderRadius: 6,
            }}
          >
            <Text>Trámite: {item.tramite}</Text>
            <Text>Fecha: {item.fecha}</Text>
            <Text>Hora: {item.hora}</Text>

            <Button
              title="Cancelar turno"
              color="red"
              onPress={() => cancelarTurno(item.id)}
            />
          </View>
        )}
      />
    </View>
  );
}
