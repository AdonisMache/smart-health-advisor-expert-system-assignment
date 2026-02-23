// --- State Management ---
let currentState = {
    screen: 'landing',
    userInfo: {},
    selectedSymptoms: [],
    followUpAnswers: {},
    results: [],
    history: JSON.parse(localStorage.getItem('healthHistory') || '[]')
};

const screens = ['landing', 'user-info', 'symptoms', 'follow-up', 'analysis', 'results', 'recommendations', 'history'];

const SYMPTOMS_DATABASE = [
    { id: 'fever', name: 'Fever', icon: 'fa-thermometer-half' },
    { id: 'headache', name: 'Headache', icon: 'fa-head-side-virus' },
    { id: 'cough', name: 'Cough', icon: 'fa-lungs' },
    { id: 'fatigue', name: 'Fatigue', icon: 'fa-bed' },
    { id: 'nausea', name: 'Nausea', icon: 'fa-stomach' },
    { id: 'chest-pain', name: 'Chest Pain', icon: 'fa-heart-pulse' },
    { id: 'body-aches', name: 'Body Aches', icon: 'fa-person-dots-from-line' },
    { id: 'shortness-breath', name: 'Shortness of Breath', icon: 'fa-wind' },
    { id: 'sore-throat', name: 'Sore Throat', icon: 'fa-mouth' }
];

// --- Navigation ---
function nextScreen(screenId) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    
    // Show target screen
    const target = document.getElementById(`screen-${screenId}`);
    if (target) {
        target.classList.add('active');
        currentState.screen = screenId;
        updateProgressBar();
        window.scrollTo(0, 0);
    }

    // Special logic per screen
    if (screenId === 'symptoms') renderSymptoms();
    if (screenId === 'follow-up') renderFollowUps();
    if (screenId === 'history') renderHistory();
}

function updateProgressBar() {
    const total = screens.length;
    const currentIdx = screens.indexOf(currentState.screen);
    const progress = ((currentIdx) / (total - 1)) * 100;
    document.getElementById('progressBar').style.width = `${progress}%`;
}

// --- Screen 2: User info ---
function validateUserInfo() {
    const age = document.getElementById('user-age').value;
    const gender = document.getElementById('user-gender').value;
    
    if (!age || !gender) {
        alert('Please provide at least your age and gender for the expert system.');
        return;
    }

    currentState.userInfo = {
        age,
        gender,
        conditions: Array.from(document.querySelectorAll('.checkbox-item input:checked')).map(c => c.value),
        location: document.getElementById('user-location').value
    };

    nextScreen('symptoms');
}

// --- Screen 3: Symptoms ---
function renderSymptoms() {
    const grid = document.getElementById('symptomGrid');
    grid.innerHTML = '';

    SYMPTOMS_DATABASE.forEach(s => {
        const isSelected = currentState.selectedSymptoms.includes(s.id);
        const card = document.createElement('div');
        card.className = `symptom-card ${isSelected ? 'selected' : ''}`;
        card.onclick = () => toggleSymptom(s.id);
        card.innerHTML = `
            <i class="fas ${s.icon}"></i>
            <span>${s.name}</span>
        `;
        grid.appendChild(card);
    });
}

function toggleSymptom(id) {
    if (currentState.selectedSymptoms.includes(id)) {
        currentState.selectedSymptoms = currentState.selectedSymptoms.filter(s => s !== id);
    } else {
        currentState.selectedSymptoms.push(id);
    }
    
    const summary = document.getElementById('selection-summary');
    const list = document.getElementById('selected-list');
    const btn = document.getElementById('btn-to-followup');

    if (currentState.selectedSymptoms.length > 0) {
        summary.style.display = 'block';
        list.innerText = currentState.selectedSymptoms.map(sid => SYMPTOMS_DATABASE.find(s => s.id === sid).name).join(', ');
        btn.disabled = false;
    } else {
        summary.style.display = 'none';
        btn.disabled = true;
    }
    
    renderSymptoms();
}

