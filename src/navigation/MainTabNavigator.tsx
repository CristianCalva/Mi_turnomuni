import React from 'react';
import { Text } from 'react-native';
import { colors } from '../theme/colors';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/home/HomeScreen';
import TramitesScreen from '../screens/tramites/TramitesScreen';
import AgendarTurnoScreen from '../screens/tramites/AgendarTurnoScreen';
import MisTurnosScreen from '../screens/turnos/MisTurnosScreen';
import TurnoDetalleScreen from '../screens/turnos/TurnoDetalleScreen';
import ProfileScreen from '../screens/home/ProfileScreen';
import FuncionarioHomeScreen from '../screens/funcionario/FuncionarioHomeScreen';
import FuncionarioDashboardScreen from '../screens/funcionario/FuncionarioDashboardScreen';
import { useAuthStore } from '../stores/authStore';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Cargar Ionicons de forma segura
let Ionicons: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Ionicons = require('@expo/vector-icons').Ionicons;
} catch (e) {
  Ionicons = null;
}

function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary, height: 92, shadowColor: 'transparent' as any },
        headerTintColor: '#fff',
        headerTitleAlign: 'center',
        headerTitleStyle: { color: '#fff', fontSize: 18, marginTop: 8 },
      }}
    >
      <Stack.Screen name="HomeMain" component={HomeScreen} options={{ title: 'Inicio' }} />
      <Stack.Screen name="Tramites" component={TramitesScreen} />
      <Stack.Screen name="AgendarTurno" component={AgendarTurnoScreen} options={{ title: 'Agendar Turno' }} />
      <Stack.Screen name="TurnoDetalle" component={TurnoDetalleScreen} options={{ title: 'Detalle de turno' }} />
      <Stack.Screen name="MisTurnos" component={MisTurnosScreen} options={{ title: 'Mis Turnos' }} />
    </Stack.Navigator>
  );
}

function FuncionarioStack() {
  return (
    <Stack.Navigator
      initialRouteName="FuncionarioDashboard"
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary, height: 92, shadowColor: 'transparent' as any },
        headerTintColor: '#fff',
        headerTitleAlign: 'center',
        headerTitleStyle: { color: '#fff', fontSize: 18, marginTop: 8 },
      }}
    >
      <Stack.Screen name="FuncionarioHome" component={FuncionarioHomeScreen} options={{ title: 'Panel' }} />
      <Stack.Screen name="FuncionarioDashboard" component={FuncionarioDashboardScreen} options={{ title: 'Turnos - Ventanilla' }} />
    </Stack.Navigator>
  );
}

export default function MainTabNavigator() {
  const { user } = useAuthStore();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        headerStyle: { backgroundColor: colors.primary, height: 92, shadowColor: 'transparent' as any },
        headerTintColor: '#fff',
        headerTitleAlign: 'center',
        headerTitleStyle: { color: '#fff', fontSize: 18, marginTop: 8 },
        tabBarStyle: { backgroundColor: colors.primary, height: 70, paddingBottom: 10 },
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: '#cfe0ff',
        tabBarLabelStyle: { paddingBottom: 6 },
        tabBarIcon: ({ color, size }) => {
        const nameMap: Record<string, string> = {
          Inicio: 'home-outline',
          Tramites: 'documents-outline',
          MisTurnos: 'calendar-outline',
          Perfil: 'person-circle-outline',
          Panel: 'speedometer-outline',
        };
        const iconName = nameMap[route.name] || 'ellipse-outline';
        return Ionicons ? <Ionicons name={iconName} size={size} color={color} /> : <Text>●</Text>;
      },
      })}
    >
      <Tab.Screen name="Inicio" component={HomeStack} options={{ headerShown: false }} />
      <Tab.Screen name="Tramites" component={TramitesScreen} />
      <Tab.Screen name="MisTurnos" component={MisTurnosScreen} options={{ title: 'Mis Turnos' }} />
      <Tab.Screen name="Perfil" component={ProfileScreen} options={{ title: 'Perfil' }} />
      {user?.rol === 'FUNCIONARIO' && (
        <Tab.Screen name="Panel" component={FuncionarioStack} options={{ title: 'Panel' }} />
      )}
    </Tab.Navigator>
  );
}
