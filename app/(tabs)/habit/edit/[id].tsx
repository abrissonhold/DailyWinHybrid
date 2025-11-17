import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../../services/firebase';
import { Formik } from 'formik';
import * as Yup from 'yup';

const validationSchema = Yup.object().shape({
  name: Yup.string().required('Required'),
  category: Yup.string().required('Required'),
  frequency: Yup.string().required('Required'),
});

const EditHabitScreen = () => {
  const { id } = useLocalSearchParams();
  const [initialValues, setInitialValues] = useState(null);

  useEffect(() => {
    if (!id) return;

    const docRef = doc(db, 'habits', id);
    getDoc(docRef).then((docSnap) => {
      if (docSnap.exists()) {
        setInitialValues(docSnap.data());
      }
    });
  }, [id]);

  const handleUpdateHabit = (values) => {
    updateDoc(doc(db, 'habits', id), values)
      .then(() => {
        router.back();
      })
      .catch((error) => {
        Alert.alert('Error', error.message);
      });
  };

  if (!initialValues) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Habit</Text>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleUpdateHabit}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
          <>
            <TextInput
              style={styles.input}
              placeholder="Habit Name"
              onChangeText={handleChange('name')}
              onBlur={handleBlur('name')}
              value={values.name}
            />
            {touched.name && errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            <TextInput
              style={styles.input}
              placeholder="Category"
              onChangeText={handleChange('category')}
              onBlur={handleBlur('category')}
              value={values.category}
            />
            {touched.category && errors.category && <Text style={styles.errorText}>{errors.category}</Text>}
            <TextInput
              style={styles.input}
              placeholder="Frequency"
              onChangeText={handleChange('frequency')}
              onBlur={handleBlur('frequency')}
              value={values.frequency}
            />
            {touched.frequency && errors.frequency && <Text style={styles.errorText}>{errors.frequency}</Text>}
            <Button onPress={handleSubmit} title="Update Habit" />
          </>
        )}
      </Formik>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  errorText: {
    fontSize: 12,
    color: 'red',
    marginBottom: 8,
  },
});

export default EditHabitScreen;
