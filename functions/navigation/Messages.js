/* eslint-disable no-alert */
/* eslint-disable promise/no-nesting */
/* eslint-disable promise/always-return */
/* eslint-disable promise/catch-or-return */
import React, { Component } from 'react';
import { Text, View } from 'react-native';
import firebase from '../../base';
import 'firebase/firestore';
import {user} from './Login';

var unameArr = [];
var allchats = [];
var chats = [];
var chatName;
var clickedUser;
var clickedUserID;

class Messages extends React.Component {
    constructor(props) {

      super(props);
      this.inboxMsgButton = this.inboxMsgButton.bind(this);
      this.newMsgButton = this.newMsgButton.bind(this);
      this.sendMessage = this.sendMessage.bind(this);
      this.searchUsername = this.searchUsername.bind(this);
      this.handleChange = this.handleChange.bind(this);
      this.openChat = this.openChat.bind(this);
      this.back = this.back.bind(this);
      this.state = {
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        newPassword: '',
        confirmPassword: '',
        isDriver: '',
        isAdmin: '',
        to: '',
        from: '',
        message: '',
        id: ''
      };
    }

    handleChange(e) {
      this.setState({
        [e.target.name]: e.target.value
      });
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
              // loads accounts
              firebase.database()
                .ref('accounts')
                .orderByChild('email')
                .once('value')
                .then((snapshot) => {
                  var i = 0;
                  snapshot.forEach((child) => {
                    unameArr[i] = child.val().uname;
                    i++;
                  })
                });

              firebase.firestore().collection("chat").get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                  allchats.push(doc.id);
                  chats = Array.from(new Set(allchats))
                });
              });
            }
          }
        });
    }

    // goes back to login page if stumble upon another page by accident without logging in
    componentDidMount() {
      this.checkEmail();
    }

    // stores message in firestore
    sendMessage(e) {
      e.preventDefault();

      firebase.firestore().collection('messages').doc(chatName)
        .get()
        .then((docSnapshot) => {
          if (docSnapshot.exists) {
            // save in database
            firebase.firestore().collection('messages/' + chatName).add({
              from: user[2],
              to: this.state.to,
              text: this.state.message,
              timestamp: new Date()
            }).catch((error) => {
              alert('Error sending message.', error);
            });

            this.state.message = '';
            document.getElementById('message').value = '';
          } else {
            let data = {field: 'field'}
            firebase.firestore().collection('chat').doc(chatName).set(data);
            // save in database
            firebase.firestore().collection('chat').doc(chatName).collection('messages').add({
              from: user[2],
              to: this.state.to,
              text: this.state.message,
              timestamp: new Date()
            }).catch((error) => {
              alert('Error sending message.', error);
            });

            this.state.message = '';
            document.getElementById('message').value = '';
          }
        })

      if (e.target.id === "submitMsgButtonNew") {

        this.inboxMsgButton();
      }
    }

    searchUsername(e) {
      let i = 0;
      // creates chat based on usernames
      while (i < unameArr.length) {
        console.log(unameArr[i]);
        // checks if there is a valid account in the database
        if (this.state.to === unameArr[i]) {
          console.log(this.state.to, unameArr[i]);
          document.getElementById('searchUser').style.display = "none";
          document.getElementById('sendNewMessage').style.display = "block";
          const search = this.state.to;

          //creates chat based on username length
          if (user[2].length !== search.length) {
            if (user[2].length < search.length) {
              chatName = (user[2] + "-" + search)
            } else {
              chatName = (search + "-" + user[2])
            }
          }
          // if same length compare by alphabets
          else {
            if (user[2] < search) {
              chatName = (user[2] + "-" + search)
            } else {
              chatName = (search + "-" + user[2])
            }
          }

          console.log(chatName);

          clickedUser = (chatName.replace(user[2].toString(), '')).replace('-', '');
          chattingTo.innerHTML = clickedUser;
          viewOtherAcctPageUser.innerHTML = clickedUser;
          break;
        } else if (i === unameArr.length) {
          alert("User not found");
        }
        i++;
      }
    }

    // view another user's profile
    viewUserProfile() {
      document.getElementById('otherAcctPage').style.display = "block";
      document.getElementById('msgsPage').style.display = "none";

      const accountsRef = firebase.database().ref('accounts');
      accountsRef.orderByChild('uname')
        .equalTo(clickedUser)
        .once('value')
        .then((snapshot) => {
          snapshot.forEach((child) => {
            lblotherfName.innerHTML = child.val().fname;
            lblotherlName.innerHTML = child.val().lname;
            lblotherEmail.innerHTML = child.val().email;
            lblotherDriver.innerHTML = child.val().isDriver;
            lblotherAdmin.innerHTML = child.val().isAdmin;
            clickedUserID = child.key;
            console.log(child.val().fname, child.val().email);
          });
        })
    }

    // new msg button
    newMsgButton() {
      console.log(unameArr, unameArr.length)
      document.getElementById('inbox').style.display = "none";
      document.getElementById('searchUser').style.display = "block";
      document.getElementById('sendNewMessage').style.display = "none";
      this.state.to = '';
      document.getElementById('selectUser').value = '';
    }

    // inbox, buttons dynamically created from the chats that you have
    inboxMsgButton() {
      document.getElementById("chatsStarted").innerHTML = "";
      document.getElementById('searchUser').style.display = "none";
      document.getElementById('inbox').style.display = "block";
      document.getElementById('sendNewMessage').style.display = "none";

      for (var c = 0; c < chats.length; c++) {
        if (chats[c].includes(user[2])) {
          var btn = document.createElement('input');
          btn.setAttribute('type', 'button')
          btn.setAttribute('value', chats[c].toString().replace(user[2], '').replace('-', ''));
          btn.setAttribute('id', c);
          btn.onclick = this.openChat;
          document.getElementById('chatsStarted').appendChild(btn);
        }
      }
    }

    // opens the chat from inbox
    openChat(e) {
      document.getElementById("messages").innerHTML = "";

      chatName = chats[e.target.id];
      console.log(chatName);
      firebase.firestore().collection("chat/" + chatName + "/messages").orderBy("timestamp").onSnapshot((querySnapshot) => {
        querySnapshot.docChanges().forEach((doc) => {
          var message = doc.doc.data();
          var html = "";
          // give each message a unique ID
          html += "<li id='message-" + message.timestamp + "'>";
          html += message.from + ": " + message.text;
          html += "</li>";

          console.log(html);

          document.getElementById('submitInboxMessage').style.display = "block";
          document.getElementById("messages").innerHTML += html;
        });
      });
    }

    report() {
      document.getElementById('btnShowReport').style.display = 'none';
      document.getElementById('btnSubmitReport').style.display = 'inline-block';
      document.getElementById('ddReportReason').style.display = 'block';
    }

    submitReport() {
      const date = new Date();
      let m = date.getMonth() + 1;
      let d = date.getDate();
      let y = date.getFullYear();
      const today = new Date(y, m, d);
      
      if (document.getElementById('ddReportReason').value === "fake"){
        const reportRef = firebase.database().ref('reportedUsers/' + clickedUserID);
        reportRef.once('value', (snapshot) => {
          if (snapshot.exists()) {
            reportRef.set({
              status: "not banned",
              lastReportDate: today * -1,
              username: clickedUser,
              fake: snapshot.val().fake += 1,
              safety: snapshot.val().safety += 0,
              vulgar: snapshot.val().vulgar += 0,
              inappropriate: snapshot.val().inappropriate += 0,
              noshow: snapshot.val().inappropriate += 0
            });
          } else {
            const reportRef = firebase.database().ref('reportedUsers/' + clickedUserID);
            reportRef.set({
              username: clickedUser,
              status: "not banned",
              lastReportDate: today * -1,
              fake: 1,
              safety: 0,
              vulgar: 0,
              inappropriate: 0,
              noshow: 0
            });
          }
        });
      }
      else if (document.getElementById('ddReportReason').value === "safety") {
        const reportRef = firebase.database().ref('reportedUsers/' + clickedUserID);
        reportRef.once('value', (snapshot) => {
          if (snapshot.exists()) {
            reportRef.set({
              status: "not banned",
              lastReportDate: today * -1,
              username: clickedUser,
              fake: snapshot.val().fake += 0,
              safety: snapshot.val().safety += 1,
              vulgar: snapshot.val().vulgar += 0,
              inappropriate: snapshot.val().inappropriate += 0,
              noshow: snapshot.val().inappropriate += 0
            });
          } 
          
          else {
            const reportRef = firebase.database().ref('reportedUsers/' + clickedUserID);
            reportRef.set({
              username: clickedUser,
              status: "not banned",
              lastReportDate: today * -1,
              fake: 0,
              safety: 1,
              vulgar: 0,
              inappropriate: 0,
              noshow: 0
            });
          }
        });
      }
      else if (document.getElementById('ddReportReason').value === "vulgar") {
        const reportRef = firebase.database().ref('reportedUsers/' + clickedUserID);
        reportRef.once('value', (snapshot) => {
          if (snapshot.exists()) {
            reportRef.set({
              status: "not banned",
              lastReportDate: today * -1,
              username: clickedUser,
              fake: snapshot.val().fake += 0,
              safety: snapshot.val().safety += 0,
              vulgar: snapshot.val().vulgar += 1,
              inappropriate: snapshot.val().inappropriate += 0,
              noshow: snapshot.val().inappropriate += 0
            });
          } 
          
          else {
            reportRef.set({
              username: clickedUser,
              status: "not banned",
              lastReportDate: today * -1,
              fake: 0,
              safety: 0,
              vulgar: 1,
              inappropriate: 0,
              noshow: 0
            });
          }
        });
      }

      else if (document.getElementById('ddReportReason').value === "inappropriate") {
        const reportRef = firebase.database().ref('reportedUsers/' + clickedUserID);
        reportRef.once('value', (snapshot) => {
          if (snapshot.exists()) {
            reportRef.set({
              status: "not banned",
              lastReportDate: today * -1,
              username: clickedUser,
              fake: snapshot.val().fake += 0,
              safety: snapshot.val().safety += 0,
              vulgar: snapshot.val().vulgar += 0,
              inappropriate: snapshot.val().inappropriate += 1,
              noshow: snapshot.val().inappropriate += 0
            });
          } 
          
          else {
            reportRef.set({
              username: clickedUser,
              status: "not banned",
              lastReportDate: today * -1,
              fake: 0,
              safety: 0,
              vulgar: 0,
              inappropriate: 1,
              noshow: 0
            });
          }
        });
      }

      else if (document.getElementById('ddReportReason').value === "noshow") {
        const reportRef = firebase.database().ref('reportedUsers/' + clickedUserID);
        reportRef.once('value', (snapshot) => {
          if (snapshot.exists()) {
            reportRef.set({
              status: "not banned",
              lastReportDate: today * -1,
              username: clickedUser,
              fake: snapshot.val().fake += 0,
              safety: snapshot.val().safety += 0,
              vulgar: snapshot.val().vulgar += 0,
              inappropriate: snapshot.val().inappropriate += 0,
              noshow: snapshot.val().inappropriate += 1
            });
          } else {
            reportRef.set({
              username: clickedUser,
              status: "not banned",
              lastReportDate: today * -1,
              fake: 0,
              safety: 0,
              vulgar: 0,
              inappropriate: 0,
              noshow: 1
            });
          }
        });
      }

      alert("Report has been sent");
      document.getElementById('otherAcctPage').style.display = "none";
      document.getElementById('msgsPage').style.display = "block";
    }

    // back button
    back() {
      document.getElementById('otherAcctPage').style.display = "none";
      document.getElementById('msgsPage').style.display = "block";
    }

  render() { 
    return (
      <View>
        <div id='msgsPage'>
          <div>
            <div>
              <h1>SIMWorld Chat</h1>
            </div>
            <div id='msgOption'>
              <button id='inboxMsgButton' title="Inbox" onClick={ this.inboxMsgButton }>Inbox</button>
              <button id='newMsgButton' title="newMessage" onClick={ this.newMsgButton }>Search User</button>
            </div>
            <br />
            <div id='inbox' style={{display: 'none'}}>
              <div id='chatsStarted'></div>
              <div>
                <ul id="messages"></ul>
              </div>
              <div id="submitInboxMessage" style={{display: 'none'}}>
                <input id="message" placeholder="Enter message" value={this.state.message}
                  onChange={this.handleChange} type="text" name="message" style={{width:'350px'}} />
                <button id='submitMsgButton' onClick={this.sendMessage}>Submit</button>
              </div>
            </div>

            <br />
            <div id='searchUser' style={{display: 'none'}}>
              <input id="selectUser" placeholder="Search user" value={this.state.to} onChange={this.handleChange}
                type="text" name="to" style={{width:'350px'}} />
              <button id='submitSearchUserButton' onClick={this.searchUsername}>Submit</button>
            </div>

            <div id="sendNewMessage" style={{display: 'none'}}>
              <button id='chattingTo' onClick={ this.viewUserProfile }></button>
              <div>
                <br/>
                <input id="message" placeholder="Enter message" value={this.state.message}
                  onChange={this.handleChange} type="text" name="message" style={{width:'350px'}} />
                <button id='submitMsgButtonNew' onClick={this.sendMessage}>Submit</button>
              </div>
            </div>
          </div>

          <br />
          <br />
        </div>

        <div id='otherAcctPage' style={{display: 'none'}}>
          <div>
            <h1 id="viewOtherAcctPageUser"></h1>
            <br />
            <table>
              <tbody>
                <tr>
                  <td>First Name:</td>
                  <td>
                    <label id='lblotherfName' style={{display:'inline'}}></label>
                  </td>
                </tr>
                <tr>
                  <td>Last Name:</td>
                  <td>
                    <label id='lblotherlName' style={{display:'inline'}}></label>
                  </td>
                </tr>
                <tr>
                  <td>Email:</td>
                  <td>
                    <label id='lblotherEmail' style={{display:'inline'}} name='email'></label>
                  </td>
                </tr>
                <tr>
                  <td>isDriver:</td>
                  <td>
                    <label id='lblotherDriver' name='isDriver'></label>
                  </td>
                </tr>
                <tr>
                  <td>isAdmin:</td>
                  <td>
                    <label id='lblotherAdmin' name='isAdmin'></label>
                  </td>
                </tr>
              </tbody>
            </table>
            <br />
            <br />
            <button id='btnShowReport' onClick={this.report}>Report User</button>
            <select id="ddReportReason" style={{width: '13em'}} required style={{display:'none'}}>
              <option value="fake">I believe this is a fake profile</option>
              <option value="safety">User has threatened my physical safety</option>
              <option value="inappropriate">User has been behaving inappropriately towards me</option>
              <option value="vulgar">User was uncivil, rude and/or vulgar</option>
              <option value="noshow">User did not show up</option>
            </select>
            <button id='btnSubmitReport' onClick={this.submitReport} style={{display:'none'}}>Submit</button>
            <button onClick={ this.back }>Back</button>
          </div>
          <br />
        </div>
      </View>
      );
    }
  }

export default Messages;