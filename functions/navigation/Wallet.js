/* eslint-disable promise/always-return */
/* eslint-disable promise/catch-or-return */
import React from 'react';
import { Text, View } from 'react-native';
import firebase from '../../base';
import 'firebase/firestore';
import {user} from './Login';
import StripeCheckout from "react-stripe-checkout";
import axios from "axios";
import * as Datetime from "react-datetime";
var moment = require('moment');

var userDetails = [];

class Wallet extends React.Component {
    constructor(props) {
        super(props);
        this.handleToken = this.handleToken.bind(this);
        this.setTwoNumberDecimal = this.setTwoNumberDecimal.bind(this);
        this.topupWallet = this.topupWallet.bind(this);
        this.topUpWalletPage = this.topUpWalletPage.bind(this);
        this.walletHomePage = this.walletHomePage.bind(this);
        this.transactionsPage = this.transactionsPage.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.getLastFiveBookings = this.getLastFiveBookings.bind(this);
        this.cashOut = this.cashOut.bind(this);
        this.submitCashOut = this.submitCashOut.bind(this);
        this.maxAmtCalc = this.maxAmtCalc.bind(this);
        this.state = {
            amount: '',
            maxAmt: this.maxAmtCalc(),
            cashoutamount: ''
        }
    }

    handleChange(e) {
        this.setState({
            [e.target.name]: e.target.value
        });
    }

    // sets amount in text box to two decimal places on blur and sets to this.state.amount
    setTwoNumberDecimal(e) {
        e.target.value = parseFloat(e.target.value).toFixed(2);
        this.setState({
            [e.target.name]: e.target.value
        });
    }

    maxAmtCalc() {
        if (user[8] > 5.00) {
            return parseFloat(user[8] - 5).toFixed(2);
        }
        else {
            return 0;
        }
    }

    getLastFiveBookings() {
        document.getElementById('tb_LastFiveTransactions').innerHTML = '';

        // get all accounts
        firebase.database().ref('accounts')
            .orderByChild('email')
            .once('value')
            .then((snapshot) => {
                let i = 0;
                snapshot.forEach((child) => {
                    userDetails[i] = child.key + ":" + child.val().uname + ":" + child.val().fname + ":" + child.val().lname;
                    i++;
                })
            });

        const database = firebase.database().ref('bookings').orderByChild('date').limitToFirst(5).endAt(Date.now());
        database.once('value', (snapshot) => {
            if (snapshot.exists()) {
                let content = '';
                snapshot.forEach((data) => {
                    console.log(data.val().currPassengers, data.val().driverID, 'haha')
                    if (data.val().currPassengers.includes(user[2]) || data.val().driverID === user[9]) {
                        console.log('fuck you');
                        let area = data.val().area;
                        let date = moment.unix(data.val().date / 1000).format("DD MMM YYYY hh:mm a");

                        let id = data.val().driverID;
                        let driver = '';

                        for (let i = 0; i < userDetails.length; i++) {
                            let key = [];
                            key = userDetails[i].split(':');
                            if (key[0] === id) {
                                driver = key[1];
                            }
                        }

                        content += '<tr id=\'' + data.key + '\'>';
                        content += '<td>' + area + '</td>'; //column1
                        content += '<td>' + date + '</td>'; //column2
                        content += '<td>' + driver + '</td>';
                        content += '</tr>';
                    }
                });
                document.getElementById('tb_LastFiveTransactions').innerHTML += content;
            }
        });
    }

    // checks email and signs user out if no such email found
    checkEmail(e) {
        const email = firebase.auth().currentUser.email;
        
        user[3] = email;

        const accountsRef = firebase.database().ref('accounts');
        accountsRef.orderByChild('email')
            .equalTo(user[3])
            .once('value')
            .then((snapshot) => {
                snapshot.forEach((child) => {
                    user[0] = child.val().fname;
                    user[1] = child.val().lname;
                    user[2] = child.val().uname;
                    user[4] = child.val().phone;
                    user[5] = child.val().isDriver;
                    user[6] = child.val().isAdmin;
                    user[7] = child.val().isBanned;
                    user[8] = child.val().wallet;
                    user[9] = child.key;
                });
            }).then(() => {
                if (typeof user[3] === 'undefined') {
                    firebase.auth().signOut();
                } else {
                    if (user[6] !== "") {
                        this.walletHomePage();
                        if (user[6].toLowerCase() === 'yes') {
                            document.getElementById("btnTopUpPage").style.display = "none";
                            document.getElementById("tbl_last5").style.display = "none";
                        }
                    }
                }
            });
    }

    // goes back to login page if stumble upon another page by accident without logging in
    componentDidMount() {
       this.checkEmail();
    }

    // to show amount left in wallet
    walletHomePage() {
        this.getLastFiveBookings();
        if(this.maxAmtCalc() === 0) {
            document.getElementById('btnCashOut').style.display = "none";
        }
        else {
            document.getElementById('btnCashOut').style.display = "inline-block";
        }

        document.getElementById('div_WalletHome').style.display = "block";
        document.getElementById('div_WalletTopUp').style.display = "none";
        document.getElementById('div_WalletHistory').style.display = "none";
        document.getElementById('div_CashOut').style.display = "none";

        document.getElementById('td_WalletAmount').innerHTML = "$" + parseFloat(user[8]).toFixed(2);
    }

