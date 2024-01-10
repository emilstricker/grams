import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import firebaseui from 'firebaseui';

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyD942kWP9Ei1ZCntA1lqPqXukpX_LMIVeo",
    authDomain: "grams-953c8.firebaseapp.com",
    databaseURL: "https://grams-953c8-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "grams-953c8",
    storageBucket: "grams-953c8.appspot.com",
    messagingSenderId: "292028283965",
    appId: "1:292028283965:web:44ed869a7c07c873a4be54",
    measurementId: "G-E6D1KYFV22"
  };

// Initialize Firebase
initializeApp(firebaseConfig);

var firebase = require('firebase');
var firebaseui = require('firebaseui');

// FirebaseUI configuration
const uiConfig = {
    callbacks: {
        signInSuccessWithAuthResult: function(authResult, redirectUrl) {
            // Handle sign-in success.
            return true;
        },
        uiShown: function() {
            document.getElementById('loader').style.display = 'none';
        }
    },
    signInFlow: 'popup',
    signInSuccessUrl: 'goals.html',
    signInOptions: [
        // Specify Google as the provider
        firebase.auth.GoogleAuthProvider.PROVIDER_ID
    ],
    tosUrl: 'goals.html',
    privacyPolicyUrl: '<your-privacy-policy-url>'
};

// Initialize the FirebaseUI Widget
const ui = new firebaseui.auth.AuthUI(getAuth());
ui.start('#firebaseui-auth-container', uiConfig);
