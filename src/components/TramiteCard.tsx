import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';

type Props = {
  nombre: string;
  onPress: () => void;
};

export default function TramiteCard({ nombre, onPress }: Props) {
  return (
    <View style={cardStyles.container}>
      <View style={cardStyles.left}>
        <View style={cardStyles.iconPlaceholder} />
      </View>

      <View style={cardStyles.body}>
        <Text style={cardStyles.title}>{nombre}</Text>
        <Text style={cardStyles.desc}>Trámite rápido y seguro</Text>
      </View>

      <TouchableOpacity style={cardStyles.cta} onPress={onPress}>
        <Text style={cardStyles.ctaText}>Agendar</Text>
      </TouchableOpacity>
    </View>
  );
}

const cardStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 2,
  },
  left: {
    marginRight: 12,
  },
  iconPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#eef6ff',
  },
  body: {
    flex: 1,
  },
  title: {
    fontWeight: '700',
    fontSize: 16,
    color: colors.text,
  },
  desc: {
    color: '#666',
    fontSize: 12,
    marginTop: 4,
  },
  cta: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  ctaText: {
    color: colors.white,
    fontWeight: '700',
  },
});
