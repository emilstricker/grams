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
  // Edit Plan Button Logic
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
    initializePlanDetails();
  }

  // Calculate Button Logic
const calcButton = document.getElementById('calcButton');
if (calcButton) {
  calcButton.addEventListener('click', async function () {
    var startingWeight = parseFloat(document.getElementById('startingWeight').value);
    var goalWeight = parseFloat(document.getElementById('goalWeight').value);
    var startDate = document.getElementById('startDate').value;
    var dietDuration = parseInt(document.getElementById('dietDuration').value);

    var planResult = calculatePlan(startingWeight, goalWeight, startDate, dietDuration);

    // Only call calculateAndStoreGoalWeights once
    await calculateAndStoreGoalWeights(startingWeight, goalWeight, dietDuration);

    populateTable({ startingWeight, goalWeight, startDate, dietDuration });

    // Hide the form and show the result table
    document.getElementById('goalFormDiv').style.display = 'none';
    document.getElementById('resultTableDiv').style.display = 'block';
  });
}


  // Weight Form Logic
  if (document.getElementById('weightForm')) {
    document.getElementById('weightForm').addEventListener('submit', async function (e) {
      e.preventDefault();
      const date = document.getElementById('dateInput').value;
      const morningWeight = parseFloat(document.getElementById('weightInput').value);
      const dailyGrams = await calculateDailyGrams(date, morningWeight);
      if (dailyGrams !== null) {
        document.getElementById('result').textContent = `Allowed grams for ${date}: ${dailyGrams.toFixed(0)} g`;
      } else {
        document.getElementById('result').textContent = 'Error calculating allowed grams.';
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', function () {
  const dateInputElement = document.getElementById('dateInput');

  // Only set the value if the element exists
  if (dateInputElement) {
    const today = new Date().toISOString().split('T')[0];
    dateInputElement.value = today;
  }

  initializePageSpecificFeatures();
});

function calculatePlan(startingWeight, goalWeight, startDate, dietDuration) {
  // Perform calculations
  let difference = startingWeight - goalWeight;
  let dailyDeficit = (difference / dietDuration) * 1000;
  console.log("Daily Deficit:", dailyDeficit);
  return dailyDeficit; // Return the calculated result
}

async function calculateAndStoreGoalWeights(startingWeight, goalWeight, dietDuration) {
  let dailyLoss = (startingWeight - goalWeight) / dietDuration;
  let goalWeightsArray = [];

  for (let i = 0; i < dietDuration; i++) {
      let dayGoalWeight = startingWeight - (dailyLoss * i);
      goalWeightsArray.push(dayGoalWeight.toFixed(2));
  }

  console.log("Calculated Goal Weights Array before storing:", goalWeightsArray);

  if (currentUser) {
      var docRef = doc(db, "users", currentUser.uid);
      try {
          await setDoc(docRef, { goalWeightsArray }, { merge: true });
          console.log("Goal weights array stored successfully.");
      } catch (error) {
          console.error("Error writing document: ", error);
      }
  }

  return goalWeightsArray; // Return the array for use outside the function
}


async function calculateDailyGrams(date, morningWeight) {
  try {
    console.log("Calculating daily grams for date:", date, "and morning weight:", morningWeight);
    const goalWeight = await getGoalWeightForDate(date);

    if (goalWeight) {
      console.log("Found goal weight:", goalWeight, "for date:", date);
      const dailyGrams = (goalWeight - morningWeight) * 1000;
      return dailyGrams >= 0 ? dailyGrams : 0;
    } else {
      console.log('Goal weight not found for the selected date:', date);
      return null;
    }
  } catch (error) {
    console.error('Error calculating daily grams:', error);
    return null;
  }
}


async function getGoalWeightForDate(date) {
  if (!currentUser) {
    console.log('No user logged in.');
    return null;
  }

  const docRef = doc(db, "users", currentUser.uid);

  try {
    const docSnap = await getDoc(docRef);
    console.log("Fetched Document:", docSnap.data());

    if (docSnap.exists() && docSnap.data().goalWeightsArray) {
      const goalWeightsArray = docSnap.data().goalWeightsArray;

      const selectedDate = new Date(date).setHours(0, 0, 0, 0);
      const startDate = new Date(docSnap.data().startDate).setHours(0, 0, 0, 0);

      const dayIndex = Math.floor((selectedDate - startDate) / (1000 * 60 * 60 * 24));

      if (dayIndex >= 0 && dayIndex < goalWeightsArray.length) {
        return goalWeightsArray[dayIndex];
      } else {
        console.log('Goal weight not found for the selected date, index:', dayIndex);
        return null;
      }
    } else {
      console.log('No goal weights array found or document does not exist.');
      return null;
    }
  } catch (error) {
    console.error('Error getting goal weight:', error);
    return null;
  }
}



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

function clearTable(tableId) {
  var table = document.getElementById(tableId);
  while (table.firstChild) {
    table.removeChild(table.firstChild);
  }
}

function populateTable(userData) {
  clearTable('resultTable');

  // Calculate End Date and Daily Deficit
  let startDateObj = new Date(userData.startDate);
  let endDate = new Date(startDateObj);
  endDate.setDate(startDateObj.getDate() + parseInt(userData.dietDuration));
  let formattedEndDate = endDate.toISOString().split('T')[0];
  let dailyDeficit = ((userData.startingWeight - userData.goalWeight) / userData.dietDuration) * 1000;
  dailyDeficit = dailyDeficit.toFixed(0);

  // Populate the table
  var resultTable = document.getElementById('resultTable');
  resultTable.appendChild(createRow('Starting Weight', userData.startingWeight + ' kg'));
  resultTable.appendChild(createRow('Goal Weight', userData.goalWeight + ' kg'));
  resultTable.appendChild(createRow('Start Date', userData.startDate));
  resultTable.appendChild(createRow('End Date', formattedEndDate));
  resultTable.appendChild(createRow('Diet Duration', userData.dietDuration + ' days'));
  resultTable.appendChild(createRow('Daily Deficit', dailyDeficit + ' g'));
}

async function initializePlanDetails() {
  if (currentUser) {
    var docRef = doc(db, "users", currentUser.uid);
    var docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      var userData = docSnap.data();
      var resultTable = document.getElementById('resultTable');

      // Calculate End Date
      let startDate = new Date(userData.startDate);
      let endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + parseInt(userData.dietDuration));

      // Format End Date for display
      let formattedEndDate = endDate.toISOString().split('T')[0];

      // Calculate Daily Deficit in grams
      let dailyDeficit = ((userData.startingWeight - userData.goalWeight) / userData.dietDuration) * 1000;
      dailyDeficit = dailyDeficit.toFixed(0);

      // Clear and populate the table
      clearTable('resultTable');
      populateTable(userData);

      // Show the result table and hide the form
      document.getElementById('resultTableDiv').style.display = 'block';
      document.getElementById('goalFormDiv').style.display = 'none';
    } else {
      // Show the goal form and hide the result table
      document.getElementById('goalFormDiv').style.display = 'block';
      document.getElementById('resultTableDiv').style.display = 'none';
    }
  }
}
