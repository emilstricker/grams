// Check if a user is logged in
firebase.auth().onAuthStateChanged((user) => {
  if (!user) {
    // If no user is logged in, redirect to the login page
    window.location.href = 'login.html';
  }
  // Else, continue with the page initialization
  setTodaysDate();
  initializePlanDetails();
});

let weightLossChartInstance;
let availableGramsChartInstance;

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
      window.location.href = "index.html";
    } else {
      window.location.href = "grams.html";
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


function getChartData() {
  let dates = [];
  let goalWeights = [];
  let morningWeights = [];
  let availableGrams = [];

  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key) && key.startsWith("morningWeight_")) {
      let date = key.split("_")[1];
      dates.push(formatDateForChart(new Date(date)));

      let morningWeight = parseFloat(localStorage.getItem(key));
      morningWeights.push(morningWeight);

      let goalWeight = parseFloat(localStorage.getItem(`goalWeight_${date}`));
      goalWeights.push(goalWeight);

      // Calculate available grams for the same date
      let grams = (goalWeight - morningWeight) * 1000;
      availableGrams.push(grams);
    }
  }

  let chartData = dates.map((date, index) => ({
    date,
    goalWeight: goalWeights[index],
    morningWeight: morningWeights[index],
    availableGrams: availableGrams[index],
  }));
  chartData.sort((a, b) => new Date(a.date) - new Date(b.date));

  dates = chartData.map((data) => data.date);
  goalWeights = chartData.map((data) => data.goalWeight);
  morningWeights = chartData.map((data) => data.morningWeight);
  availableGrams = chartData.map((data) => data.availableGrams);

  return { dates, goalWeights, morningWeights, availableGrams };
}

function formatDateForChart(date) {
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
}

function drawWeightLossChart(dates, goalWeights, morningWeights) {
  if (weightLossChartInstance) {
    weightLossChartInstance.destroy();
  }
  var ctx = document.getElementById("weightLossChart").getContext("2d");
  weightLossChartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: dates,
      datasets: [
        {
          label: "Goal Weight",
          data: goalWeights,
          borderColor: "rgb(33, 113, 181)", // Dark blue
          backgroundColor: "rgba(33, 113, 181, 0.5)",
          fill: false,
        },
        {
          label: "Morning Weight",
          data: morningWeights,
          borderColor: "rgb(255, 188, 121)", // Light orange
          backgroundColor: "rgba(255, 188, 121, 0.5)",
          fill: false,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: 1.8,
      plugins: {
        title: {
          display: true,
          text: "PROGRESS",
          padding: {
            top: 10,
            bottom: 10,
          },
          font: {
            size: 18,
          },
        },
        // ... other plugin options ...
      },
      scales: {
        y: {
          beginAtZero: false,
        },
      },
    },
  });
}

function drawAvailableGramsChart(dates, availableGrams) {
  if (availableGramsChartInstance) {
    availableGramsChartInstance.destroy();
  }
  var ctx = document.getElementById("availableGramsChart").getContext("2d");
  availableGramsChartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: dates,
      datasets: [
        {
          label: "Available Grams",
          data: availableGrams,
          backgroundColor: availableGrams.map((gram) =>
            gram < 0 ? "rgba(255, 99, 132, 0.7)" : "rgba(75, 192, 192, 0.7)"
          ), // red for negative, greenish for positive
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: 1.8,
      plugins: {
        title: {
          display: true,
          text: "DAILY GRAMS",
          padding: {
            top: 10,
            bottom: 10,
          },
          font: {
            size: 18,
          },
        },
        tooltip: {
          // Tooltip configuration if needed
        },
        legend: {
          display: true,
          // Legend configuration if needed
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            drawBorder: true,
            color: (context) =>
              context.tick.value === 0
                ? "rgba(0, 0, 0, 0.5)"
                : "rgba(0, 0, 0, 0.1)", // Black line at zero
            lineWidth: (context) => (context.tick.value === 0 ? 2 : 1), // Thicker line at zero
          },
        },
        x: {
          // Additional scale config if needed
        },
      },
    },
  });
}

function drawChartFromStorage() {
  let { dates, goalWeights, morningWeights, availableGrams } = getChartData();
  drawWeightLossChart(dates, goalWeights, morningWeights);
  drawAvailableGramsChart(dates, availableGrams);
}

window.onload = function () {
  drawChartFromStorage();
};
