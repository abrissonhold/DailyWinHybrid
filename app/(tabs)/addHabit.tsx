import { router } from 'expo-router';
import { addDoc, collection } from 'firebase/firestore';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import CustomAlert from '../../components/CustomAlert';
import { HabitForm } from '../../components/HabitForm';
import { auth, db } from '../../services/firebase';
import { Habit } from '../../types/habits';

const AddHabitScreen = () => {
  const { t } = useTranslation();
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  const handleSave = async (habitData: Partial<Habit>) => {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      setAlertTitle(t('addHabit.alert.errorTitle'));
      setAlertMessage(t('addHabit.alert.loginRequired'));
      setAlertVisible(true);
      return;
    }

    try {
      const newHabit = {
        ...habitData,
        userId,
        streak: 0,
        completedDates: [],
        createdAt: new Date(),
      };

      await addDoc(collection(db, 'habits'), newHabit);
      router.back();
    } catch (error) {
      setAlertTitle(t('addHabit.alert.errorTitle'));
      if (error instanceof Error) {
        setAlertMessage(error.message);
      } else {
        setAlertMessage(t('addHabit.alert.unknownError'));
      }
      setAlertVisible(true);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <>
      <HabitForm onSave={handleSave} onCancel={handleCancel} />
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

export default AddHabitScreen;