    topupWallet() {
        
    }

    // top up wallet button
    topUpWalletPage() {
        document.getElementById('div_WalletHome').style.display = "none";
        document.getElementById('div_WalletTopUp').style.display = "block";
        document.getElementById('div_WalletHistory').style.display = "none";
        document.getElementById('div_CashOut').style.display = "none";

    }

    // goes to transaction history page
    transactionsPage() {
        document.getElementById('div_WalletHome').style.display = "none";
        document.getElementById('div_WalletTopUp').style.display = "none";
        document.getElementById('div_WalletHistory').style.display = "block";
        document.getElementById('div_CashOut').style.display = "none";

    }

    cashOut() {
        document.getElementById('div_WalletHome').style.display = "none";
        document.getElementById('div_WalletTopUp').style.display = "none";
        document.getElementById('div_WalletHistory').style.display = "none";
        document.getElementById('div_CashOut').style.display = "block";
    }

    submitCashOut() {
        const notificationRef = firebase.database().ref('notification');
        const balance = parseFloat(user[8] - this.state.cashoutamount).toFixed(2);
        console.log(balance);
        const notification = {
            uname: 'admin',
            date: Date.now(),
            notification: 'Cash-out',
            reason: user[2] + ' has requested to cash-out $' + this.state.cashoutamount
        }

        const requestCheckOutRef = firebase.database().ref('cashcheckout');
        const requestForm = {
            requester: user[2],
            requesterID: user[9],
            date: Date.now(),
            amount: this.state.cashoutamount,
            disbursed: 'no'
        }

        const accountsRef = firebase.database().ref('accounts/' + user[9]);
        accountsRef.orderByChild('email')
          .equalTo(user[3])
          .once('value')
          .then((snapshot) => {
            snapshot.ref.update({
              wallet: balance
            })
          });

        notificationRef.push(notification);
        requestCheckOutRef.push(requestForm);
        this.state = {
            cashoutamount: ''
        };

        user[8] = balance;
        document.getElementById('cashOutInput').value = null;

        document.getElementById('div_WalletHome').style.display = "block";
        document.getElementById('div_WalletTopUp').style.display = "none";
        document.getElementById('div_WalletHistory').style.display = "none";
        document.getElementById('div_CashOut').style.display = "none";
    }

    // handles payment -> check firestripe for stripe cloud functiosn with firebase
    async handleToken(token) {
        let product = {price: this.state.amount, name: "Top-Up E-Wallet", decscription: "Top-Up"}
        const response = await axios.post(
            "http://localhost:19006/charge", // by right when served onto staging server port will be 5000
            { token, product }
        );
        const { status } = response.data;
        console.log("Response:", response.data);
        if (status === "success") {
            toast("Success! Check email for details", { type: "success" });
        } else {
            toast("Something went wrong", { type: "error" });
        }
    }

render() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <div id='homePage'>
        <div>
          <h1>E-Wallet Page</h1>
          <button id='btnWalletHome' onClick={ this.walletHomePage }>Wallet</button>
          <button id='btnTransactionPage' onClick={ this.transactionsPage }>Transactions</button>
        </div>
        <br/>
        <div id='div_WalletHome'>
            <div>
                <table>
                    <tbody>
                        <tr>
                            <td>E-Wallet Amount:</td>
                            <td id='td_WalletAmount'></td>
                        </tr>
                    </tbody>
                </table>
                <br/>
                <br/>
                <div id="tbl_last5">
                    <h4>Last 5 Transactions</h4>
                    <table>
                        <tbody id="tb_LastFiveTransactions"></tbody>
                    </table>
                </div>
            </div>
            <br/>
            <div>
                <button id='btnTopUpPage' onClick={ this.topUpWalletPage }>Top-Up</button>
                <button id='btnCashOut' onClick={ this.cashOut }>Cash-Out</button>
            </div>
        </div>
        <div id='div_WalletTopUp' style={{display: 'none'}}>
            <input type='number' step='0.01' min='0.01' value={this.state.amount} onBlur={this.setTwoNumberDecimal} onChange={this.handleChange} name='amount' /><br/><br/>
            <StripeCheckout
                stripeKey='pk_test_K5hyuKJAvnl8PNzfuwes3vn400X0HYzEvv'
                token={this.handleToken}
                amount={this.state.amount * 100}
                name="E-Wallet Top-Up"
                currency="SGD"
                email={user[3]}
            />
        </div>
        <div id='div_CashOut' style={{display: 'none'}}>
            <input id='cashOutInput' type='number' step='0.01' min='0.01' max={this.state.maxAmt} value={this.state.cashoutamount} onBlur={this.setTwoNumberDecimal} onChange={this.handleChange} style={{width: '8em'}} name='cashoutamount' />
            <br/><br/>
            <button id='btnSubmitCashOut' onClick={ this.submitCashOut }>Cash-Out</button>
        </div>
        <div id='div_WalletHistory' style={{display: 'none'}}>
          
        </div>
      </div>
    </View>
    );
  }
}

export default Wallet;