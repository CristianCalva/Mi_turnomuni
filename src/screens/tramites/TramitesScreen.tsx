import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { tramites } from '../../data/tramites';
import { styles } from '../../theme/styles';
import TramiteCard from '../../components/TramiteCard';
import { useAuthStore } from '../../stores/authStore';
import { navigateOrAuth } from '../../utils/authNavigation';

export default function TramitesScreen() {
  const navigation = useNavigation<any>();
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  return (
    <View style={styles.container}>
      <Text style={styles.headingLarge}>Trámites disponibles</Text>

      <FlatList
        data={tramites}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TramiteCard
            nombre={item.nombre}
            onPress={() => navigateOrAuth(navigation, isAuthenticated, 'AgendarTurno', { tramite: item })}
          />
        )}
      />
    </View>
  );
}
