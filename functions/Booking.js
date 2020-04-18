import React, { Component } from 'react';
import { Text, View } from 'react-native';
import firebase from '../base';
import 'firebase/firestore';
import {user} from './Login';
import * as Datetime from "react-datetime";
var moment = require('moment');

var userDetails = [];
var payMethod;

class Booking extends React.Component {
    constructor(props) {

      super(props);
      this.handleChange = this.handleChange.bind(this);
      this.createBooking = this.createBooking.bind(this);
      this.submitCreateBooking = this.submitCreateBooking.bind(this);
      this.viewMyBookings = this.viewMyBookings.bind(this);
      this.viewAllBookings = this.viewAllBookings.bind(this);
      this.viewBooking = this.viewBooking.bind(this);
      this.viewCreatedBooking = this.viewCreatedBooking.bind(this);
      this.joinBooking = this.joinBooking.bind(this);
      this.cancelBooking = this.cancelBooking.bind(this);
      this.deleteBooking = this.deleteBooking.bind(this);
      this.state = {
        description: '',
        currPassengers: '',
        payMethod: '',
        date: Datetime.moment()
      }
    }

    onChange = date => this.setState({
      date
    })

    // handles change
    handleChange(e) {
      this.setState({
        [e.target.name]: e.target.value
      });
    }

    valid = (current) => {
      let yesterday = Datetime.moment().subtract(1, 'day');
      return current.isAfter(yesterday);
    };

    // goes back to login page if stumble upon another page by accident without logging in
    componentDidMount() {
      if (typeof user[3] === 'undefined') {
        firebase.auth().signOut();
      } else {
        if (user[6].toLowerCase() === "no" && user[5].toLowerCase() === "no") { //isAdmin
          document.getElementById('btnCreateBooking').style.display = "none";
          document.getElementById('btnViewCreatedBooking').style.display = "none";
        }

        if (user[6].toLowerCase() === "yes") { //isAdmin
          document.getElementById('btnViewMyBookings').style.display = "none";
          document.getElementById('btnCreateBooking').style.display = "none";
          document.getElementById('btnViewCreatedBooking').style.display = "none";
        }

        this.viewAllBookings();
      }
    }

    // view all available bookings and displays in table
    viewAllBookings = () => {
      const self = this;
      document.getElementById('tb_AllBookings').innerHTML = '';

      document.getElementById('div_availBookings').style.display = "block";
      document.getElementById('div_createBooking').style.display = "none";
      document.getElementById('div_myBookings').style.display = "none";
      document.getElementById('div_viewSelectedBooking').style.display = "none";
      document.getElementById('div_viewCreatedBooking').style.display = "none";

      // get all accounts
      firebase.database().ref('accounts')
        .orderByChild('email')
        .once('value')
        .then(function (snapshot) {
          var i = 0;
          snapshot.forEach(function (child) {
            userDetails[i] = child.key + ":" + child.val().uname + ":" + child.val().fname + ":" + child.val().lname;
            i++;
          })
        });

      const database = firebase.database().ref('bookings').orderByChild('date').startAt(Date.now());
      database.once('value', function (snapshot) {
        if (snapshot.exists()) {
          let content = '';
          let rowCount = 0;
          snapshot.forEach(function (data) {
            let area = data.val().area;
            let date = moment.unix(data.val().date / 1000).format("DD MMM YYYY hh:mm a");
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
            content += '<td>' + driver + '</td>';
            content += '<td>' + passengers + '</td>';
            content += '<td id=\'btnViewBooking' + rowCount + '\'></td>';
            content += '</tr>';

            rowCount++;
          });

          document.getElementById('tb_AllBookings').innerHTML += content;

          for (let v = 0; v < rowCount; v++) {
            let btn = document.createElement('input');
            btn.setAttribute('type', 'button')
            btn.setAttribute('value', 'View');
            btn.onclick = self.viewBooking;
            document.getElementById('btnViewBooking' + v).appendChild(btn);

            console.log(btn);
          }
        }
      });
    }

