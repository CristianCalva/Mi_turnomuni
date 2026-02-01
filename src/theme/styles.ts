import { StyleSheet } from 'react-native';
import { colors } from './colors';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 15,
  },
  headingLarge: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 12,
  },
  card: {
    backgroundColor: colors.white,
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    elevation: 2,
  },
  dashboardTile: {
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 12,
    elevation: 3,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 140,
    minHeight: 100,
    margin: 8,
  },
  input: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e6e6e6',
    marginBottom: 10,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: colors.white,
    fontWeight: '700',
  },
  text: {
    color: colors.text,
  },
});
