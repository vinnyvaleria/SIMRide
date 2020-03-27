import React from 'react';
import { StyleSheet, Text, View, Image, Button, Alert } from 'react-native';
import { Link } from 'react-router-dom';
import logo from './assets/logo.png';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={{ color: '#fff', fontSize: 30, fontFamily: 'Helvetica', fontWeight: '600'}} >Welcome to SIMRide</Text>
      <Image source={logo} /> 
      
      <View style={styles.fixToText}>
          <Button title="Right button" onPress={() => Alert.alert('Right button pressed')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4b9ea1',
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
});
