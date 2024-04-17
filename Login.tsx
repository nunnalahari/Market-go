import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, Image, Text, TouchableOpacity, ScrollView, Keyboard, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import { OTP_LOGIN_API } from './constants/apis';


const Login = () => {
  const [branchID, setBranchID] = useState('');
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [mobileError, setMobileError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const handleLogin = async () => {
    setMobileError('');
    setIsLoading(true);

    if (!branchID.trim()) {
      setMobileError('Mobile number is required');
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        'https://arha-express.com/api/v10/otp-login',
        {
          mobile: branchID,
          user_type: 7
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'apiKey': '123456rx-ecourier123456',
          },
        }
      );

      if (response.status !== 200) {
        throw new Error('Employee Not Found');
      }

      navigation.navigate('OTPScreen', { branchID: response.data.data.mobile, OUR_OTP: response.data.data.OUR_OTP });
      Toast.show({
        type: 'success',
        text1: 'OTP sent Successfully',
      });
    } catch (error) {
      console.error('Error fetching OTP:', error);
      Toast.show({
        type: 'error',
        text1: 'Employee Not Found',
        text2:'Enter Registered Mobile Number'
      });
    }

    setIsLoading(false);
    setBranchID('');
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      setBranchID('');
    });

    return unsubscribe;
  }, [navigation]);

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.rowContainer}>
        <View style={[styles.circle]}>
          <Text style={styles.number}>1</Text>
        </View>
        <View style={[styles.circle2]}>
          <Text style={styles.number}>2</Text>
        </View>
      </View>
      <View style={styles.imagecontainer}>
        <Image source={require('./assets/images/logo.png')} style={styles.image} />
      </View>

      <View style={[styles.inputContainer, { marginTop: keyboardVisible ? '-20%' : '-60%' }]}>
        <TextInput
          style={styles.input}
          onChangeText={text => setBranchID(text)}
          value={branchID}
          keyboardType="numeric"
          placeholder="Enter Your Mobile Number"
          placeholderTextColor="grey"
        />
        {mobileError ? <Text style={styles.error}>{mobileError}</Text> : null}
      </View>
      <TouchableOpacity style={styles.buttonContainer} onPress={handleLogin} disabled={isLoading}>
        {isLoading ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <Text style={styles.buttonText}>Get OTP</Text>
        )}
      </TouchableOpacity>

      <Toast style={{ zIndex: 1 }} />

      {!keyboardVisible && (
        <>
          <View style={[styles.blueBalloon, styles.topLeft]} />
          <View style={[styles.blueBalloon, styles.topRight]} />
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
  },
  rowContainer: {
    flexDirection: 'row',
    alignSelf: 'center',
    marginTop: '25%',
  },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 30,
    marginHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "#eb6207",
  },
  circle2: {
    width: 40,
    height: 40,
    borderRadius: 30,
    marginHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "grey",
  },
  number: {
    color: 'white', // Change text color when keyboard is visible
    fontSize: 16,
    fontWeight: 'bold',
    alignSelf: 'center',
  },
  imagecontainer: {
    alignItems: 'center',
    marginTop: '-10%',
  },
  image: {
    height: "55%",
    width: "75%",
  },
  inputContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,

  },
  input: {
    height: 50,
    width: '80%',
    borderColor: '#eb2607',
    borderWidth: 1,
    borderRadius: 15,
    alignSelf: 'center',
    paddingLeft: 10,
    color: 'black',
  },
  buttonContainer: {
     height: 50,
    backgroundColor: '#eb6207',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 20,
    alignSelf: 'center',
    marginTop: '10%',
    width: "50%",
    shadowColor: "#000000",
    shadowOpacity: 1,
    elevation: 8,
    shadowRadius: 40,
    shadowOffset: { width: 1, height: 13 },
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    alignSelf: 'center',
  },
  blueBalloon: {
    backgroundColor: '#eb6207',
    borderRadius: 1000,
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  topLeft: {
    bottom: -40,
    left: -50,
    width: "80%",
    height: "35%",
  },
  topRight: {
    bottom: -55,
    right: 30,
    width: "60%",
    height: "27%",
    backgroundColor: '#FF7518',
  },
  error: {
    color: 'red',
    fontSize: 12,
    marginLeft: "11%",
    marginTop: 4, // Adjust margin as needed
  },
});

export default Login;
