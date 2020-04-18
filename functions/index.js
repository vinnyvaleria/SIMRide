/* eslint-disable callback-return */
/* eslint-disable no-path-concat */
/* eslint-disable promise/always-return */
/* eslint-disable promise/catch-or-return */
// import React from 'react';
// import ReactDOM from 'react-dom';
// import { Switch, Route, BrowserRouter } from 'react-router-dom';
// import registerServiceWorker from '../util/registerServiceWorker';
// import 'bootstrap/dist/css/bootstrap.css';
// import App from '../App'
// import 'babel-polyfill'

// import Start from './navigation/Start';
// import Signup from './navigation/Wallet';
// import Login from './navigation/Login';
// import Home from './navigation/Home';
// import Account from './navigation/Account';
// import Booking from './navigation/Booking';
// import Rating from './navigation/Rating';
// import Messages from './navigation/Messages';
// import Wallet from './navigation/Wallet';

// ReactDOM.render((
//     <BrowserRouter>
//         <App />
//     </BrowserRouter>
//     ), document.getElementById('root')
// );
// registerServiceWorker();

// const Main = () => {
//   return (
//     <Switch>
//         <Route exact path='/' component={Start}></Route>
//         <Route exact path='/signup' component={Signup}></Route>
//         <Route exact path='/login' component={Login}></Route>
//         <Route exact path='/login/home' component={Home}></Route>
//         <Route exact path='/login/home/account' component={Account}></Route>
//         <Route exact path='/login/home/wallet' component={Wallet}></Route>
//         <Route exact path='/login/home/booking' component={Booking}></Route>
//         <Route exact path='/login/home/rating' component={Rating}></Route>
//         <Route exact path='/login/home/messages' component={Messages}></Route>
//     </Switch>
//   );
// }

// const rootNode = document.querySelector('#root')
// ReactDOM.render( < App / > , rootNode)

{/* export default Main; */}

const functions = require('firebase-functions');
const express = require('express');
const engines = require('consolidate');
const helmet = require('helmet')
const app = express();

app.engine('hbs', engines.handlebars);
app.set('views', './views');
app.set('view engine', 'hbs');

function ignoreFavicon(req, res, next) {
  if (req.originalUrl === '/favicon.ico') {
    res.status(204).json({
      nope: true
    });
  } else {
    next();
  }
}

app.use(ignoreFavicon);

app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    styleSrc: ["'self'"],
    imgSrc: ["'self'"]
  }
}))

app.get('/', (req, res, next) => {
  let data = {
    message: 'fuck shafiq'
  };
  res,set('Cache-Control', 'public, max-age=300, s-maxage=600');
  this.response.render('index')
  res.status(200).send(data);
});

exports.app = functions.https.onRequest(app);