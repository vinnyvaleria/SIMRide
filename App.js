import React from 'react';
import { StyleSheet, Text, View, Image, Button, Alert } from 'react-native';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';

import logo from './assets/logo.png';

import Start from './navigation/Start';
import Signup from './navigation/Signup';
import Login from './navigation/Login';
import Home from './navigation/Home';
import Account from './navigation/Account';
import Booking from './navigation/Booking';
import Rating from './navigation/Rating';
import Messages from './navigation/Messages';

function App() {
    return (
        <Router>
            <Switch>
                <Route exact path='/' component={Start}>
                    <Start />
                </Route>
                <Route exact path='/signup' component={Signup}>
                    <Signup />
                </Route>
                <Route exact path='/login' component={Login}>
                    <Login redirect='/home'></Login>
                </Route>
                <Route exact path='/home' component={Home}>
                    <Home />
                </Route>
                <Route exact path='/account' component={Account}>
                    <Account />
                </Route>
                <Route exact path='/booking' component={Booking}>
                    <Booking />
                </Route>
                <Route exact path='booking/rating' component={Rating}>
                    <Rating />
                </Route>
                <Route exact path='/messages' component={Messages}>
                    <Messages />
                </Route>
            </Switch>
        </Router>
    );
}

export default App;
