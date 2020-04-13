import React, { Component } from 'react';
import { Text, View } from 'react-native';
import firebase from '../base';
import 'firebase/firestore';
import {user} from './Login';

class Home extends React.Component {
    constructor(props) {

      super(props);
      this.handleChange = this.handleChange.bind(this);
      this.viewApplication = this.viewApplication.bind(this);
      this.approveApplicant = this.approveApplicant.bind(this);
      this.state = {
        frontURL: '',
        backURL: ''
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
      }
      else{
        if (user[6].toLowerCase() === "no") {
          document.getElementById("div_driverApplication").style.display = "none";
        }
        else {
          this.viewApplication();
        }
      }
    }

    viewApplication() {
      const self = this;
      document.getElementById('tb_driverApplication').innerHTML = '';
      
      const database = firebase.database().ref('driverDetails').orderByChild('dateApplied');
      database.once('value', function (snapshot) {
        if (snapshot.exists()) {
          let content = '';
          let rowCount = 0;
          snapshot.forEach(function (data) {
            if (data.val().status === "pending" && data.val().completed === "yes") {
              let driverUname = data.val().driverUname;
              let dateApplied = data.val().dateApplied;
              console.log(driverUname, dateApplied);
              content += '<tr id=\'' + data.key + '\'>';
              content += '<td>' + driverUname + '</td>'; //column1
              content += '<td>' + dateApplied + '</td>'; //column2
              content += '<td id=\'btnViewApplicant' + rowCount + '\'></td>';
              content += '</tr>';

              rowCount++;
              console.log(rowCount, content);
            }
          });

          document.getElementById('tb_driverApplication').innerHTML += content;

          for (let v = 0; v < rowCount; v++) {
            let btn = document.createElement('input');
            btn.setAttribute('type', 'button')
            btn.setAttribute('value', 'View');
            btn.onclick = self.viewApplicant;
            document.getElementById('btnViewApplicant' + v).appendChild(btn);
          }
        }
      });
    }

    viewApplicant = e => {
      var driverID = e.target.parentElement.parentElement.id;
      document.getElementById('div_ViewApplicant').style.display = "block";
      document.getElementById('div_driverApplication').style.display = "none";

      const database = firebase.database().ref('driverDetails').orderByChild('dateApplied');
      database.once('value', function (snapshot) {
        if (snapshot.exists()) {
          snapshot.forEach(function (data) {
            if (data.key === driverID) {
              let driverUname = data.val().driverUname;
              let dateApplied = data.val().dateApplied;
              let license = data.val().license;
              let issuedDate = data.val().issueDate;
              console.log(driverUname, dateApplied);

              document.getElementById('td_ViewApplicant_driverID').innerHTML = data.key;
              document.getElementById('td_ViewApplicant_username').innerHTML = driverUname;
              document.getElementById('td_ViewApplicant_dateApplied').innerHTML = dateApplied;
              document.getElementById('td_ViewApplicant_license').innerHTML = license;
              document.getElementById('td_ViewApplicant_issuedDate').innerHTML = issuedDate;
            }
          });
        }
      });

      firebase.storage()
        .ref("license/" + driverID)
        .child("front")
        .getDownloadURL()
        .then(frontURL => {
          this.setState({
            frontURL
          });
        });

        firebase.storage()
          .ref("license/" + driverID)
          .child("back")
          .getDownloadURL()
          .then(backURL => {
            this.setState({
              backURL
            });
          });
    }

    approveApplicant = () => {
      const driverID = document.getElementById('td_ViewApplicant_driverID').innerHTML;
      const accountsRef = firebase.database().ref('accounts/' + driverID);
      accountsRef.orderByChild('email')
        .once('value')
        .then(function (snapshot) {
          snapshot.ref.update({
            isDriver: "yes"
          })
        });

      const driverRef = firebase.database().ref('driverDetails/' + driverID);
      driverRef.orderByChild('dateApplied')
        .once('value')
        .then(function (snapshot) {
          snapshot.ref.update({
            status: "approved"
          })
        });

        this.viewApplication();

        document.getElementById('div_ViewApplicant').style.display = "none";
        document.getElementById('div_driverApplication').style.display = "block";
    }

    back() {
      document.getElementById('div_ViewApplicant').style.display = "none";
      document.getElementById('div_driverApplication').style.display = "block";
    }

  render() {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <div id='homePage'>
          <div>
            <h1>{"Welcome Home, " + user[0]}</h1>
          </div>

          <div id="div_driverApplication">
            <table>
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Date Applied</th>
                </tr>
              </thead>
              <tbody id="tb_driverApplication">
              </tbody>
            </table>
          </div>

          <div id='div_ViewApplicant' style={{display: 'none'}}>
            <table id="tbl_ViewApplicant">
              <tbody>
                <tr id='uploadedFront'>
                  <td>
                    {this.state.frontURL && <img src={this.state.frontURL} height='150' width='200' />}
                  </td>
                  <td>
                    {this.state.backURL && <img src={this.state.backURL} height='150' width='200' />}
                  </td>
                </tr>
                <tr>
                  <td>Driver ID:</td>
                  <td id='td_ViewApplicant_driverID'></td>
                </tr>
                <tr>
                  <td>Username:</td>
                  <td id='td_ViewApplicant_username'></td>
                </tr>
                <tr>
                  <td>Date Applied:</td>
                  <td id='td_ViewApplicant_dateApplied'></td>
                </tr>
                <tr>
                  <td>License no:</td>
                  <td id='td_ViewApplicant_license'></td>
                </tr>
                <tr>
                  <td>License Issued:</td>
                  <td id='td_ViewApplicant_issuedDate'></td>
                </tr>
              </tbody>
            </table>
            <br />
            <button onClick={ this.approveApplicant }>Approve Applicant</button>
            <button onClick={ this.back }>Back</button>
          </div>
        </div>
      </View>
      );
    }
  }

export default Home;
