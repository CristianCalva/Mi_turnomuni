import React from 'react';
import { View, Text, SectionList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { categorias } from '../../data/tramites';
import { styles } from '../../theme/styles';
import TramiteCard from '../../components/TramiteCard';
import { useAuthStore } from '../../stores/authStore';
import { navigateOrAuth } from '../../utils/authNavigation';

export default function TramitesScreen() {
  const navigation = useNavigation<any>();
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  return (
    <View style={styles.container}>
      <SectionList
        sections={categorias.map((c) => ({ ...c, data: c.items }))}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TramiteCard
            nombre={item.nombre}
            icon={item.icon}
            onPress={() => navigateOrAuth(navigation, isAuthenticated, 'AgendarTurno', { tramite: item })}
          />
        )}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.sectionHeader}>{title}</Text>
        )}
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    </View>
  );
}
