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

// FirebaseUI config
const uiConfig = {
    signInSuccessUrl: 'goals.html',
    signInOptions: [
        // List of OAuth providers here, e.g., firebase.auth.GoogleAuthProvider.PROVIDER_ID
    ],
    // Other config options...
};

// Initialize the FirebaseUI widget
const ui = new firebaseui.auth.AuthUI(getAuth());
ui.start('#firebaseui-auth-container', uiConfig);
