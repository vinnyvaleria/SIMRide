import React, { Component } from 'react';
import { Text, View } from 'react-native';
import firebase from '../base';
import 'firebase/firestore';
import "firebase/storage";
import {user} from './Login';
import { getPlaneDetection } from 'expo/build/AR';

var Util = require('../util/Util');

class Account extends React.Component {
    constructor(props) {

      super(props);
      this.logout = this.logout.bind(this);
      this.submitEditProfile = this.submitEditProfile.bind(this);
      this.editProfile = this.editProfile.bind(this);
      this.submitDriverDetails = this.submitDriverDetails.bind(this);
      this.submitPassword = this.submitPassword.bind(this);
      this.applyDriver = this.applyDriver.bind(this);
      this.handleChange = this.handleChange.bind(this);
      this.handleImgChange = this.handleImgChange.bind(this);
      this.state = {
        firstName: '',
        lastName: '',
        username: '',
        phone: '',
        email: '',
        newPassword: '',
        confirmPassword: '',
        isDriver: '',
        isAdmin: '',
        id: '',
        image: null,
        frontURL: '',
        backURL: '',
        progress: 0,
        license: '',
        carplate: '',
        status: '',
        dateApplied: ''
      };
    }

    // handles textbox change
    handleChange(e) {
      this.setState({
        [e.target.name]: e.target.value
      });
    }

    // handles image change
    handleImgChange = e => {
      if (e.target.files[0]) {
        const image = e.target.files[0];
        this.setState(() => ({
          image
        }));
      }
    };

    // uplaods front license pic
    handleFrontUpload = () => {
      const {
        image
      } = this.state;
      if (image != null) {
        const uploadTask = firebase.storage().ref().child(`license/${user[9]}/front`).put(image);
        uploadTask.on(
          "state_changed",
          snapshot => {
            // progress function ...
            const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
            this.setState({
              progress
            });
            console.log('Upload is ' + progress + '% done');
          },
          error => {
            // Error function ...
            alert('Error: ' + error)
            console.log(error);
          },
          () => {
            // complete function ...
            alert('Image is uploaded!');
            document.getElementById('btnImgFrontUpload').style.display = 'none';
            document.getElementById('btnImgBackUpload').style.display = 'inline-block';
            document.getElementById('td_license').innerHTML = 'License Back:';
            document.getElementById('file').value = "";
            firebase.storage()
              .ref("license/" + user[9])
              .child("front")
              .getDownloadURL()
              .then(frontURL => {
                this.setState({
                  frontURL
                });
              });
          }
        );
      } else {
        alert('Error: No file selected');
      }
    };

    // uploads back license pic
    handleBackUpload = () => {
      var date = new Date;
      var m = date.getMonth() + 1;
      var d = date.getDate();
      var y = date.getFullYear();
      var today = new Date(y, m, d);

      const {
        image
      } = this.state;
      if (image != null) {
        const uploadTask = firebase.storage().ref().child(`license/${user[9]}/back`).put(image);
        uploadTask.on(
          "state_changed",
          snapshot => {
            // progress function ...
            const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
            this.setState({
              progress
            });
            console.log('Upload is ' + progress + '% done');
          },
          error => {
            // Error function ...
            console.log(error);
          },
          () => {
            // complete function ...
            alert('Image is uploaded!')
            firebase.storage()
              .ref("license/" + user[9])
              .child("back")
              .getDownloadURL()
              .then(backURL => {
                this.setState({
                  backURL
                });
              });

            const driverDetails = {
              completed: "yes",
              dateApplied: today
            }

            accountsRef.update(driverDetails);
          }
        );
      } else {
        alert('Error: No file selected');
      }
    };

    // goes back to login page if stumble upon another page by accident without logging in
    componentDidMount() {
      if (typeof user[3] === 'undefined') {
        firebase.auth().signOut();
      } else {
        if (user[5].toString().toLowerCase() === "no") {
          firebase.database().ref('driverDetails')
            .once('value')
            .then(function (snapshot) {
              var i = 0;
              snapshot.forEach(function (child) {
                if (user[9] = child.key) {
                  if (child.val().completed === "yes") {
                    document.getElementById('btnApplyDriver').disabled = "true";
                    document.getElementById('btnApplyDriver').style.display = "inline-block";
                    document.getElementById('btnApplyDriver').innerHTML = "Application sent";
                  } else {
                    document.getElementById('btnApplyDriver').style.display = "inline-block";
                  }
                  if (user[6].toLowerCase() === "yes") {
                    document.getElementById('btnApplyDriver').style.display = "none";
                  }
                } else {
                  document.getElementById('btnApplyDriver').style.display = "inline-block";
                }
              })
            });
        }
      }
    }

