import { collection, onSnapshot, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { useThemeContext } from '../../context/ThemeProvider';
import { auth, db } from '../../services/firebase';
import { Habit } from '../../types/habits';
import { Theme } from '@react-navigation/native';

interface MarkedDates {
  [date: string]: {
    marked?: boolean;
    dotColor?: string;
    selected?: boolean;
    selectedColor?: string;
    dots?: { color: string; key: string }[];
  };
}

interface HabitsByDate {
  [date: string]: Habit[];
}

const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE'];

const CalendarScreen = () => {
  const { navTheme } = useThemeContext();
  const styles = themedStyles(navTheme);
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
            if (!newHabitsByDate[date]) {
              newHabitsByDate[date] = [];
            }
            newHabitsByDate[date].push(habit);

            if (!newMarkedDates[date]) {
              newMarkedDates[date] = {
                marked: true,
                dots: [],
              };
            }
            
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

    const updatedMarkedDates = { ...markedDates };
    
    Object.keys(updatedMarkedDates).forEach(key => {
      if (updatedMarkedDates[key].selected) {
        updatedMarkedDates[key].selected = false;
        delete updatedMarkedDates[key].selectedColor;
      }
    });

    if (!updatedMarkedDates[dateString]) {
      updatedMarkedDates[dateString] = {};
    }
    updatedMarkedDates[dateString].selected = true;
    updatedMarkedDates[dateString].selectedColor = navTheme.colors.primary;

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
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={styles.title}>Tu Calendario</Text>

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
          <Text style={styles.statNumber}> {getCurrentStreak()}</Text>
          <Text style={styles.statLabel}>Racha actual</Text>
        </View>
      </View>

      <Calendar
        markedDates={markedDates}
        onDayPress={handleDayPress}
        markingType="multi-dot"
        theme={{
          calendarBackground: navTheme.colors.card,
          todayTextColor: navTheme.colors.primary,
          selectedDayBackgroundColor: navTheme.colors.primary,
          selectedDayTextColor: '#ffffff',
          arrowColor: navTheme.colors.primary,
          monthTextColor: navTheme.colors.text,
          textMonthFontWeight: 'bold',
          textMonthFontSize: 18,
          dayTextColor: navTheme.colors.text,
          textDisabledColor: navTheme.colors.border,
          dotColor: navTheme.colors.primary,
          selectedDotColor: '#ffffff',
        }}
      />

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

      {selectedDate && (
        <View style={styles.selectedDateContainer}>
          <Text style={styles.selectedDateTitle}>
            Hábitos del {new Date(selectedDate + 'T00:00:00').toLocaleDateString('es-ES', {
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

const themedStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
    contentContainer: {
    paddingBottom: 120,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 16,
    textAlign: 'center',
    color: theme.colors.text,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  statBox: {
    backgroundColor: theme.colors.card,
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
    color: theme.colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.text,
    textAlign: 'center',
  },
  legendContainer: {
    backgroundColor: theme.colors.card,
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
    color: theme.colors.text,
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
    color: theme.colors.text,
  },
  selectedDateContainer: {
    backgroundColor: theme.colors.card,
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
    color: theme.colors.text,
  },
  habitCard: {
    backgroundColor: theme.colors.background,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  habitCardName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  habitCardCategory: {
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: 4,
  },
  habitCardStreak: {
    fontSize: 12,
    color: theme.colors.notification,
  },
  noHabitsContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noHabitsText: {
    fontSize: 14,
    color: theme.colors.border,
    textAlign: 'center',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: theme.colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.colors.border,
    textAlign: 'center',
  },
});

export default CalendarScreen;
