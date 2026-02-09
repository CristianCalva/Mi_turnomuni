import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
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
  
  useEffect(() => {
    // Si el usuario es funcionario, redirigir automáticamente al dashboard
    if (user && user.rol === 'FUNCIONARIO') {
      // @ts-ignore
      navigation.navigate?.('FuncionarioDashboard');
    }
  }, [user]);

  return (
    <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
      <ActivityIndicator size="large" style={{ marginBottom: 12 }} />
      <Text style={{ color: '#666' }}>Abriendo panel...</Text>
    </View>
  );
}
