import { collection, onSnapshot, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Appbar } from 'react-native-paper';
import { BarChart, LineChart, PieChart } from 'react-native-chart-kit';
import ThemedText from '../../components/ThemedText';
import { TAB_BAR_HEIGHT } from '../../constants/styles';
import { hexToRgba } from '../../constants/theme';
import { useThemeContext } from '../../context/ThemeProvider';
import { auth, db } from '../../services/firebase';
import { Frequency, Habit, Priority, formatDate, isScheduledForToday } from '../../types/habits';
import { Theme as NavTheme } from '@react-navigation/native';
import { MD3Theme } from 'react-native-paper';

const screenWidth = Dimensions.get('window').width;

const StatsScreen = () => {
  const { t } = useTranslation();
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
      labels: [t('stats.priority.high'), t('stats.priority.medium'), t('stats.priority.low')],
      datasets: [{ data: [priorityCounts[Priority.HIGH], priorityCounts[Priority.MEDIUM], priorityCounts[Priority.LOW]] }]
    };
  };

  const getFrequencyStats = () => {
    const frequencyCounts = { [Frequency.DAILY]: 0, [Frequency.WEEKLY]: 0, [Frequency.MONTHLY]: 0 };
    habits.forEach(habit => { frequencyCounts[habit.frequency]++; });

    return {
      labels: [t('stats.frequency.daily'), t('stats.frequency.weekly'), t('stats.frequency.monthly')],
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
        <ThemedText style={styles.emptyIcon}>📊</ThemedText>
        <ThemedText style={styles.emptyTitle}>{t('stats.empty.title')}</ThemedText>
        <ThemedText style={styles.emptyText}>{t('stats.empty.text')}</ThemedText>
      </View>
    );
  }

  const bestStreak = getBestStreak();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.container}>
        <Appbar.Header>
          <Appbar.Content title={t('stats.title')} />
        </Appbar.Header>
        </View>
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}><ThemedText style={styles.summaryNumber}>{habits.length}</ThemedText><ThemedText style={styles.summaryLabel}>{t('stats.summary.totalHabits')}</ThemedText></View>
          <View style={styles.summaryCard}><ThemedText style={styles.summaryNumber}>{getTotalCompletions()}</ThemedText><ThemedText style={styles.summaryLabel}>{t('stats.summary.completed')}</ThemedText></View>
          <View style={styles.summaryCard}><ThemedText style={styles.summaryNumber}>{getAverageStreak()}</ThemedText><ThemedText style={styles.summaryLabel}>{t('stats.summary.averageStreak')}</ThemedText></View>
          <View style={styles.summaryCard}><ThemedText style={styles.summaryNumber}>{getCompletionRate()}%</ThemedText><ThemedText style={styles.summaryLabel}>{t('stats.summary.todayRate')}</ThemedText></View>
        </View>

        <View style={styles.bestStreakContainer}>
          <ThemedText style={styles.sectionTitle}>{t('stats.bestStreak.title')}</ThemedText>
          <View style={styles.bestStreakCard}><ThemedText style={styles.bestStreakNumber}>{bestStreak.streak}</ThemedText><ThemedText style={styles.bestStreakName}>{bestStreak.name}</ThemedText></View>
        </View>

        <View style={styles.chartContainer}>
          <ThemedText style={styles.sectionTitle}>{t('stats.last7Days.title')}</ThemedText>
          <LineChart data={getLast7DaysProgress()} width={screenWidth - 50} height={220} chartConfig={chartConfig} bezier style={styles.chart} fromZero />
        </View>

        {getCategoryStats().length > 0 && (
          <View style={styles.chartContainer}>
            <ThemedText style={styles.sectionTitle}>{t('stats.byCategory.title')}</ThemedText>
            <PieChart data={getCategoryStats()} width={screenWidth - 50} height={220} chartConfig={chartConfig} accessor="population" backgroundColor="transparent" paddingLeft="15" absolute style={styles.chart} />
          </View>
        )}

        <View style={styles.chartContainer}>
          <ThemedText style={styles.sectionTitle}>{t('stats.byPriority.title')}</ThemedText>
          <BarChart data={getPriorityStats()} width={screenWidth - 50} height={220} yAxisLabel="" yAxisSuffix="" chartConfig={chartConfig} style={styles.chart} showValuesOnTopOfBars fromZero />
        </View>

        <View style={styles.chartContainer}>
          <ThemedText style={styles.sectionTitle}>{t('stats.byFrequency.title')}</ThemedText>
          <BarChart data={getFrequencyStats()} width={screenWidth - 50} height={220} yAxisLabel="" yAxisSuffix="" chartConfig={{ ...chartConfig, color: (opacity = 1) => `rgba(${parseInt(paperTheme.colors.secondary.slice(1, 3), 16)}, ${parseInt(paperTheme.colors.secondary.slice(3, 5), 16)}, ${parseInt(paperTheme.colors.secondary.slice(5, 7), 16)}, ${opacity})` }} style={styles.chart} showValuesOnTopOfBars fromZero />
        </View>

        <View style={styles.topHabitsContainer}>
          <ThemedText style={styles.sectionTitle}>🏆 {t('stats.topHabits.title')}</ThemedText>
          {habits.sort((a, b) => b.streak - a.streak).slice(0, 3).map((habit, index) => (
            <View key={habit.id} style={styles.topHabitCard}>
              <ThemedText style={styles.topHabitRank}>#{index + 1}</ThemedText>
              <View style={styles.topHabitInfo}><ThemedText style={styles.topHabitName}>{habit.name}</ThemedText><ThemedText style={styles.topHabitCategory}>{habit.category}</ThemedText></View>
              <ThemedText style={styles.topHabitStreak}>🔥 {habit.streak}</ThemedText>
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
  topHabitStreak: { fontSize: 18, fontWeight: 'bold', color: paperTheme.colors.primary },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, backgroundColor: theme.colors.background },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 22, fontWeight: 'bold', color: theme.colors.text, marginBottom: 8, textAlign: 'center' },
  emptyText: { fontSize: 16, color: theme.colors.text, textAlign: 'center', lineHeight: 24 },
});

export default StatsScreen;
