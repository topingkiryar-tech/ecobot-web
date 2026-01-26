// 1. Демо-данные
const demoEvents = [
    { title: "Сбор пластика в Куркино", date: "25 Января, 12:00", location: "Парк Дубрава", category: "Волонтерство" },
    { title: "Лекция: Zero Waste", date: "28 Января, 18:30", location: "Библиотека №211", category: "Обучение" }
];

// 2. Управление экранами
function showScreen(screenId) {
    const screens = document.querySelectorAll('.screen');
    const tabs = document.querySelectorAll('.tab');

    screens.forEach(s => s.style.display = 'none');
    tabs.forEach(t => t.classList.remove('active'));

    const target = document.getElementById(screenId);
    if (target) {
        target.style.display = 'block';
    }

    const activeTab = document.querySelector(`[onclick="showScreen('${screenId}')"]`);
    if (activeTab) {
        activeTab.classList.add('active');
    }

    if (window.Telegram?.WebApp?.HapticFeedback) {
        Telegram.WebApp.HapticFeedback.impactOccurred('light');
    }

    // Если перешли на экран мероприятий - отрисовываем
    if (screenId === 'events-screen') {
        renderEvents();
    }

    // Если перешли на экран карты - запускаем Яндекс.Карты
    if (screenId === 'map-screen') {
        setTimeout(initYandexMap, 400);
    }
}

// 3. Отрисовка мероприятий
function renderEvents() {
    const container = document.getElementById('events-list');
    if (!container) return;

    container.innerHTML = demoEvents.map(event => `
        <div class="glass-card card" style="margin-bottom: 12px; padding: 20px; border-radius: 24px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);">
            <div class="label" style="color: var(--mint); font-size: 10px; font-weight: 800;">${event.category}</div>
            <h3 style="margin: 10px 0; font-size: 18px;">${event.title}</h3>
            <p style="font-size: 14px; opacity: 0.7; margin: 5px 0;">📍 ${event.location}</p>
            <div style="color: var(--mint); font-weight: 700; margin-top: 10px;">${event.date}</div>
        </div>
    `).join('');
}

// 4. Логика задания
function completeTask() {
    const expiry = Date.now() + 24 * 60 * 60 * 1000;
    localStorage.setItem('task_expiry', expiry);
    updateTaskUI(expiry);
}

function updateTaskUI(expiry) {
    const btn = document.getElementById('complete-btn');
    const timerDisplay = document.getElementById('task-timer');
    if (expiry && expiry > Date.now()) {
        if (btn) btn.style.display = 'none';
        if (timerDisplay) {
            timerDisplay.style.display = 'block';
            startTimer(expiry);
        }
    }
}

function startTimer(expiry) {
    const timerDisplay = document.getElementById('task-timer');
    const interval = setInterval(() => {
        const diff = expiry - Date.now();
        if (diff <= 0) {
            clearInterval(interval);
            location.reload();
            return;
        }
        const h = Math.floor(diff / 3600000).toString().padStart(2, '0');
        const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
        const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
        timerDisplay.textContent = `${h}:${m}:${s}`;
    }, 1000);
}

// 5. ГЛАВНАЯ ИНИЦИАЛИЗАЦИЯ
document.addEventListener('DOMContentLoaded', () => {
    if (window.Telegram?.WebApp) {
        Telegram.WebApp.ready();
        Telegram.WebApp.expand();
    }
    const savedExpiry = localStorage.getItem('task_expiry');
    if (savedExpiry) updateTaskUI(parseInt(savedExpiry));
    if (window.lucide) lucide.createIcons();
    showScreen('main-screen');
});

// --- БЛОК КАРТЫ (ИСПРАВЛЕННЫЙ И БЕЗОПАСНЫЙ) ---
let ymap;

function initYandexMap() {
    if (ymap || typeof ymaps === 'undefined') return;

    ymap = new ymaps.Map('map-container', {
        center: [55.7515, 37.5738], // Москва
        zoom: 12,
        controls: []
    });

    // Однократный поиск при открытии
    ymaps.search('пункт приема вторсырья', {
        boundedBy: ymap.getBounds(),
        results: 20
    }).done(res => {
        res.geoObjects.options.set('preset', 'islands#greenIcon');
        ymap.geoObjects.add(res.geoObjects);
    });
}

function locateMe() {
    if (!ymap) initYandexMap();

    navigator.geolocation.getCurrentPosition(
        pos => {
            const coords = [pos.coords.latitude, pos.coords.longitude];
            ymap.setCenter(coords, 14);

            // Просто добавляем метку, не удаляя ничего (самый безопасный способ)
            ymap.geoObjects.add(new ymaps.Placemark(coords, {
                hintContent: 'Твоё местоположение'
            }, { preset: 'islands#blueCircleDotIcon' }));

            // Ищем пункты в новом месте
            ymaps.search('пункт приема вторсырья', {
                boundedBy: ymap.getBounds(),
                results: 25
            }).done(res => {
                res.geoObjects.options.set('preset', 'islands#greenIcon');
                ymap.geoObjects.add(res.geoObjects);
            });
        },
        () => { alert('Геолокация недоступна'); },
        { enableHighAccuracy: true, timeout: 5000 }
    );
}
