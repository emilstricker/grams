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
    currentUser = user; // Ensure currentUser is set here
    setTodaysDate();
    initializePlanDetails(user).catch(error => {
      console.error("Error initializing plan details: ", error);
    });
  } else {
    window.location.href = 'login.html';
  }
});

var goalWeightsArray = {}; // Object to store weights indexed by date
let touchstartX = 0;
let touchstartY = 0;
let touchendX = 0;
let touchendY = 0;

const threshold = 75; // Minimum distance of swipe to be considered horizontal

function handleGesture() {
  let dx = touchendX - touchstartX;
  let dy = touchendY - touchstartY;

  // Check if the swipe is more horizontal than vertical
  if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > threshold) {
    if (dx < 0) {
      window.location.href = "grams.html";
    } else {
      window.location.href = "graphs.html";
    }
  }
}

document.addEventListener('touchstart', e => {
  touchstartX = e.changedTouches[0].screenX;
  touchstartY = e.changedTouches[0].screenY;
  document.body.classList.add('swipe-start'); // Add class on touch start
});

document.addEventListener('touchend', e => {
  touchendX = e.changedTouches[0].screenX;
  touchendY = e.changedTouches[0].screenY;
  handleGesture();
  document.body.classList.remove('swipe-start'); // Remove class on touch end
});


// Function to populate the goalWeightsArray based on user input
function populateGoalWeightsArray(
  startDate,
  startingWeight,
  goalWeight,
  dietDuration
) {
  var dailyWeightLoss = ((startingWeight - goalWeight) / dietDuration).toFixed(
    3
  );
  var currentDate = new Date(startDate);
  var daysLeft = dietDuration;
  while (daysLeft >= 0) {
    var currentDateISO = currentDate.toISOString().split("T")[0];
    var goalWeightForDay =
      startingWeight - dailyWeightLoss * (dietDuration - daysLeft);
    goalWeightsArray[currentDateISO] = goalWeightForDay.toFixed(3);
    currentDate.setDate(currentDate.getDate() + 1);
    daysLeft--;
  }
}

// Function to calculate the plan
async function calculatePlan() {
  var startingWeight = document.getElementById("startingWeight").value;
  var startDate = document.getElementById("startDate").value;
  var dietDuration = document.getElementById("dietDuration").value;
  var goalWeight = document.getElementById("goalWeight").value;

  // Hide the form and show the plan details
  document.getElementById("goalFormDiv").classList.add("hidden");
  document.getElementById("planDetailsDiv").classList.remove("hidden");
  document.getElementById("topContainer").classList.remove("active");

  try {
    const userDocRef = doc(db, "users", auth.currentUser.uid);

    await setDoc(userDocRef, {
      startingWeight,
      startDate,
      goalWeight,
      dietDuration,
      goalWeightsArray
    });

    populateGoalWeightsArray(startDate, startingWeight, goalWeight, dietDuration);

    // Perform calculations for the diet plan
    // Example: Calculate daily weight loss, estimated goal date, and other plan details
    var dailyWeightLoss = ((startingWeight - goalWeight) / dietDuration).toFixed(
      3
    );

    // Calculate estimated goal date
    var today = new Date(startDate);
    var estimatedGoalDate = new Date(
      today.setDate(today.getDate() + parseInt(dietDuration))
    );

    // Generate projected goal weights table
    var tableContent =
      "<tr><th>Date</th><th>Morning (kg)</th><th>Intake (g)</th><th>Goal (kg)</th></tr>";
    var currentDate = new Date(startDate);
    var daysLeft = dietDuration;
    while (daysLeft >= 0) {
      var currentDateISO = currentDate.toISOString().split("T")[0];
      var goalWeight =
        startingWeight - dailyWeightLoss * (dietDuration - daysLeft);

      // Check local storage for previously stored morning weights
      var storedMorningWeight = localStorage.getItem(
        `morningWeight_${currentDateISO}`
      );
      var morningWeight = storedMorningWeight
        ? parseFloat(storedMorningWeight.replace(",", "."))
        : "";

      tableContent += `<tr><td>${currentDate.toDateString()}</td><td><input type="number" id="morningWeight_${currentDateISO}" class="morning-weight-input" onchange="calculateRemainingGrams('${currentDateISO}')" value="${morningWeight}"/></td><td id="gramsAvailable_${currentDateISO}"></td><td>${goalWeight.toFixed(
        1
      )}</td></tr>`;

      currentDate.setDate(currentDate.getDate() + 1);
      daysLeft--;
    }

    // Generate HTML for the plan details table
    var planDetailsTable = `
    <table>
      <tr><th>Detail</th><th>Value</th></tr>
      <tr><td>Starting Weight</td><td>${parseFloat(startingWeight).toFixed(
      1
    )} kg</td></tr>
      <tr><td>Goal Weight</td><td>${parseFloat(goalWeight).toFixed(
      1
    )} kg</td></tr>
      <tr><td>Start Date</td><td>${new Date(
      startDate
    ).toLocaleDateString()}</td></tr>
      <tr><td>End Date</td><td>${estimatedGoalDate.toLocaleDateString()}</td></tr>
      <tr><td>Diet Duration</td><td>${dietDuration} days</td></tr>
      <tr><td>Daily Deficit</td><td>${(dailyWeightLoss * 1000).toFixed(
      0
    )} g</td></tr>
    </table>
    <button onclick="editPlan()" id="editButton">Edit Plan</button>
  `;
    var goalTable = `<table>` + tableContent + "</table>";
    // Insert the plan details table HTML into the planDetails div
    var planDetailsDiv = document.getElementById("planDetailsDiv");
    if (!planDetailsDiv) {
      console.log("planDetailsDiv not found");
      return;
    }
    planDetailsDiv.innerHTML = planDetailsTable;

    // Insert the projected goal weights table HTML into the goalWeightsTable element
    var goalTableDiv = document.getElementById("goalTable");
    goalTableDiv.innerHTML = goalTable;

    for (const dateISO in goalWeightsArray) {
      if (goalWeightsArray.hasOwnProperty(dateISO)) {
        localStorage.setItem(`goalWeight_${dateISO}`, goalWeightsArray[dateISO]);
      }
    }
    updateIntakeValues();
  } catch (error) {
    console.error("Error in calculatePlan: ", error);
    // Handle the error or display a message
  }
}

