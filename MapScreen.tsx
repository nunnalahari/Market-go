import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';

const MapScreen = ({ navigation, route }) => {
  const [selectedAddress, setSelectedAddress] = useState('');

  const handleAddressSelect = () => {
    // Assuming you have a mechanism to select an address on the map
    // Once an address is selected, set it to state
    navigation.goBack();
    route.params.onSelectAddress(selectedAddress);
    // Construct the Google Maps link with the selected address
    const googleMapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedAddress)}`;
    // Open the Google Maps link in the device's default browser
    Linking.openURL(googleMapsLink);
  };

  return (
    <View>
      {/* Your map component here */}
      <Text>Selected Address: {selectedAddress}</Text>
      <TouchableOpacity onPress={handleAddressSelect}>
        <Text>Select Address</Text>
      </TouchableOpacity>
    </View>
  );
}

export default MapScreen;
