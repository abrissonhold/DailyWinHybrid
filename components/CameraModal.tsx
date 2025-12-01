import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Button } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import ThemedText from './ThemedText';

interface CameraModalProps {
  onPictureTaken: (uri: string) => void;
  onClose: () => void;
}

const CameraModal = ({ onPictureTaken, onClose }: CameraModalProps) => {
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      if (photo) {
        onPictureTaken(photo.uri);
      }
    }
  };

  if (!permission) {
    // Camera permissions are still loading
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet
    return (
      <View style={styles.container}>
        <ThemedText style={{ textAlign: 'center' }}>We need your permission to show the camera</ThemedText>
        <Button onPress={requestPermission} title="grant permission" />
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <ThemedText style={styles.text}>Close</ThemedText>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} ref={cameraRef}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={takePicture}>
            <ThemedText style={styles.text}>Take Picture</ThemedText>
          </TouchableOpacity>
        </View>
      </CameraView>
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <ThemedText style={styles.text}>Close</ThemedText>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    margin: 20,
  },
  button: {
    flex: 1,
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    color: 'white',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 5,
  },
});

export default CameraModal;
