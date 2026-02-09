import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { styles as theme } from '../theme/styles';

type Props = {
  visible: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
};

const DEFAULT_REASONS = [
  'No puedo asistir',
  'Cambio de fecha',
  'Trámite resuelto por otra vía',
  'Error al agendar',
  'Otro',
];

export default function CancelTurnoModal({ visible, onClose, onConfirm }: Props) {
  const [reason, setReason] = useState<string>(DEFAULT_REASONS[0]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={localStyles.backdrop}>
        <View style={[localStyles.container, theme.cardTurno]}>
          <Text style={{ fontWeight: '800', fontSize: 18, marginBottom: 8 }}>Cancelar turno</Text>
          <Text style={{ color: '#666', marginBottom: 12 }}>¿Estás seguro? Selecciona el motivo de la cancelación.</Text>

          <View style={{ marginBottom: 8 }}>
            {DEFAULT_REASONS.map((r) => (
              <TouchableOpacity key={r} onPress={() => setReason(r)} style={[localStyles.reasonRow, reason === r ? localStyles.reasonSelected : undefined]}>
                <Text style={{ color: reason === r ? '#0b63d4' : '#333' }}>{r}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 }}>
            <TouchableOpacity onPress={onClose} style={{ paddingVertical: 8, paddingHorizontal: 12, marginRight: 8 }}>
              <Text style={{ color: '#6b6b6b' }}>Volver</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { onConfirm(reason); }} style={{ backgroundColor: '#dc3545', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8 }}>
              <Text style={{ color: '#fff', fontWeight: '700' }}>Cancelar Turno</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const localStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    padding: 20,
  },
  container: {
    padding: 16,
    borderRadius: 12,
  },
  reasonRow: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  reasonSelected: {
    backgroundColor: '#e9f3ff',
  },
});
