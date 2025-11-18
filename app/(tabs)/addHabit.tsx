import { Picker } from '@react-native-picker/picker';
import { Camera, PermissionStatus } from 'expo-camera';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { addDoc, collection } from 'firebase/firestore';
import { Formik } from 'formik';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import * as Yup from 'yup';
import CameraModal from '../../components/CameraModal';
import { auth, db } from '../../services/firebase';
import { Frequency, NewHabitInput, Priority, formatDate } from '../../types/habits';

// Validación con Yup
const validationSchema = Yup.object().shape({
  name: Yup.string().required('El nombre es requerido').min(3, 'Mínimo 3 caracteres'),
  category: Yup.string().required('La categoría es requerida'),
  frequency: Yup.string().required('La frecuencia es requerida'),
  description: Yup.string(),
  time: Yup.string(),
  dailyGoal: Yup.string(),
  additionalGoal: Yup.string(),
});

interface HabitFormValues extends NewHabitInput {
  imageUri?: string;
  location?: string;
}

const DAYS_OF_WEEK = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const AddHabitScreen = () => {
  const [cameraPermission, setCameraPermission] = useState<PermissionStatus | null>(null);
  const [locationPermission, setLocationPermission] = useState<Location.PermissionStatus | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [selectedDays, setSelectedDays] = useState<Set<string>>(new Set());

  useEffect(() => {
    (async () => {
      const cameraStatus = await Camera.getCameraPermissionsAsync();
      setCameraPermission(cameraStatus.status);

      const locationStatus = await Location.getForegroundPermissionsAsync();
      setLocationPermission(locationStatus.status);
    })();
  }, []);

  const requestCameraPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setCameraPermission(status);
  };

  const requestLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    setLocationPermission(status);
  };

  const handleAddHabit = async (values: HabitFormValues) => {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      Alert.alert('Error', 'Debes iniciar sesión para agregar un hábito.');
      return;
    }

    try {
      const habitData = {
        userId,
        name: values.name,
        category: values.category,
        description: values.description || '',
        time: values.time || '',
        reminders: values.reminders || [],
        priority: values.priority || Priority.LOW,
        frequency: values.frequency as Frequency || Frequency.DAILY,
        startDate: values.startDate || formatDate(new Date()),
        endDate: values.endDate || formatDate(new Date()),
        dailyGoal: values.dailyGoal || '',
        additionalGoal: values.additionalGoal || '',
        streak: 0,
        daysOfWeek: Array.from(selectedDays),
        completedDates: [],
        imageUri: values.imageUri || '',
        location: values.location || '',
        createdAt: new Date(),
      };

      await addDoc(collection(db, 'habits'), habitData);
      
      Alert.alert('Éxito', '¡Hábito creado correctamente!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('Error', (error as Error).message);
    }
  };

  const handleGetLocation = async (
    setFieldValue: (field: string, value: any) => void
  ) => {
    if (!locationPermission || locationPermission !== 'granted') {
      await requestLocationPermission();
      const status = await Location.getForegroundPermissionsAsync();
      if (status.status !== 'granted') {
        Alert.alert('Permiso denegado', 'No se pudo acceder a la ubicación');
        return;
      }
    }

    try {
      const location = await Location.getCurrentPositionAsync({});
      const locationString = `${location.coords.latitude},${location.coords.longitude}`;
      setFieldValue('location', locationString);
      Alert.alert('Ubicación obtenida', `Lat: ${location.coords.latitude}, Lng: ${location.coords.longitude}`);
    } catch (error) {
      Alert.alert('Error', 'No se pudo obtener la ubicación');
    }
  };

  const scheduleHabitNotification = async (habitName: string, time: string) => {
    try {
      const [hours, minutes] = time.split(':').map(Number);

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Recordatorio de hábito',
          body: `Es hora de: ${habitName}`,
          data: { habitName },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: hours,
          minute: minutes
        },
      });
    } catch (error) {
      console.error('Error al programar notificación:', error);
    }
  };

  const toggleDaySelection = (day: string) => {
    setSelectedDays(prev => {
      const newSet = new Set(prev);
      if (newSet.has(day)) {
        newSet.delete(day);
      } else {
        newSet.add(day);
      }
      return newSet;
    });
  };

  if (cameraPermission === null) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Cargando permisos...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Formik<HabitFormValues>
        initialValues={{
          name: '',
          category: '',
          frequency: Frequency.DAILY,
          description: '',
          time: '',
          priority: Priority.MEDIUM,
          startDate: formatDate(new Date()),
          endDate: formatDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)), // +30 días
          dailyGoal: '',
          additionalGoal: '',
          reminders: [],
          daysOfWeek: [],
          imageUri: '',
          location: '',
        }}
        validationSchema={validationSchema}
        onSubmit={handleAddHabit}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue }) => (
          <>
            <Modal visible={showCamera} animationType="slide">
              <CameraModal
                onPictureTaken={(uri: string) => {
                  setFieldValue('imageUri', uri);
                  setShowCamera(false);
                }}
                onClose={() => setShowCamera(false)}
              />
            </Modal>

            <Text style={styles.title}>Crear Nuevo Hábito</Text>

            {/* Nombre */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nombre del hábito *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Hacer ejercicio"
                onChangeText={handleChange('name')}
                onBlur={handleBlur('name')}
                value={values.name}
              />
              {touched.name && errors.name && (
                <Text style={styles.errorText}>{errors.name}</Text>
              )}
            </View>

            {/* Categoría */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Categoría *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Salud, Productividad"
                onChangeText={handleChange('category')}
                onBlur={handleBlur('category')}
                value={values.category}
              />
              {touched.category && errors.category && (
                <Text style={styles.errorText}>{errors.category}</Text>
              )}
            </View>

            {/* Descripción */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Descripción</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe tu hábito"
                onChangeText={handleChange('description')}
                onBlur={handleBlur('description')}
                value={values.description}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Frecuencia */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Frecuencia *</Text>
              <Picker
                selectedValue={values.frequency}
                onValueChange={(value) => setFieldValue('frequency', value)}
                style={styles.picker}
              >
                <Picker.Item label="Diario" value={Frequency.DAILY} />
                <Picker.Item label="Semanal" value={Frequency.WEEKLY} />
                <Picker.Item label="Mensual" value={Frequency.MONTHLY} />
              </Picker>
            </View>

            {/* Prioridad */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Prioridad</Text>
              <Picker
                selectedValue={values.priority}
                onValueChange={(value) => setFieldValue('priority', value)}
                style={styles.picker}
              >
                <Picker.Item label="Baja" value={Priority.LOW} />
                <Picker.Item label="Media" value={Priority.MEDIUM} />
                <Picker.Item label="Alta" value={Priority.HIGH} />
              </Picker>
            </View>

            {/* Hora */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Hora (opcional)</Text>
              <TextInput
                style={styles.input}
                placeholder="HH:MM (Ej: 08:00)"
                onChangeText={handleChange('time')}
                onBlur={handleBlur('time')}
                value={values.time}
              />
            </View>

            {/* Días de la semana (solo si es semanal) */}
            {values.frequency === Frequency.WEEKLY && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Días de la semana</Text>
                <View style={styles.daysContainer}>
                  {DAYS_OF_WEEK.map((day) => (
                    <TouchableOpacity
                      key={day}
                      style={[
                        styles.dayButton,
                        selectedDays.has(day) && styles.dayButtonSelected
                      ]}
                      onPress={() => toggleDaySelection(day)}
                    >
                      <Text style={[
                        styles.dayText,
                        selectedDays.has(day) && styles.dayTextSelected
                      ]}>
                        {day.substring(0, 3)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Meta diaria */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Meta diaria</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: 30 minutos"
                onChangeText={handleChange('dailyGoal')}
                onBlur={handleBlur('dailyGoal')}
                value={values.dailyGoal}
              />
            </View>

            {/* Meta adicional */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Meta adicional</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Correr 5km"
                onChangeText={handleChange('additionalGoal')}
                onBlur={handleBlur('additionalGoal')}
                value={values.additionalGoal}
              />
            </View>

            {/* Foto */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Foto del hábito</Text>
              <Button 
                title={values.imageUri ? "Cambiar foto" : "Tomar foto"} 
                onPress={() => {
                  if (cameraPermission !== 'granted') {
                    requestCameraPermission();
                  } else {
                    setShowCamera(true);
                  }
                }} 
              />
              {values.imageUri && (
                <Image source={{ uri: values.imageUri }} style={styles.image} />
              )}
            </View>

            {/* Ubicación */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Ubicación</Text>
              <Button 
                title={values.location ? "Actualizar ubicación" : "Obtener ubicación"} 
                onPress={() => handleGetLocation(setFieldValue)} 
              />
              {values.location && (
                <Text style={styles.locationText}>📍 {values.location}</Text>
              )}
            </View>

            {/* Botón de envío */}
            <View style={styles.submitContainer}>
              <Button 
                onPress={() => handleSubmit()} 
                title="Crear Hábito" 
                color="#007bff"
              />
            </View>
          </>
        )}
      </Formik>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
    color: '#333',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    height: 48,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  picker: {
    height: 48,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  errorText: {
    fontSize: 12,
    color: '#dc3545',
    marginTop: 4,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginTop: 12,
  },
  locationText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  dayButtonSelected: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  dayText: {
    fontSize: 14,
    color: '#333',
  },
  dayTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  submitContainer: {
    marginTop: 24,
    marginBottom: 40,
  },
});

export default AddHabitScreen;