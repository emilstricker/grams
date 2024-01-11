// goals2.js

// Import common.js to access common variables and functions
import { db, auth, currentUser, initializeAuthState } from './common.js';
// Initialize authentication state listener
initializeAuthState();

// Define page-specific logic for the 'goals2' page
// Rest of your 'goals2' page code here

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

  async function calculateAndStoreGoalWeights(startingWeight, goalWeight, dietDuration) {
    let dailyLoss = (startingWeight - goalWeight) / dietDuration;
    let goalWeightsArray = [];

    for (let i = 0; i < dietDuration; i++) {
      let dayGoalWeight = startingWeight - (dailyLoss * i);
      goalWeightsArray.push(dayGoalWeight.toFixed(2));
    }

    // Assuming currentUser is the authenticated user
    if (currentUser) {
      var docRef = doc(db, "users", currentUser.uid);
      await setDoc(docRef, { goalWeightsArray }, { merge: true }).catch(error => console.error("Error writing document: ", error));
    }

    return goalWeightsArray; // Return the calculated array
  }

  // Function to clear the table
  function clearTable(tableId) {
    var table = document.getElementById(tableId);
    while (table.firstChild) {
      table.removeChild(table.firstChild);
    }
  }
  // Function to populate the table
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
        dailyDeficit = dailyDeficit.toFixed(0); // Optional: round to 2 decimal places

        // Clear and populate the table
        clearTable('resultTable');
        resultTable.appendChild(createRow('Starting Weight', userData.startingWeight + ' kg'));
        resultTable.appendChild(createRow('Goal Weight', userData.goalWeight + ' kg'));
        resultTable.appendChild(createRow('Start Date', userData.startDate));
        resultTable.appendChild(createRow('End Date', formattedEndDate));
        resultTable.appendChild(createRow('Diet Duration', userData.dietDuration + ' days'));
        resultTable.appendChild(createRow('Daily Deficit', dailyDeficit + ' g'));

        // Show the result table and hide the form
        document.getElementById('resultTableDiv').style.display = 'block';
        console.log("Show the results");
      } else {
        // No data found, show the form
        document.getElementById('goalFormDiv').style.display = 'block';
        console.log("Show the form");
      }
    }
  }

  // Event listener for the calculate button
  document.getElementById('calcButton').addEventListener('click', async function () {
    var startingWeight = document.getElementById('startingWeight').value;
    var goalWeight = document.getElementById('goalWeight').value;
    var startDate = document.getElementById('startDate').value;
    var dietDuration = document.getElementById('dietDuration').value;

    var planResult = calculatePlan(startingWeight, goalWeight, startDate, dietDuration);

    if (currentUser) {
      var docRef = doc(db, "users", currentUser.uid);
      await setDoc(docRef, { startingWeight, goalWeight, startDate, dietDuration });
    }

    // New user data object for populateTable
    var newUserData = {
      startingWeight: startingWeight,
      goalWeight: goalWeight,
      startDate: startDate,
      dietDuration: dietDuration
    };

    populateTable(newUserData); // Use this function to populate the table
    calculateAndStoreGoalWeights(startingWeight, goalWeight, dietDuration);
    initializePlanDetails();
    document.getElementById('goalFormDiv').style.display = 'block';
    document.getElementById('resultTableDiv').style.display = 'block';
  });  // This closes the event listener for the 'calcButton'
 

}); // This closes the DOMContentLoaded event listener
