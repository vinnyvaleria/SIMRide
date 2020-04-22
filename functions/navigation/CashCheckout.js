/* eslint-disable no-alert */
/* eslint-disable promise/always-return */
/* eslint-disable promise/catch-or-return */
import React, { Component } from 'react';
import { Text, View } from 'react-native';
import firebase from '../../base';
import 'firebase/firestore';
import {user} from './Login';
import * as Datetime from "react-datetime";
var moment = require('moment');

var userDetails = [];

class Home extends React.Component {
    constructor(props) {

        super(props);
        this.handleChange = this.handleChange.bind(this);
        this.loadCashOut = this.loadCashout.bind(this);
        this.loadCashoutHistory = this.loadCashoutHistory.bind(this);
        this.changeCheckoutStatus = this.changeCheckoutStatus.bind(this);
        this.state = {
            
        };
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
        else {
            this.loadCashOut();
            this.loadCashoutHistory();
        }
    }

    loadCashout() {
        const self = this;
        document.getElementById('tb_NotDisbursedCashout').innerHTML = '';

        const database = firebase.database().ref('cashcheckout').orderByChild('date');
        database.once('value', (snapshot) => {
            if (snapshot.exists()) {
                let content = '';
                let rowCount = 0;
                snapshot.forEach((data) => {
                    console.log(data.val().requester);
                    if (data.val().disbursed === "no") {
                        console.log('fuck money');
                        let user = data.val().requester;
                        let userID = data.val().requesterID;
                        let date = moment.unix(data.val().date / 1000).format("DD MMM YYYY hh:mm a");
                        let amount = data.val().amount;

                        content += '<tr id=\'' + data.key + '\'>';
                        content += '<td>' + userID + '</td>'; //column1
                        content += '<td>' + user + '</td>'; //column2
                        content += '<td>' + amount + '</td>';
                        content += '<td>' + date + '</td>';
                        content += '<td id=\'btnUpdateRequest' + rowCount + '\'></td>';
                        content += '</tr>';

                        rowCount++;
                    }
                });
                document.getElementById('tb_NotDisbursedCashout').innerHTML += content;

                for (let v = 0; v < rowCount; v++) {
                    let btn = document.createElement('input');
                    btn.setAttribute('type', 'button')
                    btn.setAttribute('value', 'Done');
                    btn.onclick = self.changeCheckoutStatus;
                    document.getElementById('btnUpdateRequest' + v).appendChild(btn);
                }
            }
        });
    }

    changeCheckoutStatus(e) {
        var checkoutID = e.target.parentElement.parentElement.id;

        const accountsRef = firebase.database().ref('cashcheckout/' + checkoutID);
        accountsRef.orderByChild('requesterID')
          .equalTo(user[3])
          .once('value')
          .then((snapshot) => {
            snapshot.ref.update({
              disbursed: 'yes'
            })
          });

        this.loadCashOut();
        this.loadCashoutHistory();
    }

    loadCashoutHistory() {
        document.getElementById('tb_AllCashout').innerHTML = '';
        const database = firebase.database().ref('cashcheckout').orderByChild('date');
        database.once('value', (snapshot) => {
            if (snapshot.exists()) {
                let content = '';
                snapshot.forEach((data) => {
                    console.log('fuck money');
                    let user = data.val().requester;
                    let userID = data.val().requesterID;
                    let date = moment.unix(data.val().date / 1000).format("DD MMM YYYY hh:mm a");
                    let amount = data.val().amount;
                    let disbursed = data.val().disbursed;

                    content += '<tr id=\'' + data.key + '\'>';
                    content += '<td>' + userID + '</td>'; //column1
                    content += '<td>' + user + '</td>'; //column2
                    content += '<td>' + amount + '</td>';
                    content += '<td>' + date + '</td>';
                    content += '<td>' + disbursed + '</td>';
                    content += '</tr>';
                });
                document.getElementById('tb_AllCashout').innerHTML += content;
            }
        });
    }

  render() {
    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <div id='checkoutPage'>
                <h4>Checkout Requests</h4>
                <table>
                    <thead>
                        <tr>
                            <th>Requester ID</th>
                            <th>Requester</th>
                            <th>Amount</th>
                            <th>Date Applied</th>
                        </tr>
                    </thead>
                    <tbody id="tb_NotDisbursedCashout"></tbody>
                </table>
                <h4>Checkout History</h4>
                <table>
                    <thead>
                    <tr>
                        <th>Requester ID</th>
                        <th>Requester</th>
                        <th>Amount</th>
                        <th>Date Applied</th>
                        <th>Disbursed</th>
                    </tr>
                    </thead>
                    <tbody id="tb_AllCashout"></tbody>
                </table>
            </div>
        </View>
      );
    }
  }

export default Home;
