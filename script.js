// 1. Демо-данные для мероприятий (чтобы экран не был пустым)
const demoEvents = [
    { title: "Сбор пластика в Куркино", date: "25 Января, 12:00", location: "Парк Дубрава", category: "Волонтерство" },
    { title: "Лекция: Zero Waste", date: "28 Января, 18:30", location: "Библиотека №211", category: "Обучение" }
];

// 2. Управление экранами и Таб-баром
function showScreen(screenId) {
    // Скрываем все экраны
    document.querySelectorAll('.screen').forEach(s => s.style.display = 'none');

    // Показываем целевой
    const target = document.getElementById(screenId);
    if (target) target.style.display = 'block';

    // ПРАВКА БАГА: Снимаем активный класс со всех кнопок
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));

    // Находим кнопку, на которую нажали, и делаем её активной
    const activeTab = document.querySelector(`[onclick="showScreen('${screenId}')"]`);
    if (activeTab) activeTab.classList.add('active');

    // Тактильный отклик
    if (window.Telegram?.WebApp?.HapticFeedback) {
        Telegram.WebApp.HapticFeedback.impactOccurred('light');
    }

    // Если перешли на экран мероприятий, отрисовываем их
    if (screenId === 'events') renderEvents();
}

// 3. Отрисовка мероприятий
function renderEvents() {
    const container = document.getElementById('events-list'); // Убедись, что в HTML есть этот ID
    if (!container) return;

    container.innerHTML = demoEvents.map(event => `
        <div class="glass-card card" style="margin-bottom: 12px;">
            <div class="label">${event.category}</div>
            <h3 style="margin: 8px 0;">${event.title}</h3>
            <p style="font-size: 14px; opacity: 0.6; margin: 4px 0;">📍 ${event.location}</p>
            <div style="color: var(--mint); font-weight: 700; margin-top: 8px;">${event.date}</div>
        </div>
    `).join('');
}

// 4. Логика выполнения задания
function completeTask() {
    const btn = document.getElementById('complete-btn');
    const timerDisplay = document.getElementById('task-timer');

    // Устанавливаем время истечения (через 24 часа)
    const expiry = Date.now() + 24 * 60 * 60 * 1000;
    localStorage.setItem('task_expiry', expiry);

    // Меняем кнопку на таймер
    btn.style.display = 'none';
    timerDisplay.style.display = 'block';

    startTimer(expiry);

    if (window.Telegram?.WebApp?.HapticFeedback) {
        Telegram.WebApp.HapticFeedback.notificationOccurred('success');
    }
}

// 5. Работа таймера
function startTimer(expiry) {
    const timerDisplay = document.getElementById('task-timer');

    const interval = setInterval(() => {
        const now = Date.now();
        const diff = expiry - now;

        if (diff <= 0) {
            clearInterval(interval);
            document.getElementById('complete-btn').style.display = 'block';
            timerDisplay.style.display = 'none';
            localStorage.removeItem('task_expiry');
            return;
        }

        const h = Math.floor(diff / 3600000).toString().padStart(2, '0');
        const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
        const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');

        timerDisplay.textContent = `${h}:${m}:${s}`;
    }, 1000);
}

// 6. Проверка состояния при запуске
window.onload = () => {
    const savedExpiry = localStorage.getItem('task_expiry');
    if (savedExpiry && savedExpiry > Date.now()) {
        document.getElementById('complete-btn').style.display = 'none';
        document.getElementById('task-timer').style.display = 'block';
        startTimer(parseInt(savedExpiry));
    }
    // Показываем главный экран по умолчанию
    showScreen('home');
};
