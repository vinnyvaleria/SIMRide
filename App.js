import React from 'react';
import { StyleSheet, Text, View, Image, Button, Alert } from 'react-native';
import { Link } from 'react-router-dom';
import logo from './assets/logo.png';
import fire from './firebase/base';
import Login from './navigation/Login';
import Home from './navigation/Home';

var express = require('express');
var app = express();
app.set('view engine', 'js');
app.listen(3000);

app.get('/Home', function(req, res) {  

  res.render('Home');
});

class App extends React.Component {
  constructor() {
    super();
    this.state = ({
      user: null,
    });
    this.authListener = this.authListener.bind(this);
  }

  componentDidMount() {
    this.authListener();
  }

  authListener() {
    fire.auth().onAuthStateChanged((user) => {
      console.log(user);
      if (user) {
        this.setState({ user });
        localStorage.setItem('user', user.uid);
      }

      else {
        this.setState({ user: null });
        localStorage.removeItem('user');
      }
    });
  }

  render() {
    return (
      <View style={styles.container}>
      <Text style={{ color: '#fff', fontSize: 30, fontFamily: 'Helvetica', fontWeight: '600'}} >Welcome to SIMRide</Text>
      <Image source={logo} /> 
      
      <View style={styles.fixToText}>
          <Button title="Right button" onPress={() => Alert.alert('Right button pressed')} />
      </View>
      <View>{this.state.user ? (<Home />) : (<Login />)}</View>
    </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4b9ea1',
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
});


export default App;