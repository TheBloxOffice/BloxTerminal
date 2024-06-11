import React, { useState } from 'react';
import { Dimensions, Platform, View, KeyboardAvoidingView, Text, Button, TextInput, StyleSheet, TouchableOpacity, Image } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../colors';

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const response = await axios.post('https://blox-office-server-production.onrender.com/auth/login/', {
        username,
        email,
        password,
      });
      await console.log(response.data.accessToken)
      await AsyncStorage.setItem('token', response.data.accessToken);
      navigation.navigate('HomeScreen');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"} // Adjust behavior for iOS and Android
    >
      <View style={styles.imageContainer}>
        <TouchableOpacity>
          <Image
            source={require('../assets/blox.png')}
            style={styles.image}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
      <View style={styles.loginContainer}>
        <Text style={styles.text}>Login</Text>
        <TextInput
          style={styles.input}
          placeholder="Username"
          value={username, email}
          onChangeText={setUsername, setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <Button color="{colors.light_gray}" title="Login" onPress={handleLogin} />
        <Button color="{colors.light_gray}" title="Register" onPress={() => navigation.navigate('Register')} />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light_gray,
  },
  imageContainer: { // New container for the image
    flex: 1, // Allow the image to take up available space
    alignItems: 'center',
  },
  loginContainer: { // New container for login elements
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    top: -60
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
    color: 'white',
  },
  text: {
    color: 'white',
  },
  image: {
    left: 0,
    top: 0,
    width: Dimensions.get('window').width/2,
    height: Dimensions.get('window').height/2,
  },
});

export default LoginScreen;
