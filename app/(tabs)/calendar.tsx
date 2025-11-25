import { Ionicons } from '@expo/vector-icons';
import { Theme, useNavigation } from '@react-navigation/native';
import {
  collection,
  doc,
  onSnapshot,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { useThemeContext } from '../../context/ThemeProvider';
import { auth, db } from '../../services/firebase';
import {
  Frequency,
  Habit,
  markAsCompleted,
  Priority,
  unmarkCompleted,
  getPriorityColor,
} from '../../types/habits';
import { TAB_BAR_HEIGHT } from '../../constants/styles';

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

// 0 = Sunday, 1 = Monday ...
const WEEKDAY_LETTERS: Record<number, string> = {
  0: 'D', // Domingo
  1: 'L', // Lunes
  2: 'M', // Martes
  3: 'X', // Miércoles
  4: 'J', // Jueves
  5: 'V', // Viernes
  6: 'S', // Sábado
};

const CalendarScreen = () => {
  const { navTheme, paperTheme } = useThemeContext();
  const styles = useMemo(() => themedStyles(navTheme), [navTheme]);
  const navigation = useNavigation<any>();

  const [markedDates, setMarkedDates] = useState<MarkedDates>({});
  const [selectedDate, setSelectedDate] = useState<string>(
    () => new Date().toISOString().split('T')[0] // hoy
  );
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

      querySnapshot.forEach((docSnap) => {
        const habit = { ...docSnap.data(), id: docSnap.id } as Habit;
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

            const priorityColor = getPriorityColor(habit.priority, paperTheme);
            newMarkedDates[date].dots?.push({
              color: priorityColor,
              key: habit.id,
            });
          });
        }
      });

      // mantener el día seleccionado marcado
      if (!newMarkedDates[selectedDate]) {
        newMarkedDates[selectedDate] = {};
      }
      newMarkedDates[selectedDate].selected = true;
      newMarkedDates[selectedDate].selectedColor = navTheme.colors.primary;

      setAllHabits(habits);
      setMarkedDates(newMarkedDates);
      setHabitsByDate(newHabitsByDate);
    });

    return () => unsubscribe();
  }, [userId, navTheme, selectedDate]);

  const handleDayPress = (day: DateData) => {
    const dateString = day.dateString;
    setSelectedDate(dateString);

    const updatedMarkedDates: MarkedDates = { ...markedDates };

    // limpiar selección previa
    Object.keys(updatedMarkedDates).forEach((key) => {
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

  /** Equivalente a viewModel.isHabitDueOnDate(habit, date) */
  const isHabitDueOnDate = (habit: Habit, dateStr: string): boolean => {
    const target = new Date(dateStr + 'T00:00:00');
    target.setHours(0, 0, 0, 0);

    if (habit.startDate) {
      const start = new Date(habit.startDate + 'T00:00:00');
      start.setHours(0, 0, 0, 0);
      if (target < start) return false;
    }

    if (habit.endDate) {
      const end = new Date(habit.endDate + 'T00:00:00');
      end.setHours(0, 0, 0, 0);
      if (target > end) return false;
    }

    const freq = habit.frequency || Frequency.DAILY;

    if (freq === Frequency.DAILY) {
      return true;
    }

    if (freq === Frequency.WEEKLY) {
      const letter = WEEKDAY_LETTERS[target.getDay()];
      if (!habit.daysOfWeek || habit.daysOfWeek.length === 0) {
        return true; // fallback si no hay días configurados
      }
      return habit.daysOfWeek.includes(letter);
    }

    if (freq === Frequency.MONTHLY) {
      if (habit.startDate) {
        const start = new Date(habit.startDate + 'T00:00:00');
        return target.getDate() === start.getDate();
      }
      return true;
    }

    return true;
  };

  const getHabitsForDate = (date: string): Habit[] => {
    return allHabits.filter((habit) => isHabitDueOnDate(habit, date));
  };

  const isHabitCompletedOnDate = (habit: Habit, date: string): boolean => {
    return habit.completedDates?.includes(date) ?? false;
  };

  const isFutureDate = (date: string): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(date + 'T00:00:00');
    target.setHours(0, 0, 0, 0);
    return target.getTime() > today.getTime();
  };

  /** Equivalente a viewModel.toggleCompleted(habit.id, selectedDate) */
  const toggleHabitCompletion = async (habit: Habit, date: string) => {
    if (!habit.id) return;
    try {
      const habitRef = doc(db, 'habits', habit.id);
      const dateObj = new Date(date + 'T00:00:00');
      const currentlyCompleted = isHabitCompletedOnDate(habit, date);

      const updatedHabit = currentlyCompleted
        ? unmarkCompleted(habit, dateObj)
        : markAsCompleted(habit, dateObj);

      await updateDoc(habitRef, {
        completedDates: updatedHabit.completedDates,
        streak: updatedHabit.streak,
      });
    } catch (error) {
      console.error('Error toggling habit completion:', error);
    }
  };

  const getTotalCompletedDays = (): number => {
    // días distintos con al menos un hábito completado
    return Object.keys(habitsByDate).length;
  };

  const getCurrentStreak = (): number => {
    const sortedDates = Object.keys(habitsByDate).sort().reverse();
    if (sortedDates.length === 0) return 0;

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const dateStr of sortedDates) {
      const date = new Date(dateStr + 'T00:00:00');
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

  const habitsForSelectedDate = selectedDate ? getHabitsForDate(selectedDate) : [];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Top bar similar al TopAppBar de Kotlin */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={navTheme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Calendario</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{allHabits.length}</Text>
          <Text style={styles.statLabel}>Hábitos</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{getTotalCompletedDays()}</Text>
          <Text style={styles.statLabel}>Días con hábitos completados</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{getCurrentStreak()}</Text>
          <Text style={styles.statLabel}>Racha actual</Text>
        </View>
      </View>

      {/* Calendario */}
      <Calendar
        markedDates={markedDates}
        onDayPress={handleDayPress}
        markingType="multi-dot"
        current={selectedDate}
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

      {/* Leyenda de colores (extra, opcional) */}
      {allHabits.length > 0 && (
        <View style={styles.legendContainer}>
          <Text style={styles.legendTitle}>Leyenda de hábitos:</Text>
          {allHabits.map((habit, index) => (
            <View key={habit.id} style={styles.legendItem}>
              <View
                style={[
                  styles.legendDot,
                  { backgroundColor: getPriorityColor(habit.priority, paperTheme) },
                ]}
              />
              <Text style={styles.legendText}>{habit.name}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Lista de hábitos para el día seleccionado (debidos, no sólo completados) */}
      {selectedDate && (
        <View style={styles.selectedDateContainer}>
          <Text style={styles.selectedDateTitle}>
            {new Date(selectedDate + 'T00:00:00').toLocaleDateString('es-ES', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>

          {habitsForSelectedDate.length > 0 ? (
            habitsForSelectedDate.map((habit) => {
              const completed = isHabitCompletedOnDate(habit, selectedDate);
              const future = isFutureDate(selectedDate);
              const priorityColor = getPriorityColor(habit.priority, paperTheme);

              return (
                <View
                  key={habit.id}
                  style={[
                    styles.habitCard,
                    completed && styles.habitCardCompleted,
                  ]}
                >
                  {/* Círculo de completado (como en HabitCalendarItem de Kotlin) */}
                  <TouchableOpacity
                    style={[
                      styles.habitCircle,
                      completed && { backgroundColor: priorityColor },
                      !completed && {
                        borderColor: priorityColor,
                        borderWidth: 2,
                      },
                      future && styles.habitCircleDisabled,
                    ]}
                    disabled={future}
                    onPress={() => toggleHabitCompletion(habit, selectedDate)}
                  >
                    {completed && (
                      <Ionicons name="checkmark" size={18} color="#fff" />
                    )}
                  </TouchableOpacity>

                  {/* Info del hábito */}
                  <View style={styles.habitInfo}>
                    <Text style={styles.habitName}>{habit.name}</Text>
                    {habit.time && habit.time.trim().length > 0 && (
                      <Text style={styles.habitTime}>{habit.time}</Text>
                    )}
                    {habit.category && (
                      <Text style={styles.habitCategory}>{habit.category}</Text>
                    )}
                  </View>

                  {/* Racha + botón editar */}
                  <View style={styles.habitRight}>
                    <View
                      style={[
                        styles.habitStreakBadge,
                        { borderColor: priorityColor },
                      ]}
                    >
                      <Text
                        style={[
                          styles.habitStreakText,
                          { color: priorityColor },
                        ]}
                      >
                        {habit.streak || 0} días
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() =>
                        // ajusta este nombre de ruta a tu navegación real
                        navigation.navigate('HabitForm', {
                          habitId: habit.id,
                        })
                      }
                    >
                      <Ionicons
                        name="pencil"
                        size={18}
                        color={navTheme.colors.text}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          ) : (
            <View style={styles.noHabitsContainer}>
              <Text style={styles.noHabitsText}>No hay hábitos para este día</Text>
            </View>
          )}
        </View>
      )}

      {/* Mensaje si no hay hábitos en absoluto */}
      {allHabits.length === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>📝 Aún no tienes hábitos registrados.</Text>
          <Text style={styles.emptySubtext}>
            ¡Crea tu primer hábito y comienza tu viaje!
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const themedStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    contentContainer: {
      paddingBottom: TAB_BAR_HEIGHT,
    },
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 8,
    },
    topBarTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: theme.colors.text,
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: 16,
      paddingHorizontal: 16,
      marginTop: 8,
    },
    statBox: {
      backgroundColor: theme.colors.card,
      padding: 12,
      borderRadius: 12,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      minWidth: 90,
    },
    statNumber: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.primary,
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 11,
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
      textTransform: 'capitalize',
    },
    habitCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
      padding: 12,
      borderRadius: 10,
      marginBottom: 8,
    },
    habitCardCompleted: {
      backgroundColor: theme.colors.card,
    },
    habitCircle: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
      backgroundColor: 'transparent',
    },
    habitCircleDisabled: {
      opacity: 0.4,
    },
    habitInfo: {
      flex: 1,
    },
    habitName: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
    },
    habitTime: {
      fontSize: 12,
      color: theme.colors.border,
      marginTop: 2,
    },
    habitCategory: {
      fontSize: 12,
      color: theme.colors.border,
      marginTop: 2,
    },
    habitRight: {
      alignItems: 'flex-end',
      justifyContent: 'center',
      marginLeft: 8,
    },
    habitStreakBadge: {
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderWidth: 1,
      marginBottom: 6,
    },
    habitStreakText: {
      fontSize: 11,
      fontWeight: '500',
    },
    editButton: {
      padding: 4,
    },
    noHabitsContainer: {
      paddingVertical: 20,
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
