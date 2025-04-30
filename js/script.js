document.querySelectorAll('.toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const mode = btn.dataset.mode;
        document.querySelectorAll('.form-group').forEach(group => {
            group.classList.toggle('active', group.dataset.mode === mode);
        });
        document.getElementById('results').innerHTML = '';
    });
});

document.getElementById('calculator-form').addEventListener('submit', (e) => {
e.preventDefault();
const isWakeUpMode = document.querySelector('.toggle-btn.active').dataset.mode === 'wakeup';

if (isWakeUpMode) {
    const wakeUpTime = document.getElementById('wakeup-time').value;
    if (!wakeUpTime) return;
    
    // Create valid Date object with time adjustment
    const [hours, minutes] = wakeUpTime.split(':').map(Number);
    const wakeUpDate = new Date();
    wakeUpDate.setHours(hours, minutes, 0, 0);
    
    // Add 1 day if time is in the past
    if (wakeUpDate < new Date()) {
        wakeUpDate.setDate(wakeUpDate.getDate() + 1);
    }
    
    calculateSleepTimes(wakeUpDate, false);
} else {
    calculateSleepTimes(new Date(), true);
}
});

function calculateSleepTimes(baseTime, isSleepNow) {
const results = document.getElementById('results');
results.innerHTML = '';

const cycles = [1.5, 3, 4.5, 6, 7.5, 9];
const timeOptions = { hour: 'numeric', minute: '2-digit', hour12: true };

const times = cycles.map(hours => {
    const target = new Date(baseTime);
    if (isSleepNow) {
        target.setMinutes(target.getMinutes() + hours * 60);
    } else {
        target.setMinutes(target.getMinutes() - hours * 60);
    }
    return {
        hours: hours,
        time: target.toLocaleTimeString('en-US', timeOptions),
        cycleCount: hours / 1.5
    };
});

results.innerHTML = times.map(t => `
    <div class="time-card ${t.hours === 7.5 ? 'recommended' : ''}">
        <div class="time">${t.time}</div>
        <div class="details">
            <span class="cycles">${t.cycleCount} cycles</span>
            <span class="hours">${t.hours}h sleep</span>
        </div>
    </div>
`).join('');


results.scrollIntoView({
    behavior: 'smooth',
    block: 'start'
});

}


// Register service-worker.js

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
          console.log('ServiceWorker registration successful');
        })
        .catch(err => {
          console.log('ServiceWorker registration failed: ', err);
        });
    });
  }