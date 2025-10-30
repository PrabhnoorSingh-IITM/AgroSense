const firebaseConfig = {
  apiKey: "AIzaSyDLo9IsiIVdIMZlQqz8JEVhRrUZt5BHAQw",
  authDomain: "agrosense-e00de.firebaseapp.com",
  projectId: "agrosense-e00de",
  storageBucket: "agrosense-e00de.firebasestorage.app",
  messagingSenderId: "674846785029",
  appId: "1:674846785029:web:9b6860a799cb396678a66c",
  measurementId: "G-3LQWTZK219"
};

// This is the URL of your Python 'app.py' server
const BACKEND_URL = 'http://127.0.0.1:5000'; 

// --- 2. GLOBAL VARIABLES ---
let moistureChart = null; // This will hold our chart object
let currentAlerts = []; // To store history

// --- 3. MAIN APP INITIALIZATION ---
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Initialize theme (Your code)
    initializeTheme();

    // Initialize Chart.js (This is back!)
    initializeChart();
    
    // Set up navigation (Your code)
    setupNavigation();
    
    // Set up AI diagnosis (Upgraded)
    setupAIDiagnosis();
    
    // Set up easter egg (Your code)
    setupEasterEgg();
    
    // Connect to Firebase (NEW)
    setupFirebaseListener();
}


// --- 4. NEW: FIREBASE & LIVE DATA LOGIC ---
function setupFirebaseListener() {
    try {
        firebase.initializeApp(firebaseConfig);
        const database = firebase.database();
        
        // This is the path your 'sensor_simulator.py' is pushing to
        const sensorRef = database.ref('sensors/agrosense');
        
        // Listen for new data
        sensorRef.on('value', (snapshot) => {
            const data = snapshot.val();
            if (!data) return; // Exit if no data

            console.log("Received data from Firebase:", data);
            
            // Extract data
            const moisture = parseFloat(data.soil_moisture || 0);
            const humidity = parseFloat(data.air_humidity || 0);
            const temp = parseFloat(data.air_temp || 0);
            
            // Update the Metric Cards
            document.getElementById('moisture-val').textContent = `${moisture.toFixed(0)}%`;
            document.getElementById('humidity-val').textContent = `${humidity.toFixed(0)}%`;
            document.getElementById('temp-val').textContent = `${temp.toFixed(1)}°C`;
            
            // Update Status Banner
            if (moisture < 20) { // Using 20 as our hardcoded critical threshold
                updateStatusBanner("Soil is critically dry! SMS Alert Sent.", "urgent");
                addHistoryItem("Twilio SMS Alert Sent", "Critical soil moisture detected.", "urgent");
            } else if (humidity > 80) { // Using 80 as our hardcoded risk threshold
                updateStatusBanner("High humidity detected. Fungal risk.", "warning");
                addHistoryItem("High Humidity Warning", "Conditions are high-risk for fungus.", "warning");
            } else {
                updateStatusBanner("Field Health is Optimal.", "info");
            }

            // Update the Live Chart
            if (moistureChart) {
                const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                
                // Add new data
                moistureChart.data.labels.push(now);
                moistureChart.data.datasets[0].data.push(moisture);
                
                // Keep the chart from getting too crowded (e.g., last 10 readings)
                if (moistureChart.data.labels.length > 10) {
                    moistureChart.data.labels.shift();
                    moistureChart.data.datasets[0].data.shift();
                }
                moistureChart.update();
            }
            
        }, (error) => {
            console.error("Firebase read failed:", error.code);
            updateStatusBanner("Firebase Data Read Failed.", "urgent");
        });
        
    } catch (e) {
        console.error("Firebase initialization failed. Check your config.", e);
        updateStatusBanner("Firebase Connection Failed. Check Keys.", "urgent");
    }
}

// NEW: Helper function to update the status banner
function updateStatusBanner(message, type) {
    const banner = document.getElementById('status-banner');
    const icon = document.getElementById('status-icon');
    const text = banner.querySelector('p');
    
    banner.style.background = "";
    banner.className = "status-banner card";
    icon.className = "status-icon";

    if (type === "urgent") {
        banner.style.background = "linear-gradient(135deg, var(--urgent-red), #B91C1C)";
        icon.classList.add('bi', 'bi-exclamation-triangle-fill');
        text.textContent = message;
    } else if (type === "warning") {
        banner.style.background = "linear-gradient(135deg, var(--warning-orange), #D97706)";
        icon.classList.add('bi', 'bi-exclamation-circle-fill');
        text.textContent = message;
    } else { // 'info' or 'optimal'
        banner.style.background = "linear-gradient(135deg, var(--accent-green), #16A34A)";
        icon.classList.add('bi', 'bi-check-circle-fill');
        text.textContent = message;
    }
}

