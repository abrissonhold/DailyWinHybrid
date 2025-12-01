import { router, useLocalSearchParams } from 'expo-router';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Alert, View } from 'react-native';
import { HabitForm } from '../../../../components/HabitForm';
import ThemedText from '../../../../components/ThemedText';
import { db } from '../../../../services/firebase';
import { Habit } from '../../../../types/habits';

const EditHabitScreen = () => {
  const { id } = useLocalSearchParams();
  const [habit, setHabit] = useState<Habit | null>(null);

  useEffect(() => {
    if (id) {
      const habitRef = doc(db, 'habits', id as string);
      getDoc(habitRef).then(docSnap => {
        if (docSnap.exists()) {
          setHabit({ id: docSnap.id, ...docSnap.data() } as Habit);
        } else {
          Alert.alert('Error', 'No se encontró el hábito.');
        }
      });
    }
  }, [id]);

  const handleSave = async (habitData: Partial<Habit>) => {
    if (!id) return;
    try {
      const habitRef = doc(db, 'habits', id as string);
      await updateDoc(habitRef, habitData);
      router.back();
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

  if (!habit) {
    return (
      <View>
        <ThemedText>Cargando hábito...</ThemedText>
      </View>
    );
  }

  return <HabitForm habit={habit} onSave={handleSave} onCancel={handleCancel} />;
};

export default EditHabitScreen;
