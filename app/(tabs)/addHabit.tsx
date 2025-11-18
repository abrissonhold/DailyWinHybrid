import { router } from 'expo-router';
import { addDoc, collection } from 'firebase/firestore';
import React from 'react';
import { Alert } from 'react-native';
import { HabitForm } from '../../components/HabitForm';
import { auth, db } from '../../services/firebase';
import { Habit } from '../../types/habits';

const AddHabitScreen = () => {
  const handleSave = async (habitData: Partial<Habit>) => {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      Alert.alert('Error', 'Debes iniciar sesión para agregar un hábito.');
      return;
    }

    try {
      const newHabit = {
        ...habitData,
        userId,
        streak: 0,
        completedDates: [],
        createdAt: new Date(),
      };
      
      await addDoc(collection(db, 'habits'), newHabit);
      
      Alert.alert('Éxito', '¡Hábito creado correctamente!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
        if (error instanceof Error) {
            Alert.alert('Error', error.message);
        } else {
            Alert.alert('Error', 'An unknown error occurred.');
        }
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return <HabitForm onSave={handleSave} onCancel={handleCancel} />;
};

export default AddHabitScreen;
