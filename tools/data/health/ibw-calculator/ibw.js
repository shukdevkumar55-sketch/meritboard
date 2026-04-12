/**
 * MeritBoard Advanced IBW Calculator Logic
 * Formulas: Devine, Robinson, Miller, Hamwi
 * Standards: WHO BMI Range (18.5 - 24.9)
 * Author: Sukhdev Dahiya
 */

let currentUnit = 'metric';
let selectedGender = 'male';

// 1. Gender Selection Logic
function selectGender(gender) {
    selectedGender = gender;
    document.getElementById('btn-male').classList.remove('active');
    document.getElementById('btn-female').classList.remove('active');
    
    if (gender === 'male') {
        document.getElementById('btn-male').classList.add('active');
    } else {
        document.getElementById('btn-female').classList.add('active');
    }
}

// 2. Unit Switching Logic
function switchUnit(unit) {
    currentUnit = unit;
    const metricInputs = document.getElementById('metric-inputs');
    const imperialInputs = document.getElementById('imperial-inputs');
    const tabs = document.querySelectorAll('.tab-btn');

    tabs.forEach(tab => tab.classList.remove('active'));
    
    if (unit === 'metric') {
        metricInputs.classList.remove('hidden');
        imperialInputs.classList.add('hidden');
        tabs[0].classList.add('active');
    } else {
        metricInputs.classList.add('hidden');
        imperialInputs.classList.remove('hidden');
        tabs[1].classList.add('active');
    }
}

// 3. Main Calculation Engine
function calculateIBW() {
    let heightInches = 0;
    let heightMeters = 0;
    let currentWeightKg = 0;

    // Inputs Retrieval
    if (currentUnit === 'metric') {
        const cm = parseFloat(document.getElementById('m-height').value);
        const weight = parseFloat(document.getElementById('m-weight').value);
        if (!cm || cm <= 0) { alert("Please enter a valid height"); return; }
        
        heightInches = cm / 2.54;
        heightMeters = cm / 100;
        currentWeightKg = weight || 0;
    } else {
        const ft = parseFloat(document.getElementById('i-height-ft').value) || 0;
        const inch = parseFloat(document.getElementById('i-height-in').value) || 0;
        const weightLbs = parseFloat(document.getElementById('i-weight').value);
        
        if (ft <= 0 && inch <= 0) { alert("Please enter a valid height"); return; }
        
        heightInches = (ft * 12) + inch;
        heightMeters = (heightInches * 2.54) / 100;
        currentWeightKg = weightLbs ? weightLbs / 2.20462 : 0;
    }

    // Baseline: Inches over 5 feet (60 inches)
    const over5ft = heightInches - 60;

    // Formulas Implementation
    let robinson, miller, devine, hamwi;

    if (selectedGender === 'male') {
        robinson = 52 + (1.9 * over5ft);
        miller = 56.2 + (1.41 * over5ft);
        devine = 50 + (2.3 * over5ft);
        hamwi = 48 + (2.7 * over5ft);
    } else {
        robinson = 49 + (1.7 * over5ft);
        miller = 53.1 + (1.36 * over5ft);
        devine = 45.5 + (2.3 * over5ft);
        hamwi = 45.5 + (2.2 * over5ft);
    }

    // Apply Body Frame Adjustment
    const frameSize = document.getElementById('frame-size').value;
    let frameMultiplier = 1;
    if (frameSize === 'small') frameMultiplier = 0.9;
    if (frameSize === 'large') frameMultiplier = 1.1;

    const results = {
        robinson: robinson * frameMultiplier,
        miller: miller * frameMultiplier,
        devine: devine * frameMultiplier,
        hamwi: hamwi * frameMultiplier
    };

    // Calculate Average IBW
    const avgIBW = (results.robinson + results.miller + results.devine + results.hamwi) / 4;

    // WHO Range (BMI 18.5 - 24.9)
    const whoMin = 18.5 * (heightMeters * heightMeters);
    const whoMax = 24.9 * (heightMeters * heightMeters);

    // Update UI
    displayResults(avgIBW, results, whoMin, whoMax, currentWeightKg);
}

// 4. UI Update Function
function displayResults(avg, formulas, wMin, wMax, currentWeight) {
    const resArea = document.getElementById('result-area');
    resArea.classList.remove('hidden');

    // Main Value
    document.getElementById('ibw-main-value').innerHTML = `${avg.toFixed(1)} <span style="font-size: 1.5rem;">kg</span>`;

    // Individual Formulas
    document.getElementById('val-robinson').innerText = formulas.robinson.toFixed(1) + " kg";
    document.getElementById('val-miller').innerText = formulas.miller.toFixed(1) + " kg";
    document.getElementById('val-devine').innerText = formulas.devine.toFixed(1) + " kg";
    document.getElementById('val-hamwi').innerText = formulas.hamwi.toFixed(1) + " kg";

    // WHO Range
    document.getElementById('who-range-val').innerText = `${wMin.toFixed(1)} kg - ${wMax.toFixed(1)} kg`;

    // Goal Indicator (Advanced logic)
    const goalPill = document.getElementById('goal-indicator');
    if (currentWeight > 0) {
        goalPill.classList.remove('hidden');
        const diff = currentWeight - avg;
        
        if (Math.abs(diff) < 1.5) {
            goalPill.innerText = "You are at your Ideal Weight! Excellent.";
            goalPill.style.background = "#10b981"; // Green
        } else if (diff > 0) {
            goalPill.innerText = `Goal: Lose ${diff.toFixed(1)} kg to reach Ideal Weight.`;
            goalPill.style.background = "#f59e0b"; // Orange
        } else {
            goalPill.innerText = `Goal: Gain ${Math.abs(diff).toFixed(1)} kg to reach Ideal Weight.`;
            goalPill.style.background = "#3b82f6"; // Blue
        }
    } else {
        goalPill.classList.add('hidden');
    }

    // Smooth Scroll to results
    resArea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
