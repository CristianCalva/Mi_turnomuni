import React from 'react';
import { View, Text, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../stores/authStore';
import { useEffect } from 'react';
import { styles } from '../../theme/styles';

// Guard: si no está autenticado o no tiene rol de funcionario, redirige al login
import { NavigationProp } from '@react-navigation/native';

export default function FuncionarioHomeScreen() {
  const navigation = useNavigation();
  const { user, logout } = useAuthStore();

  useEffect(() => {
    if (!user || user.rol !== 'FUNCIONARIO') {
      // @ts-ignore
      navigation.reset?.({ index: 0, routes: [{ name: 'Login' }] });
    }
  }, [user]);

  return (
    <View style={[styles.container, { justifyContent: 'center' }]}>
      <View style={{ backgroundColor: '#fff', padding: 20, borderRadius: 12, elevation: 2 }}>
        <Text style={styles.headingLarge}>Panel Funcionario</Text>
        <Text style={{ marginBottom: 16 }}>Bienvenido funcionario {user?.nombre}</Text>

        <Button
          title="Gestionar Turnos"
          onPress={() => navigation.navigate('GestionTurnos' as never)}
        />

        <View style={{ marginTop: 20 }}>
          <Button title="Cerrar sesión" color="red" onPress={logout} />
        </View>
      </View>
    </View>
  );
}
