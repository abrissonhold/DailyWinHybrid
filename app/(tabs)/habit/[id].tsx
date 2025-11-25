import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { deleteDoc, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Appbar, Button, Card, Chip, Divider, FAB, Title, MD3Theme } from 'react-native-paper';
import { CustomAlert } from '../../../components/CustomAlert';
import { useThemeContext } from '../../../context/ThemeProvider';
import { db } from '../../../services/firebase';
import { Habit, isCompletedToday, markAsCompleted, unmarkCompleted } from '../../../types/habits';

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
        Alert.alert('Error', 'Habit not found.');
        router.back();
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
          <Appbar.Content title="Loading..." />
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
        <Appbar.Action icon="delete" onPress={handleDelete} />
      </Appbar.Header>
      <CustomAlert
        visible={alertVisible}
        onDismiss={() => setAlertVisible(false)}
        title="Delete Habit"
        message="Are you sure you want to delete this habit?"
        buttons={[
          { text: "Cancel", onPress: () => setAlertVisible(false), style: "cancel" },
          {
            text: isDeleting ? "Deleting..." : "Delete",
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
        title="Error"
        message={errorMessage}
        buttons={[{ text: "OK", onPress: () => setErrorAlertVisible(false) }]}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.card}>
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
          <Card.Title title="Details" />
          <Card.Content>
            <InfoRow icon="flag-outline" label="Priority" value={habit.priority} />
            <Divider style={styles.divider} />
            <InfoRow icon="calendar-repeat-outline" label="Frequency" value={habit.frequency} />
            <Divider style={styles.divider} />
            <InfoRow icon="clock-outline" label="Time" value={habit.time || 'Not set'} />
            <Divider style={styles.divider} />
            <InfoRow icon="calendar-check-outline" label="Start Date" value={habit.startDate} />
            <Divider style={styles.divider} />
            <InfoRow icon="flag-checkered" label="End Date" value={habit.endDate} />
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Title title="Goals" />
          <Card.Content>
            <InfoRow icon="trophy-outline" label="Daily Goal" value={habit.dailyGoal || 'Not set'} />
            <Divider style={styles.divider} />
            <InfoRow icon="trophy-award-outline" label="Additional Goal" value={habit.additionalGoal || 'Not set'} />
          </Card.Content>
        </Card>

        <Button
          mode={isCompleted ? "contained" : "outlined"}
          onPress={handleToggleCompletion}
          style={styles.completeButton}
          icon={isCompleted ? "check-circle" : "circle-outline"}
        >
          {isCompleted ? "Completed Today" : "Mark as Completed"}
        </Button>
      </ScrollView>

      <FAB
        icon="pencil"
        style={styles.fab}
        onPress={() => router.push(`/(tabs)/habit/edit/${habitId}`)}
      />
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
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.primary,
  },
});

export default HabitDetailScreen;