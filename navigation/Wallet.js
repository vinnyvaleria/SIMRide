import React, { Component } from 'react';
import { Text, View } from 'react-native';
import firebase from '../firebase/base';
import 'firebase/firestore';
import {user} from './Login';

class Wallet extends React.Component {
    constructor(props) {

        super(props);
        this.logout = this.logout.bind(this);
        this.topupWallet = this.topupWallet.bind(this);
        this.topUpWalletPage = this.topUpWalletPage.bind(this);
        this.walletHomePage = this.walletHomePage.bind(this);
        this.transactionsPage = this.transactionsPage.bind(this);
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

    viewAllBookings = () => {
        document.getElementById('div_WalletHome').style.display = "block";
        document.getElementById('div_WalletTopUp').style.display = "none";
        document.getElementById('div_WalletHistory').style.display = "none";


    }

render() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <div id='homePage'>
        <div>
          <h1>Wallet</h1>
        </div>
        <div id='div_WalletHome'>
            <div>
                <button id='btnWalletHome' onClick={ this.walletHomePage }>Top-Up</button>
                <button id='btnTransactionPage' onClick={ this.transactionsPage }>Transactions</button>
                <br/>
                
            </div>
            <div>
                <button id='btnTopUpPage' onClick={ this.topUpWalletPage }>Top-Up</button>
            </div>
        </div>
        <div id='div_WalletTopUp'>
          <button id='btnTopUpSubmit' onClick={ this.topUpWallet }>Top-Up</button>
        </div>
        <div id='div_WalletHistory'>
          
        </div>
      </div>
    </View>
    );
  }
}

export default Wallet;