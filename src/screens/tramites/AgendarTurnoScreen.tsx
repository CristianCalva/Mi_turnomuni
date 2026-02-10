import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { horariosPorTramite } from '../../data/horarios';
import { categorias } from '../../data/tramites';
import { useTurnosStore } from '../../stores/turnosStore';
import { useAuthStore } from '../../stores/authStore';
import { crearTurno, updateTurnoApi } from '../../services/turnosService';
import { styles } from '../../theme/styles';


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
        setSelectedTramite({ id: 'local', nombre: existing.tramite });
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
    const payload = {
      tramiteId: selectedTramite.id,
      tramiteNombre: selectedTramite.nombre,
      fecha: selectedDate.toISOString().split('T')[0],
      hora: selectedHora,
    };

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

      {step === 2 && (
        <View>
          <Text style={{ fontWeight: '700' }}>Trámite</Text>
          <Text style={{ marginBottom: 8 }}>{selectedTramite?.nombre}</Text>

          <Text style={{ fontWeight: '700' }}>Seleccioná fecha</Text>
          <TouchableOpacity onPress={() => setShowDatePicker(true)} style={{ padding: 12, backgroundColor: '#fff', borderRadius: 8, marginTop: 8, marginBottom: 12 }}>
            <Text>{selectedDate.toDateString()}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker value={selectedDate} mode="date" display="calendar" onChange={onChangeDate} />
          )}

          <Text style={{ fontWeight: '700', marginTop: 8 }}>Horas disponibles</Text>
          <FlatList
            data={horarios}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => setSelectedHora(item)} style={{ padding: 10, backgroundColor: selectedHora === item ? '#cfe6ff' : '#fff', marginVertical: 6, borderRadius: 8 }}>
                <Text>{item}</Text>
              </TouchableOpacity>
            )}
          />

          <View style={{ marginTop: 12 }}>
            <Button title="Siguiente" onPress={() => setStep(3)} disabled={!selectedHora || !selectedTramite} />
          </View>
        </View>
      )}

      {step === 3 && (
        <View>
          <Text style={{ fontWeight: '700' }}>Confirmación</Text>
          <Text>Trámite: {selectedTramite?.nombre}</Text>
          <Text>Fecha: {selectedDate.toDateString()}</Text>
          <Text>Hora: {selectedHora}</Text>

          <View style={{ height: 12 }} />
          {loading ? (
            <ActivityIndicator />
          ) : (
            <>
              <Button title="Confirmar y enviar" onPress={handleSubmit} />
              <View style={{ height: 8 }} />
              <Button title="Volver" onPress={() => setStep(2)} />
            </>
          )}
        </View>
      )}
    </View>
  );
}
