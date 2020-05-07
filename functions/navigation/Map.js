/* eslint-disable promise/catch-or-return */
/* eslint-disable no-alert */
import firebase from '../../base';
import React, { Component } from 'react';
import { Text, View, Button, StyleSheet, TextInput } from 'react-native';
import { Map, InfoWindow, Marker, GoogleApiWrapper, GoogleMap, withGoogleMap, withScriptjs, DirectionsRenderer } from 'google-maps-react';
import Geocode from "react-geocode";
import Autocomplete from 'react-google-autocomplete';
import { Location, Permissions } from 'expo';
import Constants from 'expo-constants';
Geocode.enableDebug();
import getDirections from 'react-native-google-maps-directions'

let postal = []
let pay = []
let ppl = []
let towards

class map extends React.Component {

    constructor() {
        super();
        this.state = {
            ready: false,
            to: { lat: null, lng: null },
            from: { lat: null, lng: null },
            error: null
        }
    }

    componentDidMount() {
        this.getPostal('bookingID');
        let geoOptions = {
            enableHighAccuracy: true,
            timeOut: 20000,
            maximumAge: 10000
        };
        this.setState({ ready: false });
        navigator.geolocation.getCurrentPosition(this.geoSuccess, this.geoFailure, geoOptions);
    }

    geoSuccess = (position) => {
        console.log(position);
        console.log(position.coords.latitude);
        console.log(position.coords.longitude);
        this.setState({
            ready: true,
            from: { lat: position.coords.latitude, lng: position.coords.longitude }
        })
    }

    geoFailure = (err) => {
        this.setState({ error: err.message });
    }

    getPostal = (bookingID) => {
        const database = firebase.database().ref('bookings');
        database.once('value', (snapshot) => {
            if (snapshot.exists()) {
                snapshot.forEach((data) => {
                    if (data.key === '-M5lzRNnCCt5RwXp9zmb') { // replace with bookingID later
                        towards = data.val().towards;
                        
                        if (data.val().currPassengers !== "") {
                            ppl = data.val().currPassengers.split(', ');
                            pay = data.val().payMethod.split(', ');
                            postal = data.val().postal.split(', ');
                        }
                    }
                });

                for (var d = 0; d < ppl.length; d++) {
                    var btn = document.createElement('input');
                    btn.setAttribute('type', 'button')
                    btn.setAttribute('value', ppl[d]);
                    btn.setAttribute('id', postal[d]);
                    btn.onclick = this.plotPts;
                    document.getElementById('directions').appendChild(btn);
                    console.log(btn)
                }
            }
        });
    }

    plotPts = (e) => {
        postal = e.target.id;
        let latlng = postal.split(':');
        if (towards === 'Home') {
            this.setState({
                to: {
                        lat: parseFloat(latlng[0]),
                        lng: parseFloat(latlng[1])
                    },
                from: {
                    lat: 1.329426,
                    lng: 103.776571
                },
            })
        }
        else {
             this.setState({
                 from: {
                     lat: parseFloat(latlng[0]),
                     lng: parseFloat(latlng[1])
                 },
                 to: {
                     lat: 1.329426,
                     lng: 103.776571
                 },
             })
        }
    }

    //Testing1 This shows route, but it brings you to the actual google maps
    handleGetDirections = () => {
        const data = {
            source: {
                latitude: this.state.from.lat,
                longitude: this.state.from.lng
            },
            destination: {
                latitude: this.state.to.lat,
                longitude: this.state.to.lng
            },
            params: [
                {
                    key: "travelmode",
                    value: "driving"       // may be "walking", "bicycling" or "transit" as well
                },
                {
                    key: "dir_action",
                    value: "navigate"       // this instantly initializes navigation using the given travel mode
                }
            ]
        }
        getDirections(data)
    }

    render() {
        return (
            <View style={style.container}>
                {!this.state.ready && (
                    <Text>Please allow location access.</Text>
                )}
                {this.state.error && (
                    <Text>{this.state.error}</Text>
                )}
                {this.state.ready && (
                    <Text>Latitude:{this.state.to.lat}, Longitude:{this.state.to.lng}
                        <div>
                            <div id='directions'></div>
                            <h1 align="center">WELCOME TO GOOGLE MAPS</h1>
                        </div>
                        <div>
                            <Button onPress={this.handleGetDirections} title="Get Directions" />
                            
                            <Map google={this.props.google} zoom={16} initialCenter={{ lat: this.state.from.lat, lng: this.state.from.lng }}>
                                <Marker onClick={this.onMarkerClick}
                                    name={'Current location'} />
                                <Marker
                                    name={'Destination'}
                                    position={{ lat: this.state.to.lat, lng: this.state.to.lat }} />
                                
                            </Map>
                        </div>
                    </Text>
                )}             
            </View>
        );
    }
}

//lat: 1.329426, lng: 103.776571 SIM Coordinates

const style = StyleSheet.create({
    container: {
        flex: 1,
        width: '600px',
        height: '500px'
    },
    welcome: {
        fontSize: 20,
        textAlign: 'center',
        margin: 10
    }
});

export default GoogleApiWrapper({
    apiKey: 'AIzaSyARHBw1DzEQDE0auV06gUQRI8iNUKmwHaY'
})(map);