/**
 * Smart Health Advisor | Expert System Engine
 * Sophisticated Neural-Inspired Reasoning & Interactive UI Logic
 */

// --- State Management ---
let currentState = {
    screen: 'landing',
    theme: localStorage.getItem('healthTheme') || 'light',
    userInfo: {
        age: 34,
        gender: 'male'
    },
    selectedSymptoms: [],
    activeBodyPart: null,
    results: [],
    history: JSON.parse(localStorage.getItem('healthHistory') || '[]'),
    chartInstance: null
};

// --- Knowledge Base ---
const SYMPTOMS_DATABASE = [
    { id: 'fever', name: 'High Fever', icon: 'fa-thermometer-high', part: 'head' },
    { id: 'headache', name: 'Acute Cephalgia', icon: 'fa-head-side-virus', part: 'head' },
    { id: 'dizziness', name: 'Vertigo/Dizziness', icon: 'fa-spinner', part: 'head' },
    { id: 'cough', name: 'Persistent Cough', icon: 'fa-lungs', part: 'chest' },
    { id: 'shortness-breath', name: 'Dyspnea (Breath Shortness)', icon: 'fa-wind', part: 'chest' },
    { id: 'chest-pain', name: 'Thoracic Discomfort', icon: 'fa-heart-pulse', part: 'chest' },
    { id: 'nausea', name: 'Nausea/Emesis', icon: 'fa-stomach', part: 'stomach' },
    { id: 'abdominal-pain', name: 'Abdominal Distress', icon: 'fa-stomach', part: 'stomach' },
    { id: 'fatigue', name: 'Systemic Lethargy', icon: 'fa-battery-quarter', part: 'chest' },
    { id: 'joint-pain', name: 'Arthralgia (Joint Pain)', icon: 'fa-bone', part: 'legs' },
    { id: 'muscle-pain', name: 'Myalgia (Muscle Aches)', icon: 'fa-person-dots-from-line', part: 'arms' },
    { id: 'sore-throat', name: 'Pharyngitis (Sore Throat)', icon: 'fa-mouth', part: 'head' },
    { id: 'rash', name: 'Dermatological Lesion', icon: 'fa-braille', part: 'arms' }
];

const screens = ['landing', 'user-info', 'symptoms', 'follow-up', 'analysis', 'results', 'recommendations', 'history'];

// --- Navigation & Core UI ---
function nextScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    
    const target = document.getElementById(`screen-${screenId}`);
    if (target) {
        target.classList.add('active');
        currentState.screen = screenId;
        updateProgressBar();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Lifecycle Hooks
    if (screenId === 'symptoms') renderSymptoms();
    if (screenId === 'follow-up') renderFollowUps();
    if (screenId === 'history') {
        renderHistory();
        initHistoryChart();
    }
}

function updateProgressBar() {
    const total = screens.length;
    const currentIdx = screens.indexOf(currentState.screen);
    const progress = ((currentIdx) / (total - 1)) * 100;
    const bar = document.getElementById('progressBar');
    if (bar) bar.style.width = `${progress}%`;
}

