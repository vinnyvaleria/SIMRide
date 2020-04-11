import React, { Component } from 'react';
import { Text, View } from 'react-native';
import firebase from '../firebase/base';
import 'firebase/firestore';
import {user} from './Login';

class Wallet extends React.Component {
    constructor(props) {

        super(props);
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

    walletHomePage = () => {
        document.getElementById('div_WalletHome').style.display = "block";
        document.getElementById('div_WalletTopUp').style.display = "none";
        document.getElementById('div_WalletHistory').style.display = "none";


    }

    topupWallet = () => {
        document.getElementById('div_WalletHome').style.display = "none";
        document.getElementById('div_WalletTopUp').style.display = "block";
        document.getElementById('div_WalletHistory').style.display = "none";


    }

    topUpWalletPage = () => {


    }

    transactionsPage = () => {
        document.getElementById('div_WalletHome').style.display = "none";
        document.getElementById('div_WalletTopUp').style.display = "none";
        document.getElementById('div_WalletHistory').style.display = "block";


    }

render() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <div id='homePage'>
        <div>
          <h1>Wallet Page</h1>
          <button id='btnWalletHome' onClick={ this.walletHomePage }>Wallet</button>
          <button id='btnTransactionPage' onClick={ this.transactionsPage }>Transactions</button>
        </div>
        <div id='div_WalletHome'>
            <div>
                <table>
                    <tbody>
                        <tr>
                            <td>Wallet Amount:</td>
                            <td id='td_WalletAmount'></td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div>
                <button id='btnTopUpPage' onClick={ this.topUpWalletPage }>Top-Up</button>
            </div>
        </div>
        <div id='div_WalletTopUp' style={{display: 'none'}}>
          <button id='btnTopUpSubmit' onClick={ this.topUpWallet }>Top-Up</button>
        </div>
        <div id='div_WalletHistory' style={{display: 'none'}}>
          
        </div>
      </div>
    </View>
    );
  }
}

export default Wallet;