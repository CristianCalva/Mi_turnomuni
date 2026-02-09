import React from 'react';
import { View, Text, Button, ScrollView, TouchableOpacity } from 'react-native';
import { useAuthStore } from '../../stores/authStore';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import LandingHero from '../../components/LandingHero';
import { navigateOrAuth } from '../../utils/authNavigation';
import { styles } from '../../theme/styles';
import { colors } from '../../theme/colors';
import { useTurnosStore } from '../../stores/turnosStore';
let Ionicons: any = null;
try { Ionicons = require('@expo/vector-icons').Ionicons; } catch (e) { Ionicons = null; }

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
  const nextTurno = useTurnosStore((s) => s.turnos[0]);

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
      {/* Header personalizado */}
      <View style={styles.headerBar}>
        <Text style={styles.headerGreeting}>{`Hola${user?.nombre ? ', ' + user.nombre : ''}`}</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Messages' as any)}>
            {Ionicons ? <Ionicons name="notifications-outline" size={22} color="#fff" /> : <Text style={{ color: '#fff' }}>🔔</Text>}
            {nextTurno && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>1</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Perfil' as any)}>
            {Ionicons ? <Ionicons name="person-circle-outline" size={26} color="#fff" /> : <Text style={{ color: '#fff' }}>👤</Text>}
          </TouchableOpacity>
        </View>
      </View>

      <LandingHero onCTAPress={() => navigateOrAuth(navigation, isAuthenticated, 'Tramites')} />

      <View style={{ padding: 20 }}>
        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>Bienvenido{user?.nombre ? `, ${user.nombre}` : ''}</Text>
          <Text style={styles.heroSubtitle}>Accedé rápidamente a los servicios más usados</Text>
        </View>

        {nextTurno && (
          <View style={styles.upcomingCard}>
            <Text style={{ fontWeight: '800' }}>Próximo turno</Text>
            <Text style={{ color: '#666', marginTop: 6 }}>{nextTurno.tramite}</Text>
            <Text style={{ color: '#666', marginTop: 4 }}>{nextTurno.fecha} · {nextTurno.hora}</Text>
            <View style={{ marginTop: 8, flexDirection: 'row', justifyContent: 'flex-end' }}>
              <TouchableOpacity onPress={() => navigation.navigate('MisTurnos' as any)}>
                <Text style={{ color: colors.primary, fontWeight: '700' }}>Ver mis turnos</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <Text style={{ marginBottom: 10, color: colors.text }}>Accesos rápidos</Text>

        <View style={styles.quickActionsRow}>
          <TouchableOpacity style={[styles.dashboardTile, { width: '48%' }]} onPress={() => navigateOrAuth(navigation, isAuthenticated, 'Tramites')}>
            <View style={styles.tileIcon}>{Ionicons ? <Ionicons name="document-text-outline" size={20} color={colors.primary} /> : <Text>📄</Text>}</View>
            <Text style={{ fontWeight: '700', marginBottom: 6 }}>Trámites</Text>
            <Text style={{ fontSize: 12, color: '#666' }}>Ver y agendar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.dashboardTile, { width: '48%' }]} onPress={() => navigateOrAuth(navigation, isAuthenticated, 'MisTurnos')}>
            <View style={styles.tileIcon}>{Ionicons ? <Ionicons name="calendar-outline" size={20} color={colors.primary} /> : <Text>📅</Text>}</View>
            <Text style={{ fontWeight: '700', marginBottom: 6 }}>Mis turnos</Text>
            <Text style={{ fontSize: 12, color: '#666' }}>Ver, cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.dashboardTile, { width: '48%' }]} onPress={() => navigateOrAuth(navigation, isAuthenticated, 'Messages')}>
            <View style={styles.tileIcon}>{Ionicons ? <Ionicons name="chatbubble-ellipses-outline" size={20} color={colors.primary} /> : <Text>💬</Text>}</View>
            <Text style={{ fontWeight: '700', marginBottom: 6 }}>Mensajes</Text>
            <Text style={{ fontSize: 12, color: '#666' }}>Notificaciones</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.dashboardTile, { width: '48%' }]} onPress={() => navigation.navigate('Help' as any)}>
            <View style={styles.tileIcon}>{Ionicons ? <Ionicons name="help-circle-outline" size={20} color={colors.primary} /> : <Text>❓</Text>}</View>
            <Text style={{ fontWeight: '700', marginBottom: 6 }}>Ayuda</Text>
            <Text style={{ fontSize: 12, color: '#666' }}>FAQ</Text>
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