    // view the booking clicked
    viewBooking = e => {
      document.getElementById('td_viewSelectedBooking_currPassengers').innerHTML = null;
      document.getElementById('td_viewSelectedBooking_bookingID').innerHTML = null;
      document.getElementById('td_viewSelectedBooking_driverName').innerHTML = null;
      document.getElementById('td_viewSelectedBooking_date').innerHTML = null;
      document.getElementById('td_viewSelectedBooking_area').innerHTML = null;
      document.getElementById('td_viewSelectedBooking_meeting').innerHTML = null;
      document.getElementById('td_viewSelectedBooking_slotsLeft').innerHTML = null;

      var bookingID = e.target.parentElement.parentElement.id;
      console.log(bookingID)

      document.getElementById('div_availBookings').style.display = "none";
      document.getElementById('div_createBooking').style.display = "none";
      document.getElementById('div_myBookings').style.display = "none";
      document.getElementById('div_viewSelectedBooking').style.display = "block";
      document.getElementById('div_viewCreatedBooking').style.display = "none";

      // get all accounts
      firebase.database().ref('accounts')
        .orderByChild('email')
        .once('value')
        .then(function (snapshot) {
          var i = 0;
          snapshot.forEach(function (child) {
            userDetails[i] = child.key + ":" + child.val().uname + ":" + child.val().fname + ":" + child.val().lname;
            i++;
          })
        });

      const database = firebase.database().ref('bookings');
      database.once('value', function (snapshot) {
        if (snapshot.exists()) {
          snapshot.forEach(function (data) {
            if (data.key === bookingID) {
              let area = data.val().area;
              let date = moment.unix(data.val().date / 1000).format("DD MMM YYYY hh:mm a");
              payMethod = data.val().payMethod;
              let ppl = [];

              if (data.val().currPassengers != "") {
                ppl = data.val().currPassengers.split(', ')
              }

              let slotsleft = data.val().maxPassengers - ppl.length;
              let id = data.val().driverID;
              let driver = '';

              for (let i = 0; i < userDetails.length; i++) {
                let key = [];
                key = userDetails[i].split(':');
                if (key[0] === id) {
                  driver = key[1]; // gets username
                }
              }

              console.log(user[6].toLowerCase() === "yes", id, user[9], id === user[9], ppl.includes(user[2]), slotsleft > 0)
              document.getElementById('td_viewSelectedBooking_bookingID').innerHTML = bookingID;
              document.getElementById('td_viewSelectedBooking_driverName').innerHTML = driver;
              document.getElementById('td_viewSelectedBooking_date').innerHTML = date;
              document.getElementById('td_viewSelectedBooking_area').innerHTML = area;
              document.getElementById('td_viewSelectedBooking_meeting').innerHTML = meeting;
              document.getElementById('td_viewSelectedBooking_slotsLeft').innerHTML = slotsleft;

              if (user[6].toLowerCase() === "yes") { // admin
                document.getElementById('btnJoinBooking').style.display = "none";
                document.getElementById('btnCancelBooking').style.display = "none";
                document.getElementById('btnDeleteBooking').style.display = "none";
              }
              else {
                if (driver === user[2]) { // owner of booking and not admin
                  document.getElementById('btnJoinBooking').style.display = "none";
                  document.getElementById('btnCancelBooking').style.display = "none";
                  document.getElementById('btnDeleteBooking').style.display = "inline-block";
                }
                else {
                  if (ppl.includes(user[2])) { // if already joined booking, not owner of booking and not admin
                    document.getElementById('btnJoinBooking').style.display = "none";
                    document.getElementById('btnCancelBooking').style.display = "inline-block";
                    document.getElementById('btnDeleteBooking').style.display = "none";
                  }
                  else {
                    if (slotsleft > 0) { // if not full, not joined booking, not owner of booking and not admin
                      document.getElementById('btnJoinBooking').style.display = "inline-block";
                      document.getElementById('btnCancelBooking').style.display = "none";
                      document.getElementById('btnDeleteBooking').style.display = "none";
                    }
                    else { // if full, not joined booking, not owner of booking and not admin
                      document.getElementById('btnJoinBooking').style.display = "none";
                      document.getElementById('btnCancelBooking').style.display = "none";
                      document.getElementById('btnDeleteBooking').style.display = "none";
                    }
                  }
                }
              }

              if (ppl.length > 0) {
                document.getElementById('td_viewSelectedBooking_currPassengers').innerHTML = data.val().currPassengers;
                document.getElementById('tr_viewSelectedBooking_currPassengers').style.visibility = "visible";
              } else {
                document.getElementById('tr_viewSelectedBooking_currPassengers').style.visibility = "hidden";
              }
            }
          });
        }
      });
    }

