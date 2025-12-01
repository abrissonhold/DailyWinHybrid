import { collection, onSnapshot, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BarChart, LineChart, PieChart } from 'react-native-chart-kit';
import { useThemeContext } from '../../context/ThemeProvider';
import { auth, db } from '../../services/firebase';
import { Frequency, Habit, Priority, formatDate, isScheduledForToday } from '../../types/habits';
import { Theme as NavTheme } from '@react-navigation/native';
import { MD3Theme } from 'react-native-paper';
import { hexToRgba } from '../../constants/theme';
import { TAB_BAR_HEIGHT } from '../../constants/styles';

const screenWidth = Dimensions.get('window').width;

const StatsScreen = () => {
  const { navTheme, paperTheme } = useThemeContext();
  const styles = themedStyles(navTheme, paperTheme);
  const [habits, setHabits] = useState<Habit[]>([]);
  const userId = auth.currentUser?.uid;

  useEffect(() => {
    if (!userId) return;

    const q = query(collection(db, 'habits'), where('userId', '==', userId));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const habitsData: Habit[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        habitsData.push({ id: doc.id, ...data } as Habit);
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

    const colors = [
      paperTheme.colors.primary,
      paperTheme.colors.secondary,
      paperTheme.colors.tertiary,
      paperTheme.colors.error,
      paperTheme.colors.surfaceVariant ?? paperTheme.colors.surface,
      paperTheme.colors.primaryContainer
    ];

    return Object.keys(categoryCounts).map((category, index) => ({
      name: category,
      population: categoryCounts[category],
      color: colors[index % colors.length],
      legendFontColor: navTheme.colors.text,
      legendFontSize: 14,
    }));
  };

  const getPriorityStats = () => {
    const priorityCounts = { [Priority.HIGH]: 0, [Priority.MEDIUM]: 0, [Priority.LOW]: 0 };
    habits.forEach(habit => { priorityCounts[habit.priority]++; });

    return {
      labels: ['Alta', 'Media', 'Baja'],
      datasets: [{ data: [priorityCounts[Priority.HIGH], priorityCounts[Priority.MEDIUM], priorityCounts[Priority.LOW]] }]
    };
  };

  const getFrequencyStats = () => {
    const frequencyCounts = { [Frequency.DAILY]: 0, [Frequency.WEEKLY]: 0, [Frequency.MONTHLY]: 0 };
    habits.forEach(habit => { frequencyCounts[habit.frequency]++; });

    return {
      labels: ['Diario', 'Semanal', 'Mensual'],
      datasets: [{ data: [frequencyCounts[Frequency.DAILY], frequencyCounts[Frequency.WEEKLY], frequencyCounts[Frequency.MONTHLY]] }]
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
      const completedCount = habits.filter(habit => habit.completedDates.includes(dateStr)).length;
      completionCounts.push(completedCount);
    }

    return {
      labels: last7Days,
      datasets: [{
        data: completionCounts,
        color: (opacity = 1) => hexToRgba(paperTheme.colors.primary, opacity),
        strokeWidth: 2
      }]
    };
  };

  const getTotalCompletions = () => habits.reduce((sum, habit) => sum + habit.completedDates.length, 0);
  const getAverageStreak = () => habits.length === 0 ? 0 : Math.round(habits.reduce((sum, habit) => sum + habit.streak, 0) / habits.length);
  const getBestStreak = () => habits.length === 0 ? { name: 'N/A', streak: 0 } : habits.reduce((max, habit) => habit.streak > max.streak ? habit : max, habits[0]);
  const getCompletionRate = () => {
    const scheduledToday = habits.filter(isScheduledForToday);
    if (scheduledToday.length === 0) return 0;

    const today = formatDate(new Date());
    const completedToday = scheduledToday.filter(h => h.completedDates.includes(today)).length;

    return Math.round((completedToday / scheduledToday.length) * 100);
  };

  const chartConfig = {
    backgroundColor: navTheme.colors.card,
    backgroundGradientFrom: navTheme.colors.card,
    backgroundGradientTo: navTheme.colors.card,
    decimalPlaces: 0,
    color: (opacity = 1) => hexToRgba(paperTheme.colors.primary, opacity),
    labelColor: (opacity = 1) => hexToRgba(navTheme.colors.text, opacity),
    style: { borderRadius: 16 },
    propsForDots: { r: '6', strokeWidth: '2', stroke: paperTheme.colors.primary }
  };

  if (habits.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📊</Text>
        <Text style={styles.emptyTitle}>No hay estadísticas aún</Text>
        <Text style={styles.emptyText}>Crea algunos hábitos y comienza a completarlos para ver tus estadísticas</Text>
      </View>
    );
  }

  const bestStreak = getBestStreak();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>📊 Tus Estadísticas</Text>

      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}><Text style={styles.summaryNumber}>{habits.length}</Text><Text style={styles.summaryLabel}>Total Hábitos</Text></View>
        <View style={styles.summaryCard}><Text style={styles.summaryNumber}>{getTotalCompletions()}</Text><Text style={styles.summaryLabel}>Completados</Text></View>
        <View style={styles.summaryCard}><Text style={styles.summaryNumber}>{getAverageStreak()}</Text><Text style={styles.summaryLabel}>Racha Media</Text></View>
        <View style={styles.summaryCard}><Text style={styles.summaryNumber}>{getCompletionRate()}%</Text><Text style={styles.summaryLabel}>Tasa Hoy</Text></View>
      </View>

      <View style={styles.bestStreakContainer}>
        <Text style={styles.sectionTitle}>Mejor Racha</Text>
        <View style={styles.bestStreakCard}><Text style={styles.bestStreakNumber}>{bestStreak.streak}</Text><Text style={styles.bestStreakName}>{bestStreak.name}</Text></View>
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.sectionTitle}>Últimos 7 días</Text>
        <LineChart data={getLast7DaysProgress()} width={screenWidth - 50} height={220} chartConfig={chartConfig} bezier style={styles.chart} fromZero />
      </View>

      {getCategoryStats().length > 0 && (
        <View style={styles.chartContainer}>
          <Text style={styles.sectionTitle}>Por Categoría</Text>
          <PieChart data={getCategoryStats()} width={screenWidth - 50} height={220} chartConfig={chartConfig} accessor="population" backgroundColor="transparent" paddingLeft="15" absolute style={styles.chart} />
        </View>
      )}

      <View style={styles.chartContainer}>
        <Text style={styles.sectionTitle}>Por Prioridad</Text>
        <BarChart data={getPriorityStats()} width={screenWidth - 50} height={220} yAxisLabel="" yAxisSuffix="" chartConfig={chartConfig} style={styles.chart} showValuesOnTopOfBars fromZero />
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.sectionTitle}>Por Frecuencia</Text>
        <BarChart data={getFrequencyStats()} width={screenWidth - 50} height={220} yAxisLabel="" yAxisSuffix="" chartConfig={{ ...chartConfig, color: (opacity = 1) => `rgba(${parseInt(paperTheme.colors.secondary.slice(1, 3), 16)}, ${parseInt(paperTheme.colors.secondary.slice(3, 5), 16)}, ${parseInt(paperTheme.colors.secondary.slice(5, 7), 16)}, ${opacity})` }} style={styles.chart} showValuesOnTopOfBars fromZero />
      </View>

      <View style={styles.topHabitsContainer}>
        <Text style={styles.sectionTitle}>🏆 Top 3 Hábitos</Text>
        {habits.sort((a, b) => b.streak - a.streak).slice(0, 3).map((habit, index) => (
          <View key={habit.id} style={styles.topHabitCard}>
            <Text style={styles.topHabitRank}>#{index + 1}</Text>
            <View style={styles.topHabitInfo}><Text style={styles.topHabitName}>{habit.name}</Text><Text style={styles.topHabitCategory}>{habit.category}</Text></View>
            <Text style={styles.topHabitStreak}>🔥 {habit.streak}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const themedStyles = (theme: NavTheme, paperTheme: MD3Theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  contentContainer: { paddingBottom: TAB_BAR_HEIGHT + 20, paddingHorizontal: 10 },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginVertical: 16, color: theme.colors.text },
  summaryContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around', marginBottom: 16 },
  summaryCard: { backgroundColor: theme.colors.card, borderRadius: 16, padding: 12, alignItems: 'center', width: '48%', marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  summaryNumber: { fontSize: 28, fontWeight: 'bold', color: paperTheme.colors.primary, marginBottom: 4 },
  summaryLabel: { fontSize: 12, color: theme.colors.text, textAlign: 'center' },
  bestStreakContainer: { marginBottom: 16 },
  bestStreakCard: { backgroundColor: paperTheme.colors.error, borderRadius: 16, padding: 20, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  bestStreakNumber: { fontSize: 42, fontWeight: 'bold', color: paperTheme.colors.onError, marginBottom: 8 },
  bestStreakName: { fontSize: 16, color: paperTheme.colors.onError, fontWeight: '600' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text, marginBottom: 12, paddingHorizontal: 10 },
  chartContainer: { backgroundColor: theme.colors.card, marginBottom: 20, padding: 10, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3, alignItems: 'center' },
  chart: { marginVertical: 8, borderRadius: 16 },
  topHabitsContainer: { marginHorizontal: 20, marginBottom: 40, backgroundColor: theme.colors.card, padding: 16, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  topHabitCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.background, padding: 12, borderRadius: 12, marginBottom: 8 },
  topHabitRank: { fontSize: 24, fontWeight: 'bold', color: paperTheme.colors.secondary, marginRight: 12, width: 40 },
  topHabitInfo: { flex: 1 },
  topHabitName: { fontSize: 16, fontWeight: '600', color: theme.colors.text, marginBottom: 2 },
  topHabitCategory: { fontSize: 12, color: theme.colors.text },
  topHabitStreak: { fontSize: 18, fontWeight: 'bold', color: paperTheme.colors.streak },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, backgroundColor: theme.colors.background },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 22, fontWeight: 'bold', color: theme.colors.text, marginBottom: 8, textAlign: 'center' },
  emptyText: { fontSize: 16, color: theme.colors.text, textAlign: 'center', lineHeight: 24 },
});

export default StatsScreen;
