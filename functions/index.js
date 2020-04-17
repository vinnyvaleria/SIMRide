const functions = require('firebase-functions');
const express = require("express")

// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions

const app1 = express()
app1.get("/hello", (request, response) => {
    response.send("Hello from Express on Firebase!")
})

const api1 = functions.https.onRequest(app1)

module.exports = {
    api1
}