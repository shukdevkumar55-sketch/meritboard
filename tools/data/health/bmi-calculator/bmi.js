/**
 * MeritBoard BMI Calculator Logic
 * Author: MeritBoard Team (Sukhdev Dahiya)
 * Version: 2.0 (Elite Edition)
 */

let currentUnit = 'metric';

// 1. Unit Switching Logic
function switchUnit(unit) {
    currentUnit = unit;
    
    // UI Updates
    const metricInputs = document.getElementById('metric-inputs');
    const imperialInputs = document.getElementById('imperial-inputs');
    const tabs = document.querySelectorAll('.tab-btn');
    
    if (unit === 'metric') {
        metricInputs.classList.remove('hidden');
        imperialInputs.classList.add('hidden');
        tabs[0].classList.add('active');
        tabs[1].classList.remove('active');
    } else {
        metricInputs.classList.add('hidden');
        imperialInputs.classList.remove('hidden');
        tabs[0].classList.remove('active');
        tabs[1].classList.add('active');
    }
    
    // Result reset on switch (Optional)
    document.getElementById('result-area').classList.add('hidden');
}

// 2. BMI Calculation Engine
function calculateBMI() {
    let weight, height, bmi;

    if (currentUnit === 'metric') {
        weight = parseFloat(document.getElementById('m-weight').value);
        height = parseFloat(document.getElementById('m-height').value) / 100; // cm to meters

        if (!weight || !height) {
            alert("Please enter valid weight and height!");
            return;
        }
        bmi = weight / (height * height);
    } else {
        weight = parseFloat(document.getElementById('i-weight').value);
        const feet = parseFloat(document.getElementById('i-height-ft').value) || 0;
        const inches = parseFloat(document.getElementById('i-height-in').value) || 0;
        const totalInches = (feet * 12) + inches;

        if (!weight || totalInches === 0) {
            alert("Please enter valid weight and height!");
            return;
        }
        // Imperial Formula: 703 * lbs / inch^2
        bmi = (703 * weight) / (totalInches * totalInches);
    }

    displayResult(bmi.toFixed(1));
}

// 3. Display and Animation Logic
function displayResult(bmi) {
    const resultArea = document.getElementById('result-area');
    const bmiValueText = document.getElementById('bmi-value');
    const statusPill = document.getElementById('status-pill');
    const adviceText = document.getElementById('advice-text');
    const pointer = document.getElementById('pointer');

    // Show Result Area
    resultArea.classList.remove('hidden');

    // Update Value
    bmiValueText.innerText = bmi;

    // Determine Category and Pointer Position
    let status = "";
    let advice = "";
    let color = "";
    let position = 0; // Percentage from left

    if (bmi < 18.5) {
        status = "Underweight";
        advice = "Aapka vajan thoda kam hai. Healthy diet aur protein par dhyan dein.";
        color = "#f97316"; // Orange
        position = (bmi / 18.5) * 25; // Map to first 25% of bar
    } else if (bmi >= 18.5 && bmi <= 24.9) {
        status = "Healthy / Normal";
        advice = "Badhai ho! Aapka vajan ekdum sahi hai. Is lifestyle ko maintain rakhein.";
        color = "#10b981"; // Green
        position = 25 + ((bmi - 18.5) / 6.4) * 25; // Map to 25-50%
    } else if (bmi >= 25 && bmi <= 29.9) {
        status = "Overweight";
        advice = "Aapka vajan normal se thoda zyada hai. Rozana exercise aur calorie control shuru karein.";
        color = "#f59e0b"; // Yellow
        position = 50 + ((bmi - 25) / 4.9) * 25; // Map to 50-75%
    } else {
        status = "Obese";
        advice = "Ye health ke liye chinta ka vishay ho sakta hai. Kripya doctor ya nutritionist se consult karein.";
        color = "#ef4444"; // Red
        position = 75 + ((bmi - 30) / 10) * 25; // Map to 75-100%
    }

    // Constraints for Pointer
    if (position > 98) position = 98;
    if (position < 2) position = 2;

    // Update UI elements
    statusPill.innerText = status;
    statusPill.style.background = color;
    adviceText.innerText = advice;
    
    // Trigger Pointer Animation
    setTimeout(() => {
        pointer.style.left = position + "%";
    }, 100);

    // Auto-scroll to result for mobile users
    resultArea.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// --- 1. Dark Mode Toggle Logic ---
document.addEventListener('DOMContentLoaded', () => {
    // Screenshot ke hisab se moon icon ko select kar rahe hain
    const themeBtn = document.querySelector('.fa-moon')?.parentElement;
    
    if (themeBtn) {
        themeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            document.body.classList.toggle('dark-mode');
            
            const icon = this.querySelector('i');
            if (document.body.classList.contains('dark-mode')) {
                icon.classList.replace('fa-moon', 'fa-sun');
                localStorage.setItem('mb-theme', 'dark');
            } else {
                icon.classList.replace('fa-sun', 'fa-moon');
                localStorage.setItem('mb-theme', 'light');
            }
        });
    }

    // --- 2. Hamburger Menu Logic ---
    const menuBtn = document.querySelector('.fa-bars')?.parentElement;
    if (menuBtn) {
        menuBtn.addEventListener('click', function(e) {
            e.preventDefault();
            // Yahan aapka sidebar open hone ka logic aayega
            // Example: document.getElementById('sidebar').classList.toggle('active');
            alert("Menu Button Active! Aap yahan apna navigation menu open kar sakte hain.");
        });
    }

    // Check saved theme
    if (localStorage.getItem('mb-theme') === 'dark') {
        document.body.classList.add('dark-mode');
        const icon = themeBtn?.querySelector('i');
        if(icon) icon.classList.replace('fa-moon', 'fa-sun');
    }
});