// NEW: Helper function to add items to history
function addHistoryItem(title, text, type) {
    const list = document.getElementById('history-list');
    
    // Avoid duplicate messages
    if (currentAlerts.length > 0 && currentAlerts[0].title === title) {
        return;
    }

    const card = document.createElement('div');
    card.className = `notification-card card ${type}`;
    
    const iconClass = {
        urgent: 'bi-exclamation-triangle-fill urgent-icon',
        warning: 'bi-exclamation-circle warning-icon',
        info: 'bi-info-circle info-icon'
    }[type];
    
    card.innerHTML = `
        <div class="notification-header">
            <i class="bi ${iconClass}"></i>
            <h3>${title}</h3>
            ${type === 'urgent' ? '<span class="urgent-tag">URGENT</span>' : ''}
        </div>
        <p>${text}</p>
        <span class="notification-time">${new Date().toLocaleTimeString()}</span>
    `;
    
    // Add to top of list
    list.prepend(card);
    currentAlerts.unshift({title, text});
    
    // Keep list clean
    if (currentAlerts.length > 10) {
        currentAlerts.pop();
        list.removeChild(list.lastChild);
    }
}


// --- 5. UPDATED: AI DIAGNOSIS (No changes here) ---
function setupAIDiagnosis() {
    const diagnoseBtn = document.getElementById('diagnose-btn');
    const resultsCard = document.getElementById('results-card');
    const loadingState = document.getElementById('loading-state');
    const fileInput = document.getElementById('file-upload');
    const uploadText = document.getElementById('upload-text');

    fileInput.addEventListener('change', () => {
        if (fileInput.files.length > 0) {
            uploadText.textContent = fileInput.files[0].name;
        } else {
            uploadText.textContent = "Choose an image of your crop";
        }
    });

    diagnoseBtn.addEventListener('click', async function() {
        if (fileInput.files.length === 0) {
            alert("Please choose a file to upload first.");
            return;
        }
        
        const file = fileInput.files[0];
        const formData = new FormData();
        formData.append('image', file);

        loadingState.classList.remove('hidden');
        resultsCard.classList.add('hidden');
        diagnoseBtn.disabled = true;
        diagnoseBtn.innerHTML = '<i class="bi bi-hourglass-split"></i> Diagnosing...';
        
        try {
            const response = await fetch(`${BACKEND_URL}/diagnose`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.statusText}`);
            }

            const data = await response.json();

            loadingState.classList.add('hidden');
            resultsCard.classList.remove('hidden');
            document.getElementById('diag-result-value').textContent = data.diagnosis;
            document.getElementById('diag-result-action').textContent = data.recommendation;
            document.getElementById('diag-result-conf').textContent = data.model_confidence;
            
            addHistoryItem("AI Diagnosis Complete", data.diagnosis, "info");

        } catch (error) {
            console.error("Diagnosis failed:", error);
            loadingState.classList.add('hidden');
            resultsCard.classList.remove('hidden');

            document.getElementById('diag-result-value').textContent = "Connection Failed";
            document.getElementById('diag-result-action').textContent = "Could not connect to backend. Is the Python 'app.py' server running?";
            document.getElementById('diag-result-conf').textContent = "0%";
        }

        diagnoseBtn.disabled = false;
        diagnoseBtn.innerHTML = '<i class="bi bi-cpu-fill"></i> Diagnose Crop';
    });
}


// --- 6. RE-ADDED: CHART LOGIC ---
function initializeChart() {
    const ctx = document.getElementById('moisture-chart').getContext('2d');
    
    const isDark = document.body.classList.contains('dark-theme');
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    const textColor = isDark ? '#A0A0A0' : '#64748B';
    
    // MODIFIED: Initialize with EMPTY data
    const data = {
        labels: [],
        datasets: [{
            label: 'Soil Moisture (%)',
            data: [], // Data will be added live
            borderColor: '#22C55E',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#22C55E',
            pointBorderColor: '#FFFFFF',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6
        }]
    };
    
    const config = {
        type: 'line',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: isDark ? '#2D2D2D' : '#FFFFFF',
                    titleColor: isDark ? '#FFFFFF' : '#1E293B',
                    bodyColor: isDark ? '#A0A0A0' : '#64748B',
                    borderColor: '#22C55E',
                    borderWidth: 1,
                    callbacks: {
                        label: function(context) {
                            return `Moisture: ${context.parsed.y}%`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    min: 0,
                    max: 100,
                    grid: { color: gridColor },
                    ticks: { color: textColor, callback: (v) => v + '%', stepSize: 20 },
                    title: { display: true, text: 'Moisture (%)', color: textColor },
                    beginAtZero: true,
                    grace: '0%'
                },
                x: {
                    grid: { color: gridColor },
                    ticks: { color: textColor },
                    title: { display: true, text: 'Time', color: textColor }
                }
            },
            interaction: { intersect: false, mode: 'index' },
            animations: { tension: { duration: 1000, easing: 'linear' } }
        }
    };
    
    moistureChart = new Chart(ctx, config);
}


// --- 7. UNCHANGED FUNCTIONS (Theme, Nav, Easter Egg) ---

function initializeTheme() {
    const themeSwitcher = document.getElementById('theme-switcher');
    const themeIcon = themeSwitcher.querySelector('.theme-icon');
    const themeText = themeSwitcher.querySelector('.theme-text');
    const body = document.body;
    
    const savedTheme = localStorage.getItem('agrosense-theme') || 'light';
    setTheme(savedTheme);
    
    themeSwitcher.addEventListener('click', function() {
        const currentTheme = body.classList.contains('dark-theme') ? 'dark' : 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
    });
    
    function setTheme(theme) {
        if (theme === 'dark') {
            body.classList.remove('light-theme');
            body.classList.add('dark-theme');
            themeIcon.className = 'bi bi-moon-fill theme-icon';
            themeText.textContent = 'Dark';
        } else {
            body.classList.remove('dark-theme');
            body.classList.add('light-theme');
            themeIcon.className = 'bi bi-sun-fill theme-icon';
            themeText.textContent = 'Light';
        }
        localStorage.setItem('agrosense-theme', theme);
        
        // RE-ADDED: This line updates the chart theme
        updateChartTheme();
    }
}

// RE-ADDED: This function updates the chart colors
function updateChartTheme() {
    if (!moistureChart) return;
    
    const isDark = document.body.classList.contains('dark-theme');
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    const textColor = isDark ? '#A0A0A0' : '#64748B';
    
    moistureChart.options.scales.x.grid.color = gridColor;
    moistureChart.options.scales.x.ticks.color = textColor;
    moistureChart.options.scales.x.title.color = textColor;
    moistureChart.options.scales.y.grid.color = gridColor;
    moistureChart.options.scales.y.ticks.color = textColor;
    moistureChart.options.scales.y.title.color = textColor;
    
    if (moistureChart.options.plugins.tooltip) {
        moistureChart.options.plugins.tooltip.backgroundColor = isDark ? '#2D2D2D' : '#FFFFFF';
        moistureChart.options.plugins.tooltip.titleColor = isDark ? '#FFFFFF' : '#1E293B';
        moistureChart.options.plugins.tooltip.bodyColor = isDark ? '#A0A0A0' : '#64748B';
    }
    
    moistureChart.update();
}

function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const pages = document.querySelectorAll('.page');
    
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const targetPage = this.getAttribute('data-page');
            
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            
            pages.forEach(page => {
                page.classList.remove('active');
                if (page.id === targetPage) {
                    page.classList.add('active');
                }
            });
        });
    });
}

function setupEasterEgg() {
    const logoContainer = document.querySelector('.logo-container');
    const tractor = document.getElementById('tractor');
    if (!logoContainer || !tractor) return;
    
    let clickCount = 0;
    let lastClickTime = 0;
    
    logoContainer.addEventListener('click', function() {
        const currentTime = new Date().getTime();
        
        if (currentTime - lastClickTime > 1000) {
            clickCount = 0;
        }
        
        clickCount++;
        lastClickTime = currentTime;
        
        if (clickCount >= 5) {
            triggerEasterEgg();
            clickCount = 0; 
        }
    });
}

function triggerEasterEgg() {
    const tractor = document.getElementById('tractor');
    if (tractor.classList.contains('animate')) return;
    
    tractor.classList.remove('hidden');
    
    setTimeout(function() {
        tractor.classList.add('animate');
    }, 10);
    
    setTimeout(function() {
        tractor.classList.remove('animate');
        tractor.classList.add('hidden');
    }, 3000);
}