    extendJoinBooking() {
      document.getElementById('btnSubmitJoinBooking').style.display = "inline-block";
      document.getElementById('ddPayBy').style.display = "inline-block";
      document.getElementById('btnJoinBooking').style.display = "none";
    }

    // join booking
    joinBooking = () => {
      const bookingID = document.getElementById('td_viewSelectedBooking_bookingID').innerHTML;
      let currPassengers = document.getElementById('td_viewSelectedBooking_currPassengers').innerHTML;
      console.log(currPassengers);

      console.log(payMethod);

      if (payMethod === ""){
        payMethod += document.getElementById('ddPayBy').value;
      } else{
        payMethod += (", " + document.getElementById('ddPayBy').value);
      }

      if (currPassengers === "") {
        currPassengers += user[2];
      } else {
        currPassengers += (", " + user[2]);
      }

      const accountsRef = firebase.database().ref('bookings/' + bookingID);
      const bookingDetails = {
        currPassengers: currPassengers,
        payMethod: payMethod
      }

      accountsRef.update(bookingDetails);
      this.state = {
        currPassengers: '',
        payMethod: ''
      };

      currPassengers = '';
      payMethod = '';
      document.getElementById('btnSubmitJoinBooking').style.display = "none";
      document.getElementById('ddPayBy').style.display = "none";
      this.viewMyBookings();
    }

    // cancel booking
    cancelBooking = () => {
      const bookingID = document.getElementById('td_viewSelectedBooking_bookingID').innerHTML;
      let currPassengers = document.getElementById('td_viewSelectedBooking_currPassengers').innerHTML;
      let passengers = [];
      passengers = currPassengers.split(', ');
      let payby = [];
      payby = payMethod.split(', ');
      let pos = passengers.indexOf(user[2]);
      let payToPush = '';
      let passengerToPush = '';

      console.log(pos, payby, payby[pos]);

      if (pos === 0 && passengers.length === 1) {
        currPassengers = '';
        payMethod = '';
      } 
      else {
        passengers[pos] = '';
        let temppassengers = [];
        passengers.forEach(function(p) {
          if (p != '') {
            temppassengers.push(p);
          }
        });

        payby[pos] = '';
        let temppay = [];
        payby.forEach(function (p) {
          if (p != '') {
            temppay.push(p);
          }
        });

        for (let p = 0; p < temppay.length; p++) {
          if (temppay[p] != '') {
            if (p != temppay.length - 1) {
              payToPush += temppay[p] + ", ";
              passengerToPush += temppassengers[p] + ", ";
            } else {
              payToPush += temppay[p];
              passengerToPush += temppassengers[p];
            }
          }
        }
      }

      const accountsRef = firebase.database().ref('bookings/' + bookingID);
      const bookingDetails = {
        currPassengers: passengerToPush,
        payMethod: payToPush
      }

      accountsRef.update(bookingDetails);
      this.state = {
        currPassengers: '',
        payMethod: ''
      };

      currPassengers = '';
      this.viewMyBookings();
    }

    // delete booking
    deleteBooking = () => {
      const bookingID = document.getElementById('td_viewSelectedBooking_bookingID').innerHTML;
      const accountsRef = firebase.database().ref('bookings/' + bookingID);
      accountsRef.remove();
      this.viewMyBookings();
    }

