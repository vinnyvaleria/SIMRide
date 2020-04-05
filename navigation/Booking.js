import React, { Component } from 'react';
import { Text, View } from 'react-native';
import firebase from '../firebase/base';
import 'firebase/firestore';
import {user} from './Login';

var userDetails = [];

class Booking extends React.Component {
  constructor(props) {

    super(props);
    this.logout = this.logout.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.createBooking = this.createBooking.bind(this);
    this.submitCreateBooking = this.submitCreateBooking.bind(this);
    this.viewMyBookings = this.viewMyBookings.bind(this);
    this.viewAllBookings = this.viewAllBookings.bind(this);
    this.state = {
      description: ''
    }
  }

  handleChange(e) {
    this.setState({ [e.target.name]: e.target.value });
  }

  // goes back to login page if stumble upon another page by accident without logging in
  componentDidMount() {
    if (typeof user[3] === 'undefined') {
      firebase.auth().signOut();
    }
    else {
      // load accounts
      firebase.database().ref('accounts')
      .orderByChild('email')
      .once('value')
      .then(function (snapshot) {
        var i = 0;
        snapshot.forEach(function (child) {
          userDetails[i] = child.val().uname + ":" + child.val().fname + ":" + child.val().lname;
          i++;
        })
      });
    }
  }

  logout() {
    user[0] = '';
    user[1] = '';
    user[2] = '';
    user[3] = '';
    user[4] = '';
    user[5] = '';
    user[6] = '';
    user[7] = '';

    console.log(user.email);
    firebase.auth().signOut();
  }

  // view all available bookings
  viewAllBookings = () => {
    document.getElementById('ddArea').innerHTML = '';

    document.getElementById('div_availBookings').style.display = "block";
    document.getElementById('div_createBooking').style.display = "none";
    document.getElementById('div_myBookings').style.display = "none";

    // get all accounts
    firebase.database().ref('accounts')
      .orderByChild('email')
      .once('value')
      .then(function (snapshot) {
        var i = 0;
        snapshot.forEach(function (child) {
          userDetails[i] = child.key + ":" + child.val().uname + ":" + child.val().fname + ":" + child.val().lname;
          console.log(userDetails);
          i++;
        })
      });

    var database = firebase.database().ref('bookings').orderByChild('date');
    database.once('value', function (snapshot) {
      if (snapshot.exists()) {
        var content = '';

        snapshot.forEach(function (data) {
          var area = data.val().area;
          var date = data.val().date;
          var time = data.val().time;
          var ppl = [];

          if (data.val().passengers != null) {
            ppl = data.val().passengers.split(',')
          }

          var passengers = ppl.length + "/" + data.val().maxPassengers;
          var id = data.val().driverID;
          var driver = '';

          for (let i = 0; i < userDetails.length; i++) {
            var key = [];
            key = userDetails[i].split(':');
            if (key[0] === id) {
              driver = key[1];
            }
          }

          content += '<tr>';
          content += '<td>' + area + '</td>'; //column1
          content += '<td>' + date + '</td>'; //column2
          content += '<td>' + time + '</td>';
          content += '<td>' + driver + '</td>';
          content += '<td>' + passengers + '</td>';
          content += '</tr>';
        });

       document.getElementById('tb_AllBookings').innerHTML += content;
      }
    });
  }

  // view my bookings
  viewMyBookings = () => {
    document.getElementById('div_availBookings').style.display = "none";
    document.getElementById('div_createBooking').style.display = "none";
    document.getElementById('div_myBookings').style.display = "block";
  }

  createBooking = () => {
    document.getElementById('div_availBookings').style.display = "none";
    document.getElementById('div_createBooking').style.display = "block";
    document.getElementById('div_myBookings').style.display = "none";

    document.getElementById('driverID').innerHTML = user[7];

    var database = firebase.database().ref().child('admin/area');
    database.once('value', function (snapshot) {
      if (snapshot.exists()) {
        var content = '';

        snapshot.forEach(function (child) {
          var newarea = [];
          newarea = child.val().split(',');

          content += "<option value=\"";
          content += newarea[0];
          content += "\">" + newarea[0];
          content += "</option>";
        });
         document.getElementById('ddArea').innerHTML +=  content;
      }
    });
  }

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
    } 
    else {

      const bookingsRef = firebase.database().ref('bookings');
      const booking = {
        driverID: user[7],
        date: document.getElementById('txtDate').value,
        time: document.getElementById('ddMeetTime').value,
        area: document.getElementById('ddArea').value,
        description: this.state.description,
        maxPassengers: document.getElementById('ddPassengers').value,
        curPassengers: null
      }
        // user[0] = account.fname;
        // user[7] = account.key;

      bookingsRef.push(booking);
      this.state = {
        description: ''
      };
      document.getElementById('txtDate').selectedIndex = "0";
      document.getElementById('ddMeetTime').selectedIndex = "0";
      document.getElementById('ddArea').selectedIndex = "0";
      document.getElementById('ddPassengers').selectedIndex = "0";
      document.getElementById('txtDate').value = "";
      document.getElementById('txtDescription').value = "";

      document.getElementById('div_availBookings').style.display = "block";
      document.getElementById('div_createBooking').style.display = "none";
      document.getElementById('div_yourBookings').style.display = "none";
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
          <button id='btnViewAllBookings' onClick={ this.viewAllBookings }>Join A Ride</button>
          <button id='btnViewMyBookings' onClick={ this.viewMyBookings }>View My Rides</button>
          <button id='btnCreateBooking' onClick={ this.createBooking }>Create A Ride</button>
          <br/>
          <br/>
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
            <tbody>
              <tr id="tb_myBookings"></tr>
            </tbody>
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
        
        <div id='div_createBooking' style={{display: 'none'}}>
          <table>
            <tr>
              <td>Driver ID</td>
              <td><label id="driverID"/></td>
            </tr>
            <tr>
              <td>Date</td>
              <td><input id="txtDate" onChange={this.handleChange} type="date" style={{width: '12.6em'}} required="true" /></td>
            </tr>
            <tr>
              <td>Meet-Up Time</td>
              <td>
                <select id="ddMeetTime" style={{width: '13em'}} required="true">
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
                <select id="ddArea" style={{width: '13em'}} required="true"></select>
              </td>
            </tr>
            <tr>
              <td>Description</td>
              <td>
                <input id="txtDescription" value={this.state.description} onChange={this.handleChange} type="text" name="description" placeholder="Description/zipcode of area" style={{width: '12.6em'}} />
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
          </table>
          <br/>
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
