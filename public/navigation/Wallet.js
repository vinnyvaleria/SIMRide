import React from 'react';
import { Text, View } from 'react-native';
import firebase from '../../base';
import 'firebase/firestore';
import {user} from './Login';
import StripeCheckout from "react-stripe-checkout";
import axios from "axios";

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
        this.state = {
            amount: ''
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

    // goes back to login page if stumble upon another page by accident without logging in
    componentDidMount() {
        if (typeof user[3] === 'undefined') {
            firebase.auth().signOut();
        }
        else {
            this.walletHomePage();
            if (user[6].toLowerCase() === 'yes') {
                document.getElementById("btnTopUpPage").style.display = "none";
                document.getElementById("tbl_last5").style.display = "none";
            }
        }
    }

    // to show amount left in wallet
    walletHomePage = () => {
        document.getElementById('div_WalletHome').style.display = "block";
        document.getElementById('div_WalletTopUp').style.display = "none";
        document.getElementById('div_WalletHistory').style.display = "none";

        document.getElementById('td_WalletAmount').innerHTML = "$" + user[8];
    }

    topupWallet = () => {
        


    }

    // top up wallet button
    topUpWalletPage = () => {
        document.getElementById('div_WalletHome').style.display = "none";
        document.getElementById('div_WalletTopUp').style.display = "block";
        document.getElementById('div_WalletHistory').style.display = "none";

    }

    // goes to transaction history page
    transactionsPage = () => {
        document.getElementById('div_WalletHome').style.display = "none";
        document.getElementById('div_WalletTopUp').style.display = "none";
        document.getElementById('div_WalletHistory').style.display = "block";


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
                <table id="tbl_last5">
                    <thead>
                        <tr rowSpan='3'>
                            <th>Last 5 Transactions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td id='td_Description'></td>
                            <td id='td_PaidAmount'></td>
                            <td id='td_PaidBy'></td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <br/>
            <div>
                <button id='btnTopUpPage' onClick={ this.topUpWalletPage }>Top-Up</button>
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
        <div id='div_WalletHistory' style={{display: 'none'}}>
          
        </div>
      </div>
    </View>
    );
  }
}

export default Wallet;