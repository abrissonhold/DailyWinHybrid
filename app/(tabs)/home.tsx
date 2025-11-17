import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { collection, doc, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { auth, db } from '../../services/firebase';
import { Frequency, Habit, Priority, formatDate, isCompletedToday } from '../../types/habits';

const HomeScreen = () => {
  const { t } = useTranslation();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const userId = auth.currentUser?.uid;

  useEffect(() => {
    if (!userId) return;

    const q = query(collection(db, 'habits'), where('userId', '==', userId));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const habitsData: Habit[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        habitsData.push({
          id: doc.id,
          userId: data.userId || '',
          name: data.name || '',
          category: data.category || '',
          description: data.description || '',
          time: data.time || '',
          reminders: data.reminders || [],
          priority: data.priority || Priority.LOW,
          frequency: data.frequency || Frequency.DAILY,
          startDate: data.startDate || formatDate(new Date()),
          endDate: data.endDate || formatDate(new Date()),
          dailyGoal: data.dailyGoal || '',
          additionalGoal: data.additionalGoal || '',
          streak: data.streak || 0,
          daysOfWeek: data.daysOfWeek || [],
          completedDates: data.completedDates || [],
          imageUri: data.imageUri || '',
          location: data.location || ''
        } as Habit);
      });

      // Ordenar por prioridad y racha
      habitsData.sort((a, b) => {
        const priorityOrder = { [Priority.HIGH]: 3, [Priority.MEDIUM]: 2, [Priority.LOW]: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });

      setHabits(habitsData);
    });

    return () => unsubscribe();
  }, [userId]);

  const onRefresh = async () => {
    setRefreshing(true);
    // La sincronización es automática con onSnapshot
    setTimeout(() => setRefreshing(false), 1000);
  };

  const toggleHabitCompletion = async (habit: Habit) => {
    const today = formatDate(new Date());
    const isCompleted = habit.completedDates.includes(today);

    try {
      const habitRef = doc(db, 'habits', habit.id);

      if (isCompleted) {
        // Desmarcar como completado
        const updatedDates = habit.completedDates.filter(date => date !== today);
        await updateDoc(habitRef, {
          completedDates: updatedDates,
          streak: Math.max(0, habit.streak - 1)
        });
      } else {
        // Marcar como completado
        const updatedDates = [...habit.completedDates, today];
        await updateDoc(habitRef, {
          completedDates: updatedDates,
          streak: habit.streak + 1
        });

        // Feedback visual
        Alert.alert('¡Bien hecho! 🎉', `Has completado "${habit.name}"`);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el hábito');
      console.error(error);
    }
  };

  const getPriorityColor = (priority: Priority): string => {
    switch (priority) {
      case Priority.HIGH: return '#FF6B6B';
      case Priority.MEDIUM: return '#FFA500';
      case Priority.LOW: return '#4ECDC4';
      default: return '#999';
    }
  };

  const getPriorityLabel = (priority: Priority): string => {
    switch (priority) {
      case Priority.HIGH: return 'Alta';
      case Priority.MEDIUM: return 'Media';
      case Priority.LOW: return 'Baja';
      default: return '';
    }
  };

  const getFrequencyLabel = (frequency: Frequency): string => {
    switch (frequency) {
      case Frequency.DAILY: return 'Diario';
      case Frequency.WEEKLY: return 'Semanal';
      case Frequency.MONTHLY: return 'Mensual';
      default: return '';
    }
  };

  const getTodayProgress = (): { completed: number; total: number } => {
    const today = formatDate(new Date());
    const completed = habits.filter(h => h.completedDates.includes(today)).length;
    return { completed, total: habits.length };
  };

  const renderHabitCard = ({ item }: { item: Habit }) => {
    const completed = isCompletedToday(item);
    const priorityColor = getPriorityColor(item.priority);

    return (
      <TouchableOpacity
        style={[
          styles.habitCard,
          completed && styles.habitCardCompleted,
          { borderLeftColor: priorityColor }
        ]}
        onPress={() => router.push(`/(tabs)/habit/${item.id}`)}
        activeOpacity={0.7}
      >
        <View style={styles.habitHeader}>
          <View style={styles.habitInfo}>
            {item.imageUri ? (
              <Image source={{ uri: item.imageUri }} style={styles.habitImage} />
            ) : (
              <View style={[styles.habitIconPlaceholder, { backgroundColor: priorityColor }]}>
                <Text style={styles.habitIconText}>
                  {item.name.substring(0, 2).toUpperCase()}
                </Text>
              </View>
            )}

            <View style={styles.habitDetails}>
              <Text style={[styles.habitName, completed && styles.habitNameCompleted]}>
                {item.name}
              </Text>
              <View style={styles.habitMeta}>
                <Text style={styles.habitCategory}>📁 {item.category}</Text>
                <Text style={styles.habitFrequency}>🔁 {getFrequencyLabel(item.frequency)}</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.checkButton}
            onPress={() => toggleHabitCompletion(item)}
          >
            <Ionicons
              name={completed ? "checkmark-circle" : "ellipse-outline"}
              size={32}
              color={completed ? "#4CAF50" : "#ccc"}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.habitFooter}>
          <View style={styles.habitStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>🔥 {item.streak}</Text>
              <Text style={styles.statLabel}>Racha</Text>
            </View>

            {item.time && (
              <View style={styles.statItem}>
                <Text style={styles.statValue}>⏰ {item.time}</Text>
                <Text style={styles.statLabel}>Hora</Text>
              </View>
            )}

            <View style={styles.statItem}>
              <View style={[styles.priorityBadge, { backgroundColor: priorityColor }]}>
                <Text style={styles.priorityText}>{getPriorityLabel(item.priority)}</Text>
              </View>
            </View>
          </View>

          {item.dailyGoal && (
            <Text style={styles.habitGoal}>🎯 {item.dailyGoal}</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const progress = getTodayProgress();
  const progressPercentage = habits.length > 0
    ? Math.round((progress.completed / progress.total) * 100)
    : 0;

  return (
    <View style={styles.container}>
      {/* Header con progreso */}
      <View style={styles.header}>
        <Text style={styles.title}>{t('home.title')}</Text>
        <Text style={styles.greeting}>
          {new Date().getHours() < 12 ? '🌅' : new Date().getHours() < 18 ? '☀️' : '🌙'}
          {' '}Bienvenido de vuelta
        </Text>
      </View>

      {/* Progreso del día */}
      {habits.length > 0 && (
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Progreso de hoy</Text>
            <Text style={styles.progressValue}>{progress.completed}/{progress.total}</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBar,
                { width: `${progressPercentage}%` }
              ]}
            />
          </View>
          <Text style={styles.progressPercentage}>{progressPercentage}% completado</Text>
        </View>
      )}

      {/* Lista de hábitos */}
      {habits.length > 0 ? (
        <FlatList
          data={habits}
          keyExtractor={(item) => item.id}
          renderItem={renderHabitCard}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📝</Text>
          <Text style={styles.emptyTitle}>No tienes hábitos aún</Text>
          <Text style={styles.emptyText}>
            ¡Crea tu primer hábito y comienza tu viaje hacia una mejor versión de ti!
          </Text>
        </View>
      )}

      {/* Botón flotante para agregar */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/(tabs)/addHabit')}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 40,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  greeting: {
    fontSize: 16,
    color: '#666',
  },
  progressContainer: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  progressValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  progressPercentage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  habitCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  habitCardCompleted: {
    opacity: 0.8,
    backgroundColor: '#f0f9f0',
  },
  habitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  habitInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  habitImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  habitIconPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  habitIconText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  habitDetails: {
    flex: 1,
  },
  habitName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  habitNameCompleted: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  habitMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  habitCategory: {
    fontSize: 12,
    color: '#666',
  },
  habitFrequency: {
    fontSize: 12,
    color: '#666',
  },
  checkButton: {
    padding: 4,
  },
  habitFooter: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  habitStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  statLabel: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
  },
  priorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: 'bold',
  },
  habitGoal: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default HomeScreen;