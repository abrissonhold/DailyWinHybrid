import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const IconGenerator = () => {
  return (
    <View style={styles.container}>
      <Ionicons name="checkmark-circle" size={800} color="white" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4ECDC4', 
  },
});

export default IconGenerator;
