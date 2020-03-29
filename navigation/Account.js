import React, { Component } from 'react';
import { Text, View } from 'react-native';
import firebase from '../firebase/base';
import 'firebase/firestore';
import {user} from './Login';

var clickedUser;
var Util = require('../util/Util');

class Account extends React.Component {
  constructor(props) {

    super(props);
    this.logout = this.logout.bind(this);
    this.submitEditProfile = this.submitEditProfile.bind(this);
    this.submitPassword = this.submitPassword.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.state = {
      firstName: '',
      lastName: '',
      username: '',
      email: '',
      newPassword: '',
      confirmPassword: '',
      isDriver: '',
      isAdmin: '',
      id: ''
    };
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

  editProfile() {
    Util.editProfile();
  }

  submitEditProfile(e) {
    e.preventDefault();
    if (this.state.firstName != "" && this.state.lastName != "") {
      user[0] = this.state.firstName;
      user[1] = this.state.lastName;

      const accountsRef = firebase.database().ref('accounts/' + user[7]);
      accountsRef.orderByChild('email')
        .equalTo(user[3])
        .once('value')
        .then(function (snapshot) {
          snapshot.ref.update({
            fname: user[0]
          })
          snapshot.ref.update({
            lname: user[1]
          })
        });

      //Util.updateProfile(user[3], user[0], user[1], user[7]);
    }

    else if (this.state.firstName != "" && this.state.lastName === "") {
      user[0] = this.state.firstName;

      const accountsRef = firebase.database().ref('accounts/' + user[7]);
      accountsRef.orderByChild('email')
        .equalTo(user[3])
        .once('value')
        .then(function (snapshot) {
          snapshot.ref.update({
            fname: user[0]
          })
        });
    }

    else if (this.state.firstName == "" && this.state.lastName != "") {
      user[1] = this.state.lastName;

      const accountsRef = firebase.database().ref('accounts/' + user[7]);
      accountsRef.orderByChild('email')
        .equalTo(user[3])
        .once('value')
        .then(function (snapshot) {
          snapshot.ref.update({
            lname: user[1]
          })
        });
    }

    else {
      alert("Account was not updated.")
    }
    document.getElementById('lblfName').innerHTML = user[0];
    document.getElementById('lbllName').innerHTML = user[1];

    Util.profilePageReset();

    document.getElementById('editfName').value = "";
    document.getElementById('editlName').value = "";
  }

  cancelEditProfile() {
    Util.profilePageReset();

    document.getElementById('editfName').value = "";
    document.getElementById('editlName').value = "";
  }

  changePassword() {
    document.getElementById('tblProfile').style.display = 'none';
    document.getElementById('tblPassword').style.display = 'block';

    document.getElementById('lblfName').style.display = 'none';
    document.getElementById('lbllName').style.display = 'none';

    document.getElementById('editfName').style.display = 'none';
    document.getElementById('editlName').style.display = 'none';

    document.getElementById('editButton').style.display = 'none';
    document.getElementById('changePasswordButton').style.display = 'none';
    document.getElementById('submitEditButton').style.display = 'none';
    document.getElementById('cancelEditButton').style.display = 'none';
    document.getElementById('submitPasswordButton').style.display = 'inline';
    document.getElementById('cancelPasswordButton').style.display = 'inline';

    document.getElementById('editfName').value = "";
    document.getElementById('editlName').value = "";
  }

  submitPassword(e) {
    e.preventDefault();

    if (this.state.newPassword === this.state.confirmPassword) {
      var user = firebase.auth().currentUser;

      user.updatePassword(this.state.confirmPassword).then(function () {
        alert("Password updated successfully!");
      }).catch(function (error) {
        alert(error);
      });

      Util.profilePageReset();

    document.getElementById('editNewPassword').value = "";
    document.getElementById('confirmNewPassword').value = "";
    }
    else {
      alert("Passwords do not match!");
    }
  }

  cancelPassword() {
    Util.profilePageReset();

    document.getElementById('editNewPassword').value = "";
    document.getElementById('confirmNewPassword').value = "";
  }


  viewUserProfile() {
    document.getElementById('otherAcctPage').style.display = "block";
    document.getElementById('homePage').style.display = "none";
    document.getElementById('bookPage').style.display = "none";
    document.getElementById('msgsPage').style.display = "none";
    document.getElementById('acctPage').style.display = "none";

    const accountsRef = firebase.database().ref('accounts');
    accountsRef.orderByChild('uname')
      .equalTo(clickedUser)
      .once('value')
      .then(function (snapshot) {
        snapshot.forEach(function(child) {
          lblotherfName.innerHTML = child.val().fname;
          lblotherlName.innerHTML = child.val().lname;
          lblotherEmail.innerHTML = child.val().email;
          lblotherDriver.innerHTML = child.val().isDriver;
          lblotherAdmin.innerHTML = child.val().isAdmin;
          console.log(child.val().fname, child.val().email);
        });
      })
  }

render() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <div id='acctPage'>
        <div>
          <h1>{user[2] + "'s Account"}</h1>
          <table id='tblProfile'>
            <tr>
              <td>First Name:</td>
              <td>
                <label id='lblfName' style={{display:'inline'}}>{user[0]}</label>
                <input id='editfName' style={{display:'none'}} value={this.state.firstName} onChange={this.handleChange} type="text" name="firstName" />
              </td>
            </tr>
            <tr>
              <td>Last Name:</td>
              <td>
                <label id='lbllName' style={{display:'inline'}}>{user[1]}</label>
                <input id='editlName' style={{display:'none'}} value={this.state.lastName} onChange={this.handleChange} type="text" name="lastName" />
              </td>
            </tr>
            <tr>
              <td>Email:</td>
              <td>
                <label id='lblEmail' style={{display:'inline'}} name='email'>{user[3]}</label>
              </td>
            </tr>
            <tr>
              <td>isDriver:</td>
              <td>
                <label id='lblDriver' name='isDriver'>{user[5]}</label>
              </td>
            </tr>
            <tr>
              <td>isAdmin:</td>
              <td>
                <label id='lblAdmin' name='isAdmin'>{user[6]}</label>
              </td>
            </tr>
          </table>
          <table id='tblPassword' style={{display: 'none'}}>
            <tr>
              <td>New Password:</td>
              <td><input id='editNewPassword' value={this.state.newPassword} onChange={this.handleChange} type="password" name="newPassword" /></td>
            </tr>
            <tr>
              <td>Confirm Password:</td>
              <td><input id='editConfirmPassword' value={this.state.confirmPassword} onChange={this.handleChange} type="password" name="confirmPassword" /></td>
            </tr>
          </table>
          <br />
          <br />
          <button id='editButton' onClick={this.editProfile}>Edit Profile</button>
          <button id='changePasswordButton' onClick={this.changePassword}>Change Password</button>
          <button id='submitEditButton' onClick={this.submitEditProfile} style={{display:'none'}}>Update</button>
          <button id='cancelEditButton' onClick={this.cancelEditProfile} style={{display:'none'}}>Cancel</button>
          <button id='submitPasswordButton' onClick={this.submitPassword} style={{display:'none'}}>Update</button>
          <button id='cancelPasswordButton' onClick={this.cancelPassword} style={{display:'none'}}>Cancel</button>
          <br />
          <br />
          <button onClick={this.logout}>Logout</button>
        </div>
        <br />
      </div>
    </View>
    );
  }
}

export default Account;
