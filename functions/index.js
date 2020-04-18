import React from 'react';
import ReactDOM from 'react-dom';
import { Switch, Route, BrowserRouter } from 'react-router-dom';
import registerServiceWorker from '../util/registerServiceWorker';
import 'bootstrap/dist/css/bootstrap.css';
import React from 'react'
import ReactDOM from 'react-dom'
import App from './components/App'
import 'babel-polyfill'

import App from '../App';
import Start from './navigation/Start';
import Signup from './navigation/Wallet';
import Login from './navigation/Login';
import Home from './navigation/Home';
import Account from './navigation/Account';
import Booking from './navigation/Booking';
import Rating from './navigation/Rating';
import Messages from './navigation/Messages';
import Wallet from './navigation/Wallet';

ReactDOM.render((
    <BrowserRouter>
        <App />
    </BrowserRouter>
    ), document.getElementById('root')
);
registerServiceWorker();

const Main = () => {
  return (
    <Switch>
        <Route exact path='/' component={Start}></Route>
        <Route exact path='/signup' component={Signup}></Route>
        <Route exact path='/login' component={Login}></Route>
        <Route exact path='/login/home' component={Home}></Route>
        <Route exact path='/login/home/account' component={Account}></Route>
        <Route exact path='/login/home/wallet' component={Wallet}></Route>
        <Route exact path='/login/home/booking' component={Booking}></Route>
        <Route exact path='/login/home/rating' component={Rating}></Route>
        <Route exact path='/login/home/messages' component={Messages}></Route>
    </Switch>
  );
}

const rootNode = document.querySelector('#root')
ReactDOM.render( < App / > , rootNode)

{/* export default Main; */}