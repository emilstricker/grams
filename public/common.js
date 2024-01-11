// common.js

// Import Firestore services at the top
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js';
import { getFirestore, doc, setDoc, getDoc } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';

// Firebase configuration and initialization
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
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let currentUser = null;

document.addEventListener('DOMContentLoaded', function () {
    // Rest of your common code here
});

// Export onAuthStateChanged function
export function initializeAuthState() {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            console.log("Current user set:", user);
            currentUser = user;
            // You can call other functions related to authentication here
        } else {
            window.location.href = 'login.html';
        }
    });
}

// Export common variables and functions
export { db, auth, currentUser };
