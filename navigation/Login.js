import React, { Component } from 'react';
import { Text, View } from 'react-native';
import { Link } from 'react-router-dom';
import firebase from '../firebase/base';
import { validate } from 'email-validator';

var user = new Array(8); //fname, lname, uname, email, isDriver, isAdmin, isBanned, id
var countArr = new Array(1); //account
var unameArr = [];
var emailArr = [];
var Util = require('../util/Util');

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.login = this.login.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.signup = this.signup.bind(this);
    this.state = {
      firstName: '',
      lastName: '',
      username: '',
      email: '',
      password: '',
      repassword: ''
    };
  }

  handleChange(e) {
    this.setState({ [e.target.name]: e.target.value });
  }

  componentDidMount() {
    // counts current total account registered
    firebase.database().ref('admin')
                       .orderByChild('acct')
                       .once('value')
                       .then(function(snapshot) {
                         snapshot.forEach(function(child) {
                           countArr[0] = child.val().acct;
                           console.log(child.val().acct, countArr[0]);
                      })
                    });

  // loads accounts
  firebase.database().ref('accounts')
    .orderByChild('email')
    .once('value')
    .then(function (snapshot) {
      var i = 0;
      snapshot.forEach(function (child) {
        unameArr[i] = child.val().uname;
        emailArr[i] = child.val().email;
        i++;
      })
    });

    console.log(emailArr, unameArr);
  }

  checkEmail(e) {
    user[3] = document.getElementById("signinemail").value;
    user[3] = user[3].toString().toLowerCase();

    const accountsRef = firebase.database().ref('accounts');
    accountsRef.orderByChild('email')
      .equalTo(user[3])
      .once('value')
      .then(function (snapshot) {
        snapshot.forEach(function(child) {
          user[0] = child.val().fname;
          user[1] = child.val().lname;
          user[2] = child.val().uname;
          user[4] = child.val().isDriver;
          user[5] = child.val().isAdmin;
          user[6] = child.val().isBanned;
          user[7] = child.key;
          console.log(child.val().fname, child.val().email, user[7]);
        });
      })
  }

  login(e) {
    e.preventDefault();
    var i = 1;
    var email = this.state.email;

    if (!validate(email)) {
      alert("Email not valid bro");
    }
    else {
      while (i < emailArr.length) {
        console.log(emailArr[i], email);
        if (emailArr[i].toString() === email) {
          if (user[7].toString() === "yes") {
            alert("Account is banned. Please contact administrator.")
          }
          else {
            firebase.auth().signInWithEmailAndPassword(email, this.state.password).then((u) => {}).catch((error) => {
              alert(error.message)
            })
            break;
          }
        }
        else if (i == emailArr.length-1) {
          alert("Email not found yo");
          i++;
        }
        else {
          i++;
        }
      }
    }
  }

  signup(e) {
    e.preventDefault();

    // checks for duplicate username
    var i = 0;
    var unameCheck = false;
    while (i < unameArr.length) {
      if (this.state.username === unameArr[i]) {
        alert("Username has already been registered");
        unameCheck = false;
        break;
      }
      else {
        unameCheck = true;
      }
      i++;
    }

    // checks confirm password
    if (this.state.password != this.state.repassword) {
      alert("Passwords do not match");
    }

    else {
      console.log(unameCheck);
      if (unameCheck) {
        firebase.auth().createUserWithEmailAndPassword(this.state.email, this.state.password).then((u)=>{
        }).then((u)=>{
          const accountsRef = firebase.database().ref('accounts');
          const account = {
            fname: this.state.firstName,
            lname: this.state.lastName,
            uname: this.state.username,
            email: this.state.email.toString().toLowerCase(),
            passw: this.state.password,
            isDriver: "no",
            isAdmin: "no",
            isBanned: "no"
          }

          user[0] = account.fname;
          user[1] = account.lname;
          user[2] = account.uname;
          user[3] = account.email;
          user[4] = account.isDriver;
          user[5] = account.isAdmin;
          user[6] = account.isBanned;
          user[7] = account.key;

          accountsRef.push(account);
          this.state = {
            firstName: '',
            lastName: '',
            username: '',
            email: '',
            password: '',
            repassword: '',
            isDriver: '',
            isAdmin: '',
            isBanned: ''
          };

          firebase.database().ref('admin/counter')
                             .once('value')
                             .then(function(snapshot) {
                                 countArr[0] += 1;
                                 console.log("rewrite: ", countArr[0]);
                                 snapshot.ref.update({ acct: countArr[0] });
                            });
        })
        .catch((error) => {
            alert(error.message);
        })
      }
    }
  }

  extendsignup(e) {
    e.preventDefault();
    document.getElementById("signinblock").style.display = "none";
    document.getElementById("signupblock").style.display = "block";
  }

  cancel(e) {
    e.preventDefault();
    document.getElementById("signinblock").style.display = "block";
    document.getElementById("signupblock").style.display = "none";
  }

  render() {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <div>
          <form>
            <div id="signinblock">
              <input id="signinemail" value={this.state.email} onChange={this.handleChange} type="email" name="email" placeholder="E-Mail (test@this.com)" />
              <input value={this.state.password} onChange={this.handleChange} onFocus={this.checkEmail} type="password" name="password" placeholder="Password (shafiq)" style={{marginLeft: '15px'}}/>
              <br/>
              <br/>
              <button type="submit" onClick={this.login}>Sign In</button>
              <button onClick={this.extendsignup} style={{marginLeft: '25px'}}>Sign Up</button>
            </div>

            <div id="signupblock" style={{display: 'none'}}>
              <table>
                <tr>
                  <td>First Name</td>
                  <td><input value={this.state.firstName} onChange={this.handleChange} type="text" name="firstName"/></td>
                </tr>
                <tr>
                  <td>Last Name</td>
                  <td><input value={this.state.lastName} onChange={this.handleChange} type="text" name="lastName"/></td>
                </tr>
                <tr>
                  <td>E-Mail</td>
                  <td><input value={this.state.email} onChange={this.handleChange} type="email" name="email"/></td>
                </tr>
                <tr>
                  <td>Username</td>
                  <td><input value={this.state.username} onChange={this.handleChange} type="text" name="username"/></td>
                </tr>
                <tr>
                  <td>Password</td>
                  <td><input value={this.state.password} onChange={this.handleChange} type="password" name="password"/></td>
                </tr>
                <tr>
                  <td>Re-Enter Password</td>
                  <td><input value={this.state.repassword} onChange={this.handleChange} type="password" name="repassword"/></td>
                </tr>
              </table>
              <br/>
              <button onClick={this.signup}>Submit</button>
              <button onClick={this.cancel} style={{marginLeft: '25px'}}>Cancel</button>
            </div>
          </form>
        </div>
      </View>
    );
  }
}

export default Login;
export { user }
