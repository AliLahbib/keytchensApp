import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, Linking } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';

interface HomeScreenProps {
  onLogout: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onLogout }) => {
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('back');
  const [isCameraActive, setIsCameraActive] = useState(true);

  useEffect(() => {
    checkCameraPermission();
  }, []);

  const checkCameraPermission = async () => {
    if (!hasPermission) {
      const permission = await requestPermission();
      if (!permission) {
        Alert.alert(
          'Camera Permission',
          'Camera access is required to scan QR codes. Please enable it in settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
          ]
        );
      }
    }
  };

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Camera Permission Required</Text>
          <Text style={styles.subtitle}>Please grant camera access to continue</Text>
        </View>
        <TouchableOpacity style={styles.permissionButton} onPress={checkCameraPermission}>
          <Text style={styles.permissionButtonText}>Request Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Camera Not Available</Text>
          <Text style={styles.subtitle}>No camera device found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>QR Code Scanner</Text>
        <Text style={styles.subtitle}>Position the QR code within the frame</Text>
      </View>

      <View style={styles.cameraContainer}>
        <Camera
          style={styles.camera}
          device={device}
          isActive={isCameraActive}
          photo={false}
          video={false}
        />
        <View style={styles.scanFrame} />
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#000',
    zIndex: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    width: '100%',
    height: '100%',
  },
  scanFrame: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderWidth: 3,
    borderColor: '#00FF00',
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  footer: {
    padding: 24,
    backgroundColor: '#000',
    alignItems: 'center',
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  permissionButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginTop: 20,
  },
  permissionButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
