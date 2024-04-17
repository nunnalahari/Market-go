import React, { useState, useEffect } from 'react';
import { View, ScrollView, TextInput, StyleSheet, Image, TouchableOpacity, Text, KeyboardAvoidingView, PermissionsAndroid, Platform, ActivityIndicator } from 'react-native';
import Icons from 'react-native-vector-icons/AntDesign';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Geolocation from '@react-native-community/geolocation';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { isLocationEnabled, promptForEnableLocationIfNeeded } from 'react-native-android-location-enabler';
import Toast from 'react-native-toast-message';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import RNFS from 'react-native-fs';


const HomePage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');
  const [branchCode, setBranchCode] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [token, setToken] = useState(null);
  const [focusedInput, setFocusedInput] = useState(null);
  const [location, setLocation] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phoneNumberError, setPhoneNumberError] = useState('');
  const [addressError, setAddressError] = useState('');
  const [branchCodeError, setBranchCodeError] = useState('');
  const [businessTypeError, setBusinessTypeError] = useState('');
  const [imgUrlError, setImgUrlError] = useState('');
  const [para, setPara] = useState('');
  const [imgUrl, setImgUrl] = useState('https://static.vecteezy.com/system/resources/thumbnails/002/318/271/small/user-profile-icon-free-vector.jpg');
  const navigation = useNavigation();


    const requestLocationPermission = async () => {
      // Request location permission
      if (Platform.OS === 'android') {
        try {
          const locationGranted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
              title: 'Location Permission',
              message: 'This app needs access to your location to function properly.',
              buttonPositive: 'OK',
            }
          );
          if (locationGranted === PermissionsAndroid.RESULTS.GRANTED) {
            console.log('Location permission granted');
            const checkEnabled = await isLocationEnabled();
            if (!checkEnabled) {
              console.log('Location services are not enabled');
              const enableResult = await promptForEnableLocationIfNeeded();
              if (enableResult === 'enabled' || enableResult === 'already-enabled') {
                console.log('Location services enabled');
              } else {
                console.log('User declined to enable location services');
                setAddress('Location services are not enabled');
              }
            }
          } else {
            console.log('Location permission denied');
            setAddress('Permission denied');
          }
        } catch (error) {
          console.error('Error requesting location permission:', error);
        }
      }
    };

    const requestCameraPermission = async () => {
      // Request camera permission
      if (Platform.OS === 'android') {
        try {
          const cameraGranted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.CAMERA,
            {
              title: 'Camera Permission',
              message: 'This app needs access to your camera to take pictures.',
              buttonPositive: 'OK',
            }
          );
          if (cameraGranted === PermissionsAndroid.RESULTS.GRANTED) {
            console.log('Camera permission granted');
          } else {
            console.log('Camera permission denied');
            Alert.alert('Permission denied', 'Please enable camera permissions to take pictures.');
          }
        } catch (error) {
          console.error('Error requesting camera permission:', error);
        }
      }
    };

  useEffect(() => {
    const retrieveStoredData = async () => {
      try {
        const storedData = await AsyncStorage.getItem('userData');
        if (storedData !== null) {
          const userData = JSON.parse(storedData);
          const userToken = userData.token;
          setToken(userToken);
        } else {
          console.log('No stored user data found in local storage.');
        }
      } catch (error) {
        console.error('Error retrieving stored user data:', error);
      }
    };
    retrieveStoredData();
  }, []);

  useEffect(() => {
      const requestPermissions = async () => {
        await requestLocationPermission();
      };

      requestPermissions();

      return () => {
        Geolocation.clearWatch();
      };
    }, []);

    useEffect(() => {
      requestLocationPermission();

      return () => {
        Geolocation.clearWatch();
      };
    }, []);


  const getLocation = () => {
    setLoadingLocation(true);
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });
        getAddressFromCoordinates(latitude, longitude);
      },
      (error) => {
        console.error(error);
        if (error.code === 2) {
          setAddress('No location provider available');
        } else {
          setAddress('Error fetching location');
        }
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );
  };

  const getAddressFromCoordinates = async (latitude, longitude) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);
      const data = await response.json();
      const address = data.display_name;
      setAddress(address);
      setLoadingLocation(false);
    } catch (error) {
      console.error('Error fetching address:', error);
    }
  };

  const openCameraLib = async () => {
      await requestCameraPermission(); // Request camera permission before opening camera
      const result = await launchCamera();
      if (result?.assets && result.assets[0]?.uri) {
        setImgUrl(result.assets[0].uri);
        const imagePath = result.assets[0].uri;
        //console.log(imagePath);
        const base64ImageUrl = await convertImageToBase64(imagePath);
        let split=base64ImageUrl.split(',');
        let imagedata= split[1]
        setPara(imagedata);
        //console.log(imagedata);
      }
    };

  const convertImageToBase64 = async (imagePath) => {
    try {
      const base64Data = await RNFS.readFile(imagePath, 'base64');
      const base64Url = `data:image/jpeg;base64,${base64Data}`;
      return base64Url;
      //console.log(base64Url)
    } catch (error) {
      console.error('Error converting image to base64:', error);
      return null;
    }
  };

  const handleFocus = (inputName) => {
    setFocusedInput(inputName);
    if (inputName === 'address') {
      getLocation();
    }
  };

  const handleBlur = () => {
    setFocusedInput(null);
  };

  const handleSubmit = async () => {
    if (!name) {
      setNameError('Name is required');
    } else {
      setNameError('');
    }

    if (!email) {
      setEmailError('Email is required');
    } else {
      setEmailError('');
    }

    if (!phoneNumber) {
      setPhoneNumberError('Phone number is required');
    } else {
      setPhoneNumberError('');
    }

    if (!address) {
      setAddressError('Address is required');
    } else {
      setAddressError('');
    }

    if (!branchCode) {
      setBranchCodeError('Branch code is required');
    } else {
      setBranchCodeError('');
    }

    if (!businessType) {
      setBusinessTypeError('Business type is required');
    } else {
      setBusinessTypeError('');
    }

    if (!imgUrl || imgUrl === 'https://static.vecteezy.com/system/resources/thumbnails/002/318/271/small/user-profile-icon-free-vector.jpg') {
       setImgUrlError('Image profile is required');
    } else {
       setImgUrlError('');
    }


    if (name && email && phoneNumber && address && branchCode && businessType) {
      setIsLoading(true);
      try {
        const requestData = {
          branch_code: branchCode,
          name: name,
          email: email,
          mobile: phoneNumber,
          address: address,
          lat: location ? location.latitude.toString() : '',
          long: location ? location.longitude.toString() : '',
          business_type: businessType,
          note: note,
          image:para
        };
        console.log(requestData)
        const response = await axios.post(
          'https://arha-express.com/api/v10/employee/store_client',
          requestData,
          {
            headers: {
              'Content-Type': 'application/json',
              'apiKey': '123456rx-ecourier123456',
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        if (response.status === 200) {
          Toast.show({
            type: 'success',
            text1: 'Form submitted successfully!',
          });
          setBranchCode('');
          setName('');
          setEmail('');
          setPhoneNumber('');
          setNote('');
          setBusinessType('');
          setAddress('');
          setImgUrl('https://static.vecteezy.com/system/resources/thumbnails/002/318/271/small/user-profile-icon-free-vector.jpg');

        } else {
          Toast.show({
            type: 'error',
            text1: response.data.message,
          });
        }
      } catch (error) {
        console.error('Error submitting form:', error);
        Toast.show({
          type: 'error',
          text1: 'Failed to submit form. Please try again later.',
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleLogout = async () => {
    try {
      setBranchCode('');
      setName('');
      setEmail('');
      setPhoneNumber('');
      setNote('');
      setBusinessType('');
      setAddress('');
      setImgUrl('https://static.vecteezy.com/system/resources/thumbnails/002/318/271/small/user-profile-icon-free-vector.jpg');

      await AsyncStorage.removeItem('userData');
      await requestLocationPermission();
      navigation.navigate('Login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={require('./assets/images/logo.png')} style={styles.image} />
        <TouchableOpacity onPress={handleLogout} style={{alignItems:'center'}}>
          <Icons name="logout" size={20} color="#eb6207" style={{marginRight: 16}}/>
          <Text style={{marginRight: 16,fontWeight:"bold",alignSelf:'center',color:"grey",padding:'1%'}}>LogOut</Text>
        </TouchableOpacity>
      </View>
      <Image resizeMode="contain" style={styles.img} source={{uri:imgUrl,}}/>
            {imgUrlError ? <Text style={styles.errorimage}>{imgUrlError}</Text> : null}
         <TouchableOpacity onPress={openCameraLib} style={styles.btnCam}>
             <Text style={styles.camera}>Upload Profile</Text>
         </TouchableOpacity>

      <ScrollView>
        <View style={styles.formContainer}>
          <Text style={styles.notes}>Branch Code</Text>
          <TextInput
            style={[styles.input, focusedInput === 'branchCode' && styles.focusedInput]}
            placeholder="Enter your Branch Code"
            value={branchCode}
            onChangeText={setBranchCode}
            onFocus={() => handleFocus('branchCode')}
            onBlur={handleBlur}
          />
          {branchCodeError ? <Text style={styles.error}>{branchCodeError}</Text> : null}

          <Text style={styles.notes}> Business Name</Text>
          <TextInput
            style={[styles.input, focusedInput === 'name' && styles.focusedInput]}
            placeholder="Business Name"
            value={name}
            onChangeText={setName}
            onFocus={() => handleFocus('name')}
            onBlur={handleBlur}
          />
          {nameError ? <Text style={styles.error}>{nameError}</Text> : null}

          <Text style={styles.notes}> Email</Text>
          <TextInput
            style={[styles.input, focusedInput === 'email' && styles.focusedInput]}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            onFocus={() => handleFocus('email')}
            onBlur={handleBlur}
          />
          {emailError ? <Text style={styles.error}>{emailError}</Text> : null}

          <Text style={styles.notes}> Number</Text>
          <TextInput
            style={[styles.input, focusedInput === 'phoneNumber' && styles.focusedInput]}
            placeholder="Phone Number"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            onFocus={() => handleFocus('phoneNumber')}
            onBlur={handleBlur}
          />
          {phoneNumberError ? <Text style={styles.error}>{phoneNumberError}</Text> : null}

          <View style={styles.addressRow}>
            <Text style={styles.notes}> Address</Text>
            <TouchableOpacity onPress={getLocation} style={{marginRight: 8}}>
              <AntDesign name="enviroment" size={24} color="#eb6207" />
            </TouchableOpacity>
          </View>

          <TextInput
            style={[styles.addressInput, focusedInput === 'address' && styles.focusedInput]}
            placeholder={loadingLocation ? 'Loading location...' : 'Address'}
            value={address}
            onChangeText={setAddress}
            onFocus={() => handleFocus('address')}
            onBlur={handleBlur}
            multiline={true}
            numberOfLines={4}
          />
          {addressError ? <Text style={styles.error1}>{addressError}</Text> : null}

          <Text style={styles.notes}> Business Type</Text>
          <TextInput
            style={[styles.input, focusedInput === 'businessType' && styles.focusedInput]}
            placeholder="Business Type"
            value={businessType}
            onChangeText={setBusinessType}
            onFocus={() => handleFocus('businessType')}
            onBlur={handleBlur}
          />
          {businessTypeError ? <Text style={styles.error}>{businessTypeError}</Text> : null}

          <Text style={styles.notes}> Note</Text>
          <TextInput
            style={[styles.noteInput, focusedInput === 'note' && styles.focusedInput]}
            placeholder="Note (Optional)"
            value={note}
            onChangeText={setNote}
            multiline={true}
            onFocus={() => handleFocus('note')}
            onBlur={handleBlur}
          />
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            {isLoading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>Submit</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
      <Toast style={{ zIndex: 1 }} />
    </View>
  )
};

const styles = StyleSheet.create({
  scrollViewContent: {
    flexGrow: 1,
  },
  img: {
  marginTop:'2%',
    height: '20%',
    width: '30%',
    alignSelf: 'center',

  },
  camera: {
    alignSelf: 'center',
    padding:10,
    color: 'white',
  },
  container: {
    flex: 1,
  },
  input: {
    alignSelf: 'center',
    marginBottom: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 5,
    marginLeft: 8,
    width: '90%',
  },
  addressInput: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 5,
    marginLeft: 20,
    width: '90%',
    textAlignVertical: 'top',
    height: 100,
  },
  focusedInput: {
    borderColor: '#eb2706',
  },
  highlightBorder: {
    borderColor: '#eb2706',
  },
  image: {
    height: "80%",
    width: "40%",
    marginRight: 5,
    marginLeft: '1%',
    alignSelf:"center",
    marginBottom:'-2%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    height: '8%',
    paddingRight: 10,
    paddingLeft: 10,
    shadowColor: "#000000",
    shadowOpacity: 1,
    elevation: 8,
    shadowRadius: 40,
    shadowOffset: { width: 1, height: 13 },
  },
  buttonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#eb6207',
    height: 35,
    width: '90%',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 20,
    marginTop: 8,
  },
  formContainer: {
    flex: 1,
    margin: 10,
    marginTop: '2%',
  },
  notes: {
    color: 'black',
    margin: 8,
    fontSize: 14,
    marginLeft: 20,
  },
  addressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  error: {
    color: 'red',
    marginLeft: 20,
    marginTop: -4,
    fontSize: 12,
  },
  errorimage: {
      color: 'red',
      alignSelf:"center",

      fontSize: 12,
    },
  error1: {
    color: 'red',
    marginLeft: 20,
    marginTop: 4,
    fontSize: 12,
  },
  noteInput: {
    alignSelf: 'center',
    marginBottom: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 5,
    marginLeft: 8,
    width: '90%',
    height: 100,
    textAlignVertical: 'top',
  },
  btnCam:{
   height: 40,
   backgroundColor: '#eb6207',
   marginTop:"10",
      borderRadius: 20,
      alignSelf: 'center',
      width: "30%",
      shadowColor: "#000000",
      shadowOpacity: 1,
      elevation: 8,
      shadowRadius: 40,
      shadowOffset: { width: 1, height: 13 },
  }
});

export default HomePage;