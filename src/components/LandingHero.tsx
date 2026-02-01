import React from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, Dimensions } from 'react-native';
import { colors } from '../theme/colors';

const { width } = Dimensions.get('window');

type Props = {
  onCTAPress?: () => void;
};

export default function LandingHero({ onCTAPress }: Props) {
  return (
    <ImageBackground
      source={require('../../assets/splash-icon.png')}
      style={styles.background}
      imageStyle={styles.image}
    >
      <View style={styles.overlay} />

      <View style={styles.content}>
        <Text style={styles.brand}>MiTurnoMuni</Text>
        <Text style={styles.heading}>Agenda tu turno
sin salir de casa</Text>
        <Text style={styles.subtitle}>Sistema digital de agendamiento para trámites municipales. Rápido y disponible 24/7</Text>

        <TouchableOpacity style={styles.cta} activeOpacity={0.85} onPress={onCTAPress}>
          <Text style={styles.ctaText}>Agendar Turno Ahora</Text>
        </TouchableOpacity>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>2.847</Text>
            <Text style={styles.statLabel}>Turnos agendados este mes</Text>
          </View>

          <View style={[styles.statCard, styles.statCardRight]}>
            <Text style={[styles.statNumber, { color: colors.secondary }]}>15
            </Text>
            <Text style={styles.statLabel}>minutos
Tiempo promedio de atención</Text>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    width: '100%',
    height: 420,
    justifyContent: 'center',
  },
  image: {
    resizeMode: 'cover',
    opacity: 0.35,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10,40,80,0.45)'
  },
  content: {
    paddingHorizontal: 20,
    zIndex: 2,
  },
  brand: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  heading: {
    color: colors.white,
    fontSize: 42,
    fontWeight: '800',
    lineHeight: 46,
    marginBottom: 8,
    maxWidth: width * 0.8,
  },
  subtitle: {
    color: colors.white,
    opacity: 0.95,
    marginBottom: 18,
    maxWidth: width * 0.75,
  },
  cta: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 28,
    alignSelf: 'flex-start',
    marginBottom: 20,
    elevation: 4,
  },
  ctaText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 16,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 6,
    alignItems: 'center',
  },
  statCard: {
    backgroundColor: colors.white,
    padding: 14,
    borderRadius: 12,
    minWidth: 140,
    marginRight: 12,
    elevation: 3,
  },
  statCardRight: {
    alignItems: 'flex-start',
  },
  statNumber: {
    color: colors.primary,
    fontSize: 28,
    fontWeight: '800',
  },
  statLabel: {
    color: '#333',
    marginTop: 6,
    fontSize: 12,
  }
});
