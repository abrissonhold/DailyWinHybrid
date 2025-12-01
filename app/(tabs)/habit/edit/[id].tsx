import { router, useLocalSearchParams } from 'expo-router';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import CustomAlert from '../../../../components/CustomAlert';
import { HabitForm } from '../../../../components/HabitForm';
import ThemedText from '../../../../components/ThemedText';
import { db } from '../../../../services/firebase';
import { Habit } from '../../../../types/habits';

const EditHabitScreen = () => {
  const { id } = useLocalSearchParams();
  const { t } = useTranslation();
  const [habit, setHabit] = useState<Habit | null>(null);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  useEffect(() => {
    if (id) {
      const habitRef = doc(db, 'habits', id as string);
      getDoc(habitRef).then(docSnap => {
        if (docSnap.exists()) {
          setHabit({ id: docSnap.id, ...docSnap.data() } as Habit);
        } else {
          setAlertTitle(t('editHabit.notFound.title'));
          setAlertMessage(t('editHabit.notFound.message'));
          setAlertVisible(true);
        }
      });
    }
  }, [id, t]);

  const handleSave = async (habitData: Partial<Habit>) => {
    if (!id) return;
    try {
      const habitRef = doc(db, 'habits', id as string);
      await updateDoc(habitRef, habitData);
      router.back();
    } catch (error) {
      setAlertTitle(t('editHabit.saveError.title'));
      if (error instanceof Error) {
        setAlertMessage(error.message);
      } else {
        setAlertMessage(t('editHabit.saveError.unknown'));
      }
      setAlertVisible(true);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (!habit) {
    return (
      <View>
        <ThemedText>{t('editHabit.loading')}</ThemedText>
        <CustomAlert
          visible={alertVisible}
          title={alertTitle}
          message={alertMessage}
          onDismiss={() => setAlertVisible(false)}
          buttons={[{ text: 'OK', onPress: () => setAlertVisible(false) }]}
        />
      </View>
    );
  }

  return (
    <>
      <HabitForm habit={habit} onSave={handleSave} onCancel={handleCancel} />
      <CustomAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        onDismiss={() => setAlertVisible(false)}
        buttons={[{ text: 'OK', onPress: () => setAlertVisible(false) }]}
      />
    </>
  );
};

export default EditHabitScreen;