    // logout
    logout() {
      user[0] = '';
      user[1] = '';
      user[2] = '';
      user[3] = '';
      user[4] = '';
      user[5] = '';
      user[6] = '';
      user[7] = '';
      user[8] = '';
      user[9] = '';

      console.log(user.email);
      firebase.auth().signOut();
    }

    // edit profile
    editProfile() {
      this.setState({
        firstName: user[0],
        lastName: user[1],
        phone: user[4]
      });
      Util.editProfile();

      document.getElementById('tblApplyDriver').style.display = 'none';
      document.getElementById('btnApplyDriver').style.display = 'none';
      document.getElementById('cancelApplyDriverButton').style.display = 'none';
      document.getElementById('btnImgFrontUpload').style.display = 'none';
      document.getElementById('btnImgBackUpload').style.display = 'none';
      document.getElementById('submitDriverDetails').style.display = 'none';
    }

    // submits the edited profile and updates the realtime db
    submitEditProfile(e) {
      e.preventDefault();
      if (this.state.firstName != "" && this.state.lastName != "" && this.state.phone != "") {
        user[0] = this.state.firstName;
        user[1] = this.state.lastName;
        user[4] = this.state.phone;

        const accountsRef = firebase.database().ref('accounts/' + user[9]);
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
            snapshot.ref.update({
              phone: user[4]
            })
          });
      } else {
        alert("Account was not updated.")
      }
      document.getElementById('lblfName').innerHTML = user[0];
      document.getElementById('lbllName').innerHTML = user[1];
      document.getElementById('lblPhone').innerHTML = user[4];

      Util.profilePageReset();

      document.getElementById('editfName').value = "";
      document.getElementById('editlName').value = "";
      document.getElementById('editPhone').value = "";
    }

    // goes back to profile page
    cancelEditProfile() {
      Util.profilePageReset();

      document.getElementById('tblApplyDriver').style.display = 'none';
      document.getElementById('btnApplyDriver').style.display = 'block';
      document.getElementById('cancelApplyDriverButton').style.display = 'none';
      document.getElementById('btnImgFrontUpload').style.display = 'none';
      document.getElementById('btnImgBackUpload').style.display = 'none';
      document.getElementById('submitDriverDetails').style.display = 'none';

      document.getElementById('editfName').value = "";
      document.getElementById('editlName').value = "";
      document.getElementById('editPhone').value = "";
    }

    // change password button
    changePassword() {
      document.getElementById('tblProfile').style.display = 'none';
      document.getElementById('tblPassword').style.display = 'block';
      document.getElementById('tblApplyDriver').style.display = 'none';

      document.getElementById('lblfName').style.display = 'none';
      document.getElementById('lbllName').style.display = 'none';
      document.getElementById('lblPhone').style.display = 'none';

      document.getElementById('editfName').style.display = 'none';
      document.getElementById('editlName').style.display = 'none';
      document.getElementById('editPhone').style.display = 'none';

      document.getElementById('editButton').style.display = 'none';
      document.getElementById('changePasswordButton').style.display = 'none';
      document.getElementById('submitEditButton').style.display = 'none';
      document.getElementById('cancelEditButton').style.display = 'none';
      document.getElementById('submitPasswordButton').style.display = 'inline';
      document.getElementById('cancelPasswordButton').style.display = 'inline';

      document.getElementById('tblApplyDriver').style.display = 'none';
      document.getElementById('btnApplyDriver').style.display = 'none';
      document.getElementById('cancelApplyDriverButton').style.display = 'none';
      document.getElementById('btnImgFrontUpload').style.display = 'none';
      document.getElementById('btnImgBackUpload').style.display = 'none';
      document.getElementById('submitDriverDetails').style.display = 'none';

      document.getElementById('editfName').value = "";
      document.getElementById('editlName').value = "";
      document.getElementById('editPhone').value = "";
    }

    // submits password change and stores into realtime db
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
      } else {
        alert("Passwords do not match!");
      }
    }

    // goes back to profile page
    cancelPassword() {
      Util.profilePageReset();

      document.getElementById('tblApplyDriver').style.display = 'none';
      document.getElementById('btnApplyDriver').style.display = 'block';
      document.getElementById('cancelApplyDriverButton').style.display = 'none';
      document.getElementById('btnImgFrontUpload').style.display = 'none';
      document.getElementById('btnImgBackUpload').style.display = 'none';
      document.getElementById('submitDriverDetails').style.display = 'none';

      document.getElementById('editNewPassword').value = "";
      document.getElementById('confirmNewPassword').value = "";
    }

    // apply to be driver button
    applyDriver() {
      document.getElementById('tblProfile').style.display = 'none';
      document.getElementById('tblPassword').style.display = 'none';
      document.getElementById('tblApplyDriver').style.display = 'block';

      document.getElementById('lblfName').style.display = 'none';
      document.getElementById('lbllName').style.display = 'none';
      document.getElementById('lblPhone').style.display = 'none';

      document.getElementById('editfName').style.display = 'none';
      document.getElementById('editlName').style.display = 'none';

      document.getElementById('editButton').style.display = 'none';
      document.getElementById('changePasswordButton').style.display = 'none';
      document.getElementById('submitEditButton').style.display = 'none';
      document.getElementById('cancelEditButton').style.display = 'none';
      document.getElementById('submitPasswordButton').style.display = 'none';
      document.getElementById('cancelPasswordButton').style.display = 'none';
      document.getElementById('btnApplyDriver').style.display = 'none';
      document.getElementById('cancelApplyDriverButton').style.display = 'inline-block';
      document.getElementById('btnImgFrontUpload').style.display = 'none';
      document.getElementById('btnImgBackUpload').style.display = 'none';
      document.getElementById('submitDriverDetails').style.display = 'inline-block';
    }

    // cancel driver application button
    cancelApplyDriver() {
      Util.profilePageReset();
      document.getElementById('tblApplyDriver').style.display = 'none';
      document.getElementById('btnApplyDriver').style.display = 'block';
      document.getElementById('cancelApplyDriverButton').style.display = 'none';
      document.getElementById('btnImgFrontUpload').style.display = 'none';
      document.getElementById('btnImgBackUpload').style.display = 'none';
      document.getElementById('submitDriverDetails').style.display = 'none';
    }

    // submits driver details into realtime db
    submitDriverDetails() {
      var date = new Date;
      var m = date.getMonth()+1;
      var d = date.getDate();
      var y = date.getFullYear() - 2;
      var yy = date.getFullYear();
      var issuedDate = new Date(document.getElementById('txtIssueDate').value);
      var today = new Date(y, m, d);
      var now = new Date(yy, m, d)

      if (this.state.license != "" && this.state.carplate != "" && this.state.license.length == 9 && (this.state.license.charAt(0) === 'S' || this.state.license.charAt(0) === 'T') && today > issuedDate) {
        const accountsRef = firebase.database().ref('driverDetails/' + user[9]);
        const driverDetails = {
          driverUname: user[2],
          carplate: this.state.carplate,
          license: this.state.license,
          issueDate: document.getElementById('txtIssueDate').value,
          completed: "no",
          status: "pending",
          dateApplied: now
        }

        accountsRef.update(driverDetails);
        this.state = {
          carplate: '',
          license: '',
          status: '',
          dateApplied: ''
        };

        document.getElementById('tblDriverDetails').style.display = 'none';
        document.getElementById('tblDriverImage').style.display = 'block';
        document.getElementById('btnImgFrontUpload').style.display = 'inline-block';
        document.getElementById('btnImgBackUpload').style.display = 'none';
        document.getElementById('submitDriverDetails').style.display = 'none';
      } else {
        if (this.state.license == "" || this.state.carplate == "") {
          alert('One or more fields are empty');
        } else if (this.state.license.length != 9 || (this.state.license.charAt(0) != 'S' && this.state.license.charAt(0) != 'T')) {
          alert('Please enter a valid license number');
        } else if (issuedDate > today) {
          alert('You must be a driver for at least 2 years');
        }
      }
    }

render() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <div id='acctPage'>
        <div>
          <h1>{user[2] + "'s Account"}</h1>
          <table id='tblProfile'>
            <tbody>
              <tr>
                <td>First Name:</td>
                <td>
                  <label id='lblfName' style={{display:'inline'}}>{user[0]}</label>
                  <input id='editfName' style={{display:'none'}} placeholder={user[0]} value={this.state.firstName}
                    onChange={this.handleChange} type="text" name="firstName" />
                </td>
              </tr>
              <tr>
                <td>Last Name:</td>
                <td>
                  <label id='lbllName' style={{display:'inline'}}>{user[1]}</label>
                  <input id='editlName' style={{display:'none'}} placeholder={user[1]} value={this.state.lastName}
                    onChange={this.handleChange} type="text" name="lastName" />
                </td>
              </tr>
              <tr>
                <td>Email:</td>
                <td>
                  <label id='lblEmail' style={{display:'inline'}} name='email'>{user[3]}</label>
                </td>
              </tr>
              <tr>
                <td>Phone:</td>
                <td>
                  <label id='lblPhone' style={{display:'inline'}}>{user[4]}</label>
                  <input id='editPhone' style={{display:'none'}} placeholder={user[4]} value={this.state.phone}
                   onChange={this.handleChange} type="phone" name="phone" />
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
            </tbody>
          </table>
          <table id='tblPassword' style={{display: 'none'}}>
            <tbody>
              <tr>
                <td>New Password:</td>
                <td><input id='editNewPassword' value={this.state.newPassword} onChange={this.handleChange}
                    type="password" name="newPassword" /></td>
              </tr>
              <tr>
                <td>Confirm Password:</td>
                <td><input id='editConfirmPassword' value={this.state.confirmPassword} onChange={this.handleChange}
                    type="password" name="confirmPassword" /></td>
              </tr>
            </tbody>
          </table>

          <div id="tblApplyDriver" style={{display: 'none'}}>
            <div>
              <table id='tblDriverDetails'>
                <tbody>
                  <tr>
                    <td>Carplate No:</td>
                    <td>
                      <input id='txtCarplate' value={this.state.carplate} onChange={this.handleChange} type="text"
                        name="carplate" />
                    </td>
                  </tr>
                  <tr>
                    <td>Issue Date:</td>
                    <td>
                      <input id='txtIssueDate' type="date" name="date" />
                    </td>
                  </tr>
                  <tr>
                    <td>License Number:</td>
                    <td>
                      <input id='txtLicenseNo' value={this.state.license} onChange={this.handleChange} type="text"
                        name="license" />
                    </td>
                  </tr>
                </tbody>
              </table>

              <div id='tblDriverImage' style={{display: 'none'}}>
                <table>
                  <tbody>
                    <tr id='uploadedFront'>
                      <td>
                        {this.state.frontURL && <img src={this.state.frontURL} height='150' width='200' />}
                      </td>
                      <td>
                        {this.state.backURL && <img src={this.state.backURL} height='150' width='200' />}
                      </td>
                    </tr>
                  </tbody>
                </table>
                <table>
                  <tbody>
                    <tr>
                      <td id='td_license'>License Front:</td>
                      <td><input type="file" id='file' accept="image/*" onChange={this.handleImgChange} /></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <br />
          <br />
          <button id='submitDriverDetails' onClick={this.submitDriverDetails} style={{display:'none'}}>Continue</button>
          <button id='btnImgFrontUpload' onClick={this.handleFrontUpload} style={{display:'none'}}>Upload Front</button>
          <button id='btnImgBackUpload' onClick={this.handleBackUpload} style={{display:'none'}}>Upload Back</button>
          <button id='cancelApplyDriverButton' onClick={this.cancelApplyDriver} style={{display:'none'}}>Cancel</button>
          <button id='editButton' onClick={this.editProfile}>Edit Profile</button>
          <button id='changePasswordButton' onClick={this.changePassword}>Change Password</button>
          <button id='submitEditButton' onClick={this.submitEditProfile} style={{display:'none'}}>Update</button>
          <button id='cancelEditButton' onClick={this.cancelEditProfile} style={{display:'none'}}>Cancel</button>
          <button id='submitPasswordButton' onClick={this.submitPassword} style={{display:'none'}}>Update</button>
          <button id='cancelPasswordButton' onClick={this.cancelPassword} style={{display:'none'}}>Cancel</button>
          <div>
            <button id='btnApplyDriver' onClick={this.applyDriver} style={{display:'none'}}>Apply to be a driver</button>
          </div>
          <br />
          <button onClick={this.logout}>Logout</button>
        </div>
      </div>
    </View>
    );
  }
}

export default Account;