function filterSymptoms() {
    const query = document.getElementById('symptom-search').value.toLowerCase();
    document.querySelectorAll('.symptom-card').forEach(card => {
        const name = card.querySelector('span').innerText.toLowerCase();
        card.style.display = name.includes(query) ? 'block' : 'none';
    });
}

// --- Screen 4: Follow Up ---
function renderFollowUps() {
    const container = document.getElementById('follow-up-container');
    container.innerHTML = `
        <h2>Deepening the Analysis</h2>
        <p>Expert systems require context. Please answer these secondary questions.</p>
        
        <div class="form-group">
            <label>How long have you felt these symptoms?</label>
            <select id="duration">
                <option value="today">Less than 24 hours</option>
                <option value="few-days">2-3 Days</option>
                <option value="week">A week or more</option>
            </select>
        </div>

        <div class="form-group">
            <label>Symptom Severity (Scale of 1-10)</label>
            <input type="range" id="severity" min="1" max="10" value="5" style="width:100%">
            <div style="display:flex; justify-content:space-between; font-size: 0.8rem; color: var(--text-muted)">
                <span>Mild</span>
                <span>Moderate</span>
                <span>Severe</span>
            </div>
        </div>

        <div class="form-group">
            <label>Are your symptoms getting worse?</label>
            <div class="checkbox-group">
                <label class="checkbox-item"><input type="radio" name="trend" value="improving"> Improving</label>
                <label class="checkbox-item"><input type="radio" name="trend" value="stable" checked> Stable</label>
                <label class="checkbox-item"><input type="radio" name="trend" value="worsening"> Worsening</label>
            </div>
        </div>
    `;
}

// --- Screen 5: Expert Reasoning Engine (The Logic) ---
function startAnalysis() {
    nextScreen('analysis');
    
    const steps = [
        "Initializing rule-based engine...",
        "Validating user profile: " + (currentState.userInfo.age > 40 ? "Adult Profile" : "General Profile"),
        "Matching symptoms against medical knowledge base...",
        `Analyzing ${currentState.selectedSymptoms.length} primary symptoms...`,
        "Calculating confidence scores based on severity..."
    ];

    let currentStep = 0;
    const stepEl = document.getElementById('analysis-steps');
    
    const interval = setInterval(() => {
        if (currentStep < steps.length) {
            const el = document.createElement('div');
            el.innerHTML = `<i class="fas fa-check-circle"></i> ${steps[currentStep]}`;
            el.style.marginBottom = '0.5rem';
            el.style.opacity = '0';
            el.style.transition = 'opacity 0.5s ease';
            stepEl.appendChild(el);
            setTimeout(() => el.style.opacity = '1', 10);
            currentStep++;
        } else {
            clearInterval(interval);
            performDiagnosis();
        }
    }, 1000);
}

function performDiagnosis() {
    const syms = currentState.selectedSymptoms;
    const severity = parseInt(document.getElementById('severity')?.value || 5);
    let potentialConditions = [];

    // Expert Logic Simulation
    if (syms.includes('fever') && syms.includes('headache')) {
        potentialConditions.push({ name: 'Influenza (Flu)', confidence: severity > 7 ? 85 : 65 });
        potentialConditions.push({ name: 'Malaria Risk', confidence: 40 });
    }
    
    if (syms.includes('cough') && syms.includes('fatigue')) {
        potentialConditions.push({ name: 'Respiratory Infection', confidence: 75 });
        potentialConditions.push({ name: 'Common Cold', confidence: 50 });
    }

    if (syms.includes('chest-pain')) {
        potentialConditions.push({ name: 'Cardiac Stress', confidence: 30, warning: 'Urgent' });
    }

    if (potentialConditions.length === 0) {
        potentialConditions.push({ name: 'General Viral Infection', confidence: 45 });
    }

    currentState.results = potentialConditions;
    saveToHistory();
    renderResults();
    nextScreen('results');
}

