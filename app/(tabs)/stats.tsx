import { collection, onSnapshot, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BarChart, LineChart, PieChart } from 'react-native-chart-kit';
import { auth, db } from '../../services/firebase';
import { Frequency, Habit, Priority, formatDate } from '../../types/habits';

const screenWidth = Dimensions.get('window').width;

const StatsScreen = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
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
      setHabits(habitsData);
    });

    return () => unsubscribe();
  }, [userId]);

  const getCategoryStats = () => {
    const categoryCounts = habits.reduce((acc, habit) => {
      acc[habit.category] = (acc[habit.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE'];
    
    return Object.keys(categoryCounts).map((category, index) => ({
      name: category,
      population: categoryCounts[category],
      color: colors[index % colors.length],
      legendFontColor: '#7F7F7F',
      legendFontSize: 14,
    }));
  };

  const getPriorityStats = () => {
    const priorityCounts = {
      [Priority.HIGH]: 0,
      [Priority.MEDIUM]: 0,
      [Priority.LOW]: 0,
    };

    habits.forEach(habit => {
      priorityCounts[habit.priority]++;
    });

    return {
      labels: ['Alta', 'Media', 'Baja'],
      datasets: [{
        data: [
          priorityCounts[Priority.HIGH],
          priorityCounts[Priority.MEDIUM],
          priorityCounts[Priority.LOW]
        ]
      }]
    };
  };

  const getFrequencyStats = () => {
    const frequencyCounts = {
      [Frequency.DAILY]: 0,
      [Frequency.WEEKLY]: 0,
      [Frequency.MONTHLY]: 0,
    };

    habits.forEach(habit => {
      frequencyCounts[habit.frequency]++;
    });

    return {
      labels: ['Diario', 'Semanal', 'Mensual'],
      datasets: [{
        data: [
          frequencyCounts[Frequency.DAILY],
          frequencyCounts[Frequency.WEEKLY],
          frequencyCounts[Frequency.MONTHLY]
        ]
      }]
    };
  };

  const getLast7DaysProgress = () => {
    const last7Days: string[] = [];
    const completionCounts: number[] = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = formatDate(date);
      last7Days.push(dateStr.substring(5)); 

      const completedCount = habits.filter(habit => 
        habit.completedDates.includes(dateStr)
      ).length;
      
      completionCounts.push(completedCount);
    }

    return {
      labels: last7Days,
      datasets: [{
        data: completionCounts,
        color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
        strokeWidth: 2
      }]
    };
  };

  // Estadísticas generales
  const getTotalCompletions = () => {
    return habits.reduce((sum, habit) => sum + habit.completedDates.length, 0);
  };

  const getAverageStreak = () => {
    if (habits.length === 0) return 0;
    const totalStreak = habits.reduce((sum, habit) => sum + habit.streak, 0);
    return Math.round(totalStreak / habits.length);
  };

  const getBestStreak = () => {
    if (habits.length === 0) return { name: 'N/A', streak: 0 };
    const best = habits.reduce((max, habit) => 
      habit.streak > max.streak ? habit : max
    , habits[0]);
    return { name: best.name, streak: best.streak };
  };

  const getCompletionRate = () => {
    if (habits.length === 0) return 0;
    const today = formatDate(new Date());
    const completedToday = habits.filter(h => h.completedDates.includes(today)).length;
    return Math.round((completedToday / habits.length) * 100);
  };

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 123, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#007bff'
    }
  };

  if (habits.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📊</Text>
        <Text style={styles.emptyTitle}>No hay estadísticas aún</Text>
        <Text style={styles.emptyText}>
          Crea algunos hábitos y comienza a completarlos para ver tus estadísticas
        </Text>
      </View>
    );
  }

  const bestStreak = getBestStreak();

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>📊 Tus Estadísticas</Text>

      {/* Tarjetas de resumen */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>{habits.length}</Text>
          <Text style={styles.summaryLabel}>Total Hábitos</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>{getTotalCompletions()}</Text>
          <Text style={styles.summaryLabel}>Completados</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>{getAverageStreak()}</Text>
          <Text style={styles.summaryLabel}>Racha Media</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>{getCompletionRate()}%</Text>
          <Text style={styles.summaryLabel}>Tasa Hoy</Text>
        </View>
      </View>

      {/* Mejor racha */}
      <View style={styles.bestStreakContainer}>
        <Text style={styles.sectionTitle}>🔥 Mejor Racha</Text>
        <View style={styles.bestStreakCard}>
          <Text style={styles.bestStreakNumber}>{bestStreak.streak}</Text>
          <Text style={styles.bestStreakName}>{bestStreak.name}</Text>
        </View>
      </View>

      {/* Progreso últimos 7 días */}
      <View style={styles.chartContainer}>
        <Text style={styles.sectionTitle}>📈 Últimos 7 días</Text>
        <LineChart
          data={getLast7DaysProgress()}
          width={screenWidth - 40}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
          withInnerLines={false}
          withOuterLines={true}
          withVerticalLabels={true}
          withHorizontalLabels={true}
          fromZero
        />
      </View>

      {/* Hábitos por categoría */}
      {getCategoryStats().length > 0 && (
        <View style={styles.chartContainer}>
          <Text style={styles.sectionTitle}>📁 Por Categoría</Text>
          <PieChart
            data={getCategoryStats()}
            width={screenWidth - 40}
            height={220}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
            style={styles.chart}
          />
        </View>
      )}

      {/* Hábitos por prioridad */}
      <View style={styles.chartContainer}>
        <Text style={styles.sectionTitle}>⚡ Por Prioridad</Text>
        <BarChart
          data={getPriorityStats()}
          width={screenWidth - 40}
          height={220}
          yAxisLabel=""
          yAxisSuffix=""
          chartConfig={{
            ...chartConfig,
            color: (opacity = 1) => `rgba(255, 107, 107, ${opacity})`,
          }}
          style={styles.chart}
          showValuesOnTopOfBars
          fromZero
        />
      </View>

      {/* Hábitos por frecuencia */}
      <View style={styles.chartContainer}>
        <Text style={styles.sectionTitle}>🔁 Por Frecuencia</Text>
        <BarChart
          data={getFrequencyStats()}
          width={screenWidth - 40}
          height={220}
          yAxisLabel=""
          yAxisSuffix=""
          chartConfig={{
            ...chartConfig,
            color: (opacity = 1) => `rgba(78, 205, 196, ${opacity})`,
          }}
          style={styles.chart}
          showValuesOnTopOfBars
          fromZero
        />
      </View>

      {/* Top 3 hábitos con mejor racha */}
      <View style={styles.topHabitsContainer}>
        <Text style={styles.sectionTitle}>🏆 Top 3 Hábitos</Text>
        {habits
          .sort((a, b) => b.streak - a.streak)
          .slice(0, 3)
          .map((habit, index) => (
            <View key={habit.id} style={styles.topHabitCard}>
              <Text style={styles.topHabitRank}>#{index + 1}</Text>
              <View style={styles.topHabitInfo}>
                <Text style={styles.topHabitName}>{habit.name}</Text>
                <Text style={styles.topHabitCategory}>{habit.category}</Text>
              </View>
              <Text style={styles.topHabitStreak}>🔥 {habit.streak}</Text>
            </View>
          ))}
      </View>
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
    textAlign: 'center',
    marginVertical: 20,
    color: '#333',
  },
  summaryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    width: '45%',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  bestStreakContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  bestStreakCard: {
    backgroundColor: '#FF6B6B',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  bestStreakNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  bestStreakName: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  chartContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  topHabitsContainer: {
    marginHorizontal: 20,
    marginBottom: 40,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  topHabitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  topHabitRank: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
    marginRight: 12,
    width: 40,
  },
  topHabitInfo: {
    flex: 1,
  },
  topHabitName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  topHabitCategory: {
    fontSize: 12,
    color: '#666',
  },
  topHabitStreak: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#f5f5f5',
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
});

export default StatsScreen;