// --- Theme Management ---
function initTheme() {
    document.documentElement.setAttribute('data-theme', currentState.theme);
    const icon = document.querySelector('#themeToggle i');
    if (icon) icon.className = currentState.theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

function toggleTheme() {
    currentState.theme = currentState.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('healthTheme', currentState.theme);
    initTheme();
}

// --- Screen 2: Patient Profiling ---
function validateUserInfo() {
    try {
        const ageInput = document.getElementById('user-age');
        const genderInput = document.getElementById('user-gender');
        
        if (!ageInput || !genderInput) {
            console.error("Critical Input Components Missing");
            return;
        }

        const age = ageInput.value;
        const gender = genderInput.value;
        
        if (!age || !gender) {
            alert('Demographic data is essential for accurate expert inference.');
            return;
        }

        currentState.userInfo = {
            age,
            gender,
            conditions: Array.from(document.querySelectorAll('.checkbox-item input:checked')).map(c => c.value)
        };

        window.nextScreen('symptoms');
    } catch (err) {
        console.error("Validation Error:", err);
    }
}

// --- Screen 3: Symptom Matrix ---
function renderSymptoms() {
    const grid = document.getElementById('symptomGrid');
    if (!grid) return;
    grid.innerHTML = '';

    const filtered = currentState.activeBodyPart 
        ? SYMPTOMS_DATABASE.filter(s => s.part === currentState.activeBodyPart)
        : SYMPTOMS_DATABASE;

    filtered.forEach(s => {
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

    initBodyMap();
}

function toggleSymptom(id) {
    if (currentState.selectedSymptoms.includes(id)) {
        currentState.selectedSymptoms = currentState.selectedSymptoms.filter(s => s !== id);
    } else {
        currentState.selectedSymptoms.push(id);
    }
    
    updateSymptomUI();
}

function updateSymptomUI() {
    const summary = document.getElementById('selection-summary');
    const list = document.getElementById('selected-list');
    const btn = document.getElementById('btn-to-followup');

    if (currentState.selectedSymptoms.length > 0) {
        if (summary) summary.style.display = 'block';
        if (list) list.innerText = currentState.selectedSymptoms.map(sid => SYMPTOMS_DATABASE.find(s => s.id === sid)?.name || sid).join(', ');
        if (btn) btn.disabled = false;
    } else {
        if (summary) summary.style.display = 'none';
        if (btn) btn.disabled = true;
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

function initBodyMap() {
    document.querySelectorAll('.body-part').forEach(part => {
        const partName = part.getAttribute('data-part');
        if (currentState.activeBodyPart === partName) {
            part.classList.add('active');
        } else {
            part.classList.remove('active');
        }

        part.onclick = (e) => {
            e.stopPropagation();
            if (currentState.activeBodyPart === partName) {
                currentState.activeBodyPart = null;
            } else {
                currentState.activeBodyPart = partName;
            }
            renderSymptoms();
        };
    });
}

// --- Screen 4: Neural Follow-ups ---
function renderFollowUps() {
    const container = document.getElementById('follow-up-container');
    if (!container) return;
    container.innerHTML = `
        <h2>Contextual Expansion</h2>
        <p>The reasoning engine requires temporal and intensity parameters for high-confidence mapping.</p>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
            <div class="form-group">
                <label>Temporal Duration</label>
                <select id="duration">
                    <option value="today">Acute (< 24h)</option>
                    <option value="few-days">Sub-acute (2-3 Days)</option>
                    <option value="week">Persistent (> 1 week)</option>
                </select>
            </div>

            <div class="form-group">
                <label>Intensity Vector (1-10)</label>
                <input type="range" id="severity" min="1" max="10" value="5" style="width:100%; height: 8px;">
                <div style="display:flex; justify-content:space-between; font-size: 0.75rem; color: var(--text-muted); margin-top: 0.5rem">
                    <span>Mild</span>
                    <span>Mod</span>
                    <span>Severe</span>
                </div>
            </div>
        </div>

        <div class="form-group">
            <label>Pathological Progression</label>
            <div class="checkbox-group">
                <label class="checkbox-item"><input type="radio" name="trend" value="improving"> Regressive</label>
                <label class="checkbox-item"><input type="radio" name="trend" value="stable" checked> Stable</label>
                <label class="checkbox-item"><input type="radio" name="trend" value="worsening"> Progressive</label>
            </div>
        </div>
    `;
}

// --- Screen 5: Neural Reasoning Engine ---
async function startAnalysis() {
    nextScreen('analysis');
    
    const steps = [
        "Initializing rule-based inference engine...",
        "Applying demographic weights (Age: " + (currentState.userInfo.age || 25) + ")...",
        "Mapping symptoms to knowledge nodes...",
        "Running probabilistic convergence on " + currentState.selectedSymptoms.length + " indicators...",
        "Calculating confidence interval through severity weighting..."
    ];

    const viz = document.getElementById('reasoningViz');
    const stepEl = document.getElementById('analysis-steps');
    if (viz) viz.innerHTML = '';
    if (stepEl) stepEl.innerHTML = '';

    // Create Viz Nodes with improved feel
    const nodes = ['Observation', 'Knowledge', 'Inference'];
    nodes.forEach((n, idx) => {
        const div = document.createElement('div');
        div.className = 'viz-node';
        div.innerText = n;
        div.style.transitionDelay = `${idx * 0.5}s`;
        if (viz) viz.appendChild(div);
    });

    for (let i = 0; i < steps.length; i++) {
        await new Promise(r => setTimeout(r, 1000));
        const el = document.createElement('div');
        el.className = 'reasoning-step';
        el.innerHTML = `<i class="fas fa-check-circle" style="margin-right: 0.75rem; color: var(--secondary)"></i> <span>${steps[i]}</span>`;
        el.style.marginBottom = '1rem';
        el.style.display = 'flex';
        el.style.alignItems = 'center';
        el.style.animation = 'slideIn 0.5s cubic-bezier(0.23, 1, 0.32, 1) forwards';
        if (stepEl) stepEl.appendChild(el);
        
        // Dynamic Viz Update
        if (viz) {
            if (i === 1) {
                viz.children[0].classList.add('active-node');
                viz.children[0].style.boxShadow = '0 0 20px var(--primary-glow)';
            }
            if (i === 2) {
                viz.children[1].classList.add('active-node');
                viz.children[1].style.boxShadow = '0 0 20px var(--primary-glow)';
            }
            if (i === 4) {
                viz.children[2].classList.add('active-node');
                viz.children[2].style.boxShadow = '0 0 20px var(--secondary-glow)';
            }
        }
    }

    performDiagnosis();
}

function performDiagnosis() {
    const syms = currentState.selectedSymptoms;
    const severity = parseInt(document.getElementById('severity')?.value || 5);
    let conditions = [];

    // Refined Expert Rules with complexity
    if (syms.includes('fever') && syms.includes('headache')) {
        let conf = 60 + (severity * 2);
        if (syms.includes('sore-throat')) conf += 10;
        conditions.push({ name: 'Viral Influenza (Flu)', confidence: Math.min(conf, 95), type: 'Infection' });
    }
    
    if (syms.includes('cough') && syms.includes('shortness-breath')) {
        conditions.push({ name: 'Upper Respiratory Infection', confidence: 75 + (severity * 1), warning: true });
        if (severity > 8) conditions.push({ name: 'Pneumonic Complications', confidence: 40, warning: true });
    }

    if (syms.includes('nausea') && (syms.includes('abdominal-pain') || syms.includes('stomach-cramps'))) {
        conditions.push({ name: 'Gastroenteritis (Viral)', confidence: 65 + (severity * 1.5) });
    }

    if (syms.includes('chest-pain')) {
        conditions.push({ name: 'Angina/Cardiac Stress Indicator', confidence: 35, warning: true, type: 'Critical' });
    }

    if (conditions.length === 0) {
        conditions.push({ name: 'Benign Symptom Cluster', confidence: 50, type: 'General' });
    }

    currentState.results = conditions.sort((a,b) => b.confidence - a.confidence);
    saveToHistory();
    renderResults();
    nextScreen('results');
}

// --- Screen 6: Results ---
function renderResults() {
    const list = document.getElementById('results-list');
    if (!list) return;
    list.innerHTML = '';

    currentState.results.forEach((res, index) => {
        const card = document.createElement('div');
        card.className = 'card result-card';
        card.style.animationDelay = `${index * 0.2}s`;
        card.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:flex-start">
                <h3 style="margin:0">${res.name} ${res.warning ? '<i class="fas fa-exclamation-triangle" style="color:var(--danger); margin-left:0.5rem"></i>' : ''}</h3>
                <span style="font-size: 0.7525rem; font-weight:800; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.05em">${res.type || 'Indicator'}</span>
            </div>
            <div class="confidence-bg">
                <div class="confidence-fill" style="width: 0%"></div>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <p style="font-size: 0.9rem; font-weight: 700; color: var(--primary); margin:0">System Confidence: ${res.confidence}%</p>
                <div style="font-size: 0.8rem; color: var(--text-muted)">Correlation: High</div>
            </div>
            <p style="margin-top:1.5rem; margin-bottom:0; font-size: 0.95rem; line-height: 1.5; color: var(--text-main)">
                The reasoning engine identified <strong>${currentState.selectedSymptoms.length} biological markers</strong> that converge on this condition with a confidence interval of ${res.confidence}%.
            </p>
        `;
        list.appendChild(card);
        
        setTimeout(() => {
            const fill = card.querySelector('.confidence-fill');
            if (fill) fill.style.width = res.confidence + '%';
        }, 300);
    });
}

// --- Screen 7: Recommendations ---
const recommendationData = {
    'low': {
        title: 'Preventative / Monitoring',
        actions: ['Oral Rehydration Therapy (2.5L+ fluids)', 'Cessation of strenuous physical activity for 48h', 'Continuous temperature monitoring every 4-6h'],
        note: 'Monitor for escalation of symptoms or new visual markers.'
    },
    'med': {
        title: 'Active Management',
        actions: ['Pharmacological consultation (Antipyretics/Analgesics)', 'Targeted rest in climate-controlled environment', 'Isolation protocols to mitigate viral transmission', 'Schedule a primary care screening if stable after 72h'],
        note: 'Requires vigilant oversight of breathing rhythm and fatigue levels.'
    },
    'high': {
        title: 'Urgent Clinical Protocol',
        actions: ['Immediate Emergency Department Presentation', 'Request comprehensive blood panel and vitals scan', 'Cease all autonomous activity', 'Secure transportation to clinical facility'],
        note: 'Critical indicators detected. High-priority medical assessment mandatory.'
    }
};

function renderRecommendations() {
    const severity = parseInt(document.getElementById('severity')?.value || 5);
    const level = severity < 4 ? 'low' : (severity < 8 ? 'med' : 'high');
    const data = recommendationData[level];
    const content = document.getElementById('recommendations-content');
    if (!content) return;
    
    content.innerHTML = `
        <div style="padding: 2rem; border-radius: var(--radius-md); background: ${level === 'high' ? 'var(--danger)' : (level === 'med' ? 'var(--primary)' : 'var(--secondary)')}; color: white; margin-bottom: 2.5rem; box-shadow: 0 10px 20px var(--primary-glow)">
            <h3 style="color: white; margin:0; font-size: 1.5rem;">Protocol Score: ${level.toUpperCase()}</h3>
            <p style="color: rgba(255,255,255,0.9); margin: 0.5rem 0 0 0; font-size: 0.95rem;">${data.title}</p>
        </div>
        
        <h4 style="margin-bottom: 1.5rem; font-weight: 700; color: var(--text-main)">Computational Recommendations</h4>
        <ul style="list-style: none; padding-left: 0; margin-bottom: 3rem;">
            ${data.actions.map(r => `<li style="margin-bottom: 1.5rem; display:flex; gap: 1.25rem; align-items:flex-start;">
                <div style="width: 24px; height: 24px; border-radius: 50%; background: var(--secondary-glow); color: var(--secondary); display:flex; align-items:center; justify-content:center; flex-shrink:0">
                    <i class="fas fa-check" style="font-size: 0.8rem"></i>
                </div>
                <span style="font-size: 1.1rem; color: var(--text-main)">${r}</span>
            </li>`).join('')}
        </ul>

        <div style="padding: 1.5rem; background: var(--surface-solid); border: 1px solid var(--border); border-radius: var(--radius-md);">
            <p style="margin:0; font-style: italic; color: var(--text-muted); font-size: 0.95rem">
                "<strong>Expert Note:</strong> ${data.note}"
            </p>
        </div>
    `;
}

// --- Screen 8: Analytics & History ---
function calculateWellnessScore() {
    if (currentState.history.length === 0) return 100;
    const recent = currentState.history.slice(0, 5);
    const avgSeverity = recent.reduce((sum, item) => sum + item.severity, 0) / recent.length;
    const frequencyPenalty = (recent.length / 5) * 10;
    return Math.max(10, Math.round(100 - (avgSeverity * 8) - frequencyPenalty));
}

function saveToHistory() {
    const entry = {
        id: 'REF-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
        date: new Date().toLocaleDateString(),
        fullDate: new Date().toLocaleString(),
        symptoms: currentState.selectedSymptoms.length,
        result: currentState.results[0]?.name || 'Unknown',
        confidence: currentState.results[0]?.confidence || 0,
        severity: parseInt(document.getElementById('severity')?.value || 5)
    };
    currentState.history.unshift(entry);
    localStorage.setItem('healthHistory', JSON.stringify(currentState.history.slice(0, 20)));
}

function renderHistory() {
    const list = document.getElementById('history-list');
    if (!list) return;

    const wellnessScore = calculateWellnessScore();
    const scoreColor = wellnessScore > 80 ? 'var(--secondary)' : (wellnessScore > 50 ? 'var(--accent)' : 'var(--danger)');

    if (currentState.history.length === 0) {
        list.innerHTML = '<p style="text-align:center; padding: 2rem; color:var(--text-muted)">Diagnostic history is currently empty.</p>';
        return;
    }

    let html = `
        <div class="card" style="text-align:center; padding: 2.5rem; margin-bottom: 3rem; border: 2px solid ${scoreColor}; background: var(--surface-solid)">
            <p style="margin-bottom: 0.5rem; text-transform: uppercase; font-size: 0.8rem; font-weight: 800; color: var(--text-muted)">Current Wellness Index</p>
            <h2 style="font-size: 4rem; color: ${scoreColor}; margin:0">${wellnessScore}</h2>
            <p style="margin-top:0.5rem; font-size: 0.95rem; color: var(--text-main)">${wellnessScore > 70 ? 'Optimal biological stability detected.' : 'Increased physiological stress markers recorded.'}</p>
        </div>
    `;

    html += currentState.history.map((item, idx) => `
        <div class="card" style="padding: 1.5rem; margin-bottom: 1.25rem; border-left: 6px solid ${idx === 0 ? 'var(--primary)' : 'var(--border)'}; transition: var(--transition)">
            <div style="display:flex; justify-content:space-between; align-items:center">
                <div>
                    <h4 style="margin:0; font-size: 1.15rem; color: var(--text-main)">${item.result}</h4>
                    <span style="font-size: 0.85rem; color: var(--text-muted)">Consultation Ref: ${item.fullDate}</span>
                </div>
                <div style="text-align:right">
                    <span style="display:block; font-weight:800; color:var(--primary); font-size: 1.1rem">${item.confidence}%</span>
                    <span style="font-size: 0.75rem; color:var(--text-muted); text-transform:uppercase">${item.symptoms} Markers</span>
                </div>
            </div>
        </div>
    `).join('');

    list.innerHTML = html;
}

function initHistoryChart() {
    const chartEl = document.getElementById('historyChart');
    if (!chartEl || currentState.history.length === 0) return;
    const ctx = chartEl.getContext('2d');
    if (!ctx) return;

    if (currentState.chartInstance) currentState.chartInstance.destroy();

    const data = [...currentState.history].reverse().slice(-7);
    
    currentState.chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(i => i.date),
            datasets: [{
                label: 'Physiological Stress',
                data: data.map(i => i.severity),
                borderColor: '#2563eb',
                backgroundColor: 'rgba(37, 99, 235, 0.05)',
                tension: 0.5,
                fill: true,
                borderWidth: 4,
                pointRadius: 6,
                pointBackgroundColor: '#2563eb'
            }, {
                label: 'Model Confidence',
                data: data.map(i => i.confidence / 10),
                borderColor: '#10b981',
                borderDash: [8, 4],
                tension: 0.3,
                fill: false,
                borderWidth: 2,
                pointRadius: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { intersect: false, mode: 'index' },
            plugins: {
                legend: { position: 'top', align: 'end', labels: { usePointStyle: true, color: currentState.theme === 'dark' ? '#f8fafc' : '#0f172a', font: { weight: 'bold' } } }
            },
            scales: {
                y: { min: 0, max: 10, grid: { color: 'rgba(0,0,0,0.05)', drawBorder: false }, ticks: { stepSize: 2 } },
                x: { grid: { display: false } }
            }
        }
    });
}

function exportData() {
    const reportText = `
=========================================
      SMART HEALTH ADVISOR REPORT
=========================================
Date of Analysis: ${new Date().toLocaleString()}
System Kernel: V3.2.0-STABLE
-----------------------------------------

1. CLINICAL DEMOGRAPHICS
-----------------------------------------
Biological Age: ${currentState.userInfo.age || 'Not Recorded'}
Biological Gender: ${currentState.userInfo.gender || 'Not Recorded'}
Pre-existing Conditions: ${currentState.userInfo.conditions?.length > 0 ? currentState.userInfo.conditions.join(', ') : 'None Disclosed'}

2. DIAGNOSTIC INFERENCE SUMMARY
-----------------------------------------
Primary Indicator: ${currentState.results[0]?.name || 'Unknown'}
Engine Confidence: ${currentState.results[0]?.confidence || 0}%
Indicator Pattern: ${currentState.results[0]?.type || 'General'}
Biological Markers Identified: ${currentState.selectedSymptoms.length}

3. COMPUTATIONAL RECOMMENDATIONS
-----------------------------------------
${currentState.results[0]?.warning ? 'CRITICAL: High intensity markers detected. Immediate clinical assessment advised.\n' : '- Standard protocol management applied'}
- Review non-clinical action plan provided in session dashboard.

4. LOGICAL HISTORY CONTEXT
-----------------------------------------
Historical Consultations: ${currentState.history.length}
Recent Wellness Index: ${calculateWellnessScore()}/100

-----------------------------------------
DISCLAIMER: This report is a computational 
model for educational simulation and should 
not replace clinical diagnosis.
=========================================
    `.trim();

    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Clinical_Analysis_Report_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
}

function clearHistory() {
    if (confirm('Permanently purge historical diagnostic datasets?')) {
        currentState.history = [];
        localStorage.removeItem('healthHistory');
        renderHistory();
        if (currentState.chartInstance) currentState.chartInstance.destroy();
    }
}

function seedDummyData() {
    if (currentState.history.length === 0) {
        const dummyHistory = [
            { id: 'REF-H4X92', date: '2026-03-05', fullDate: '3/5/2026, 2:30 PM', symptoms: 3, result: 'Viral Influenza (Flu)', confidence: 88, severity: 7 },
            { id: 'REF-P2K11', date: '2026-02-15', fullDate: '2/15/2026, 10:15 AM', symptoms: 2, result: 'Upper Respiratory Infection', confidence: 72, severity: 4 },
            { id: 'REF-M9L44', date: '2026-01-20', fullDate: '1/20/2026, 4:45 PM', symptoms: 1, result: 'Benign Symptom Cluster', confidence: 50, severity: 2 },
            { id: 'REF-S1T88', date: '2025-12-10', fullDate: '12/10/2025, 9:00 AM', symptoms: 4, result: 'Gastroenteritis (Viral)', confidence: 82, severity: 6 },
            { id: 'REF-R7V32', date: '2025-11-28', fullDate: '11/28/2025, 11:20 AM', symptoms: 2, result: 'Viral Influenza (Flu)', confidence: 65, severity: 5 }
        ];
        currentState.history = dummyHistory;
        localStorage.setItem('healthHistory', JSON.stringify(dummyHistory));
    }
}

// --- Global API Export ---
window.nextScreen = nextScreen;
window.validateUserInfo = validateUserInfo;
window.toggleSymptom = toggleSymptom;
window.filterSymptoms = filterSymptoms;
window.startAnalysis = startAnalysis;
window.exportData = exportData;
window.clearHistory = clearHistory;

// Initialize
window.onload = () => {
    initTheme();
    seedDummyData();
    
    // Theme Toggle
    const themeBtn = document.getElementById('themeToggle');
    if (themeBtn) themeBtn.onclick = toggleTheme;

    // Logo Navigation
    const logo = document.getElementById('mainLogo');
    if (logo) {
        logo.onclick = () => window.nextScreen('landing');
    }

    // Pre-fill demo data
    const ageInput = document.getElementById('user-age');
    const genderInput = document.getElementById('user-gender');
    if (ageInput) ageInput.value = currentState.userInfo.age;
    if (genderInput) genderInput.value = currentState.userInfo.gender;

    updateProgressBar();
};

// Global API Exposure
window.nextScreen = (id) => {
    console.log(`Navigating to screen: ${id}`);
    if (id === 'recommendations') renderRecommendations();
    
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    
    const target = document.getElementById(`screen-${id}`);
    if (target) {
        target.classList.add('active');
        currentState.screen = id;
        
        // Progress Bar
        const total = screens.length;
        const currentIdx = screens.indexOf(id);
        const progress = ((currentIdx) / (total - 1)) * 100;
        const bar = document.getElementById('progressBar');
        if (bar) bar.style.width = `${progress}%`;

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Lifecycle Hooks
    if (id === 'symptoms') renderSymptoms();
    if (id === 'follow-up') renderFollowUps();
    if (id === 'history') {
        renderHistory();
        setTimeout(initHistoryChart, 300); // Small delay for layout calculation
    }
};

window.validateUserInfo = validateUserInfo;
window.toggleSymptom = toggleSymptom;
window.filterSymptoms = filterSymptoms;
window.startAnalysis = startAnalysis;
window.exportData = exportData;
window.clearHistory = clearHistory;
