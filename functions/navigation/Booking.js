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
import { Map, Marker, GoogleApiWrapper } from "google-maps-react";
import GooglePlacesAutocomplete from 'react-google-places-autocomplete';
import 'react-google-places-autocomplete/dist/index.min.css';

var userDetails = [];
var payMethod;
var PostalCode;

class Booking extends React.Component {
    constructor(props) {

      super(props);
      this.valid = this.valid.bind(this);
      this.handleChange = this.handleChange.bind(this);
      this.onChange = this.onChange.bind(this);
      this.createBooking = this.createBooking.bind(this);
      this.submitCreateBooking = this.submitCreateBooking.bind(this);
      this.viewMyBookings = this.viewMyBookings.bind(this);
      this.viewAllBookings = this.viewAllBookings.bind(this);
      this.viewBooking = this.viewBooking.bind(this);
      this.viewCreatedBooking = this.viewCreatedBooking.bind(this);
      this.joinBooking = this.joinBooking.bind(this);
      this.cancelBooking = this.cancelBooking.bind(this);
      this.deleteBooking = this.deleteBooking.bind(this);
      this.filterChange = this.filterChange.bind(this);
      this.removePassenger = this.removePassenger.bind(this);
      this.confirmRemovePassenger = this.confirmRemovePassenger.bind(this);
      this.showRecurring = this.showRecurring.bind(this);
      this.state = {
        currPassengers: '',
        payMethod: '',
        date: Datetime.moment(),
        postal: '',
        removeReason: '',
        recurringWeeks: 1,
        createArea: 'Admiralty',
        createTowards: 'School',
        createMaxPassengers: '1'
      }
    }

    onChange(date) {
      this.setState({ date: date })
    }

    // handles change
    handleChange(e) {
      this.setState({
        [e.target.name]: e.target.value
      });
      //alert(this.state.createMaxPassengers);
    }

    valid(current) {
      let yesterday = Datetime.moment().subtract(1, 'day');
      return current.isAfter(yesterday);
    }

