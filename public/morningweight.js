// morningweights.js

// Import common.js to access common variables and functions
import { db, auth, currentUser } from './common.js';

// Define page-specific logic for the 'morningweights' page
// Rest of your 'morningweights' page code here

document.addEventListener('DOMContentLoaded', function () {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('dateInput').value = today;

    document.getElementById('weightForm').addEventListener('submit', function (e) {
        e.preventDefault();

        const date = document.getElementById('dateInput').value;
        const morningWeight = parseFloat(document.getElementById('weightInput').value);

        const dailyGrams = calculateDailyGrams(date, morningWeight); // Implement this function

        document.getElementById('result').textContent = `Allowed grams for ${date}: ${dailyGrams} g`;
    });
});

async function calculateDailyGrams(date, morningWeight) {
    try {
        const goalWeight = await getGoalWeightForDate(date);

        if (goalWeight) {
            // Assuming goalWeight and morningWeight are in the same unit (kg)
            const dailyGrams = (goalWeight - morningWeight) * 1000; // Convert kg to grams
            return dailyGrams >= 0 ? dailyGrams : 0; // Ensure the value is non-negative
        } else {
            console.log('Goal weight not found for the selected date');
            return null;
        }
    } catch (error) {
        console.error('Error calculating daily grams:', error);
        return null;
    }
}

// Usage in the form submit event
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

// Usage in the form submit event
document.getElementById('weightForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    const date = document.getElementById('dateInput').value;
    const morningWeight = parseFloat(document.getElementById('weightInput').value);
  
    const goalWeightsArray = await calculateAndStoreGoalWeights(startingWeight, goalWeight, dietDuration); // Get the calculated array
  
    // Now you can use goalWeightsArray as needed
    const dailyGrams = await calculateDailyGrams(date, morningWeight, goalWeightsArray);
  
    if (dailyGrams !== null) {
      document.getElementById('result').textContent = `Allowed grams for ${date}: ${dailyGrams.toFixed(0)} g`;
    } else {
      document.getElementById('result').textContent = 'Error calculating allowed grams.';
    }
  });
  
  async function calculateDailyGrams(date, morningWeight) {
    try {
      const goalWeight = await getGoalWeightForDate(date);
  
      if (goalWeight) {
        // Assuming goalWeight and morningWeight are in the same unit (kg)
        const dailyGrams = (goalWeight - morningWeight) * 1000; // Convert kg to grams
        return dailyGrams >= 0 ? dailyGrams : 0; // Ensure the value is non-negative
      } else {
        console.log('Goal weight not found for the selected date');
        return null;
      }
    } catch (error) {
      console.error('Error calculating daily grams:', error);
      return null;
    }
  }
  
  // Usage in the form submit event
  document.getElementById('weightForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    const date = document.getElementById('dateInput').value;
    const morningWeight = parseFloat(document.getElementById('weightInput').value);
    const startingWeight = document.getElementById('startingWeight').value; // Add this line
    const goalWeight = document.getElementById('goalWeight').value; // Add this line
    const dietDuration = document.getElementById('dietDuration').value; // Add this line
  
    const goalWeightsArray = await calculateAndStoreGoalWeights(startingWeight, goalWeight, dietDuration);
  
    // Now you can use goalWeightsArray as needed
    const dailyGrams = await calculateDailyGrams(date, morningWeight, goalWeightsArray);
  
    if (dailyGrams !== null) {
      document.getElementById('result').textContent = `Allowed grams for ${date}: ${dailyGrams.toFixed(0)} g`;
    } else {
      document.getElementById('result').textContent = 'Error calculating allowed grams.';
    }
  });
  