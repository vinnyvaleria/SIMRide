import React, { Component } from 'react';
import { Text, View } from 'react-native';
import firebase from '../base';
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
      this.sendMessage = this.sendMessage.bind(this);
      this.searchUsername = this.searchUsername.bind(this);
      this.handleChange = this.handleChange.bind(this);
      this.openChat = this.openChat.bind(this);
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

    // goes back to login page if stumble upon another page by accident without logging in
    componentDidMount() {
      if (typeof user[3] === 'undefined') {
        firebase.auth().signOut();
      } else {
        // loads accounts
        firebase.database()
          .ref('accounts')
          .orderByChild('email')
          .once('value')
          .then(function (snapshot) {
            var i = 0;
            snapshot.forEach(function (child) {
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
            }).catch(function (error) {
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
            }).catch(function (error) {
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
      e.preventDefault();

      var i = 0;

      // creates chat based on usernames
      while (i < unameArr.length + 1) {
        // checks if there is a valid account in the database
        if (this.state.to === unameArr[i]) {
          document.getElementById('searchUser').style.display = "none";
          document.getElementById('sendNewMessage').style.display = "block";

          //creates chat based on username length
          chatName;
          if (user[2].length != this.state.to.length) {
            if (user[2].length < this.state.to.length) {
              chatName = (user[2] + "-" + this.state.to)
            } else {
              chatName = (this.state.to + "-" + user[2])
            }
          }
          // if same length compare by alphabets
          else {
            var i = 0;
            while (i < user[2].length) {
              if (user[2][i] != this.state.to[i]) {
                if (user[2][i] < this.state.to[i]) {
                  chatName = (user[2] + "-" + this.state.to)
                } else {
                  chatName = (this.state.to + "-" + user[2])
                }
              } else {
                i++;
              }
            }
          }

          console.log(chatName);

          clickedUser = (chatName.replace(user[2].toString(), '')).replace('-', '');
          chattingTo.innerHTML = clickedUser;
          viewOtherAcctPageUser.innerHTML = clickedUser;
          break;
        } else if (i === unameArr.length) {
          alert("User not found.")
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
        .then(function (snapshot) {
          snapshot.forEach(function (child) {
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
    newMsgButton = () => {
      document.getElementById('inbox').style.display = "none";
      document.getElementById('searchUser').style.display = "block";
      document.getElementById('sendNewMessage').style.display = "none";
      this.state.to = '';
      document.getElementById('selectUser').value = '';
    }

    // inbox, buttons dynamically created from the chats that you have
    inboxMsgButton = () => {
      document.getElementById("chatsStarted").innerHTML = "";
      document.getElementById('searchUser').style.display = "none";
      document.getElementById('inbox').style.display = "block";
      document.getElementById('sendNewMessage').style.display = "none";

      for (var c = 0; c < chats.length; c++) {
        var btn = document.createElement('input');
        btn.setAttribute('type', 'button')
        btn.setAttribute('value', chats[c].toString().replace(user[2], '').replace('-', ''));
        btn.setAttribute('id', c);
        btn.onclick = this.openChat;
        document.getElementById('chatsStarted').appendChild(btn);
      }
    }

    // opens the chat from inbox
    openChat = e => {
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
      const reportRef = firebase.database().ref('reportedUsers').child(clickedUserID);

      reportRef.once('value', function (snapshot) {
        if (snapshot.exists()) {
          reportRef.set({
            status: "not banned",
            lastReportDate: firebase.database.ServerValue.TIMESTAMP,
            username: clickedUser,
            fake: snapshot.val().fake += 1,
            vulgar: snapshot.val().vulgar += 1,
            safety: snapshot.val().safety += 1,
            inappropriate: snapshot.val().inappropriate += 1
          });
        }
        else {
          reportRef.set({
            status: "not banned",
            lastReportDate: firebase.database.ServerValue.TIMESTAMP,
            username: clickedUser,
            fake: 1,
            vulgar: 1,
            safety: 1,
            inappropriate: 1
          });
        }
      });
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
            <h1>This is the messages tab</h1>
          </div>
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
            <button onClick={this.report}>Report User</button>
            <button onClick={ this.back }>Back</button>
          </div>
          <br />
        </div>
      </View>
      );
    }
  }

export default Messages;