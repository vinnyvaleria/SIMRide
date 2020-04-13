import React, { Component } from 'react';
import { Text, View } from 'react-native';
import firebase from '../base';
import 'firebase/firestore';
import {user} from './Login';

class Home extends React.Component {
    constructor(props) {

      super(props);
      this.handleChange = this.handleChange.bind(this);
    }

    handleChange(e) {
      this.setState({
        [e.target.name]: e.target.value
      });
    }

    // goes back to login page if stumble upon another page by accident without logging in
    componentDidMount() {
      if (typeof user[3] === 'undefined') {
        firebase.auth().signOut();
      }
    }

  render() {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <div id='homePage'>
          <div>
            <h1>{"Welcome Home, " + user[0]}</h1>
          </div>
        </div>
      </View>
      );
    }
  }

export default Home;