    // view my bookings
    viewMyBookings = () => {
      const self = this;
      document.getElementById('tb_myBookings').innerHTML = '';

      document.getElementById('div_availBookings').style.display = "none";
      document.getElementById('div_createBooking').style.display = "none";
      document.getElementById('div_myBookings').style.display = "block";
      document.getElementById('div_viewSelectedBooking').style.display = "none";
      document.getElementById('div_viewCreatedBooking').style.display = "none";

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

      const database = firebase.database().ref('bookings').orderByChild('date');
      database.once('value', function (snapshot) {
        if (snapshot.exists()) {
          let content = '';
          let rowCount = 0;
          snapshot.forEach(function (data) {
            if (data.val().currPassengers != "") {
              if (data.val().currPassengers.includes(user[2])) {
                let area = data.val().area;
                let date = moment.unix(data.val().date / 1000).format("DD MMM YYYY hh:mm a");
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
                content += '<td>' + driver + '</td>';
                content += '<td>' + passengers + '</td>';
                content += '<td id=\'btnViewMyBooking' + rowCount + '\'></td>';
                content += '</tr>';

                rowCount++;
              }
            }
          });

          document.getElementById('tb_myBookings').innerHTML += content;

          for (let v = 0; v < rowCount; v++) {
            let btn = document.createElement('input');
            btn.setAttribute('type', 'button')
            btn.setAttribute('value', 'View');
            btn.onclick = self.viewBooking;
            document.getElementById('btnViewMyBooking' + v).appendChild(btn);
          }
        }
      });
    }

    // view created bookings by driver
    viewCreatedBooking = () => {
      const self = this;
      document.getElementById('tb_CreatedBookings').innerHTML = '';

      document.getElementById('div_availBookings').style.display = "none";
      document.getElementById('div_createBooking').style.display = "none";
      document.getElementById('div_myBookings').style.display = "none";
      document.getElementById('div_viewSelectedBooking').style.display = "none";
      document.getElementById('div_viewCreatedBooking').style.display = "block";


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

      const database = firebase.database().ref('bookings').orderByChild('date').startAt(Date.now());
      database.once('value', function (snapshot) {
        if (snapshot.exists()) {
          let content = '';
          let rowCount = 0;
          snapshot.forEach(function (data) {
            if (data.val().driverID === user[9]) {
              let area = data.val().area;
              let date = moment.unix(data.val().date / 1000).format("DD MMM YYYY hh:mm a");
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
              content += '<td>' + driver + '</td>';
              content += '<td>' + passengers + '</td>';
              content += '<td id=\'btnViewCreatedBooking' + rowCount + '\'></td>';
              content += '</tr>';

              rowCount++;
            }
          });

          document.getElementById('tb_CreatedBookings').innerHTML += content;

          for (let v = 0; v < rowCount; v++) {
            let btn = document.createElement('input');
            btn.setAttribute('type', 'button')
            btn.setAttribute('value', 'View');
            btn.onclick = self.viewBooking;
            document.getElementById('btnViewCreatedBooking' + v).appendChild(btn);
          }
        }
      });
    }

    // display create booking information, binds area from db
    createBooking = () => {
      document.getElementById('div_availBookings').style.display = "none";
      document.getElementById('div_createBooking').style.display = "block";
      document.getElementById('div_myBookings').style.display = "none";
      document.getElementById('div_viewSelectedBooking').style.display = "none";
      document.getElementById('div_viewCreatedBooking').style.display = "none";

      document.getElementById('driverID').innerHTML = user[9];

      const database = firebase.database().ref().child('admin/area');
      database.once('value', function (snapshot) {
        if (snapshot.exists()) {
          let content = '';

          snapshot.forEach(function (child) {
            let newarea = [];
            newarea = child.val().split(',');

            content += "<option value=\"";
            content += newarea[0];
            content += "\">" + newarea[0];
            content += "</option>";
          });
          document.getElementById('ddArea').innerHTML += content;
        }
      });
    }

