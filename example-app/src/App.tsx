import React, { useCallback, useMemo, useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import {
  createStackNavigator,
  HeaderBackButton,
  TransitionPresets,
} from '@react-navigation/stack';
import HomeScreen from './screens/HomeScreen';
import { Platform, StatusBar, StyleSheet, Image, Text, View, TouchableOpacity } from 'react-native';
import { colors } from './colors';
import { LogContext, Log, Event } from './components/LogContext';
import DiscoverReadersScreen from './screens/DiscoverReadersScreen';
import ReaderDisplayScreen from './screens/ReaderDisplayScreen';
import LocationListScreen from './screens/LocationListScreen';
import UpdateReaderScreen from './screens/UpdateReaderScreen';
import RefundPaymentScreen from './screens/RefundPaymentScreen';
import DiscoveryMethodScreen from './screens/DiscoveryMethodScreen';
import CollectCardPaymentScreen from './screens/CollectCardPaymentScreen';
import SetupIntentScreen from './screens/SetupIntentScreen';
import LogListScreen from './screens/LogListScreen';
import LogScreen from './screens/LogScreen';
import MenuScreen from './screens/MenuScreen';
import CameraScreen from './screens/CameraScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterInternetReaderScreen from './screens/RegisterInternetReaderScreen';
import {
  Reader,
  Location,
  useStripeTerminal,
  requestNeededAndroidPermissions,
} from '@stripe/stripe-terminal-react-native';
import { Alert, LogBox } from 'react-native';
import DatabaseScreen from './screens/DatabaseScreen';
import Ionicons from '@expo/vector-icons/Ionicons';

export type RouteParamList = {
  UpdateReader: {
    update: Reader.SoftwareUpdate;
    reader: Reader.Type;
    onDidUpdate: () => void;
  };
  LocationList: {
    onSelect: (location: Location) => void;
  };
  DiscoveryMethod: {
    onChange: (method: Reader.DiscoveryMethod) => void;
  };
  SetupIntent: {
    discoveryMethod: Reader.DiscoveryMethod;
  };
  DiscoverReaders: {
    simulated: boolean;
    discoveryMethod: Reader.DiscoveryMethod;
  };
  CollectCardPayment: {
    simulated: boolean;
    discoveryMethod: Reader.DiscoveryMethod;
  };
  RefundPayment: {
    simulated: boolean;
    discoveryMethod: Reader.DiscoveryMethod;
  };
  Log: {
    event: Event;
    log: Log;
  };
};

LogBox.ignoreLogs([
  'Overwriting fontFamily style attribute preprocessor',
  // https://reactnavigation.org/docs/5.x/troubleshooting#i-get-the-warning-non-serializable-values-were-found-in-the-navigation-state
  'Non-serializable values were found in the navigation state',
  // https://github.com/software-mansion/react-native-gesture-handler/issues/722
  'RCTBridge required dispatch_sync to load RNGestureHandlerModule. This may lead to deadlocks',
  // https://github.com/react-native-netinfo/react-native-netinfo/issues/486
  'new NativeEventEmitter()` was called with a non-null argument without the required `removeListeners` method.',
  'new NativeEventEmitter()` was called with a non-null argument without the required `addListener` method.',
]);

const Stack = createStackNavigator();

const screenOptions = {
  headerTintColor: colors.white,
  headerStyle: {
    shadowOpacity: 0,
    backgroundColor: colors.blurple,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.slate,
  },
  headerTitleStyle: {
    color: colors.white,
  },
  headerBackTitleStyle: {
    color: colors.white,
  },
  cardOverlayEnabled: true,
  gesturesEnabled: true,
  ...Platform.select({
    ios: {
      ...TransitionPresets.ModalPresentationIOS,
    },
  }),
};

export default function App() {
  const [logs, setlogs] = useState<Log[]>([]);
  const [hasPerms, setHasPerms] = useState<boolean>(false);
  const clearLogs = useCallback(() => setlogs([]), []);
  const { initialize: initStripe } = useStripeTerminal();

  useEffect(() => {
    const initAndClear = async () => {
      const { error, reader } = await initStripe();

      if (error) {
        Alert.alert('StripeTerminal init failed', error.message);
        return;
      }

      if (reader) {
        console.log(
          'StripeTerminal has been initialized properly and connected to the reader',
          reader
        );
        return;
      }

      console.log('StripeTerminal has been initialized properly');
    };
    if (hasPerms) {
      initAndClear();
    }
  }, [initStripe, hasPerms]);

  const handlePermissionsSuccess = useCallback(async () => {
    setHasPerms(true);
  }, []);

  useEffect(() => {
    async function handlePermissions() {
      try {
        const { error } = await requestNeededAndroidPermissions({
          accessFineLocation: {
            title: 'Location Permission',
            message: 'Stripe Terminal needs access to your location',
            buttonPositive: 'Accept',
          },
        });
        if (!error) {
          handlePermissionsSuccess();
        } else {
          console.error(
            'Location and BT services are required in order to connect to a reader.'
          );
        }
      } catch (e) {
        console.error(e);
      }
    }
    if (Platform.OS === 'android') {
      handlePermissions();
    } else {
      handlePermissionsSuccess();
    }
  }, [handlePermissionsSuccess]);

  const addLogs = useCallback((newLog: Log) => {
    const updateLog = (log: Log) =>
      log.name === newLog.name
        ? { name: log.name, events: [...log.events, ...newLog.events] }
        : log;
    setlogs((prev) =>
      prev.map((e) => e.name).includes(newLog.name)
        ? prev.map(updateLog)
        : [...prev, newLog]
    );
  }, []);

  const value = useMemo(
    () => ({ logs, addLogs, clearLogs }),
    [logs, addLogs, clearLogs]
  );

  return (
    <LogContext.Provider value={value}>
      <>
        <StatusBar
          backgroundColor={colors.blurple_dark}
          barStyle="light-content"
          translucent
        />

        <NavigationContainer>
          <Stack.Navigator screenOptions={screenOptions} mode="modal" initialRouteName="LoginScreen">
            <Stack.Screen name="Blox Terminal" component={LoginScreen} />
            <Stack.Screen
              name="MenuScreen"
              component={MenuScreen}
              options={({ navigation }) => ({
                headerTitle: () => (
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <View style={{ flex: 1, alignItems: 'flex-start' }}>
                      <Text style={{ textAlign: 'left', color: 'white' }}>Menu</Text>
                    </View>
                    <View style={{ flex: 1, alignItems: 'center' }}>
                      <TouchableOpacity onPress={() => navigation.navigate('HomeScreen')}>
                        <Image
                          source={require('./assets/blox.png')}
                          style={{ width: 100, height: 42 }}
                          resizeMode="contain"
                        />
                      </TouchableOpacity>
                    </View>
                    <View style={{ flex: 1, alignItems: 'flex-end' }}>
                    </View>
                  </View>
                ),
                headerTitleAlign: 'center',
              })}
            />
            <Stack.Screen
              name="HomeScreen"
              component={HomeScreen}
              options={({ navigation }) => ({
                headerTitle: () => (
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <View style={{ flex: 1, alignItems: 'flex-start' }}>
                      <Text style={{ textAlign: 'left', color: 'white' }}>Sign Out</Text>
                    </View>
                    <View style={{ flex: 1, alignItems: 'center' }}>
                      <TouchableOpacity>
                        <Image
                          source={require('./assets/blox.png')}
                          style={{ width: 100, height: 42 }}
                          resizeMode="contain"
                        />
                      </TouchableOpacity>
                    </View>
                    <View style={{ flex: 1, alignItems: 'flex-end' }}>
                    </View>
                  </View>
                ),
                headerTitleAlign: 'center',
                headerRight: () => (
                  <View style={{ alignItems: 'center' }}>
                    <TouchableOpacity>
                      <Ionicons
                        name="menu"
                        size={33}
                        color="white"
                        onPress={() => navigation.navigate('MenuScreen')}
                      />
                    </TouchableOpacity>
                  </View>
                ),
              })}
            />
            <Stack.Screen
              name="DatabaseScreen"
              component={DatabaseScreen}
              options={({ navigation }) => ({
                headerTitle: () => (
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <View style={{ flex: 1, alignItems: 'flex-start' }}>
                      <Text style={{ textAlign: 'left', color: 'white' }}>Database</Text>
                    </View>
                    <View style={{ flex: 1, alignItems: 'center' }}>
                      <TouchableOpacity>
                        <Image
                          source={require('./assets/blox.png')}
                          style={{ width: 100, height: 42 }}
                          resizeMode="contain"
                          onPress={() => navigation.navigate('HomeScreen')}
                        />
                      </TouchableOpacity>
                    </View>
                    <View style={{ flex: 1, alignItems: 'flex-end' }}>
                    </View>
                  </View>
                ),
                headerTitleAlign: 'center',
                headerRight: () => (
                  <View style={{ alignItems: 'center' }}>
                    <TouchableOpacity>
                      <Ionicons
                        name="menu"
                        size={33}
                        color="white"
                        onPress={() => navigation.navigate('MenuScreen')}
                      />
                    </TouchableOpacity>
                  </View>
                ),
              })}
            />
            <Stack.Screen
              name="CameraScreen"
              options={{ headerTitle: 'CameraScreen' }}
              component={CameraScreen}
            />
            <Stack.Screen
              name="DiscoverReadersScreen"
              options={{ headerTitle: 'Discovery' }}
              component={DiscoverReadersScreen}
            />
            <Stack.Screen
              name="RegisterInternetReader"
              options={{
                headerTitle: 'Register Reader',
              }}
              component={RegisterInternetReaderScreen}
            />
            <Stack.Screen
              name="ReaderDisplayScreen"
              component={ReaderDisplayScreen}
            />
            <Stack.Screen
              name="LocationListScreen"
              options={{ headerTitle: 'Locations' }}
              component={LocationListScreen}
            />
            <Stack.Screen
              name="UpdateReaderScreen"
              options={{ headerTitle: 'Update Reader' }}
              component={UpdateReaderScreen}
            />
            <Stack.Screen
              name="RefundPaymentScreen"
              options={{
                headerTitle: 'Collect refund',
                headerBackAccessibilityLabel: 'payment-back',
              }}
              component={RefundPaymentScreen}
            />
            <Stack.Screen
              name="DiscoveryMethodScreen"
              component={DiscoveryMethodScreen}
            />
            <Stack.Screen
              name="CollectCardPaymentScreen"
              options={{
                headerTitle: 'Collect card payment',
                headerBackAccessibilityLabel: 'payment-back',
              }}
              component={CollectCardPaymentScreen}
            />
            <Stack.Screen
              name="SetupIntentScreen"
              options={{
                headerTitle: 'SetupIntent',
                headerBackAccessibilityLabel: 'payment-back',
              }}
              component={SetupIntentScreen}
            />
            <Stack.Screen
              name="LogListScreen"
              options={({ navigation }) => ({
                headerTitle: 'Logs',
                headerBackAccessibilityLabel: 'logs-back',
                headerLeft: () => (
                  <HeaderBackButton
                    onPress={() => navigation.navigate('HomeScreen')}
                  />
                ),
              })}
              component={LogListScreen}
            />
            <Stack.Screen
              name="LogScreen"
              options={{
                headerTitle: 'Event',
                headerBackAccessibilityLabel: 'log-back',
              }}
              component={LogScreen}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </>
    </LogContext.Provider>
  );
}
