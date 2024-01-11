
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

onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("Current user set:", user);
    currentUser = user;
    initializePageSpecificFeatures();
  } else {
    window.location.href = 'login.html';
  }
});

function initializePageSpecificFeatures() {
  if (document.getElementById('editPlanButton')) {
    document.getElementById('editPlanButton').addEventListener('click', async function () {
      console.log("Edit button clicked");
      var docRef = doc(db, "users", currentUser.uid);
      var docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        var userData = docSnap.data();
        document.getElementById('startingWeight').value = userData.startingWeight;
        document.getElementById('goalWeight').value = userData.goalWeight;
        document.getElementById('startDate').value = userData.startDate;
        document.getElementById('dietDuration').value = userData.dietDuration;
        document.getElementById('goalFormDiv').style.display = 'block';
        document.getElementById('resultTableDiv').style.display = 'none';
        document.getElementById('calcButton').style.display = 'block';
      }
    });
  }

  if (document.getElementById('weightForm')) {
    document.getElementById('weightForm').addEventListener('submit', async function (e) {
      e.preventDefault();
      const date = document.getElementById('dateInput').value;
      const morningWeight = parseFloat(document.getElementById('weightInput').value);
      // Additional logic for weightForm submit event
      // ...
    });
  }
}

// ... [Rest of your functions and shared code]
