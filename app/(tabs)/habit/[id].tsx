import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { deleteDoc, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Appbar, Button, Card, Chip, Divider, FAB, Title, MD3Theme } from 'react-native-paper';
import MapPicker from '../../../components/MapPicker';
import CustomAlert from '../../../components/CustomAlert';
import { useThemeContext } from '../../../context/ThemeProvider';
import { db } from '../../../services/firebase';
import { Habit, isCompletedToday, markAsCompleted, unmarkCompleted } from '../../../types/habits';
import { TAB_BAR_HEIGHT } from '../../../constants/styles';

type InfoRowProps = {
  icon: any;
  label: string;
  value: string;
};

const InfoRow: React.FC<InfoRowProps> = ({ icon, label, value }) => {
  const { paperTheme } = useThemeContext();
  const styles = createStyles(paperTheme);
  return (
    <View style={styles.infoRow}>
      <MaterialCommunityIcons name={icon} size={24} color={paperTheme.colors.primary} style={styles.infoIcon} />
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
};

const HabitDetailScreen = () => {
  const { id } = useLocalSearchParams();
  const { t } = useTranslation();
  const { paperTheme } = useThemeContext();
  const styles = createStyles(paperTheme);
  const [habit, setHabit] = useState<Habit | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [errorAlertVisible, setErrorAlertVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const habitId = Array.isArray(id) ? id[0] : id;

  useEffect(() => {
    if (!habitId) return;

    const docRef = doc(db, 'habits', habitId);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setHabit({ id: docSnap.id, ...docSnap.data() } as Habit);
      } else {
        setErrorMessage(t('habitDetails.notFound.message'));
        setErrorAlertVisible(true);
      }
    });

    return () => unsubscribe();
  }, [habitId]);

  const handleDelete = () => {
    if (!habitId) return;
    setAlertVisible(true);
  };

  const handleToggleCompletion = () => {
    if (!habit) return;
    const updatedHabit = isCompletedToday(habit)
      ? unmarkCompleted(habit)
      : markAsCompleted(habit);

    updateDoc(doc(db, 'habits', habit.id), {
      completedDates: updatedHabit.completedDates,
      streak: updatedHabit.streak,
    });
  };

  if (!habit) {
    return (
      <View style={styles.container}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title={t('habitDetails.loading')} />
        </Appbar.Header>
      </View>
    );
  }

  const isCompleted = isCompletedToday(habit);

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={habit.name} />
        <Appbar.Action icon="pencil" onPress={() => router.push(`/(tabs)/habit/edit/${habitId}`)} />
        <Appbar.Action icon="delete" onPress={handleDelete} />
      </Appbar.Header>
      <CustomAlert
        visible={alertVisible}
        onDismiss={() => setAlertVisible(false)}
        title={t('habitDetails.deleteAlert.title')}
        message={t('habitDetails.deleteAlert.message')}
        buttons={[
          { text: t('habitDetails.deleteAlert.cancel'), onPress: () => setAlertVisible(false), style: "cancel" },
          {
            text: isDeleting ? t('habitDetails.deleteAlert.deleting') : t('habitDetails.deleteAlert.delete'),
            onPress: () => {
              setIsDeleting(true);
              deleteDoc(doc(db, 'habits', habitId))
                .then(() => {
                  setAlertVisible(false);
                  router.back();
                })
                .catch((error) => {
                  setAlertVisible(false);
                  setErrorMessage(error.message);
                  setErrorAlertVisible(true);
                })
                .finally(() => setIsDeleting(false));
            },
            style: "destructive",
          },
        ]}
      />
      <CustomAlert
        visible={errorAlertVisible}
        onDismiss={() => setErrorAlertVisible(false)}
        title={t('habitDetails.errorAlert.title')}
        message={errorMessage}
        buttons={[{ text: t('habitDetails.errorAlert.ok'), onPress: () => setErrorAlertVisible(false) }]}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.card}>
          {habit.imageUri ? <Card.Cover source={{ uri: habit.imageUri }} /> : null}
          <Card.Content>
            <Title style={styles.title}>{habit.name}</Title>
            <Chip
              icon="tag-outline"
              style={styles.chip}
              textStyle={styles.chipText}
            >
              {habit.category}
            </Chip>

            {habit.description && (
              <Text style={styles.description}>{habit.description}</Text>
            )}
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Title title={t('habitDetails.details.title')} />
          <Card.Content>
            <InfoRow icon="fire" label={t('habitDetails.details.streak')} value={t('habitDetails.details.days', { count: habit.streak })} />
            <Divider style={styles.divider} />
            {habit.reminders && habit.reminders.length > 0 && (
              <>
                <InfoRow icon="bell-ring-outline" label={t('habitDetails.details.reminders')} value={habit.reminders.join(', ')} />
                <Divider style={styles.divider} />
              </>
            )}
            {habit.frequency === 'WEEKLY' && habit.daysOfWeek && habit.daysOfWeek.length > 0 && (
              <>
                <InfoRow icon="calendar-week" label={t('habitDetails.details.daysOfWeek')} value={habit.daysOfWeek.join(', ')} />
                <Divider style={styles.divider} />
              </>
            )}
            <InfoRow icon="flag-outline" label={t('habitDetails.details.priority')} value={habit.priority} />
            <Divider style={styles.divider} />
            <InfoRow icon="calendar-repeat-outline" label={t('habitDetails.details.frequency')} value={habit.frequency} />
            <Divider style={styles.divider} />
            <InfoRow icon="clock-outline" label={t('habitDetails.details.time')} value={habit.time || t('habitDetails.details.notSet')} />
            <Divider style={styles.divider} />
            <InfoRow icon="calendar-check-outline" label={t('habitDetails.details.startDate')} value={habit.startDate} />
            <Divider style={styles.divider} />
            <InfoRow icon="flag-checkered" label={t('habitDetails.details.endDate')} value={habit.endDate} />
          </Card.Content>
        </Card>

        {habit.location && (
          <Card style={styles.card}>
            <Card.Title title={t('habitDetails.location.title')} />
            <View style={styles.mapContainer}>
              <MapPicker location={habit.location} readOnly />
            </View>
          </Card>
        )}

        <Card style={styles.card}>
          <Card.Title title={t('habitDetails.goals.title')} />
          <Card.Content>
            <InfoRow icon="trophy-outline" label={t('habitDetails.goals.dailyGoal')} value={habit.dailyGoal || t('habitDetails.details.notSet')} />
            <Divider style={styles.divider} />
            <InfoRow icon="trophy-award-outline" label={t('habitDetails.goals.additionalGoal')} value={habit.additionalGoal || t('habitDetails.details.notSet')} />
          </Card.Content>
        </Card>

        <Button
          mode={isCompleted ? "contained" : "outlined"}
          onPress={handleToggleCompletion}
          style={styles.completeButton}
          icon={isCompleted ? "check-circle" : "circle-outline"}
        >
          {isCompleted ? t('habitDetails.completedToday') : t('habitDetails.markAsCompleted')}
        </Button>
      </ScrollView>
    </View>
  );
};

const createStyles = (theme: MD3Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: TAB_BAR_HEIGHT + 16,
  },
  card: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  chip: {
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  chipText: {
    fontSize: 14,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  divider: {
    marginVertical: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoIcon: {
    marginRight: 16,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  infoValue: {
    fontSize: 16,
  },
  completeButton: {
    marginTop: 16,
    paddingVertical: 8,
  },
  mapContainer: {
    height: 200,
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
});

export default HabitDetailScreen;