// --- Screen 6: Results ---
function renderResults() {
    const list = document.getElementById('results-list');
    list.innerHTML = '';

    currentState.results.forEach(res => {
        const card = document.createElement('div');
        card.className = 'card result-card';
        card.innerHTML = `
            <h3>${res.name} ${res.warning ? '<span style="color:var(--danger); font-size:0.8rem; vertical-align:middle">[!]</span>' : ''}</h3>
            <div class="confidence-bar">
                <div class="confidence-fill" style="width: ${res.confidence}%"></div>
            </div>
            <p style="font-size: 0.9rem">Expert Confidence: ${res.confidence}%</p>
            <p style="margin-bottom:0">Based on your reported ${currentState.selectedSymptoms.join(' and ')}, the system detects patterns typical of ${res.name}.</p>
        `;
        list.appendChild(card);
    });
}

// --- Screen 7: Recommendations ---
function nextToRecommendations() {
    nextScreen('recommendations');
}

// Overwrite the existing function to actually populate
window.nextScreen = nextScreen; // Make it global
window.validateUserInfo = validateUserInfo;
window.toggleSymptom = toggleSymptom;
window.filterSymptoms = filterSymptoms;
window.startAnalysis = startAnalysis;

// Populate Recommendations
const recommendationData = {
    'low': ['Increase hydration', 'Rest for 24 hours', 'Monitor temperature'],
    'med': ['Consult a pharmacist', 'Scheduled rest', 'Avoid strenuous activity', 'Visit a clinic if no improvement'],
    'high': ['Visit emergency department', 'Immediate bed rest', 'Professional medical consultation required']
};

function renderRecommendations() {
    const severity = parseInt(document.getElementById('severity')?.value || 5);
    const level = severity < 4 ? 'low' : (severity < 8 ? 'med' : 'high');
    const content = document.getElementById('recommendations-content');
    
    content.innerHTML = `
        <div style="padding: 1rem; border-radius: var(--radius-sm); background: ${level === 'high' ? '#fee2e2' : '#f0fdf4'}; margin-bottom: 2rem; border: 1px solid ${level === 'high' ? '#fecaca' : '#dcfce7'}">
            <h3 style="color: ${level === 'high' ? '#991b1b' : '#166534'}">Severity Level: ${level.toUpperCase()}</h3>
        </div>
        <ul style="padding-left: 1.5rem">
            ${recommendationData[level].map(r => `<li style="margin-bottom: 0.75rem">${r}</li>`).join('')}
        </ul>
    `;
}

// Override nextScreen to include recommendation rendering
const originalNextScreen = nextScreen;
nextScreen = function(id) {
    if (id === 'recommendations') renderRecommendations();
    originalNextScreen(id);
};

// --- Screen 8: History ---
function saveToHistory() {
    const entry = {
        date: new Date().toLocaleString(),
        symptoms: currentState.selectedSymptoms.map(sid => SYMPTOMS_DATABASE.find(s => s.id === sid)?.name),
        result: currentState.results[0]?.name || 'Unknown'
    };
    currentState.history.unshift(entry);
    localStorage.setItem('healthHistory', JSON.stringify(currentState.history.slice(0, 10)));
}

function renderHistory() {
    const list = document.getElementById('history-list');
    if (currentState.history.length === 0) {
        list.innerHTML = '<p>No previous consultations found.</p>';
        return;
    }

    list.innerHTML = currentState.history.map(item => `
        <div class="card" style="padding: 1rem; margin-bottom: 1rem;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start">
                <div>
                    <h4 style="margin-bottom: 0.25rem">${item.result}</h4>
                    <p style="font-size: 0.8rem; margin:0">${item.date}</p>
                </div>
                <div style="font-size: 0.75rem; color: var(--text-muted); text-align:right">
                    ${item.symptoms.join(', ')}
                </div>
            </div>
        </div>
    `).join('');
}

function clearHistory() {
    if (confirm('Clear all consultation history?')) {
        currentState.history = [];
        localStorage.removeItem('healthHistory');
        renderHistory();
    }
}

// Initialize
window.onload = () => {
    updateProgressBar();
};
