import React, { Component } from 'react';
import { Text, View } from 'react-native';
import firebase from '../base';
import 'firebase/firestore';
import {user} from './Login';

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
        if (user[6].toLowerCase() === "yes") { // admin
          document.getElementById("adminDB").style.display = "block";
          this.viewApplication();
          this.viewReportedUsers();
        }
        else if (user[6].toLowerCase() === "no" && user[5].toLowerCase() === "yes") { // driver
          document.getElementById("driverDB").style.display = "block";
          this.viewCreatedBooking();
          this.viewMyBookings('tb_DriverUpcomingRides');
        }
        else if (user[6].toLowerCase() === "no" && user[5].toLowerCase() === "no") { // normal users
          document.getElementById("riderDB").style.display = "block";
          this.viewMyBookings('tb_RiderUpcomingRides');
        }
      }
    }

    // view list of applicants
    viewApplication() {
      const self = this;
      document.getElementById('tb_driverApplication').innerHTML = '';
      
      const database = firebase.database().ref('driverDetails').orderByChild('dateApplied');
      database.once('value', function (snapshot) {
        if (snapshot.exists()) {
          let content = '';
          let rowCount = 0;
          snapshot.forEach(function (data) {
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
    viewApplicant = e => {
      var driverID = e.target.parentElement.parentElement.id;
      document.getElementById('div_ViewApplicant').style.display = "block";
      document.getElementById('div_ViewReportedUser').style.display = "none";
      document.getElementById('div_driverApplication').style.display = "none";
      document.getElementById('div_ReportedUsers').style.display = "none";
      
      const database = firebase.database().ref('driverDetails').orderByChild('dateApplied');
      database.once('value', function (snapshot) {
        if (snapshot.exists()) {
          snapshot.forEach(function (data) {
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
    approveApplicant = () => {
      const driverID = document.getElementById('td_ViewApplicant_driverID').innerHTML;
      const accountsRef = firebase.database().ref('accounts/' + driverID);
      accountsRef.orderByChild('email')
        .once('value')
        .then(function (snapshot) {
          snapshot.ref.update({
            isDriver: "yes"
          })
        });

      const driverRef = firebase.database().ref('driverDetails/' + driverID);
      driverRef.orderByChild('dateApplied')
        .once('value')
        .then(function (snapshot) {
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
      database.once('value', function (snapshot) {
        if (snapshot.exists()) {
          let content = '';
          let rowCount = 0;
          snapshot.forEach(function (data) {
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
    viewReportedUser = e => {
      var userID = e.target.parentElement.parentElement.id;
      document.getElementById('div_ViewApplicant').style.display = "none";
      document.getElementById('div_ViewReportedUser').style.display = "block";
      document.getElementById('div_driverApplication').style.display = "none";
      document.getElementById('div_ReportedUsers').style.display = "none";

      const database = firebase.database().ref('reportedUsers').orderByChild('lastReportDate');
      database.once('value', function (snapshot) {
        if (snapshot.exists()) {
          snapshot.forEach(function (data) {
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
        .then(function (snapshot) {
          snapshot.ref.update({
            isBanned: "yes"
          })
        });

      const reportedRef = firebase.database().ref('reportedUsers/' + userID);
      reportedRef.once('value')
        .then(function (snapshot) {
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
        .then(function (snapshot) {
          snapshot.ref.update({
            isBanned: "no"
          })
        });

      const reportedRef = firebase.database().ref('reportedUsers/' + userID);
      reportedRef.once('value')
        .then(function (snapshot) {
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

    viewMyBookings = (tb) => {
      document.getElementById(tb).innerHTML = '';

      // get all accounts
      firebase.database().ref('accounts')
        .orderByChild('email')
        .once('value')
        .then(function (snapshot) {
          let i = 0;
          snapshot.forEach(function (child) {
            userDetails[i] = child.key + ":" + child.val().uname + ":" + child.val().fname + ":" + child.val().lname;
            i++;
          })
        });

      let date = new Date();
      date.setDate(date.getDate()-1);

      const database = firebase.database().ref('bookings').orderByChild('date').limitToFirst(3).startAt(date.toISOString());
      database.once('value', function (snapshot) {
        if (snapshot.exists()) {
          let content = '';
          snapshot.forEach(function (data) {
            if (data.val().currPassengers != "") {
              if (data.val().currPassengers.includes(user[2])) {
                let area = data.val().area;
                let date = data.val().date;
                let time = data.val().time;
                let ppl = [];

                if (data.val().currPassengers != "") {
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
                content += '<td>' + time + '</td>';
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
    viewCreatedBooking = () => {
      document.getElementById('tb_DriverUpcomingRides').innerHTML = '';

      // get all accounts
      firebase.database().ref('accounts')
        .orderByChild('email')
        .once('value')
        .then(function (snapshot) {
          let i = 0;
          snapshot.forEach(function (child) {
            userDetails[i] = child.key + ":" + child.val().uname + ":" + child.val().fname + ":" + child.val().lname;
            i++;
          })
        });

      let date = new Date();
      date.setDate(date.getDate() - 1);

      const database = firebase.database().ref('bookings').orderByChild('date').limitToFirst(3).equalTo(date.toISOString());
      database.on('value', function (snapshot) {
        if (snapshot.exists()) {
          let content = '';
          snapshot.forEach(function (data) {
            if (data.val().driverID === user[9]) {
              let area = data.val().area;
              let date = data.val().date;
              let time = data.val().time;
              let ppl = [];

              if (data.val().currPassengers != "") {
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
              content += '<td>' + time + '</td>';
              content += '<td>' + driver + '</td>';
              content += '<td>' + passengers + '</td>';
              content += '</tr>';
            }
          });
          document.getElementById('tb_DriverUpcomingRides').innerHTML += content;
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
            <div id='div_DriverUpcomingRides'>
              <h4>Today's Rides</h4>
              <table>
                <thead>
                  <tr>
                    <th>Area</th>
                    <th>Date</th>
                    <th>Time</th>
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
                    <th>Date</th>
                    <th>Time</th>
                    <th>Driver</th>
                    <th>No. of Passengers</th>
                  </tr>
                </thead>
                <tbody id="tb_DriverUpcomingDrives"></tbody>
              </table>
            </div>
          </div>
          <div id="riderDB" style={{display: 'none'}}>
            <h4>Today's Rides</h4>
            <div id='div_RiderUpcomingRides'>
              <table>
                <thead>
                  <tr>
                    <th>Area</th>
                    <th>Date</th>
                    <th>Time</th>
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
