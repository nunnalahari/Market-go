import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';


const Splash = ({ navigation }) => {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const retrieveStoredData = async () => {
      try {
        const storedData = await AsyncStorage.getItem('userData');

        if (storedData !== null) {
          const userData = JSON.parse(storedData);
          const userToken = userData.token;
          setToken(userToken);

          if (userToken !== null) {
            navigation.navigate('HomePage');
          } else {
            navigation.navigate('Login');
          }
        } else {
          console.log('No stored user data found in local storage.');
          navigation.navigate('Login');
        }
      } catch (error) {
        console.error('Error retrieving stored user data:', error);
        navigation.navigate('Login');
      } finally {
        setLoading(false); // Mark loading as false after retrieval attempt
      }
    };

    retrieveStoredData();
  }, [navigation]);

  useEffect(() => {
    if (!loading && !token) {
      const splashScreenTimeout = setTimeout(() => {
        navigation.navigate('Login');
      }, 5000); // Timeout duration set to 5000 milliseconds (5 seconds)

      return () => clearTimeout(splashScreenTimeout);
    }
  }, [loading, token, navigation]);

  if (loading) {
    return (
      <View style={styles.container}>
        <Image
          source={require('./assets/images/logo.png')}
          resizeMode="contain"
          style={styles.image}
        />
      </View>
    );
  }

  return null; // Return null when not loading to prevent rendering anything
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    justifyContent: 'center',
    alignItems: "center",
    flex: 1
  },
  image: {
    height: "80%",
    width: "80%",
  }
});

export default Splash;
