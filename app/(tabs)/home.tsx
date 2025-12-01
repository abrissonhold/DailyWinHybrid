import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { collection, doc, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Appbar } from 'react-native-paper';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { Theme } from '@react-navigation/native';
import CustomAlert from '../../components/CustomAlert';
import { useThemeContext } from '../../context/ThemeProvider';
import { auth, db } from '../../services/firebase';
import { Frequency, Habit, Priority, formatDate, isCompletedToday, isScheduledForToday } from '../../types/habits';
import { getPriorityColor } from '../../constants/theme';
import { TAB_BAR_HEIGHT } from '../../constants/styles';

const HomeScreen = () => {
  const { t } = useTranslation();
  const { navTheme, paperTheme } = useThemeContext();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
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

      habitsData.sort((a, b) => {
        const priorityOrder = { [Priority.HIGH]: 3, [Priority.MEDIUM]: 2, [Priority.LOW]: 1 };

        const getGroup = (habit: Habit) => {
          if (isCompletedToday(habit)) {
            return 3;
          }
          if (!isScheduledForToday(habit)) {
            return 2;
          }
          return 1;
        };

        const groupA = getGroup(a);
        const groupB = getGroup(b);

        if (groupA !== groupB) {
          return groupA - groupB;
        }

        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });

      setHabits(habitsData);
    });

    return () => unsubscribe();
  }, [userId]);

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const toggleHabitCompletion = async (habit: Habit) => {
    const today = formatDate(new Date());
    const isCompleted = habit.completedDates.includes(today);

    try {
      const habitRef = doc(db, 'habits', habit.id);

      if (isCompleted) {
        const updatedDates = habit.completedDates.filter(date => date !== today);
        await updateDoc(habitRef, {
          completedDates: updatedDates,
          streak: Math.max(0, habit.streak - 1)
        });
      } else {
        const updatedDates = [...habit.completedDates, today];
        await updateDoc(habitRef, {
          completedDates: updatedDates,
          streak: habit.streak + 1
        });

        setAlertTitle(t('home.alert.wellDone'));
        setAlertMessage(t('home.alert.completedHabit', { habitName: habit.name }));
        setAlertVisible(true);
      }
    } catch (error) {
      setAlertTitle(t('home.alert.error'));
      setAlertMessage(t('home.alert.updateFailed'));
      setAlertVisible(true);
    }
  };

  const getTodayProgress = (): { completed: number; total: number } => {
    const today = formatDate(new Date());
    const scheduledTodayHabits = habits.filter(h => isScheduledForToday(h));
    const completed = scheduledTodayHabits.filter(h => h.completedDates.includes(today)).length;
    return { completed, total: scheduledTodayHabits.length };
  };

  const renderHabitCard = ({ item }: { item: Habit }) => {
    const completed = isCompletedToday(item);
    const priorityColor = getPriorityColor(item.priority, paperTheme);
    const styles = themedStyles(navTheme, paperTheme);
    const scheduledToday = isScheduledForToday(item);

    return (
      <TouchableOpacity
        style={[
          styles.habitCard,
          completed && styles.habitCardCompleted,
          !scheduledToday && styles.habitCardDisabled,
        ]}
        onPress={() => router.push(`/(tabs)/habit/${item.id}`)}
        activeOpacity={0.8}
        disabled={!scheduledToday}
      >
        <View style={styles.habitInfoContainer}>
          <View style={[styles.habitIcon, { backgroundColor: priorityColor }]}>
            <Text style={styles.habitIconText}>{item.name.charAt(0)}</Text>
          </View>
          <View style={styles.habitDetails}>
            <Text style={[styles.habitName, completed && styles.habitNameCompleted]}>
              {item.name}
            </Text>
            <View style={styles.habitMeta}>
              <Text style={styles.habitMetaText}>{t('home.habitCard.habit')}</Text>
              {item.time && (
                <>
                  <Text style={styles.habitMetaDot}>•</Text>
                  <Text style={styles.habitMetaText}>{item.time}</Text>
                </>
              )}
              {item.streak > 0 && (
                <>
                  <Text style={styles.habitMetaDot}>•</Text>
                  <Ionicons name="flame" size={14} color="#FF6B6B" />
                  <Text style={styles.habitMetaText}>{item.streak}</Text>
                </>
              )}
            </View>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.checkButton, completed && styles.checkButtonCompleted]}
          onPress={() => toggleHabitCompletion(item)}
          disabled={!scheduledToday}
        >
          {completed && <Ionicons name="checkmark" size={20} color={navTheme.colors.card} />}
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const progress = getTodayProgress();
  const progressPercentage = progress.total > 0
    ? Math.round((progress.completed / progress.total) * 100)
    : 0;
  const styles = themedStyles(navTheme, paperTheme);

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title={t('home.title')} />
      </Appbar.Header>

      {/* Progress Section */}
      {habits.length > 0 && (
        <View style={styles.progressSection}>
          <View style={styles.progressCircleContainer}>
            <AnimatedCircularProgress
              size={80}
              width={8}
              fill={progressPercentage}
              tintColor={navTheme.colors.primary}
              backgroundColor={navTheme.colors.border}
              padding={10}
              rotation={0}
              lineCap="round"
            >
              {
                (fill: number) => (
                  <Text style={styles.progressText}>
                    {`${Math.round(fill)}%`}
                  </Text>
                )
              }
            </AnimatedCircularProgress>
          </View>
          <View style={styles.progressInfo}>
            <Text style={styles.progressInfoTitle}>{t('home.progress.title')}</Text>
            <Text style={styles.progressInfoText}>{t('home.progress.text', { completed: progress.completed, total: progress.total })}</Text>
          </View>
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
          <Text style={styles.emptyTitle}>{t('home.empty.title')}</Text>
          <Text style={styles.emptyText}>
            {t('home.empty.text')}
          </Text>
        </View>
      )}

      <CustomAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        onDismiss={() => setAlertVisible(false)}
        buttons={[{ text: 'OK', onPress: () => setAlertVisible(false) }]}
      />
    </View>
  );
};

const themedStyles = (theme: Theme, paperTheme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: theme.colors.card,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerButton: {
    padding: 4,
  },
  progressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  progressCircleContainer: {
    marginRight: 16,
  },
  progressText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  progressInfo: {
    flex: 1,
  },
  progressInfoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  progressInfoText: {
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: 12,
  },
  progressButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  progressButtonText: {
    color: theme.colors.card,
    fontWeight: 'bold',
    fontSize: 14,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: TAB_BAR_HEIGHT,
  },
  habitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  habitCardCompleted: {
    backgroundColor: theme.colors.border,
  },
  habitCardDisabled: {
    opacity: 0.5,
  },
  habitInfoContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  habitIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  habitIconText: {
    color: theme.colors.card,
    fontSize: 18,
    fontWeight: 'bold',
  },
  habitDetails: {
    flex: 1,
  },
  habitName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  habitNameCompleted: {
    textDecorationLine: 'line-through',
    color: theme.colors.text,
  },
  habitMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  habitMetaText: {
    fontSize: 14,
    color: theme.colors.text,
    marginRight: 4,
  },
  habitMetaDot: {
    fontSize: 14,
    color: theme.colors.border,
    marginHorizontal: 4,
  },
  checkButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkButtonCompleted: {
    backgroundColor: paperTheme.colors.success,
    borderColor: paperTheme.colors.success,
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
    color: theme.colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.text,
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default HomeScreen;
