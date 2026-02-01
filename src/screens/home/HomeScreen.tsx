import React from 'react';
import { View, Text, Button, ScrollView, TouchableOpacity } from 'react-native';
import { useAuthStore } from '../../stores/authStore';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import LandingHero from '../../components/LandingHero';
import { navigateOrAuth } from '../../utils/authNavigation';
import { styles } from '../../theme/styles';
import { colors } from '../../theme/colors';

type RootStackParamList = {
  Tramites: undefined;
  MisTurnos: undefined;
  Home: undefined;
};

export default function HomeScreen() {
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
      <LandingHero onCTAPress={() => navigateOrAuth(navigation, isAuthenticated, 'Tramites')} />
      <View style={{ padding: 20 }}>
        <Text style={styles.headingLarge}>Bienvenido, {user?.nombre}</Text>

        <Text style={{ marginBottom: 10, color: colors.text }}>Accesos rápidos</Text>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          <TouchableOpacity style={styles.dashboardTile} onPress={() => navigateOrAuth(navigation, isAuthenticated, 'Tramites')}>
            <Text style={{ fontWeight: '700', marginBottom: 6 }}>Trámites</Text>
            <Text style={{ fontSize: 12, color: '#666' }}>Ver y agendar trámites</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.dashboardTile} onPress={() => navigateOrAuth(navigation, isAuthenticated, 'MisTurnos')}>
            <Text style={{ fontWeight: '700', marginBottom: 6 }}>Mis turnos</Text>
            <Text style={{ fontSize: 12, color: '#666' }}>Ver y cancelar turnos</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.dashboardTile} onPress={() => navigateOrAuth(navigation, isAuthenticated, 'Messages')}>
            <Text style={{ fontWeight: '700', marginBottom: 6 }}>Mensajes</Text>
            <Text style={{ fontSize: 12, color: '#666' }}>Notificaciones y mensajes</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.dashboardTile} onPress={() => navigation.navigate('Help' as any)}>
            <Text style={{ fontWeight: '700', marginBottom: 6 }}>Ayuda</Text>
            <Text style={{ fontSize: 12, color: '#666' }}>Preguntas frecuentes</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 16 }} />

        <TouchableOpacity onPress={logout} style={[styles.primaryButton, { backgroundColor: colors.danger }] as any}>
          <Text style={styles.primaryButtonText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
