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
  // Function to create a table row
  function createRow(detail, value) {
    var row = document.createElement('tr');
    var detailCell = document.createElement('td');
    var valueCell = document.createElement('td');
    detailCell.textContent = detail;
    valueCell.textContent = value;
    row.appendChild(detailCell);
    row.appendChild(valueCell);
    return row;
  }

  // Function to calculate the plan (Add your logic here)
  function calculatePlan(startingWeight, goalWeight, startDate, dietDuration) {
    // Perform calculations
    let difference = startingWeight - goalWeight;
    let dailyDeficit = (difference / dietDuration) * 1000;
    console.log(dailyDeficit);
    return dailyDeficit;
    // Return the calculated result or an object containing results
  }

  document.getElementById('editPlanButton').addEventListener('click', async function () {
    // Fetch current plan data from Firestore
    console.log("Edit button clicked");
    var docRef = doc(db, "users", currentUser.uid);
    var docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      var userData = docSnap.data();
      // Populate form fields with userData
      document.getElementById('startingWeight').value = userData.startingWeight;
      document.getElementById('goalWeight').value = userData.goalWeight;
      document.getElementById('startDate').value = userData.startDate;
      document.getElementById('dietDuration').value = userData.dietDuration;

      // Populate other fields similarly
    }

    // Toggle visibility of divs and buttons
    document.getElementById('goalFormDiv').style.display = 'block';
    document.getElementById('resultTableDiv').style.display = 'none';
    document.getElementById('calcButton').style.display = 'block'; // Assuming this is your calculate button
  });

  // Function to clear the table
  function clearTable(tableId) {
    var table = document.getElementById(tableId);
    while (table.firstChild) {
      table.removeChild(table.firstChild);
    }
  }

  async function initializePlanDetails() {
    if (currentUser) {
      var docRef = doc(db, "users", currentUser.uid);
      var docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        var userData = docSnap.data();
        var resultTable = document.getElementById('resultTable');

        clearTable('resultTable'); // Clear the table first

        // Use userData values directly instead of input elements
        resultTable.appendChild(createRow('Starting Weight', userData.startingWeight + ' kg'));
        resultTable.appendChild(createRow('Goal Weight', userData.goalWeight + ' kg'));
        resultTable.appendChild(createRow('Start Date', userData.startDate)); // Use userData.startDate
        resultTable.appendChild(createRow('Diet Duration', userData.dietDuration + ' days')); // Use userData.dietDuration

        // Add more rows based on userData

        // Show the result table and hide the form
        document.getElementById('resultTableDiv').style.display = 'block';
      } else {
        // No data found, show the form
        document.getElementById('goalFormDiv').style.display = 'block';
      }
    }
  }

  // Event listener for the calculate button
  document.getElementById('calcButton').addEventListener('click', async function () {
    // Get form values
    var startingWeight = document.getElementById('startingWeight').value;
    var goalWeight = document.getElementById('goalWeight').value;
    var startDate = document.getElementById('startDate').value;
    var dietDuration = document.getElementById('dietDuration').value;

    // Perform calculations (if applicable)
    var planResult = calculatePlan(startingWeight, goalWeight, startDate, dietDuration);

    // Store the data in Firestore
    if (currentUser) {
      var docRef = doc(db, "users", currentUser.uid);
      await setDoc(docRef, { startingWeight, goalWeight, startDate, dietDuration });
    }
    clearTable('resultTable'); // Clear the table before appending new data

    // Create and append rows to the result table
    var resultTable = document.getElementById('resultTable');
    resultTable.appendChild(createRow('Starting Weight', startingWeight + ' kg'));
    resultTable.appendChild(createRow('Goal Weight', goalWeight + ' kg'));
    resultTable.appendChild(createRow('Start Date', startDate));
    resultTable.appendChild(createRow('Diet Duration', dietDuration + ' days'));

    // Hide the form and show the result table
    document.getElementById('goalFormDiv').style.display = 'none';
    document.getElementById('resultTableDiv').style.display = 'block';
  });

  onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log("Current user set:", user);
      currentUser = user;
      initializePlanDetails();
    } else {
      window.location.href = 'login.html';
    }
  });
});