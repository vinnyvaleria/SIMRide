import React, { Component } from 'react';
import { Text, View } from 'react-native';
import firebase from '../firebase/base';
import 'firebase/firestore';
import {user} from './Login';

class Booking extends React.Component {
  constructor(props) {

    super(props);
    this.logout = this.logout.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(e) {
    this.setState({ [e.target.name]: e.target.value });
  }

  // goes back to login page if stumble upon another page by accident without logging in
  componentDidMount() {
    if (typeof user[3] === 'undefined') {
      firebase.auth().signOut();
    }
  }

  logout() {
    user[0] = '';
    user[1] = '';
    user[2] = '';
    user[3] = '';
    user[4] = '';
    user[5] = '';
    user[6] = '';
    user[7] = '';

    console.log(user.email);
    firebase.auth().signOut();
  }

render() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <div id='bookPage'>
        <div>
          <h1>This is the booking tab</h1>
        </div>
      </div>
    </View>
    );
  }
}

export default Booking;
