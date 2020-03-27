import React from 'react';
import { Switch, Route, BrowserRouter } from 'react-router-dom';

//
import Start from './navigation/Start';
import Signup from './navigation/Signup';
import Login from './navigation/Login';
import Home from './navigation/Home';
import Account from './navigation/Account';
import Booking from './navigation/Booking';
import Rating from './navigation/Rating';
import Messages from './navigation/Messages';

ReactDOM.render((
    <BrowserRouter>
        <App />
    </BrowserRouter>
    ), document.getElementById('root')
);

const Main = () => {
  return (
    <Switch>
        <Route exact path='/' component={Start}></Route>
        <Route exact path='/signup' component={Signup}></Route>
        <Route exact path='/login' component={Login}></Route>
        <Route exact path='/login/home' component={Home}></Route>
        <Route exact path='/login/home/account' component={Account}></Route>
        <Route exact path='/login/home/booking' component={Booking}></Route>
        <Route exact path='/login/home/rating' component={Rating}></Route>
        <Route exact path='/login/home/messages' component={Messages}></Route>
    </Switch>
  );
}

export default Main;