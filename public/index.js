// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);