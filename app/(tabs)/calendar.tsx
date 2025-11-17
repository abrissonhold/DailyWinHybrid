import { collection, onSnapshot, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { auth, db } from '../../services/firebase';
import { Habit } from '../../types/habits';

interface MarkedDates {
  [date: string]: {
    marked?: boolean;
    dotColor?: string;
    selected?: boolean;
    selectedColor?: string;
    dots?: Array<{ color: string; key: string }>;
  };
}

interface HabitsByDate {
  [date: string]: Habit[];
}

const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE'];

const CalendarScreen = () => {
  const [markedDates, setMarkedDates] = useState<MarkedDates>({});
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [habitsByDate, setHabitsByDate] = useState<HabitsByDate>({});
  const [allHabits, setAllHabits] = useState<Habit[]>([]);
  const userId = auth.currentUser?.uid;

  useEffect(() => {
    if (!userId) return;

    const q = query(collection(db, 'habits'), where('userId', '==', userId));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const newMarkedDates: MarkedDates = {};
      const newHabitsByDate: HabitsByDate = {};
      const habits: Habit[] = [];
      
      querySnapshot.forEach((doc) => {
        const habit = { ...doc.data(), id: doc.id } as Habit;
        habits.push(habit);
        
        if (habit.completedDates && habit.completedDates.length > 0) {
          habit.completedDates.forEach((date: string) => {
            // Inicializar el array de hábitos para esta fecha si no existe
            if (!newHabitsByDate[date]) {
              newHabitsByDate[date] = [];
            }
            newHabitsByDate[date].push(habit);

            // Crear o actualizar el marcado en el calendario
            if (!newMarkedDates[date]) {
              newMarkedDates[date] = {
                marked: true,
                dots: [],
              };
            }
            
            // Agregar un punto de color para cada hábito
            const colorIndex = habits.indexOf(habit) % COLORS.length;
            newMarkedDates[date].dots?.push({
              color: COLORS[colorIndex],
              key: habit.id,
            });
          });
        }
      });
      
      setAllHabits(habits);
      setMarkedDates(newMarkedDates);
      setHabitsByDate(newHabitsByDate);
    });

    return () => unsubscribe();
  }, [userId]);

  const handleDayPress = (day: DateData) => {
    const dateString = day.dateString;
    setSelectedDate(dateString);

    // Actualizar la selección visual
    const updatedMarkedDates = { ...markedDates };
    
    // Remover selección anterior
    Object.keys(updatedMarkedDates).forEach(key => {
      if (updatedMarkedDates[key].selected) {
        updatedMarkedDates[key].selected = false;
        delete updatedMarkedDates[key].selectedColor;
      }
    });

    // Agregar nueva selección
    if (!updatedMarkedDates[dateString]) {
      updatedMarkedDates[dateString] = {};
    }
    updatedMarkedDates[dateString].selected = true;
    updatedMarkedDates[dateString].selectedColor = '#00adf5';

    setMarkedDates(updatedMarkedDates);
  };

  const getCompletedHabitsForDate = (date: string): Habit[] => {
    return habitsByDate[date] || [];
  };

  const getTotalCompletedDays = (): number => {
    return Object.keys(habitsByDate).length;
  };

  const getCurrentStreak = (): number => {
    const sortedDates = Object.keys(habitsByDate).sort().reverse();
    if (sortedDates.length === 0) return 0;

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const dateStr of sortedDates) {
      const date = new Date(dateStr);
      date.setHours(0, 0, 0, 0);
      
      const diffTime = currentDate.getTime() - date.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === streak) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Tu Calendario</Text>

      {/* Estadísticas */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{allHabits.length}</Text>
          <Text style={styles.statLabel}>Hábitos</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{getTotalCompletedDays()}</Text>
          <Text style={styles.statLabel}>Días completados</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>🔥 {getCurrentStreak()}</Text>
          <Text style={styles.statLabel}>Racha actual</Text>
        </View>
      </View>

      {/* Calendario */}
      <Calendar
        markedDates={markedDates}
        onDayPress={handleDayPress}
        markingType="multi-dot"
        theme={{
          todayTextColor: '#00adf5',
          selectedDayBackgroundColor: '#00adf5',
          selectedDayTextColor: '#ffffff',
          arrowColor: '#00adf5',
          monthTextColor: '#333',
          textMonthFontWeight: 'bold',
          textMonthFontSize: 18,
          textDayFontSize: 16,
        }}
      />

      {/* Leyenda de colores */}
      {allHabits.length > 0 && (
        <View style={styles.legendContainer}>
          <Text style={styles.legendTitle}>Leyenda de hábitos:</Text>
          {allHabits.map((habit, index) => (
            <View key={habit.id} style={styles.legendItem}>
              <View 
                style={[
                  styles.legendDot, 
                  { backgroundColor: COLORS[index % COLORS.length] }
                ]} 
              />
              <Text style={styles.legendText}>{habit.name}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Hábitos completados en la fecha seleccionada */}
      {selectedDate && (
        <View style={styles.selectedDateContainer}>
          <Text style={styles.selectedDateTitle}>
            📅 Hábitos del {new Date(selectedDate + 'T00:00:00').toLocaleDateString('es-ES', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </Text>
          
          {getCompletedHabitsForDate(selectedDate).length > 0 ? (
            getCompletedHabitsForDate(selectedDate).map((habit) => (
              <View key={habit.id} style={styles.habitCard}>
                <Text style={styles.habitCardName}>✅ {habit.name}</Text>
                <Text style={styles.habitCardCategory}>{habit.category}</Text>
                <Text style={styles.habitCardStreak}>
                  🔥 Racha: {habit.streak} días
                </Text>
              </View>
            ))
          ) : (
            <View style={styles.noHabitsContainer}>
              <Text style={styles.noHabitsText}>
                😔 No hay hábitos completados en esta fecha
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Mensaje si no hay hábitos */}
      {allHabits.length === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            📝 Aún no tienes hábitos registrados.
          </Text>
          <Text style={styles.emptySubtext}>
            ¡Crea tu primer hábito y comienza tu viaje!
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 16,
    textAlign: 'center',
    color: '#333',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  statBox: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minWidth: 100,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00adf5',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  legendContainer: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: '#666',
  },
  selectedDateContainer: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedDateTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  habitCard: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4ECDC4',
  },
  habitCardName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  habitCardCategory: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  habitCardStreak: {
    fontSize: 12,
    color: '#FF6B6B',
  },
  noHabitsContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noHabitsText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});

export default CalendarScreen;