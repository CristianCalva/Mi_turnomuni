import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Share } from 'react-native';
import { styles } from '../../theme/styles';
import { colors } from '../../theme/colors';

const NEWS_DATA = [
  { id: '1', title: 'Feria de empleo municipal', category: 'Evento', date: '2026-02-20', summary: 'Feria de empleo en la Plaza Central: oferta laboral y orientación.' },
  { id: '2', title: 'Corte de agua programado', category: 'Aviso', date: '2026-02-18', summary: 'Se realizará un corte de agua en sectores norte por trabajos de mantenimiento.' },
  { id: '3', title: 'Comunicado oficial: cambio de horario', category: 'Comunicado', date: '2026-02-12', summary: 'Se actualizan los horarios de atención en ventanilla municipal.' },
  { id: '4', title: 'Campaña de vacunación', category: 'Evento', date: '2026-03-05', summary: 'Jornada gratuita de vacunación en el Centro de Salud.' },
];

export default function NoticiasScreen() {
  const onShare = async (item: any) => {
    try {
      await Share.share({
        message: `${item.title}\n\n${item.summary || ''}`,
        title: item.title,
      });
    } catch (e) {
      // no-op
    }
  };

  return (
    <View style={[styles.container, { paddingTop: 20 }]}> 
      <Text style={styles.headingLarge}>Noticias</Text>
      <Text style={{ color: '#666', marginBottom: 12 }}>Eventos, comunicados y avisos</Text>

      <FlatList
        data={NEWS_DATA}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontWeight: '800' }}>{item.title}</Text>
              <Text style={{ fontSize: 12, color: '#666' }}>{item.date}</Text>
            </View>
            <Text style={{ marginTop: 8, color: '#444' }}>{item.summary}</Text>
            <View style={{ marginTop: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 12, color: colors.primary, fontWeight: '700' }}>{item.category}</Text>
              <TouchableOpacity style={styles.secondaryButtonGreen as any} onPress={() => onShare(item)}>
                <Text style={styles.secondaryButtonText}>Compartir</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}
