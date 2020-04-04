import React, { Component } from 'react';
import { Text, View } from 'react-native';
import firebase from '../firebase/base';
import 'firebase/firestore';
import {user} from './Login';

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
    // document.getElementById('div_availBookings').style.display = "block";
    // document.getElementById('div_createBooking').style.display = "none";
    // document.getElementById('div_yourBookings').style.display = "none";

    // var database = firebase.database().ref().child('bookings');
    // database.once('value', function (snapshot) {
    //   if (snapshot.exists()) {
    //     var content = '';

    //     snapshot.forEach(function (data) {
    //       var driver = data.val().driver;
    //       var id = data.key;
    //       content += '<tr>';
    //       content += '<td>' + driver + '</td>'; //column1
    //       content += '<td>' + JobId + '</td>'; //column2
    //       content += '</tr>';
    //     });

    //     $('#ex-table').append(content);
    //   }
    // });
  }

  // view all available bookings
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

          console.log(newarea[0], content);
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
        passengers: document.getElementById('ddPassengers').value
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
                <th>ID</th>
                <th>Driver</th>
                <th>Date</th>
                <th>Area</th>
                <th>No. of Passengers</th>
              </tr>
            </thead>
            <tbody>
              <tr id="tr">
                <td id="td_MyID"></td>
                <td id="td_MyDriver"></td>
                <td id="td_MyDate"></td>
                <td id="td_MyPassengers"></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div id='div_availBookings'>
          <table id="tbl_AllBookings">
            <thead>
              <tr>
                <th>ID</th>
                <th>Driver</th>
                <th>Date</th>
                <th>Area</th>
                <th>No. of Passengers</th>
              </tr>
            </thead>
            <tbody>
              <tr id="tr">
                <td id="td_AllID"></td>
                <td id="td_AllDriver"></td>
                <td id="td_AllDate"></td>
                <td id="td_AllPassengers"></td>
              </tr>
            </tbody>
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
                  <option value="0630">06:30</option>
                  <option value="0700">07:00</option>
                  <option value="0730">07:30</option>
                  <option value="0800">08:00</option>
                  <option value="0830">08:30</option>
                  <option value="0900">09:00</option>
                  <option value="0930">09:30</option>
                  <option value="1000">10:00</option>
                  <option value="1030">10:30</option>
                  <option value="1100">11:00</option>
                  <option value="1130">11:30</option>
                  <option value="1200">12:00</option>
                  <option value="1230">12:30</option>
                  <option value="1300">13:00</option>
                  <option value="1330">13:30</option>
                  <option value="1400">14:00</option>
                  <option value="1430">14:30</option>
                  <option value="1500">15:00</option>
                  <option value="1530">15:30</option>
                  <option value="1600">16:00</option>
                  <option value="1630">16:30</option>
                  <option value="1700">17:00</option>
                  <option value="1730">17:30</option>
                  <option value="1800">18:00</option>
                  <option value="1830">18:30</option>
                  <option value="1900">19:00</option>
                  <option value="1930">19:30</option>
                  <option value="2000">20:00</option>
                  <option value="2030">20:30</option>
                  <option value="2100">21:00</option>
                  <option value="2130">21:30</option>
                  <option value="2200">22:00</option>
                  <option value="2230">22:30</option>
                  <option value="2300">23:00</option>
                  <option value="2330">23:30</option>
                  <option value="0000">00:00</option>
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
