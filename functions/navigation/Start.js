import React from "react";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import Messages from './Messages';
import Account from './Account';
import Booking from './Booking';
import Home from './Home';
import Wallet from './Wallet';
import Map from './Map';
import Rating from './Rating';
import Checkout from './CashCheckout';
import { user } from './Login';


export default function Start() {
  return (
    <Router>
      <div>
        <nav>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/Booking">Bookings</Link>
            </li>
            <li>
              <Link to="/Messages">Messages</Link>
            </li>
            <li>
              <Link to="/Wallet">Wallet</Link>
            </li>
            <li>
                <Link to="/Map">Map</Link>
            </li>
            <li>
                <Link to="/Rating">Ratings</Link>
            </li>
            <li id='checkOutTab'>
              <Link to="/Checkout">Checkout Requests</Link>
            </li>
            <li>
              <Link to="/Account">Account</Link>
            </li>
          </ul>
        </nav>

        {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
        <Switch>
            <Route path="/Booking">
            <Booking />
          </Route>
          <Route path="/Messages">
            <Messages />
          </Route>
          <Route path="/Account">
            <Account />
          </Route>
          <Route path="/Wallet">
            <Wallet />
          </Route>
          <Route path="/Map">
              <Map />
          </Route>
          <Route path="/Rating">
              <Rating />
          </Route>
           <Route path="/Checkout">
              <Checkout />
          </Route>
          <Route path="/">
            <Home />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}