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
      this.viewApplication = this.viewApplication.bind(this);
      this.viewReportedUsers = this.viewReportedUsers.bind(this);
      this.approveApplicant = this.approveApplicant.bind(this);
      this.viewCreatedBooking = this.viewCreatedBooking.bind(this);
      this.viewMyBookings = this.viewMyBookings.bind(this);
      this.Notifications = this.Notifications.bind(this);
      this.acknowledgeNotif = this.acknowledgeNotif.bind(this);
      this.walletBalanceCheck = this.walletBalanceCheck.bind(this);
      this.state = {
        frontURL: '',
        backURL: ''
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
      else{
        if (user[6] !== "") {
          if (user[6].toLowerCase() === "yes") { // admin
            document.getElementById("adminDB").style.display = "block";
            this.viewApplication();
            this.viewReportedUsers();
            this.Notifications('tb_AdminNotifications');
          } else if (user[6].toLowerCase() === "no" && user[5].toLowerCase() === "yes") { // driver
            this.walletBalanceCheck();
            document.getElementById("driverDB").style.display = "block";
            this.viewCreatedBooking();
            this.viewMyBookings('tb_DriverUpcomingRides');
            this.Notifications('tb_DriverNotifications');
          } else if (user[6].toLowerCase() === "no" && user[5].toLowerCase() === "no") { // normal users
            this.walletBalanceCheck();
            document.getElementById("riderDB").style.display = "block";
            this.viewMyBookings('tb_RiderUpcomingRides');
            this.Notifications('tb_RiderNotifications');
          }
        }
      }
    }

    walletBalanceCheck() {
      if (user[8] < 5.00) {
        const notificationRef = firebase.database().ref('notification');
        const notification = {
          uname: user[2],
          date: Date.now(),
          notification: 'E-Wallet balance is below $5.00. Current balance: $' + user[8] + '.',
          reason: 'Please top-up your wallet to continue using your e-wallet.'
        }

        notificationRef.push(notification);
      }
    }

    // view list of applicants
    viewApplication() {
      const self = this;
      document.getElementById('tb_driverApplication').innerHTML = '';
      
      const database = firebase.database().ref('driverDetails').orderByChild('dateApplied');
      database.once('value', (snapshot) => {
        if (snapshot.exists()) {
          let content = '';
          let rowCount = 0;
          snapshot.forEach((data) => {
            if (data.val().status === "pending" && data.val().completed === "yes") {
              let driverUname = data.val().driverUname;
              let dateApplied = data.val().dateApplied;
              console.log(driverUname, dateApplied);
              content += '<tr id=\'' + data.key + '\'>';
              content += '<td>' + driverUname + '</td>'; //column1
              content += '<td>' + dateApplied + '</td>'; //column2
              content += '<td id=\'btnViewApplicant' + rowCount + '\'></td>';
              content += '</tr>';

              rowCount++;
              console.log(rowCount, content);
            }
          });

          document.getElementById('tb_driverApplication').innerHTML += content;

          for (let v = 0; v < rowCount; v++) {
            let btn = document.createElement('input');
            btn.setAttribute('type', 'button')
            btn.setAttribute('value', 'View');
            btn.onclick = self.viewApplicant;
            document.getElementById('btnViewApplicant' + v).appendChild(btn);
          }
        }
      });
    }

    // view applicant that applied to be driver
    viewApplicant(e) {
      var driverID = e.target.parentElement.parentElement.id;
      document.getElementById('div_ViewApplicant').style.display = "block";
      document.getElementById('div_ViewReportedUser').style.display = "none";
      document.getElementById('div_driverApplication').style.display = "none";
      document.getElementById('div_ReportedUsers').style.display = "none";
      
      const database = firebase.database().ref('driverDetails').orderByChild('dateApplied');
      database.once('value', (snapshot) => {
        if (snapshot.exists()) {
          snapshot.forEach((data) => {
            if (data.key === driverID) {
              let driverUname = data.val().driverUname;
              let dateApplied = data.val().dateApplied;
              let license = data.val().license;
              let issuedDate = data.val().issueDate;
              console.log(driverUname, dateApplied);

              document.getElementById('td_ViewApplicant_driverID').innerHTML = data.key;
              document.getElementById('td_ViewApplicant_username').innerHTML = driverUname;
              document.getElementById('td_ViewApplicant_dateApplied').innerHTML = dateApplied;
              document.getElementById('td_ViewApplicant_license').innerHTML = license;
              document.getElementById('td_ViewApplicant_issuedDate').innerHTML = issuedDate;
            }
          });
        }
      });

      firebase.storage()
        .ref("license/" + driverID)
        .child("front")
        .getDownloadURL()
        .then(frontURL => {
          this.setState({
            frontURL
          });
        });

        firebase.storage()
          .ref("license/" + driverID)
          .child("back")
          .getDownloadURL()
          .then(backURL => {
            this.setState({
              backURL
            });
          });
    }

    // approve applicants
    approveApplicant() {
      const driverID = document.getElementById('td_ViewApplicant_driverID').innerHTML;
      const accountsRef = firebase.database().ref('accounts/' + driverID);
      accountsRef.orderByChild('email')
        .once('value')
        .then((snapshot) => {
          snapshot.ref.update({
            isDriver: "yes"
          })
        });

      const driverRef = firebase.database().ref('driverDetails/' + driverID);
      driverRef.orderByChild('dateApplied')
        .once('value')
        .then((snapshot) => {
          snapshot.ref.update({
            status: "approved"
          })
        });

        this.viewApplication();

        document.getElementById('div_ViewApplicant').style.display = "none";
        document.getElementById('div_driverApplication').style.display = "block";
    }

    // view reported users
    viewReportedUsers() {
      const self = this;
      document.getElementById('tb_ReportedUsers').innerHTML = '';

      const database = firebase.database().ref('reportedUsers').orderByChild('lastReportDate');
      database.once('value', (snapshot) => {
        if (snapshot.exists()) {
          let content = '';
          let rowCount = 0;
          snapshot.forEach((data) => {
            let username = data.val().username;
            let lastDate = new Date(data.val().lastReportDate * -1);
            let status = data.val().status;
            console.log(username, lastDate);
            content += '<tr id=\'' + data.key + '\'>';
            content += '<td>' + username + '</td>'; //column1
            content += '<td>' + lastDate.toDateString() + '</td>'; //column2
            content += '<td>' + status + '</td>';
            content += '<td id=\'btnViewReportedUser' + rowCount + '\'></td>';
            content += '</tr>';

            rowCount++;
            console.log(rowCount, content);
          });

          document.getElementById('tb_ReportedUsers').innerHTML += content;

          for (let v = 0; v < rowCount; v++) {
            let btn = document.createElement('input');
            btn.setAttribute('type', 'button')
            btn.setAttribute('value', 'View');
            btn.onclick = self.viewReportedUser;
            document.getElementById('btnViewReportedUser' + v).appendChild(btn);
          }
        }
      });
    }

    // view the reported user
    viewReportedUser(e) {
      var userID = e.target.parentElement.parentElement.id;
      document.getElementById('div_ViewApplicant').style.display = "none";
      document.getElementById('div_ViewReportedUser').style.display = "block";
      document.getElementById('div_driverApplication').style.display = "none";
      document.getElementById('div_ReportedUsers').style.display = "none";

      const database = firebase.database().ref('reportedUsers').orderByChild('lastReportDate');
      database.once('value', (snapshot) => {
        if (snapshot.exists()) {
          snapshot.forEach((data) => {
            if (data.key === userID) {
              let username = data.val().username;
              let lastReportDate = new Date(data.val().lastReportDate * -1);
              let status = data.val().status;
              let fake = data.val().fake;
              let safety = data.val().safety;
              let inappropriate = data.val().inappropriate;
              let vulgar = data.val().vulgar;
              console.log(username, lastReportDate);
              
              document.getElementById('td_ViewReportedUser_userID').innerHTML = data.key;
              document.getElementById('td_ViewReportedUser_username').innerHTML = username;
              document.getElementById('td_ViewReportedUser_status').innerHTML = status;
              document.getElementById('td_ViewReportedUser_lastreport').innerHTML = lastReportDate.toDateString();
              document.getElementById('td_ViewReportedUser_fakeprofile').innerHTML = fake;
              document.getElementById('td_ViewReportedUser_safety').innerHTML = safety;
              document.getElementById('td_ViewReportedUser_inappropriate').innerHTML = inappropriate;
              document.getElementById('td_ViewReportedUser_vulgar').innerHTML = vulgar;

              if (status === "banned") {
                document.getElementById('btnUnBanUser').style.display = "inline-block";
                document.getElementById('btnBanUser').style.display = "none"
              }
              else {
                document.getElementById('btnUnBanUser').style.display = "none";
                document.getElementById('btnBanUser').style.display = "inline-block"
              }
            }
          });
        }
      });
    }

    banUser() {
      const userID = document.getElementById('td_ViewReportedUser_userID').innerHTML;
      const accountsRef = firebase.database().ref('accounts/' + userID);
      accountsRef.once('value')
        .then((snapshot) => {
          snapshot.ref.update({
            isBanned: "yes"
          })
        });

      const reportedRef = firebase.database().ref('reportedUsers/' + userID);
      reportedRef.once('value')
        .then((snapshot) => {
          snapshot.ref.update({
            status: "banned"
          })
        });

        alert("User has been banned");

        document.getElementById('div_ViewApplicant').style.display = "none";
        document.getElementById('div_ViewReportedUser').style.display = "none";
        document.getElementById('div_driverApplication').style.display = "block";
        document.getElementById('div_ReportedUsers').style.display = "block";
    }

    unBanUser() {
      const userID = document.getElementById('td_ViewReportedUser_userID').innerHTML;
      const accountsRef = firebase.database().ref('accounts/' + userID);
      accountsRef.once('value')
        .then((snapshot) => {
          snapshot.ref.update({
            isBanned: "no"
          })
        });

      const reportedRef = firebase.database().ref('reportedUsers/' + userID);
      reportedRef.once('value')
        .then((snapshot) => {
          snapshot.ref.update({
            status: "not banned"
          })
        });

        alert("User has been unbanned");

        document.getElementById('div_ViewApplicant').style.display = "none";
        document.getElementById('div_ViewReportedUser').style.display = "none";
        document.getElementById('div_driverApplication').style.display = "block";
        document.getElementById('div_ReportedUsers').style.display = "block";
    }

    Notifications(tb) {
      const self = this;
      document.getElementById(tb).innerHTML = '';

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

      const database = firebase.database().ref('notification').orderByChild('date');
      database.once('value', (snapshot) => {
        if (snapshot.exists()) {
          let content = '';
          let rowCount = 0;
          snapshot.forEach((data) => {
            if (data.val().uname === user[2]) {
              let notification = data.val().notification;
              let reason = data.val().reason;
              let date = moment.unix(data.val().date / 1000).format("DD MMM YYYY");

              content += '<tr id=\'' + data.key + '\'>';
              content += '<td>' + notification + '</td>'; //column1
              content += '<td>' + reason + '</td>'; //column2
              content += '<td>' + date + '</td>';
              content += '<td id=\'btnNotification' + rowCount + '\'></td>';
              content += '</tr>';

              rowCount++;
            }
          });

          document.getElementById(tb).innerHTML += content;

          for (let v = 0; v < rowCount; v++) {
            let btn = document.createElement('input');
            btn.setAttribute('type', 'button')
            btn.setAttribute('value', 'Ack');
            btn.onclick = self.acknowledgeNotif;
            document.getElementById('btnNotification' + v).appendChild(btn);
          }
        }
      });
    }

    acknowledgeNotif(e) {
      const notifID = e.target.parentElement.parentElement.id;
      console.log(notifID);
      const notifRef = firebase.database().ref('notification/' + notifID);
      notifRef.remove();

      if (user[6] === 'yes') {
        this.Notifications('tb_AdminNotifications');
      }
      else {
        if (user[5] === 'no') {
          this.Notifications('tb_RiderNotifications');
        } else {
          this.Notifications('tb_DriverNotifications');
        }
      }
    }

    viewMyBookings(tb) {
      document.getElementById(tb).innerHTML = '';

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

      const database = firebase.database().ref('bookings').orderByChild('date').limitToFirst(3).startAt(Date.now());
      database.once('value', (snapshot) => {
        if (snapshot.exists()) {
          let content = '';
          snapshot.forEach((data) => {
            if (data.val().currPassengers !== "") {
              if (data.val().currPassengers.includes(user[2])) {
                let area = data.val().area;
                let date = moment.unix(data.val().date / 1000).format("DD MMM YYYY hh:mm a");
                let ppl = [];

                if (data.val().currPassengers !== "") {
                  ppl = data.val().currPassengers.split(',')
                }

                let passengers = ppl.length + "/" + data.val().maxPassengers;
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
                content += '<td>' + passengers + '</td>';
                content += '</tr>';
              }
            }
          });
          document.getElementById(tb).innerHTML += content;
        }
      });
    }

    // view created bookings by driver
    viewCreatedBooking() {
      document.getElementById('tb_DriverUpcomingDrives').innerHTML = '';

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

      let date = new Date();
      date.setDate(date.getDate() - 1);

      const database = firebase.database().ref('bookings').orderByChild('date').limitToFirst(3).startAt(Date.now());
      database.on('value', (snapshot) => {
        if (snapshot.exists()) {
          let content = '';
          snapshot.forEach((data) => {
            if (data.val().driverID === user[9]) {
              let area = data.val().area;
              let date = moment.unix(data.val().date / 1000).format("DD MMM YYYY hh:mm a");
              let ppl = [];

              if (data.val().currPassengers !== "") {
                ppl = data.val().currPassengers.split(',')
              }

              let passengers = ppl.length + "/" + data.val().maxPassengers;
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
              content += '<td>' + passengers + '</td>';
              content += '</tr>';
            }
          });
          document.getElementById('tb_DriverUpcomingDrives').innerHTML += content;
        }
      });
    }

    // back button
    back() {
       document.getElementById('div_ViewApplicant').style.display = "none";
       document.getElementById('div_ViewReportedUser').style.display = "none";
       document.getElementById('div_driverApplication').style.display = "block";
       document.getElementById('div_ReportedUsers').style.display = "block";
    }

  render() {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <div id='homePage'>
          <div>
            <h1>{"Welcome Home, " + user[0]}</h1>
          </div>
          <div id="adminDB" style={{display: 'none'}}>
            <div id="div_driverApplication">
              <h4>Notifications</h4>
              <table>
                <tbody id="tb_AdminNotifications"></tbody>
              </table>
              <h4>Driver Applicants List</h4>
              <table>
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Date Applied</th>
                  </tr>
                </thead>
                <tbody id="tb_driverApplication">
                </tbody>
              </table>
            </div>

            <div id='div_ReportedUsers'>
              <h4>Reported User List</h4>
              <table>
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Latest Reported Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody id="tb_ReportedUsers">
                </tbody>
              </table>
            </div>

            <div id='div_ViewApplicant' style={{display: 'none'}}>
              <table id="tbl_ViewApplicant">
                <tbody>
                  <tr id='uploadedFront'>
                    <td>
                      {this.state.frontURL && <img src={this.state.frontURL} height='150' width='200' />}
                    </td>
                    <td>
                      {this.state.backURL && <img src={this.state.backURL} height='150' width='200' />}
                    </td>
                  </tr>
                  <tr>
                    <td>Driver ID:</td>
                    <td id='td_ViewApplicant_driverID'></td>
                  </tr>
                  <tr>
                    <td>Username:</td>
                    <td id='td_ViewApplicant_username'></td>
                  </tr>
                  <tr>
                    <td>Date Applied:</td>
                    <td id='td_ViewApplicant_dateApplied'></td>
                  </tr>
                  <tr>
                    <td>License no:</td>
                    <td id='td_ViewApplicant_license'></td>
                  </tr>
                  <tr>
                    <td>License Issued:</td>
                    <td id='td_ViewApplicant_issuedDate'></td>
                  </tr>
                </tbody>
              </table>
              <br />
              <button onClick={ this.approveApplicant }>Approve Applicant</button>
              <button onClick={ this.back }>Back</button>
            </div>

            <div id='div_ViewReportedUser' style={{display: 'none'}}>
              <table id="tbl_ViewReportedUser">
                <tbody>
                  <tr>
                    <td>User ID:</td>
                    <td id='td_ViewReportedUser_userID'></td>
                  </tr>
                  <tr>
                    <td>Username:</td>
                    <td id='td_ViewReportedUser_username'></td>
                  </tr>
                  <tr>
                    <td>Status:</td>
                    <td id='td_ViewReportedUser_status'></td>
                  </tr>
                  <tr>
                    <td>Last Reported Date:</td>
                    <td id='td_ViewReportedUser_lastreport'></td>
                  </tr>
                  <tr>
                    <td>Fake Profile:</td>
                    <td id='td_ViewReportedUser_fakeprofile'></td>
                  </tr>
                  <tr>
                    <td>Threatened Safety:</td>
                    <td id='td_ViewReportedUser_safety'></td>
                  </tr>
                  <tr>
                    <td>Inappropriate Behaviour:</td>
                    <td id='td_ViewReportedUser_inappropriate'></td>
                  </tr>
                  <tr>
                    <td>Uncivil, Rude or Vulgar:</td>
                    <td id='td_ViewReportedUser_vulgar'></td>
                  </tr>
                </tbody>
              </table>
              <br />
              <button id="btnBanUser" onClick={ this.banUser }>Ban User</button>
              <button id="btnUnBanUser" onClick={ this.unBanUser }>Un-Ban User</button>
              <button onClick={ this.back }>Back</button>
            </div>
          </div>

          <div id="driverDB" style={{display: 'none'}}>
            <div id='div_DriverNotifications'>
              <h4>Notifications</h4>
              <table>
                <tbody id="tb_DriverNotifications"></tbody>
              </table>
            </div>
            <div id='div_DriverUpcomingRides'>
              <h4>Upcoming Rides</h4>
              <table>
                <thead>
                  <tr>
                    <th>Area</th>
                    <th>Date & Time</th>
                    <th>Driver</th>
                    <th>No. of Passengers</th>
                  </tr>
                </thead>
                <tbody id="tb_DriverUpcomingRides"></tbody>
              </table>
            </div>
            <div id='div_DriverUpcomingDrives'>
              <h4>Upcoming Drives</h4>
              <table>
                <thead>
                  <tr>
                    <th>Area</th>
                    <th>Date & Time</th>
                    <th>Driver</th>
                    <th>No. of Passengers</th>
                  </tr>
                </thead>
                <tbody id="tb_DriverUpcomingDrives"></tbody>
              </table>
            </div>
          </div>

          <div id="riderDB" style={{display: 'none'}}>
            <div id='div_RiderNotifications'>
              <h4>Notifications</h4>
              <table>
                <tbody id="tb_RiderNotifications"></tbody>
              </table>
            </div>
            <h4>Upcoming Rides</h4>
            <div id='div_RiderUpcomingRides'>
              <table>
                <thead>
                  <tr>
                    <th>Area</th>
                    <th>Date & Time</th>
                    <th>Driver</th>
                    <th>No. of Passengers</th>
                  </tr>
                </thead>
                <tbody id="tb_RiderUpcomingRides"></tbody>
              </table>
            </div>
          </div>
        </div>
      </View>
      );
    }
  }

export default Home;
