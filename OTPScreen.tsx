import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput, StyleSheet, Image, Text, TouchableOpacity, Alert, ScrollView, Keyboard, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

const OTPScreen = ({ route, navigation }) => {
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const { branchID } = route.params;
  const [enteredOTP, setEnteredOTP] = useState(['', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [OUR_OTP, setOurOTP] = useState(route.params.OUR_OTP); // Initial OUR_OTP state
  const refs = useRef([]);

  useEffect(() => {
    console.log('Initial OTP:', OUR_OTP);
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

  const handleVerifyOTP = async () => {
    const enteredOTPValue = enteredOTP.join('');

    if (!enteredOTPValue.trim()) {
      setOtpError('Please enter the OTP');
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(
        'https://arha-express.com/api/v10/otp-verify',
        {
          mobile: branchID,
          user_type: 2,
          OUR_OTP: OUR_OTP,
          CUSTOMER_OTP: enteredOTPValue,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'apiKey': '123456rx-ecourier123456',
          },
        }
      );

      if (response.status === 200) {
        await AsyncStorage.setItem('userData', JSON.stringify(response.data.data));

        Toast.show({
          type: 'success',
          text1: 'Sign in successful.',
          visibilityTime: 2000, // 2 seconds
        });

        // Navigate to the home page after the toast is shown
        setTimeout(() => {
          navigation.navigate('HomePage');
        }, 2000);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Invalid OTP. Please try again.',
        });
        setEnteredOTP(['', '', '', '', '']);
        refs.current[0].focus();
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to verify OTP. Please try again.',
      });
      setEnteredOTP(['', '', '', '', '']);
      refs.current[0].focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPChange = (index, value) => {
    const newOTP = [...enteredOTP];
    newOTP[index] = value;
    setEnteredOTP(newOTP);

    if (value !== '' && index < 4) {
      refs.current[index + 1].focus();
    }
  };

  const handleResendOTP = async () => {
    setIsLoading(true);

    try {
      const response = await axios.post(
        'https://arha-express.com/api/v10/otp-login',
        {
          mobile: branchID,
          user_type: 7,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'apiKey': '123456rx-ecourier123456',
          },
        }
      );

      if (response.status === 200) {
        const resent_OTP = response.data.data.OUR_OTP;
        console.log('Resent OTP:', resent_OTP);

        // Update the OUR_OTP state with the resent OTP only when the "Resend OTP" button is clicked
        setOurOTP(resent_OTP);

        Toast.show({
          type: 'success',
          text1: 'OTP resent successfully.',
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Failed to resend OTP. Please try again.',
        });
      }
    } catch (error) {
      console.error('Error resending OTP:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to resend OTP. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

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

      <Text style={[styles.text, { marginTop: keyboardVisible ? '-30%' : '-60%' }]}>Enter The OTP</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
        {enteredOTP.map((digit, index) => (
          <TextInput
            key={index}
            style={styles.input}
            onChangeText={text => handleOTPChange(index, text)}
            value={digit}
            keyboardType="numeric"
            maxLength={1}
            ref={ref => refs.current[index] = ref}
          />
        ))}
      </View>
      {otpError ? <Text style={styles.error}>{otpError}</Text> : null}

      <TouchableOpacity style={styles.buttonContainer} onPress={handleVerifyOTP} disabled={isLoading}>
        {isLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>Verify OTP</Text>
        )}
      </TouchableOpacity>
     <TouchableOpacity onPress={handleResendOTP}>
          <Text style={styles.resendLink}>Click here to resend OTP</Text>
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
    flex: 1,
    backgroundColor: '#ffffff',
  },
  rowContainer: {
    flexDirection: 'row',
    alignSelf: 'center',
    marginTop: '20%',
  },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 30,
    marginHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "grey",
  },
  circle2: {
    width: 40,
    height: 40,
    borderRadius: 30,
    marginHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "#eb6207",
  },
  text: {
    color: "grey",
    fontSize: 26,
    fontWeight: "bold",
    padding: 10,
    textAlign: 'center',
  },
  number: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    alignSelf: 'center',
  },
  imagecontainer: {
    alignItems: 'center',
    marginTop: '-10%',
  },
  image: {
    height: '55%',
    width: '70%',
  },
  input: {
    height: 40,
    width: 40,
    borderColor: "#eb6207",
    borderWidth: 1,
    marginHorizontal: 5,
    textAlign: 'center',
    padding: 10,
    borderRadius: 10,
  },
  buttonContainer: {
    height:50,
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
    width: "75%",
    height: "35%",
  },
  topRight: {
    bottom: -55,
    right: 10,
    width: "55%",
    height: "27%",
    backgroundColor: '#FF7518',
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginTop: 10,
    marginBottom:-22,
  },
  resendLink: {
      color: '#007bff', // Blue color for the link
      marginTop: 20, // Adjust the spacing as needed
      textAlign: 'center', // Center the text
      textDecorationLine: 'underline', // Underline style for the link
    },
});

export default OTPScreen;
