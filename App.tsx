import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import OTPScreen from './OTPScreen';
import HomePage from './HomePage';
import Login from './Login';
import Splash from './Splash';
import MapScreen from'./MapScreen';


const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash">
        <Stack.Screen name="Splash" component={Splash} options={{headerShown:false}}/>
        <Stack.Screen name="Login" component={Login} options={{headerShown:false}} />
        <Stack.Screen name="OTPScreen" component={OTPScreen} options={{headerShown:false}} />
        <Stack.Screen name="HomePage" component={HomePage} options={{headerShown:false}} />

      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;