    // submits created booking into realtime db
    submitCreateBooking(e) {
      // // checks for duplicate username
      // var i = 0;
      // var unameCheck = false;
      // while (i < unameArr.length) {
      //   if (this.state.username === unameArr[i]) {
      //     alert("Username has already been registered");
      //     unameCheck = false;
      //     break;
      //   } else {
      //     unameCheck = true;
      //   }
      //   i++;
      // }

      // checks empty description field
      if (this.state.description == null || this.state.description == "") {
        alert("Please enter zipcode or description of area");
      } else {
        const bookingsRef = firebase.database().ref('bookings');
        const booking = {
          driverID: user[9],
          date: Date.parse((this.state.date)),
          area: document.getElementById('ddArea').value,
          maxPassengers: document.getElementById('ddPassengers').value,
          currPassengers: '',
          payMethod: ''
        }
        // user[0] = account.fname;
        // user[9] = account.key;

        bookingsRef.push(booking);
        this.state = {
          description: '',
          currPassengers: '',
          date: Datetime.moment()
        };
        document.getElementById('ddArea').selectedIndex = "0";
        document.getElementById('ddPassengers').selectedIndex = "0";
        document.getElementById('txtDescription').value = "";

        document.getElementById('div_availBookings').style.display = "block";
        document.getElementById('div_createBooking').style.display = "none";
        document.getElementById('div_myBookings').style.display = "none";
        document.getElementById('div_viewSelectedBooking').style.display = "none";
        document.getElementById('div_viewCreatedBooking').style.display = "none";
      }
    }

    filterChange = () => {
      const self = this;
      let areaNames = [];
      document.getElementById('tb_AllBookings').innerHTML = '';

      document.getElementById('div_availBookings').style.display = "block";
      document.getElementById('div_createBooking').style.display = "none";
      document.getElementById('div_myBookings').style.display = "none";
      document.getElementById('div_viewSelectedBooking').style.display = "none";
      document.getElementById('div_viewCreatedBooking').style.display = "none";

      // get all accounts
      firebase.database().ref('accounts')
        .orderByChild('email')
        .once('value')
        .then(function (snapshot) {
          var i = 0;
          snapshot.forEach(function (child) {
            userDetails[i] = child.key + ":" + child.val().uname + ":" + child.val().fname + ":" + child.val().lname;
            i++;
          })
        });

      // get all area
      const areadatabase = firebase.database().ref().child('admin/area');
      areadatabase.once('value', function (snapshot) {
        if (snapshot.exists()) {
          snapshot.forEach(function (child) {
            let newarea = [];
            newarea = child.val().split(',');
            if (document.getElementById('ddFilterArea').value === newarea[1]) {
              areaNames.push(newarea[0]);
            }
          });
        }
      });

      console.log(areaNames);

      const database = firebase.database().ref('bookings').orderByChild('date').startAt(Date.now());
      database.once('value', function (snapshot) {
        if (snapshot.exists()) {
          let content = '';
          let rowCount = 0;
          snapshot.forEach(function (data) {
            for (var v = 0; v < areaNames.length; v++) {
              if (areaNames[v] === data.val().area) {
                let area = data.val().area;
                let date = moment.unix(data.val().date / 1000).format("DD MMM YYYY hh:mm a");
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
                content += '<td>' + driver + '</td>';
                content += '<td>' + passengers + '</td>';
                content += '<td id=\'btnViewBooking' + rowCount + '\'></td>';
                content += '</tr>';

                rowCount++;
              }
            }
          });

          document.getElementById('tb_AllBookings').innerHTML += content;

          for (let v = 0; v < rowCount; v++) {
            let btn = document.createElement('input');
            btn.setAttribute('type', 'button')
            btn.setAttribute('value', 'View');
            btn.onclick = self.viewBooking;
            document.getElementById('btnViewBooking' + v).appendChild(btn);

            console.log(btn);
          }
        }
      });
    }

