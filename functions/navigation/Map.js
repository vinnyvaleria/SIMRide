import React, { Component } from 'react';
import { Text, View, Button, StyleSheet } from 'react-native';
import { Map, InfoWindow, Marker, GoogleApiWrapper, GoogleMap, withGoogleMap, withScriptjs } from 'google-maps-react';
import Geocode from "react-geocode";
import Autocomplete from 'react-google-autocomplete';
import { Location, Permissions } from 'expo';
import Constants from 'expo-constants';
Geocode.enableDebug();

class map extends React.Component {

    constructor() {
        super();
        this.state = {
            ready: false,
            where: { lat: null, lng: null },
            error: null
        }
    }

    componentDidMount() {
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
            where: { lat: position.coords.latitude, lng: position.coords.longitude }
        })
    }

    geoFailure = (err) => {
        this.setState({ error: err.message });
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
                        </div>
                        <div>
                            <Map google={this.props.google} zoom={16} initialCenter={{ lat: this.state.where.lat, lng: this.state.where.lng }}>
                                <Marker onClick={this.onMarkerClick}
                                    name={'Current location'} />
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