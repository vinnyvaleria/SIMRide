import React, { Component } from 'react';
import { Text, View } from 'react-native';
import firebase from '../base';
import 'firebase/firestore';
import {user} from './Login';

var userDetails = [];

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
      this.state = {
        description: '',
        currPassengers: ''
      }
    }

    // handles change
    handleChange(e) {
      this.setState({
        [e.target.name]: e.target.value
      });
    }

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

      const database = firebase.database().ref('bookings').orderByChild('date');
      database.once('value', function (snapshot) {
        if (snapshot.exists()) {
          let content = '';
          let rowCount = 0;
          snapshot.forEach(function (data) {
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
      document.getElementById('td_viewSelectedBooking_time').innerHTML = null;
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
              let date = data.val().date;
              let time = data.val().time;
              let meeting = data.val().description;
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
                  driver = key[1]; //gets username
                }
              }

              console.log(driver, area, date, time, meeting, slotsleft);
              document.getElementById('td_viewSelectedBooking_bookingID').innerHTML = bookingID;
              document.getElementById('td_viewSelectedBooking_driverName').innerHTML = driver;
              document.getElementById('td_viewSelectedBooking_date').innerHTML = date;
              document.getElementById('td_viewSelectedBooking_time').innerHTML = time;
              document.getElementById('td_viewSelectedBooking_area').innerHTML = area;
              document.getElementById('td_viewSelectedBooking_meeting').innerHTML = meeting;
              document.getElementById('td_viewSelectedBooking_slotsLeft').innerHTML = slotsleft;

              // checks if user already in booking or if booking is full
              if (ppl.length > 0) {
                document.getElementById('td_viewSelectedBooking_currPassengers').innerHTML = data.val().currPassengers;
                document.getElementById('tr_viewSelectedBooking_currPassengers').style.visibility = "visible";
              } else {
                document.getElementById('tr_viewSelectedBooking_currPassengers').style.visibility = "hidden";
              }
              if (slotsleft === 0 && !ppl.includes(user[2])) {
                document.getElementById('btnJoinBooking').style.display = "none";
                document.getElementById('btnCancelBooking').style.display = "none";
              } else if (ppl.includes(user[2])) {
                document.getElementById('btnJoinBooking').style.display = "none";
                document.getElementById('btnCancelBooking').style.display = "inline-block";
              } else {
                document.getElementById('btnJoinBooking').style.display = "inline-block";
                document.getElementById('btnCancelBooking').style.display = "none";
              }
              if (user[6].toLowerCase() === "yes") {
                document.getElementById('btnJoinBooking').style.display = "none";
                document.getElementById('btnCancelBooking').style.display = "none";
              }
            }
          });
        }
      });
    }

    // join booking
    joinBooking = () => {
      const bookingID = document.getElementById('td_viewSelectedBooking_bookingID').innerHTML;
      let currPassengers = document.getElementById('td_viewSelectedBooking_currPassengers').innerHTML;
      console.log(currPassengers);

      if (currPassengers === "") {
        currPassengers += user[2];
      } else {
        currPassengers += (", " + user[2]);
      }

      const accountsRef = firebase.database().ref('bookings/' + bookingID);
      const bookingDetails = {
        currPassengers: currPassengers
      }

      accountsRef.update(bookingDetails);
      this.state = {
        currPassengers: ''
      };

      currPassengers = '';
      this.viewMyBookings();
    }

    // cancel booking
    cancelBooking = () => {
      const bookingID = document.getElementById('td_viewSelectedBooking_bookingID').innerHTML;
      let currPassengers = document.getElementById('td_viewSelectedBooking_currPassengers').innerHTML;
      console.log(currPassengers);
      let passengers = [];
      passengers = currPassengers.split(", ");
      let pos = passengers.indexOf(user[2]);

      console.log(pos, passengers.length, passengers);

      if (pos === 0 && passengers.length === 1) {
        currPassengers = '';
      } else if (pos === 0 && passengers.length > 1) {
        currPassengers.replace(user[2], '');
      } else if (pos > 0 && passengers.length > 1) {
        currPassengers.replace(", " + user[2], '');
      }

      const accountsRef = firebase.database().ref('bookings/' + bookingID);
      const bookingDetails = {
        currPassengers: currPassengers
      }

      accountsRef.update(bookingDetails);
      this.state = {
        currPassengers: ''
      };

      currPassengers = '';
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

       const database = firebase.database().ref('bookings').orderByChild('date');
       database.once('value', function (snapshot) {
         if (snapshot.exists()) {
           let content = '';
           let rowCount = 0;
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
          date: document.getElementById('txtDate').value,
          time: document.getElementById('ddMeetTime').value,
          area: document.getElementById('ddArea').value,
          description: this.state.description,
          maxPassengers: document.getElementById('ddPassengers').value,
          currPassengers: ''
        }
        // user[0] = account.fname;
        // user[9] = account.key;

        bookingsRef.push(booking);
        this.state = {
          description: '',
          currPassengers: ''
        };
        document.getElementById('txtDate').selectedIndex = "0";
        document.getElementById('ddMeetTime').selectedIndex = "0";
        document.getElementById('ddArea').selectedIndex = "0";
        document.getElementById('ddPassengers').selectedIndex = "0";
        document.getElementById('txtDate').value = "";
        document.getElementById('txtDescription').value = "";

        document.getElementById('div_availBookings').style.display = "block";
        document.getElementById('div_createBooking').style.display = "none";
        document.getElementById('div_myBookings').style.display = "none";
        document.getElementById('div_viewSelectedBooking').style.display = "none";
        document.getElementById('div_viewCreatedBooking').style.display = "none";
      }
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
                  <th>Date</th>
                  <th>Time</th>
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
                  <th>Date</th>
                  <th>Time</th>
                  <th>Driver</th>
                  <th>No. of Passengers</th>
                </tr>
              </thead>
              <tbody id="tb_CreatedBookings"></tbody>
            </table>
          </div>

          <div id='div_availBookings'>
            <table id="tbl_AllBookings">
              <thead>
                <tr>
                  <th>Area</th>
                  <th>Date</th>
                  <th>Time</th>
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
                  <td>Date:</td>
                  <td id='td_viewSelectedBooking_date'></td>
                </tr>
                <tr>
                  <td>Time:</td>
                  <td id='td_viewSelectedBooking_time'></td>
                </tr>
                <tr>
                  <td>Area:</td>
                  <td id='td_viewSelectedBooking_area'></td>
                </tr>
                <tr>
                  <td>Meeting place:</td>
                  <td id='td_viewSelectedBooking_meeting'></td>
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
            <button id='btnJoinBooking' onClick={ this.joinBooking }>Join Booking</button>
            <button id='btnCancelBooking' onClick={ this.cancelBooking }>Cancel Booking</button>
          </div>

          <div id='div_createBooking' style={{display: 'none'}}>
            <table>
              <tbody>
                <tr>
                  <td>Driver ID</td>
                  <td><label id="driverID" /></td>
                </tr>
                <tr>
                  <td>Date</td>
                  <td><input id="txtDate" onChange={this.handleChange} type="date" style={{width: '12.6em'}} required />
                  </td>
                </tr>
                <tr>
                  <td>Meet-Up Time</td>
                  <td>
                    <select id="ddMeetTime" style={{width: '13em'}} required>
                      <option value="06:30">06:30</option>
                      <option value="07:00">07:00</option>
                      <option value="07:30">07:30</option>
                      <option value="08:00">08:00</option>
                      <option value="08:30">08:30</option>
                      <option value="09:00">09:00</option>
                      <option value="09:30">09:30</option>
                      <option value="10:00">10:00</option>
                      <option value="10:30">10:30</option>
                      <option value="11:00">11:00</option>
                      <option value="11:30">11:30</option>
                      <option value="12:00">12:00</option>
                      <option value="12:30">12:30</option>
                      <option value="13:00">13:00</option>
                      <option value="13:30">13:30</option>
                      <option value="14:00">14:00</option>
                      <option value="14:30">14:30</option>
                      <option value="15:00">15:00</option>
                      <option value="15:30">15:30</option>
                      <option value="16:00">16:00</option>
                      <option value="16:30">16:30</option>
                      <option value="17:00">17:00</option>
                      <option value="17:30">17:30</option>
                      <option value="18:00">18:00</option>
                      <option value="18:30">18:30</option>
                      <option value="19:00">19:00</option>
                      <option value="19:30">19:30</option>
                      <option value="20:00">20:00</option>
                      <option value="20:30">20:30</option>
                      <option value="21:00">21:00</option>
                      <option value="21:30">21:30</option>
                      <option value="22:00">22:00</option>
                      <option value="22:30">22:30</option>
                      <option value="23:00">23:00</option>
                      <option value="23:30">23:30</option>
                      <option value="00:00">00:00</option>
                    </select>
                  </td>
                </tr>
                <tr>
                  <td>Area</td>
                  <td>
                    <select id="ddArea" style={{width: '13em'}} required></select>
                  </td>
                </tr>
                <tr>
                  <td>Description</td>
                  <td>
                    <input id="txtDescription" value={this.state.description} onChange={this.handleChange} type="text"
                      name="description" placeholder="Description/zipcode of area" style={{width: '12.6em'}} />
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
