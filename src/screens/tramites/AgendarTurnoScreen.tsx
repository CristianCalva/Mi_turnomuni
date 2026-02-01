import React, { useState } from 'react';
import { View, Text, Button, FlatList } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { horariosPorTramite } from '../../data/horarios';
import { useTurnosStore } from '../../stores/turnosStore';
import { useAuthStore } from '../../stores/authStore';
import { useEffect } from 'react';


export default function AgendarTurnoScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { agregarTurno } = useTurnosStore();

  const { tramite } = route.params;
  const horarios = horariosPorTramite[tramite.nombre] || [];

  const [horaSeleccionada, setHoraSeleccionada] = useState<string | null>(null);

  const confirmar = () => {
    if (!horaSeleccionada) return;

    agregarTurno({
      id: Date.now().toString(),
      tramite: tramite.nombre,
      fecha: new Date().toLocaleDateString(),
      hora: horaSeleccionada,
    });

    navigation.goBack();
  };

  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      // @ts-ignore
      navigation.reset?.({ index: 0, routes: [{ name: 'Login' }] });
    }
  }, [isAuthenticated]);

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18 }}>Trámite</Text>
      <Text>{tramite.nombre}</Text>

      <Text style={{ marginTop: 10 }}>Horas disponibles:</Text>

      <FlatList
        data={horarios}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <Button
            title={item}
            onPress={() => setHoraSeleccionada(item)}
          />
        )}
      />

      {horaSeleccionada && (
        <>
          <Text>Hora seleccionada: {horaSeleccionada}</Text>
          <Button title="Confirmar turno" onPress={confirmar} />
        </>
      )}
    </View>
  );
}
