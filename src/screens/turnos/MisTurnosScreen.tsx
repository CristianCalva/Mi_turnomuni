import React from 'react';
import { View, Text, Button, FlatList, Alert, TouchableOpacity } from 'react-native';
import { useTurnosStore } from '../../stores/turnosStore';
import { styles } from '../../theme/styles';
import { useAuthStore } from '../../stores/authStore';
import { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';

export default function MisTurnosScreen() {
  const { turnos, cancelarTurno } = useTurnosStore();
  const { isAuthenticated } = useAuthStore();
  const navigation = useNavigation();

  useEffect(() => {
    if (!isAuthenticated) {
      // @ts-ignore
      navigation.reset?.({ index: 0, routes: [{ name: 'Login' }] });
    }
  }, [isAuthenticated]);

  const confirmarCancelacion = (id: string) => {
    Alert.alert(
      'Cancelar turno',
      '¿Desea cancelar este turno?',
      [
        { text: 'No' },
        { text: 'Sí', onPress: () => cancelarTurno(id) },
      ]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: 20 }]}>
      <Text style={styles.headingLarge}>Mis turnos</Text>

      <FlatList
        data={turnos}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={{ color: '#666' }}>No tiene turnos agendados</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={{ fontWeight: '700' }}>{item.tramite}</Text>
            <Text style={{ color: '#666', marginVertical: 6 }}>{item.fecha}</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
              <TouchableOpacity onPress={() => confirmarCancelacion(item.id)} style={{ backgroundColor: '#fff', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12, borderWidth: 1, borderColor: '#e6e6e6' }}>
                <Text style={{ color: '#dc3545' }}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}