    showRecurring() {
      if (document.getElementById('cbRecurring').checked === true){
        document.getElementById('tr_showRecurring').style.display = 'inline-block';
      }
      else {
        document.getElementById('tr_showRecurring').style.display = 'none';
      }
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
              if (user[6] === "no" && user[5] === "no") { //not admin, not driver
                document.getElementById('btnCreateBooking').style.display = "none";
                document.getElementById('btnViewCreatedBooking').style.display = "none";
              }

              if (user[6] === "yes") { //isAdmin
                document.getElementById('btnViewMyBookings').style.display = "none";
                document.getElementById('btnCreateBooking').style.display = "none";
                document.getElementById('btnViewCreatedBooking').style.display = "none";
              }

              this.viewAllBookings();
            }
          }
        });
    }

    // goes back to login page if stumble upon another page by accident without logging in
    componentDidMount() {
      this.checkEmail();
    }

    // view all available bookings and displays in table
    viewAllBookings() {
      const self = this;
      document.getElementById('tb_AllBookings').innerHTML = '';

      document.getElementById('div_availBookings').style.display = "block";
      document.getElementById('div_createBooking').style.display = "none";
      document.getElementById('div_myBookings').style.display = "none";
      document.getElementById('div_viewSelectedBooking').style.display = "none";
      document.getElementById('div_viewCreatedBooking').style.display = "none";
      document.getElementById('btnSubmitJoinBooking').style.display = "none";
      document.getElementById('tbl_viewSelectedBooking_ExtendBooking').style.display = "none";

      // get all accounts
      firebase.database().ref('accounts')
        .orderByChild('email')
        .once('value')
        .then((snapshot) => {
          var i = 0;
          snapshot.forEach((child) => {
            userDetails[i] = child.key + ":" + child.val().uname + ":" + child.val().fname + ":" + child.val().lname;
            i++;
          })
        });

      const database = firebase.database().ref('bookings').orderByChild('date').startAt(Date.now());
      database.once('value', (snapshot) => {
        if (snapshot.exists()) {
          let content = '';
          let rowCount = 0;
          snapshot.forEach((data) => {
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
    viewBooking(e) {
      document.getElementById('td_viewSelectedBooking_currPassengers').innerHTML = null;
      document.getElementById('td_viewSelectedBooking_bookingID').innerHTML = null;
      document.getElementById('td_viewSelectedBooking_driverName').innerHTML = null;
      document.getElementById('td_viewSelectedBooking_date').innerHTML = null;
      document.getElementById('td_viewSelectedBooking_area').innerHTML = null;
      document.getElementById('td_viewSelectedBooking_towards').innerHTML = null;
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
        .then((snapshot) => {
          var i = 0;
          snapshot.forEach((child) => {
            userDetails[i] = child.key + ":" + child.val().uname + ":" + child.val().fname + ":" + child.val().lname;
            i++;
          })
        });

      const database = firebase.database().ref('bookings');
      database.once('value', (snapshot) => {
        if (snapshot.exists()) {
          snapshot.forEach((data) => {
            if (data.key === bookingID) {
              let area = data.val().area;
              let date = moment.unix(data.val().date / 1000).format("DD MMM YYYY hh:mm a");
              let towards = data.val().towards;
              payMethod = data.val().payMethod;
              PostalCode = data.val().postal;
              let ppl = [];
              let pay = [];
              let meet = [];

              if (data.val().currPassengers !== "") {
                ppl = data.val().currPassengers.split(', ');
                pay = payMethod.split(', ');
                meet = PostalCode.split(', ');
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
              document.getElementById('td_viewSelectedBooking_towards').innerHTML = towards;
              document.getElementById('td_viewSelectedBooking_slotsLeft').innerHTML = slotsleft;

              if (user[6].toLowerCase() === "yes") { // admin
                document.getElementById('btnJoinBooking').style.display = "none";
                document.getElementById('btnCancelBooking').style.display = "none";
                document.getElementById('btnDeleteBooking').style.display = "none";
                document.getElementById('btnRemovePassenger').style.display = "none";
                document.getElementById('btnConfirmRemovePassenger').style.display = "none";
                document.getElementById('tbl_removePassengerExtend').style.display = "none";
              }
              else {
                if (driver === user[2]) { // owner of booking and not admin
                  document.getElementById('btnJoinBooking').style.display = "none";
                  document.getElementById('btnCancelBooking').style.display = "none";
                  document.getElementById('btnDeleteBooking').style.display = "inline-block";
                  document.getElementById('btnRemovePassenger').style.display = "inline-block";
                  document.getElementById('btnConfirmRemovePassenger').style.display = "none";
                  document.getElementById('tbl_removePassengerExtend').style.display = "none";
                }
                else {
                  if (ppl.includes(user[2])) { // if already joined booking, not owner of booking and not admin
                    document.getElementById('btnJoinBooking').style.display = "none";
                    document.getElementById('btnCancelBooking').style.display = "inline-block";
                    document.getElementById('btnDeleteBooking').style.display = "none";
                    document.getElementById('btnRemovePassenger').style.display = "none";
                    document.getElementById('btnConfirmRemovePassenger').style.display = "none";
                    document.getElementById('tbl_removePassengerExtend').style.display = "none";
                  }
                  else {
                    if (slotsleft > 0) { // if not full, not joined booking, not owner of booking and not admin
                      document.getElementById('btnJoinBooking').style.display = "inline-block";
                      document.getElementById('btnCancelBooking').style.display = "none";
                      document.getElementById('btnDeleteBooking').style.display = "none";
                      document.getElementById('btnRemovePassenger').style.display = "none";
                      document.getElementById('btnConfirmRemovePassenger').style.display = "none";
                      document.getElementById('tbl_removePassengerExtend').style.display = "none";
                    }
                    else { // if full, not joined booking, not owner of booking and not admin
                      document.getElementById('btnJoinBooking').style.display = "none";
                      document.getElementById('btnCancelBooking').style.display = "none";
                      document.getElementById('btnDeleteBooking').style.display = "none";
                      document.getElementById('btnRemovePassenger').style.display = "none";
                      document.getElementById('btnConfirmRemovePassenger').style.display = "none";
                      document.getElementById('tbl_removePassengerExtend').style.display = "none";
                    }
                  }
                }
              }

              if (ppl.length > 0) {
                document.getElementById('td_viewSelectedBooking_currPassengers').innerHTML = "";
                if (driver === user[2]) {
                  for (let ct = 0; ct < ppl.length; ct++) {
                    document.getElementById('td_viewSelectedBooking_currPassengers').innerHTML += ppl[ct] + " (Pick-Up Point: " + meet[ct] + ", Paying By: " + pay[ct] + ") <br/>";
                  }
                  document.getElementById('tr_viewSelectedBooking_currPassengers').style.visibility = "visible";
                }
                else {
                  document.getElementById('td_viewSelectedBooking_currPassengers').innerHTML = data.val().currPassengers;
                  document.getElementById('tr_viewSelectedBooking_currPassengers').style.visibility = "visible";
                }
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
      document.getElementById('tbl_viewSelectedBooking_ExtendBooking').style.display = "block";
      document.getElementById('btnJoinBooking').style.display = "none";
    }

    // join booking
    joinBooking() {
      const bookingID = document.getElementById('td_viewSelectedBooking_bookingID').innerHTML;
      let currPassengers = document.getElementById('td_viewSelectedBooking_currPassengers').innerHTML;
      let bookingDate = document.getElementById('td_viewSelectedBooking_date').innerHTML;

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
      if (PostalCode === "") {  
        PostalCode += this.state.postal;
      } else {
        PostalCode += (", " + this.state.postal);
      }
      
      // checks for duplicate booking
      let dates = [];
      let check = false;
      const zip = PostalCode;

      const database = firebase.database().ref('bookings').orderByChild('date').startAt(Date.now());
      database.once('value', (snapshot) => {
        if (snapshot.exists()) {
          snapshot.forEach((data) => {
            if (data.val().currPassengers.includes(user[2])) {
              dates.push(data.val().date);
            }
          });
        }
      }).then(() => {
        var i = 0;
        
        if (dates.length === 0) {
          check = true;
        }
        else {
          while (i < dates.length) {
            if (Date.parse(bookingDate) < moment.unix(dates[i] / 1000).add(2, 'hours') && Date.parse(bookingDate) > moment.unix(dates[i] / 1000).add(-2, 'hours')) {
              alert("You have another booking set 2 hours before/after this time");
              check = false;
              break;
            } else {
              check = true;
            }
            i++;
          }
        }

        if (check) {
          if (user[8] < 5.00 && document.getElementById('ddPayBy').value === "wallet") {
            alert("You do not have sufficient funds in your e-wallet");
          }
          else {
            const accountsRef = firebase.database().ref('bookings/' + bookingID);
            const bookingDetails = {
              currPassengers: currPassengers,
              payMethod: payMethod,
              postal: zip
            }
            accountsRef.update(bookingDetails);
            this.state = {
              currPassengers: '',
              payMethod: '',
              postal: ''
            };

            payMethod = '';
            currPassengers = '';
            document.getElementById('btnSubmitJoinBooking').style.display = "none";
            document.getElementById('tbl_viewSelectedBooking_ExtendBooking').style.display = "none";
            this.viewMyBookings();
          }
        }
      });

      PostalCode = '';
    }

    // cancel booking
    cancelBooking() {
      const bookingID = document.getElementById('td_viewSelectedBooking_bookingID').innerHTML;
      let currPassengers = document.getElementById('td_viewSelectedBooking_currPassengers').innerHTML;
      let passengers = [];
      passengers = currPassengers.split(', ');
      let payby = [];
      payby = payMethod.split(', ');
      let meet = [];
      meet = PostalCode.split(', ');
      let pos = passengers.indexOf(user[2]);
      let payToPush = '';
      let passengerToPush = '';
      let meetToPush = '';

      passengers[pos] = '';
      let temppassengers = [];
      passengers.forEach((p) => {
        if (p !== '') {
          temppassengers.push(p);
        }
      });

      payby[pos] = '';
      let temppay = [];
      payby.forEach((p) => {
        if (p !== '') {
          temppay.push(p);
        }
      });

      meet[pos] = '';
      let tempmeet = [];
      meet.forEach((p) => {
        if (p !== '') {
          tempmeet.push(p);
        }
      });

      for (let p = 0; p < temppay.length; p++) {
        if (temppay[p] !== '') {
          if (p !== temppay.length - 1) {
            payToPush += temppay[p] + ", ";
            passengerToPush += temppassengers[p] + ", ";
            meetToPush += tempmeet[p] + ", ";
          } else {
            payToPush += temppay[p];
            passengerToPush += temppassengers[p];
            meetToPush += tempmeet[p];
          }
        }
      }

      const accountsRef = firebase.database().ref('bookings/' + bookingID);
      const bookingDetails = {
        currPassengers: passengerToPush,
        payMethod: payToPush,
        postal: meetToPush
      }

      accountsRef.update(bookingDetails);
      this.state = {
        currPassengers: '',
        payMethod: '',
        postal: ''
      };

      currPassengers = '';
      this.viewMyBookings();
    }

    // delete booking
    deleteBooking() {
      const bookingID = document.getElementById('td_viewSelectedBooking_bookingID').innerHTML;
      const accountsRef = firebase.database().ref('bookings/' + bookingID);
      accountsRef.remove();
      this.viewMyBookings();
    }

    // change to remove passenger view
    removePassenger() {
      const bookingID = document.getElementById('td_viewSelectedBooking_bookingID').innerHTML;
      const database = firebase.database().ref().child('bookings/' + bookingID);
      document.getElementById('ddRemovePassenger').innerHTML = "";
      database.once('value', (snapshot) => {
        if (snapshot.exists()) {
          if (snapshot.val().currPassengers !== "") {
            let content = '';
            let passengers = [];
            passengers = snapshot.val().currPassengers.split(', ');

            for (let ct = 0; ct < passengers.length; ct++) {
              content += "<option value=\"";
              content += passengers[ct];
              content += "\">" + passengers[ct];
              content += "</option>";
            }
            document.getElementById('ddRemovePassenger').innerHTML += content;
          }
          else {
            document.getElementById('ddRemovePassenger').innerHTML += "<option value='none'>No passengers available</option>";
          }
        }
      });
      document.getElementById('btnRemovePassenger').style.display = "none";
      document.getElementById('btnDeleteBooking').style.display = "none";
      document.getElementById('tbl_removePassengerExtend').style.display = "block";
    }

    confirmRemovePassenger() {
      const bookingID = document.getElementById('td_viewSelectedBooking_bookingID').innerHTML;

      if (document.getElementById('ddRemovePassenger').value === "No passengers available") {
        document.getElementById('btnConfirmRemovePassenger').style.display = "none";
      }
      else {
        document.getElementById('btnConfirmRemovePassenger').style.display = "inline-block";
      }

      const database = firebase.database().ref('bookings');
      database.once('value', (snapshot) => {
        if (snapshot.exists()) {
          snapshot.forEach((data) => {
            if (data.key === bookingID) {
              payMethod = data.val().payMethod;
              PostalCode = data.val().postal;
              let currPassengers = data.val().currPassengers;
              let passengers = [];
              let payby = [];
              let meet = [];

              if (currPassengers !== "") {
                passengers = currPassengers.split(', ');
                payby = payMethod.split(', ');
                meet = PostalCode.split(', ');
              }
            
              let pos = passengers.indexOf(document.getElementById('ddRemovePassenger').value);
              let payToPush = '';
              let passengerToPush = '';
              let meetToPush = '';

              passengers[pos] = '';
              let temppassengers = [];
              passengers.forEach((p) => {
                if (p !== '') {
                  temppassengers.push(p);
                }
              });

              payby[pos] = '';
              let temppay = [];
              payby.forEach((p) => {
                if (p !== '') {
                  temppay.push(p);
                }
              });

              meet[pos] = '';
              let tempmeet = [];
              meet.forEach((p) => {
                if (p !== '') {
                  tempmeet.push(p);
                }
              });

              for (let p = 0; p < temppay.length; p++) {
                if (temppay[p] !== '') {
                  if (p !== temppay.length - 1) {
                    payToPush += temppay[p] + ", ";
                    passengerToPush += temppassengers[p] + ", ";
                    meetToPush += tempmeet[p] + ", ";
                  } else {
                    payToPush += temppay[p];
                    passengerToPush += temppassengers[p];
                    meetToPush += tempmeet[p];
                  }
                }
              }
              const accountsRef = firebase.database().ref('bookings/' + bookingID);
              const bookingDetails = {
                currPassengers: passengerToPush,
                payMethod: payToPush,
                postal: meetToPush
              }

              const notificationRef = firebase.database().ref('notification');
              const notification = {
                uname: document.getElementById('ddRemovePassenger').value,
                date: Date.now(),
                notification: 'Removed from booking ' + bookingID,
                reason: this.state.removeReason
              }

              notificationRef.push(notification);
              accountsRef.update(bookingDetails);
              this.state = {
                currPassengers: '',
                payMethod: '',
                postal: '',
                removeReason: '',
                date: Datetime.moment()
              };
            }
          });
        }
      });

      this.viewCreatedBooking();
    }

    // view my bookings
    viewMyBookings() {
      const self = this;
      document.getElementById('tb_myBookings').innerHTML = '';

      document.getElementById('div_availBookings').style.display = "none";
      document.getElementById('div_createBooking').style.display = "none";
      document.getElementById('div_myBookings').style.display = "block";
      document.getElementById('div_viewSelectedBooking').style.display = "none";
      document.getElementById('div_viewCreatedBooking').style.display = "none";
      document.getElementById('btnSubmitJoinBooking').style.display = "none";
      document.getElementById('tbl_viewSelectedBooking_ExtendBooking').style.display = "none";

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

      const database = firebase.database().ref('bookings').orderByChild('date');
      database.once('value', (snapshot) => {
        if (snapshot.exists()) {
          let content = '';
          let rowCount = 0;
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
    viewCreatedBooking() {
      const self = this;
      document.getElementById('tb_CreatedBookings').innerHTML = '';

      document.getElementById('div_availBookings').style.display = "none";
      document.getElementById('div_createBooking').style.display = "none";
      document.getElementById('div_myBookings').style.display = "none";
      document.getElementById('div_viewSelectedBooking').style.display = "none";
      document.getElementById('div_viewCreatedBooking').style.display = "block";
      document.getElementById('btnSubmitJoinBooking').style.display = "none";
      document.getElementById('tbl_viewSelectedBooking_ExtendBooking').style.display = "none";

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

      const database = firebase.database().ref('bookings').orderByChild('date').startAt(Date.now());
      database.once('value', (snapshot) => {
        if (snapshot.exists()) {
          let content = '';
          let rowCount = 0;
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
    createBooking() {
      document.getElementById('div_availBookings').style.display = "none";
      document.getElementById('div_createBooking').style.display = "block";
      document.getElementById('div_myBookings').style.display = "none";
      document.getElementById('div_viewSelectedBooking').style.display = "none";
      document.getElementById('div_viewCreatedBooking').style.display = "none";

      document.getElementById('driverID').innerHTML = user[9];

      const database = firebase.database().ref().child('admin/area');
      database.once('value', (snapshot) => {
        if (snapshot.exists()) {
          let content = '';

          snapshot.forEach((child) => {
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
      // checks for duplicate booking
      let dates = [];
      let check = false;
      const database = firebase.database().ref('bookings').orderByChild('date').startAt(Date.now());
      database.once('value', (snapshot) => {
        if (snapshot.exists()) {
          snapshot.forEach((data) => {
            if (data.val().driverID === user[9]) {
              dates.push(data.val().date);
            }
          });
        }
      }).then(() => {
        var i = 0;
        if (dates.length === 0) {
          check = true;
        }
        else {
          while (i < dates.length) {
            if (this.state.date < moment.unix(dates[i] / 1000).add(2, 'hours') && this.state.date > moment.unix(dates[i] / 1000).add(-2, 'hours')) {
              alert("You have another booking set 2 hours before/after this time");
              check = false;
              break;
            } else {
              check = true;
            }
            i++;
          }

          if (check) {
            const date = new Date(this.state.date);
            const weeks = this.state.recurringWeeks;
            let x = 0;
            const bookingsRef = firebase.database().ref('bookings');
            while (x < weeks) {
              const booking = {
                driverID: user[9],
                date: date.setDate(date.getDate() + (7 * x)),
                area: this.state.createArea,
                maxPassengers: this.state.createMaxPassengers,
                currPassengers: '',
                payMethod: '',
                postal: '',
                towards: this.state.createTowards
              }

              bookingsRef.push(booking);
              x++;
            }
            document.getElementById('tr_showRecurring').style.display = 'none';
            document.getElementById('cbRecurring').checked = false;
            this.state = {
              date: Datetime.moment(),
              recurringWeeks: 1
            };
          }
        }
      });

     

      document.getElementById('ddArea').selectedIndex = "0";
      document.getElementById('ddPassengers').selectedIndex = "0";
      document.getElementById('ddTowards').selectedIndex = "0";

      document.getElementById('div_availBookings').style.display = "block";
      document.getElementById('div_createBooking').style.display = "none";
      document.getElementById('div_myBookings').style.display = "none";
      document.getElementById('div_viewSelectedBooking').style.display = "none";
      document.getElementById('div_viewCreatedBooking').style.display = "none";
    }

    filterChange() {
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
        .then((snapshot) => {
          var i = 0;
          snapshot.forEach((child) => {
            userDetails[i] = child.key + ":" + child.val().uname + ":" + child.val().fname + ":" + child.val().lname;
            i++;
          })
        });

      // get all area
      const areadatabase = firebase.database().ref().child('admin/area');
      areadatabase.once('value', (snapshot) => {
        if (snapshot.exists()) {
          snapshot.forEach((child) => {
            let newarea = [];
            newarea = child.val().split(',');
            if (document.getElementById('ddFilterArea').value === "All") {
              areaNames.push(newarea[0]);
            }
            else if (document.getElementById('ddFilterArea').value === newarea[1]) {
              areaNames.push(newarea[0]);
            }
          });
        }
      });

      console.log(areaNames);

      const database = firebase.database().ref('bookings').orderByChild('date').startAt(Date.now());
      database.once('value', (snapshot) => {
        if (snapshot.exists()) {
          let content = '';
          let rowCount = 0;
          snapshot.forEach((data) => {
            for (var v = 0; v < areaNames.length; v++) {
              if (areaNames[v] === data.val().area) {
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
              <option>All</option>
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
                  <td>Going:</td>
                  <td id='td_viewSelectedBooking_towards'></td>
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
            <table id='tbl_viewSelectedBooking_ExtendBooking' style={{display: 'none'}}>
              <tbody>
                <tr>
                  <td>Postal Code of Meeting/Drop-Off Point:</td>
                  <td>
                    <GooglePlacesAutocomplete 
                      id='postal' 
                      placeholder='Search' 
                      onSelect={({ description }) => (
                        this.setState({ postal: description })
                      )}
                      required 
                    />
                  </td>
                </tr>
                <tr>
                  <td>Choose Payment Method:</td>
                  <td>
                    <select id='ddPayBy' required>
                      <option value="wallet">Pay by E-Wallet</option>
                      <option value="cash">Pay by cash</option>
                    </select>
                  </td>
                </tr>
              </tbody>
            </table>
            <br />
            <button id='btnJoinBooking' onClick={ this.extendJoinBooking }>Join Booking</button>
            <button id='btnSubmitJoinBooking' onClick={ this.joinBooking } style={{display: 'none'}}>Submit Booking</button>
            <button id='btnCancelBooking' onClick={ this.cancelBooking }>Cancel Booking</button>
            <button id='btnRemovePassenger' onClick={ this.removePassenger }>Remove Passenger</button>
            <button id='btnDeleteBooking' onClick={ this.deleteBooking }>Delete Booking</button>
            <table id='tbl_removePassengerExtend' style={{display: 'none'}}>
              <tbody>
                <tr>
                  <td>Choose a passenger to remove:</td>
                  <td><select id="ddRemovePassenger"></select></td>
                </tr>
                <tr>
                  <td>Reason for removing: </td>
                  <td><input id='txtRemoveReason' value={this.state.removeReason} onChange={this.handleChange} type="text" name="removeReason" required /></td>
                </tr>
              </tbody>
            </table>
            <br/>
            <button id='btnConfirmRemovePassenger' onClick={ this.confirmRemovePassenger } style={{display: 'none'}}>Confirm Remove Passenger</button>
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
                    <select id="ddArea" style={{width: '13em'}} name='createArea' onChange={this.handleChange} required ></select>
                  </td>
                </tr>
                <tr>
                  <td>Where are you going?</td>
                  <td>
                    <select id="ddTowards" name='createTowards' onChange={this.handleChange} required >
                      <option value="School">School</option>
                      <option value="Home">Home</option>
                    </select>
                  </td>
                </tr>
                <tr>
                  <td>No. of Passengers</td>
                  <td>
                    <select id="ddPassengers" name='createMaxPassengers' onChange={this.handleChange} required >
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
                <tr>
                  <td>Recurring?</td>
                  <td>
                    <input type='checkbox' id='cbRecurring' onChange={this.showRecurring} />
                  </td>
                </tr>
                </tbody>
            </table>
            <table id='tr_showRecurring' style={{display:'none'}}>
              <tbody>
                <tr>
                  <td>No. of weeks&emsp;&emsp;&emsp;&nbsp;&nbsp;</td>
                  <td>
                    <input type='number' id='txtRecurringWeeks' name='recurringWeeks' value={this.state.recurringWeeks} onChange={this.handleChange} required />
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

export default GoogleApiWrapper({
  apiKey: "AIzaSyARHBw1DzEQDE0auV06gUQRI8iNUKmwHaY",
  libraries: ["places"]
})(Booking);
