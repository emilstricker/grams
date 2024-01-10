// Global variables to store data
let totalGrams = 0;
let eatenGrams = [];

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
      window.location.href = "graphs.html";
    } else {
      window.location.href = "index.html";
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



// DOM element references
const startElement = document.getElementById("start");
const eatInputElement = document.getElementById("eatInput");
const eatingElement = document.getElementById("eating");
const gramsListElement = document.getElementById("gramsList");
const gramsLeftElement = document.getElementById("gramsLeft");
const startOverButtonElement = document.getElementById("startOverButton");
const progressBarElement = document.getElementById("progressBar");

// Initialize the app when the page loads
function initialize() {
  const dateISO = new Date().toISOString().split("T")[0];
  const morningWeight = parseFloat(
    localStorage.getItem(`morningWeight_${dateISO}`)
  );
  const goalWeight = parseFloat(localStorage.getItem(`goalWeight_${dateISO}`));

  console.log("Retrieved morningWeight:", morningWeight);
  console.log("Retrieved goalWeight:", goalWeight);

  if (!isNaN(morningWeight) && !isNaN(goalWeight)) {
    // Calculate the total grams based on morning weight and goal weight
    totalGrams = calculateTotalGrams(morningWeight, goalWeight);
    localStorage.setItem("totalGrams", totalGrams);
    startElement.style.display = "none";
    eatInputElement.style.display = "block";
  } else {
    // If morning weight or goal weight is not set for today, show the manual input field
    startElement.style.display = "block";
    eatInputElement.style.display = "none";
  }

  if (localStorage.getItem("eatenGrams")) {
    eatenGrams = JSON.parse(localStorage.getItem("eatenGrams"));
    displayEaten();
  }

  updateUI();
}

// Function to start the eating process
function startEating() {
  const dateISO = new Date().toISOString().split("T")[0];
  const morningWeight = parseFloat(
    localStorage.getItem(`morningWeight_${dateISO}`)
  );
  const goalWeight = parseFloat(localStorage.getItem(`goalWeight_${dateISO}`));

  if (!isNaN(morningWeight) && !isNaN(goalWeight)) {
    totalGrams = calculateTotalGrams(morningWeight, goalWeight);
  } else {
    // Retrieve the value from the input field
    const gramsPlanInput = document.getElementById("grams-plan");
    if (gramsPlanInput) {
      const input = gramsPlanInput.value;
      totalGrams = parseInt(input);
    } else {
      // Handle the case where the input field is not found or another error occurs
      alert("Error: Grams plan input field not found.");
      return; // Exit the function to prevent further execution
    }
  }

  if (totalGrams > 0) {
    localStorage.setItem("totalGrams", totalGrams);
    startElement.style.display = "none";
    eatInputElement.style.display = "block";
    eatingElement.focus();
    updateUI();
  } else {
    // Handle invalid totalGrams (e.g., show an error message)
    alert("Invalid input for grams. Please check the data.");
  }
  updateUI();
}

function calculateTotalGrams(morningWeight, goalWeight) {
  const standardGramsAllocation = 500; // Example calculation:
  // If the morning weight is greater than the goal weight,
  // calculate the difference in grams.
  // You may adjust the formula according to your diet plan's logic.

  if (morningWeight < goalWeight) {
    return (goalWeight - morningWeight) * 1000; // Convert kg to grams
  } else {
    // If morning weight is equal to or less than the goal weight,
    // you might want to provide a standard number of grams or another logic.
    return standardGramsAllocation; // This should be defined based on your application's logic.
  }
}

// Function to add eaten grams
function eat() {
  // Reference to the correct ID based on your HTML
  const input = document.getElementById("grams-eaten").value;
  if (validateInput(input)) {
    const gramsEaten = parseInt(input);
    eatenGrams.unshift(gramsEaten);
    localStorage.setItem("eatenGrams", JSON.stringify(eatenGrams));
    displayEaten();
    updateUI();
    // Clear the input after eating
    document.getElementById("grams-eaten").value = "";
  }
}

// Function to validate input
function validateInput(input) {
  if (input > 0 && !isNaN(input)) {
    return true;
  } else {
    alert("Please enter a valid positive number.");
    return false;
  }
}

// Function to delete eaten grams
function deleteGrams(index) {
  eatenGrams.splice(index, 1);
  localStorage.setItem("eatenGrams", JSON.stringify(eatenGrams));
  displayEaten();
  updateUI();
}

// Function to display the list of eaten grams
function displayEaten() {
  gramsListElement.innerHTML = "";
  eatenGrams.forEach((grams, index) => {
    const listItem = document.createElement("li");
    const deleteIcon = document.createElement("i");
    deleteIcon.className = "fas fa-trash-alt delete-icon";
    deleteIcon.onclick = () => deleteGrams(index);
    listItem.appendChild(deleteIcon);

    // Determine whether to use "gram" or "grams"
    const gramText = grams === 1 ? "gram" : "grams";

    listItem.appendChild(document.createTextNode(grams + " " + gramText));
    gramsListElement.appendChild(listItem);
  });
}

// Function to update progress bar based on eaten grams
function updateProgressBar() {
  const sum = eatenGrams.reduce((acc, val) => acc + val, 0);
  const percentage = (sum / totalGrams) * 100;
  progressBarElement.style.width = `${percentage}%`;

  if (percentage <= 60) {
    progressBarElement.style.backgroundColor = "green";
  } else if (percentage > 60 && percentage <= 80) {
    progressBarElement.style.backgroundColor = "yellow";
  } else {
    progressBarElement.style.backgroundColor = "red";
  }
}

// Function to update visibility of start over button
function updateStartOverButtonVisibility() {
  startOverButtonElement.style.display =
    localStorage.getItem("totalGrams") !== null ? "block" : "none";
}

// Function to update grams left to consume
function updateGramsLeft() {
  if (totalGrams <= 0) {
    // Hide the gramsLeftElement if totalGrams doesn't exist or equals 0
    gramsLeftElement.style.display = "none";
    return; // Exit the function early
  } else {
    // Show the gramsLeftElement if totalGrams is greater than 0
    gramsLeftElement.style.display = "block";
  }

  const sum = eatenGrams.reduce((acc, val) => acc + val, 0);
  const gramsLeft = totalGrams - sum;
  const gramsConsumed = sum.toFixed(0);
  const totalGramsFormatted = totalGrams.toFixed(0);
  const gramsLeftFormatted = gramsLeft.toFixed(0);

  gramsLeftElement.innerHTML = `You have <span class="highlight">${gramsLeftFormatted}</span> grams remaining to reach today's goal of ${totalGramsFormatted} grams.<p>So far you've consumed ${gramsConsumed} grams.`;
}

// Function to update UI elements
function updateUI() {
  updateProgressBar();
  updateStartOverButtonVisibility();
  updateGramsLeft();
}

// Prevent automatic zoom on input focus (for iOS)
document.body.addEventListener("focusin", function (e) {
  e.preventDefault();
});

// Function to start over and clear all data
function startOver() {
  const confirmation = confirm(
    "Are you sure you would like to reset? This will clear all of your grams."
  );
  if (confirmation) {
    localStorage.removeItem("eatenGrams");
    eatenGrams = [];
    updateUI();
    eatInputElement.style.display = "block";
    gramsListElement.innerHTML = "";
    // gramsLeftElement.textContent = "";
     // gramsLeftElement.style.display = "none"; // Add this line
    eatingElement.value = "";
    totalGrams = 0;
    startOverButtonElement.style.display = "none";
    progressBarElement.style.width = "0";
    progressBarElement.style.backgroundColor = "green";
  }
}

// Function to reset localStorage
function resetLocalStorage() {
  const confirmation = confirm(
    "Are you sure you would like to reset? This will clear all of your grams."
  );
  if (confirmation) {
    localStorage.removeItem("totalGrams");
    localStorage.removeItem("eatenGrams");
    totalGrams = 0;
    eatenGrams = [];
    startElement.style.display = "block";
    eatInputElement.style.display = "none";
    gramsListElement.innerHTML = "";
      gramsLeftElement.style.display = "none"; // Add this line

    eatingElement.value = "";
    startOverButtonElement.style.display = "none";
    progressBarElement.style.width = "0";
    progressBarElement.style.backgroundColor = "green";
  }
}

initialize(); // Start the app when the page loads
