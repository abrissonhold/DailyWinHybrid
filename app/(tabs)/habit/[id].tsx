import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { doc, getDoc, deleteDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../../../services/firebase';

const HabitDetailScreen = () => {
  const { id } = useLocalSearchParams();
  const [habit, setHabit] = useState(null);

  useEffect(() => {
    if (!id) return;

    const docRef = doc(db, 'habits', id);
    getDoc(docRef).then((docSnap) => {
      if (docSnap.exists()) {
        setHabit(docSnap.data());
      }
    });
  }, [id]);

  const handleDelete = () => {
    deleteDoc(doc(db, 'habits', id))
      .then(() => {
        router.back();
      })
      .catch((error) => {
        Alert.alert('Error', error.message);
      });
  };

  const handleMarkAsCompleted = () => {
    const today = new Date().toISOString().slice(0, 10); // Get date in YYYY-MM-DD format
    updateDoc(doc(db, 'habits', id), {
      completedDates: arrayUnion(today),
    })
      .then(() => {
        Alert.alert('Success', 'Habit marked as completed for today!');
      })
      .catch((error) => {
        Alert.alert('Error', error.message);
      });
  };

  if (!habit) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{habit.name}</Text>
      <Text>Category: {habit.category}</Text>
      <Text>Frequency: {habit.frequency}</Text>
      <Button title="Mark as Completed for Today" onPress={handleMarkAsCompleted} />
      <View style={styles.buttons}>
        <Button title="Edit" onPress={() => router.push(`/(tabs)/habit/edit/${id}`)} />
        <Button title="Delete" onPress={handleDelete} color="red" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  buttons: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
});

export default HabitDetailScreen;