document.getElementById("goalFormDiv").classList.add("hidden");
document.getElementById("planDetailsDiv").classList.remove("hidden");

async function initializePlanDetails() {
  if (!currentUser) {
    console.error('No authenticated user found');
    return;
  }

  const userDocRef = doc(db, "users", currentUser.uid);
  try {
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
      const userData = docSnap.data();

      document.getElementById("startingWeight").value = userData.startingWeight;
      document.getElementById("startDate").value = userData.startDate;
      document.getElementById("goalWeight").value = userData.goalWeight;
      document.getElementById("dietDuration").value = userData.dietDuration;
      goalWeightsArray = userData.goalWeightsArray || {};

      // Populate morning weights
      const morningWeights = userData.morningWeights || {};
      for (const [dateISO, weight] of Object.entries(morningWeights)) {
        const weightInput = document.getElementById(`morningWeight_${dateISO}`);
        if (weightInput) {
          weightInput.value = weight;
        }
      }

      document.getElementById("goalFormDiv").classList.add("hidden");
      document.getElementById("planDetailsDiv").classList.remove("hidden");
      document.getElementById("editPlanButton").classList.remove("hidden");

      calculatePlan();
      updateIntakeValues();
    } else {
      document.getElementById("goalFormDiv").classList.remove("hidden");
      document.getElementById("planDetailsDiv").classList.add("hidden");
      document.getElementById("editPlanButton").classList.add("hidden");
    }
  } catch (error) {
    console.error("Error reading document: ", error);
  }
}


function setTodaysDate() {
  var today = new Date().toISOString().split("T")[0];
  document.getElementById("startDate").value = today;
}

function editPlan() {
  document.getElementById("goalFormDiv").classList.remove("hidden");
  document.getElementById("planDetailsDiv").classList.add("hidden");
  document.getElementById("topContainer").classList.add("active");
}

async function calculateRemainingGrams(dateISO) {
  var morningWeightInput = document.getElementById(`morningWeight_${dateISO}`);
  var morningWeight = parseFloat(morningWeightInput.value);
  var goalWeight = parseFloat(goalWeightsArray[dateISO]);
  var remainingGrams = (goalWeight * 1000 - morningWeight * 1000).toFixed(0);

  if (!dateISO) {
    dateISO = new Date().toISOString().split("T")[0];
  }

  if (!isNaN(remainingGrams)) {
    document.getElementById(`gramsAvailable_${dateISO}`).textContent = remainingGrams;
    try {
      // Update Firestore with the new morning weight
      const userDocRef = doc(db, "users", currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        userData.morningWeights = userData.morningWeights || {};
        userData.morningWeights[dateISO] = morningWeight;

        // Save the updated data back to Firestore
        await setDoc(userDocRef, userData);

        console.log("Morning weight stored:", morningWeight);
      }
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  } else {
    document.getElementById(`gramsAvailable_${dateISO}`).textContent = "Invalid Input";
  }
}
document.getElementById('calcButton').addEventListener('click', calculatePlan);

function updateIntakeValues() {
  Object.keys(goalWeightsArray).forEach((dateISO) => {
    const morningWeightInput = document.getElementById(
      `morningWeight_${dateISO}`
    );
    const morningWeight =
      morningWeightInput && morningWeightInput.value
        ? parseFloat(morningWeightInput.value)
        : null;
    const goalWeight = parseFloat(goalWeightsArray[dateISO]);

    // Check if morningWeight is a number and not null
    if (morningWeight !== null && !isNaN(morningWeight)) {
      const remainingGrams = (goalWeight * 1000 - morningWeight * 1000).toFixed(
        0
      );
      document.getElementById(`gramsAvailable_${dateISO}`).textContent =
        remainingGrams;
    } else {
      // If morningWeight is null or not a number, set the text to empty or "N/A"
      document.getElementById(`gramsAvailable_${dateISO}`).textContent = "";
    }
  });
}

window.onload = function () {
  setTodaysDate();
  // Add event listeners to input fields
  var inputFields = document.getElementsByTagName("input");
  for (var i = 0; i < inputFields.length; i++) {
    inputFields[i].addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        calculatePlan();
      }
    });
  }

  // Add submit event listener to the form
  document.getElementById("goalForm").addEventListener("submit", function (e) {
    e.preventDefault();
    calculatePlan();
  });
  // Add event listener to the edit plan button
  document.getElementById('editPlanButton').addEventListener('click', editPlan);

};