  render() {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <div id='bookPage'>
          <div>
            <h1>This is the booking tab</h1>
          </div>
          <div>
            <button id='btnViewAllBookings' onClick={ this.viewAllBookings }>View All Rides</button>
            <button id='btnViewMyBookings' onClick={ this.viewMyBookings }>View My Rides</button>
            <button id='btnCreateBooking' onClick={ this.createBooking }>Create A Ride</button>
            <button id='btnViewCreatedBooking' onClick={ this.viewCreatedBooking }>View My Created Rides</button>
            <br />
            <br />
          </div>

          <div id='div_myBookings' style={{display: 'none'}}>
            <table id="tbl_MyBookings">
              <thead>
                <tr>
                  <th>Area</th>
                  <th>Date & Time</th>
                  <th>Driver</th>
                  <th>No. of Passengers</th>
                </tr>
              </thead>
              <tbody id="tb_myBookings"></tbody>
            </table>
          </div>

          <div id='div_viewCreatedBooking' style={{display: 'none'}}>
            <table id="tbl_CreatedBookings">
              <thead>
                <tr>
                  <th>Area</th>
                  <th>Date & Time</th>
                  <th>Driver</th>
                  <th>No. of Passengers</th>
                </tr>
              </thead>
              <tbody id="tb_CreatedBookings"></tbody>
            </table>
          </div>

          <div id='div_availBookings'>
            <select id="ddFilterArea" onChange={this.filterChange} style={{width: '5em'}} required>
              <option>North</option>
              <option>South</option>
              <option>East</option>
              <option>West</option>
              <option>Central</option>
            </select>  
            <br/>
            <br/>
            <table id="tbl_AllBookings">
              <thead>
                <tr>
                  <th>Area</th>
                  <th>Date & Time</th>
                  <th>Driver</th>
                  <th>No. of Passengers</th>
                </tr>
              </thead>
              <tbody id="tb_AllBookings"></tbody>
            </table>
          </div>

          <div id='div_viewSelectedBooking' style={{display: 'none'}}>
            <table id="tbl_AllBookings">
              <tbody>
                <tr>
                  <td>Booking ID:</td>
                  <td id='td_viewSelectedBooking_bookingID'></td>
                </tr>
                <tr>
                  <td>Driver Username:</td>
                  <td id='td_viewSelectedBooking_driverName'></td>
                </tr>
                <tr>
                  <td>Date & Time:</td>
                  <td id='td_viewSelectedBooking_date'></td>
                </tr>
                <tr>
                  <td>Area:</td>
                  <td id='td_viewSelectedBooking_area'></td>
                </tr>
                <tr>
                  <td>Slots left:</td>
                  <td id='td_viewSelectedBooking_slotsLeft'></td>
                </tr>
                <tr id='tr_viewSelectedBooking_currPassengers'>
                  <td>Passengers:</td>
                  <td id='td_viewSelectedBooking_currPassengers'></td>
                </tr>
              </tbody>
            </table>
            <br />
            <button id='btnJoinBooking' onClick={ this.extendJoinBooking }>Join Booking</button>
            <select id="ddPayBy" style={{display: 'none'}} required>
              <option value="wallet">Pay by E-Wallet</option>
              <option value="cash">Pay by cash</option>
            </select>
            <button id='btnSubmitJoinBooking' onClick={ this.joinBooking } style={{display: 'none'}}>Join Booking</button>
            <button id='btnCancelBooking' onClick={ this.cancelBooking }>Cancel Booking</button>
            <button id='btnDeleteBooking' onClick={ this.deleteBooking }>Delete Booking</button>
          </div>

          <div id='div_createBooking' style={{display: 'none'}}>
            <table>
              <tbody>
                <tr>
                  <td>Driver ID</td>
                  <td><label id="driverID" /></td>
                </tr>
                <tr>
                  <td>Date & Time</td>
                  <Datetime isValidDate={this.valid} locale="en-sg" id='datepicker' onChange={this.onChange} value={this.state.date} required />
                </tr>
                <tr>
                  <td>Area</td>
                  <td>
                    <select id="ddArea" style={{width: '13em'}} required></select>
                  </td>
                </tr>
                <tr>
                  <td>No. of Passengers</td>
                  <td>
                    <select id="ddPassengers">
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5</option>
                      <option value="6">6</option>
                      <option value="7">7</option>
                    </select>
                  </td>
                </tr>
              </tbody>
            </table>
            <br />
            <div style={{textAlign: 'center'}}>
              <button onClick={this.submitCreateBooking}>Submit</button>
              <button onClick={this.viewAllBookings} style={{marginLeft: '25px'}}>Cancel</button>
            </div>
          </div>
        </div>
      </View>
      );
    }
  }

export default Booking;
