import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Linking, Alert } from 'react-native';
import { styles } from '../../theme/styles';

const FAQ_DATA = [
  { id: '1', q: '¿Cómo agendo un turno?', a: 'Ingresá a Trámites, elegí el trámite y seleccioná una fecha y hora disponible.' },
  { id: '2', q: '¿Cómo cancelo un turno?', a: 'En Mis turnos seleccioná el turno que querés cancelar y tocá el botón "Cancelar".' },
  { id: '3', q: '¿Qué documentos necesito?', a: 'Los documentos requeridos aparecen en la pantalla del trámite antes de agendar.' },
  { id: '4', q: '¿Puedo pagar en línea?', a: 'Si el trámite admite pago en línea, aparecerá la opción en el paso de confirmación.' },
  { id: '5', q: '¿Dónde se realiza el trámite?', a: 'La dirección y horarios aparecen en la página del trámite seleccionado.' },
];

export default function HelpScreen() {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggle = (id: string) => setOpenId(openId === id ? null : id);

  const openWhatsApp = async () => {
    const phone = '593967816221';
    const text = 'Hola, necesito ayuda con MiTurnoMuni';
    const urlApp = `whatsapp://send?phone=${phone}&text=${encodeURIComponent(text)}`;
    const urlWeb = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    try {
      const supported = await Linking.canOpenURL(urlApp);
      if (supported) {
        await Linking.openURL(urlApp);
      } else {
        await Linking.openURL(urlWeb);
      }
    } catch (e) {
      Alert.alert('Error', 'No se pudo abrir WhatsApp');
    }
  };

  return (
    <View style={[styles.container, { paddingTop: 20 }]}> 
      <Text style={styles.headingLarge}>Ayuda</Text>
      <Text style={{ color: '#666', marginBottom: 12 }}>Preguntas frecuentes</Text>

      <FlatList
        data={FAQ_DATA}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => toggle(item.id)}>
            <Text style={{ fontWeight: '800', marginBottom: 6 }}>{item.q}</Text>
            {openId === item.id && <Text style={{ color: '#444' }}>{item.a}</Text>}
          </TouchableOpacity>
        )}
        ListFooterComponent={() => (
          <View style={{ marginTop: 12 }}>
            <Text style={{ color: '#666', marginBottom: 8 }}>Si no encontrás la respuesta, contactanos:</Text>
            <TouchableOpacity style={styles.secondaryButtonGreen as any} onPress={openWhatsApp}>
              <Text style={styles.secondaryButtonText}>Contactar por Wasap</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}
