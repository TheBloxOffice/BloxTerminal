import React, { useState, useRef } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { Button, TouchableOpacity, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera/next';

export default function CameraScreen() {

  const [facing, setFacing] = useState('back');
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef('cameraRef');

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center' }}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  const handleBarcodeScanned = ({ type, data }) => {
    setScannedData(data);
    // You might want to add some logic here to stop scanning after a successful scan
    // For example: cameraRef.current.pausePreview();
  }

  return (
    <View style={styles.container}>
      {scannedData && (
        <View style={styles.dataContainer}>
          <Text style={styles.dataText}>Scanned Data: {scannedData}</Text>
        </View>
      )}
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
          isHighlightingEnabled: true
        }}
        onBarcodeScanned={scannedData ? undefined : handleBarcodeScanned}
      >
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
            <Text style={styles.text}>Flip Camera</Text>
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}

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
    flexDirection: 'row',
    backgroundColor: 'transparent',
    margin: 64,
  },
  button: {
    flex: 1,
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
});
