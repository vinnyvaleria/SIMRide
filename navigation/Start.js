// This is for the root page aka Start page
import React from 'react';
import { StyleSheet, Text, View, Image, Button, Alert } from 'react-native';

import logo from '../assets/logo.png';

function Start() {
  return (
    <div>
      <p>This is the start page</p>
        <View style={styles.container}>
            <Text style={{ color: '#919831', fontSize: 30, fontFamily: 'Helvetica', fontWeight: '600'}} >Welcome to SIMRide</Text>
            <Image source={logo} /> 
        </View> 
    </div>
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

export default Start;