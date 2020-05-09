import React, { Component } from 'react';
import { Text, View, Button, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import StarRating from 'react-native-star-rating';

class rating extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            starCount: 3
        };
    }

    onStarRatingPress(rating) {
        this.setState({
            starCount: rating
        });
        console.log("Rating is: " + rating)
    }

    render() {
        return (
            <View>
                <div>
                    <h1>Ratings Page</h1>
                </div>
                <div>          
                    <table>
                        <tr>
                            <Text>How was your trip?</Text>
                        </tr>
                        <tr>
                            <Text>The rating is: {this.state.starCount}/5</Text>
                            <StarRating
                                disabled={false}
                                maxStars={5}
                                fullStarColor={'yellow'}
                                rating={this.state.starCount}                            
                                selectedStar={(rating) => this.onStarRatingPress(rating)}
                            />
                        </tr>                  
                        <tr>
                            <Button title="Submit" />
                        </tr>
                    </table>
                </div>
            </View>
        );
    }
}

export default rating;