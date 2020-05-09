import React, { Component } from 'react';
import { Text, View, Button, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Map, InfoWindow, Marker, GoogleApiWrapper, GoogleMap, withGoogleMap, withScriptjs, DirectionsRenderer } from 'google-maps-react';
import Geocode from "react-geocode";
import Autocomplete from 'react-google-autocomplete';
import { Location, Permissions } from 'expo';
import Constants from 'expo-constants';
Geocode.enableDebug();
import getDirections from 'react-native-google-maps-directions'
import Geocoder from 'react-native-geocoding';

class map extends React.Component {

    constructor() {
        super();
        this.state = {
            ready: false,
            where: { lat: null, lng: null, latitudeDelta: 0, longitudeDelta: 0 }, //Retrieving Lat and Lng
            error: null
        }
    }

    componentDidMount() {
        let geoOptions = {
            enableHighAccuracy: true, 
            timeOut: 20000, //How long to wait before refreshing (In milliseconds)
            maximumAge: 10000 // How long to store Lat and Lng
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
            where: { lat: position.coords.latitude, lng: position.coords.longitude }
        })
    }

    geoFailure = (err) => {
        this.setState({ error: err.message });
    }

    //This shows route, but it brings you to the actual google maps
    handleGetDirections = () => {
        const data = {
            source: { //User Location          
                latitude: this.state.where.lat,
                longitude: this.state.where.lng
            },
            destination: { //SIM Location
                latitude: 1.329426,
                longitude: 103.776571
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
            ],
            //Insert Rider's waypoints here?
            waypoints: [
                { //313 Orchard Location
                    latitude: 1.3014,
                    longitude: 103.8406
                },

                { //Scape Location
                    latitude: 1.3009,
                    longitude: 103.8358
                },

                { //MOE Headquarters Location
                    latitude: 1.2978,
                    longitude: 103.8284
                }
            ]
        }
        getDirections(data)
    }//End of Show route  

    //Convert Address to LatLng (Currently using SIM lat lng)
    getLatLng() {
        Geocoder.init("AIzaSyARHBw1DzEQDE0auV06gUQRI8iNUKmwHaY");

        Geocoder.from("461 Clementi Rd, Singapore 599491").then(
            json => {
                var location = json.results[0].geometry.location;
                console.log(location);
                console.log(location.lat);
                console.log(location.lng);
            })
            .catch(error => console.warn(error));

        Geocoder.from(1.329426, 103.776571). then(
            json => {
                var address_component = json.results[0].formatted_address;
                console.log(address_component)
                alert(address_component);
            },
            error => {
                alert(error);
            }
        );
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
                    <Text>Latitude:{this.state.where.lat}, Longitude:{this.state.where.lng}
                        <div>
                            <h1 align="center">WELCOME TO GOOGLE MAPS</h1>        
                            <TouchableOpacity onPress={() => { this.getLatLng() }} >
                                <Text> Get Address </Text>
                            </TouchableOpacity>
                        </div>
                        <div>
                            <Button onPress={this.handleGetDirections} title="Get Directions" />
                            <Map google={this.props.google} zoom={16} initialCenter={{ lat: this.state.where.lat, lng: this.state.where.lng }}>
                                <Marker onClick={this.onMarkerClick}
                                    name={'Current location'} />
                                <Marker
                                    name={'Singapore Institute of Management'}
                                    position={{ lat: 1.329426, lng: 103.776571 }} />
                                
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