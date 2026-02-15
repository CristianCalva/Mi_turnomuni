import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, TouchableOpacity, ActivityIndicator, Alert, Modal, ScrollView } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { horariosPorTramite } from '../../data/horarios';
import { categorias } from '../../data/tramites';
import { useTurnosStore } from '../../stores/turnosStore';
import { useAuthStore } from '../../stores/authStore';
import { crearTurno, updateTurnoApi } from '../../services/turnosService';
import { styles } from '../../theme/styles';
import { colors } from '../../theme/colors';


export default function AgendarTurnoScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { agregarTurno, actualizarTurno } = useTurnosStore();

  const tramiteParam = route.params?.tramite || null;
  const editTurnoId = route.params?.turnoId || null;

  // Steps: 1 = seleccionar trámite, 2 = fecha/hora, 3 = confirmación
  const [step, setStep] = useState<number>(tramiteParam ? 2 : 1);

  const [selectedTramite, setSelectedTramite] = useState<any>(tramiteParam);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTramiteModal, setShowTramiteModal] = useState(false);
  const [selectedHora, setSelectedHora] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const horarios = selectedTramite ? horariosPorTramite[selectedTramite.nombre] || [] : [];

  const token = useAuthStore(state => state.token);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const currentUser = useAuthStore(state => state.user);

  useEffect(() => {
    if (!isAuthenticated) {
      // si no autenticado, regresar al login (previo manejo en navigateOrAuth normalmente)
      // @ts-ignore
      navigation.reset?.({ index: 0, routes: [{ name: 'Login' }] });
    }
  }, [isAuthenticated]);

  useEffect(() => {
    // si venimos con turnoId, precargar para edición
    if (editTurnoId) {
      const existing = useTurnosStore.getState().turnos.find((t) => t.id === editTurnoId);
      const currentUser = useAuthStore.getState().user;
      // Seguridad UI: si es ciudadano y no es dueño del turno, bloquear edición
      if (currentUser && currentUser.rol === 'CIUDADANO' && existing && existing.propietarioId && String(existing.propietarioId) !== String(currentUser.id)) {
        Alert.alert('No autorizado', 'No puedes editar turnos de otros usuarios');
        // regresar a MisTurnos
        navigation.navigate('MisTurnos' as any);
        return;
      }
      if (existing) {
        // intentar resolver el id del trámite buscando por nombre en las categorías
        const allItems = categorias.reduce((acc: any[], c) => acc.concat(c.items), [] as any[]);
        const match = allItems.find((it) => String(it.nombre).toLowerCase() === String(existing.tramite).toLowerCase());
        if (match) setSelectedTramite(match);
        else setSelectedTramite({ id: 'local', nombre: existing.tramite });
        // intentar parsear fecha
        try {
          setSelectedDate(new Date(existing.fecha));
        } catch {
          // ignore
        }
        setSelectedHora(existing.hora || null);
        // Abrir en paso 2 para permitir editar fecha/hora antes de confirmar
        setStep(2);
      }
    }
  }, [editTurnoId]);

  const onChangeDate = (_: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) setSelectedDate(date);
  };

  const handleSubmit = async () => {
    if (!selectedTramite || !selectedHora) return Alert.alert('Validación', 'Seleccione trámite y hora');
    setLoading(true);
    const payload: any = {
      tramiteNombre: selectedTramite.nombre,
      fecha: selectedDate.toISOString().split('T')[0],
      hora: selectedHora,
    };
    // incluir `tramiteId` sólo si está disponible y no es el marcador local usado para edición
    if (selectedTramite.id && selectedTramite.id !== 'local') {
      payload.tramiteId = selectedTramite.id;
    }

    try {
      if (editTurnoId) {
        // actualizar remoto
        await updateTurnoApi(editTurnoId, payload, token || undefined);
        actualizarTurno(editTurnoId, { tramite: selectedTramite.nombre, fecha: payload.fecha, hora: selectedHora });
        Alert.alert('Éxito', 'Turno actualizado correctamente');
        navigation.navigate('MisTurnos');
      } else {
        const res = await crearTurno(payload, token || undefined);

        const turnoLocal = {
          id: (res && (res.id || Date.now().toString())) as string,
          tramite: selectedTramite.nombre,
          fecha: payload.fecha,
          hora: selectedHora,
          propietarioId: currentUser?.id,
        };
        agregarTurno(turnoLocal);

        Alert.alert('Éxito', 'Turno agendado correctamente en el servidor');
        navigation.navigate('MisTurnos');
      }
    } catch (e: any) {
      // si el servicio devolvió detalles de intentos, mostramos resumen útil
      if (e?.attempts) {
        const summary = e.attempts.map((a: any) => {
          if (a.error) return `${a.url} -> error: ${a.error}`;
          const textPreview = (a.text || '').toString().slice(0, 200).replace(/\n/g, ' ');
          return `${a.url} -> status ${a.status} content-type:${a.contentType} resp:${textPreview}`;
        }).join('\n');

        Alert.alert('Error servidor', 'No se pudo crear el turno. Intentos:\n' + summary);
      } else {
        Alert.alert('Error', e?.message || 'No se pudo agendar el turno');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headingLarge}>Agendar Turno</Text>

      {step === 1 && (
        <View>
          <Text style={{ marginBottom: 8 }}>Seleccioná el trámite</Text>
          {categorias.map((cat) => (
            <View key={cat.id} style={{ marginBottom: 12 }}>
              <Text style={{ fontWeight: '700', marginBottom: 6 }}>{cat.title}</Text>
              {cat.items.map((it) => {
                const horas = horariosPorTramite[it.nombre] || horariosPorTramite[it.nombre.replace(/s$/i, '')] || [];
                return (
                  <TouchableOpacity
                    key={it.id}
                    onPress={() => { setSelectedTramite(it); setStep(2); setSelectedHora(null); }}
                    style={{ padding: 12, backgroundColor: '#fff', borderRadius: 8, marginBottom: 8 }}
                  >
                    <Text style={{ fontWeight: '700' }}>{it.nombre}</Text>
                    {horas.length > 0 && (
                      <Text style={{ color: '#0B5ED7', marginTop: 6 }}>{horas.join(' · ')}</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>
      )}

      <Modal visible={showTramiteModal} animationType="slide" transparent={true} onRequestClose={() => setShowTramiteModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeaderTitle}>Seleccionar trámite</Text>
              <TouchableOpacity onPress={() => setShowTramiteModal(false)}>
                <Text style={styles.modalClose}>Cerrar</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={{ marginTop: 12 }}>
              {categorias.map((cat) => (
                <View key={cat.id} style={{ marginBottom: 18 }}>
                  <Text style={{ fontWeight: '800', marginBottom: 8 }}>{cat.title}</Text>
                  <FlatList
                    horizontal
                    data={cat.items}
                    keyExtractor={(it: any) => it.id}
                    showsHorizontalScrollIndicator={false}
                    renderItem={({ item }: any) => (
                      <TouchableOpacity
                        onPress={() => { setSelectedTramite(item); setStep(2); setSelectedHora(null); setShowTramiteModal(false); }}
                        style={styles.tramitesItem}
                      >
                        <Text style={styles.tramitesItemText}>{item.nombre}</Text>
                      </TouchableOpacity>
                    )}
                  />
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {step === 2 && (
        <View>
          <View style={[styles.cardTurno, { padding: 18 }]}> 
            <Text style={styles.tramiteTitle}>Trámite seleccionado</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#333' }}>{selectedTramite?.nombre}</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(true)} style={{ backgroundColor: '#f6f9ff', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10 }}>
                <Text style={{ color: '#0B5ED7', fontWeight: '700' }}>{selectedDate.toLocaleDateString()}</Text>
              </TouchableOpacity>
            </View>
            {showDatePicker && (
              <View style={{ marginTop: 12 }}>
                <DateTimePicker value={selectedDate} mode="date" display="calendar" onChange={onChangeDate} />
              </View>
            )}

            <Text style={[styles.sectionHeader, { marginTop: 14 }]}>Horas disponibles</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 }}>
              {horarios.map((h) => (
                <TouchableOpacity
                  key={h}
                  onPress={() => setSelectedHora(h)}
                  style={[
                    styles.chip,
                    selectedHora === h ? styles.chipSelected : undefined,
                  ]}
                >
                  <Text style={selectedHora === h ? styles.chipTextSelected : undefined}>{h}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={{ marginTop: 16, flexDirection: 'row', justifyContent: 'space-between' }}>
              {!editTurnoId ? (
                <TouchableOpacity onPress={() => setShowTramiteModal(true)} style={[styles.changeTramiteButton, { width: '48%' }]}> 
                  <Text style={{ color: '#fff', fontWeight: '800' }}>Cambiar trámite</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={() => setShowDatePicker(true)} style={[styles.primaryButton, { backgroundColor: '#f1f3f5', width: '48%' }]}> 
                  <Text style={[styles.primaryButtonText, { color: '#333' }]}>Seleccionar fecha</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={() => setStep(3)} disabled={!selectedHora || !selectedTramite} style={[styles.primaryButton, { width: '48%', opacity: (!selectedHora || !selectedTramite) ? 0.6 : 1 }]}> 
                <Text style={styles.primaryButtonText}>Siguiente</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {step === 3 && (
        <View>
          <Text style={styles.sectionHeader}>Confirmación</Text>
          <View style={styles.card}>
            <Text style={{ fontWeight: '700', marginBottom: 6 }}>{selectedTramite?.nombre}</Text>
            <Text style={{ color: '#6b6b6b', marginBottom: 4 }}>Fecha</Text>
            <Text style={{ marginBottom: 8 }}>{selectedDate.toLocaleDateString()}</Text>
            <Text style={{ color: '#6b6b6b', marginBottom: 4 }}>Hora</Text>
            <Text style={{ marginBottom: 8 }}>{selectedHora}</Text>
          </View>

          <View style={{ height: 12 }} />
          {loading ? (
            <ActivityIndicator />
          ) : (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <TouchableOpacity onPress={() => setStep(2)} style={[styles.secondaryButtonGreen, { width: '48%', backgroundColor: '#e9ecef' }]}> 
                <Text style={[styles.secondaryButtonText, { color: '#333' }]}>Volver</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSubmit} style={[styles.primaryButton, { width: '48%' }]}> 
                <Text style={styles.primaryButtonText}>Confirmar y enviar</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </View>
  );
}
