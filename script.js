const tg = window.Telegram.WebApp;
tg.expand();

// 1. ПРОВЕРКА СОСТОЯНИЯ ЗАДАНИЯ ПРИ ЗАПУСКЕ
function checkTaskStatus() {
    const lastClick = localStorage.getItem('lastTaskCompleted');
    const timerDisplay = document.getElementById('task-timer');
    const btn = document.querySelector('.mini-done-btn');

    if (lastClick) {
        const lastDate = new Date(parseInt(lastClick)).toDateString();
        const today = new Date().toDateString();

        // Если сегодня уже нажимали — показываем таймер вместо кнопки
        if (lastDate === today) {
            if (btn) btn.style.display = 'none';
            if (timerDisplay) {
                timerDisplay.style.display = 'block';
                startMidnightTimer();
            }
        }
    }
}

// 2. ЛОГИКА ВЫПОЛНЕНИЯ (БЕЗ АЛЕРТОВ)
function completeTask() {
    if (tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');

    // Сохраняем время нажатия
    localStorage.setItem('lastTaskCompleted', Date.now().toString());

    const btn = document.querySelector('.mini-done-btn');
    const timerDisplay = document.getElementById('task-timer');

    // Плавная анимация скрытия кнопки
    if (btn) {
        btn.innerText = "Принято! ✨";
        btn.style.background = "#fff";
        setTimeout(() => {
            btn.style.display = 'none';
            if (timerDisplay) {
                timerDisplay.style.display = 'block';
                startMidnightTimer();
            }
        }, 1000);
    }
}

// 3. ТАЙМЕР ДО ПОЛНОЧИ
function startMidnightTimer() {
    const timerElement = document.getElementById('task-timer');

    function update() {
        const now = new Date();
        const midnight = new Date();
        midnight.setHours(24, 0, 0, 0);

        const diff = midnight - now;
        if (diff <= 0) {
            localStorage.removeItem('lastTaskCompleted');
            location.reload();
            return;
        }

        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);

        timerElement.innerText = `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
    }
    update();
    setInterval(update, 1000);
}

// 4. НАВИГАЦИЯ И ЗАГРУЗКА
function showScreen(screenId, element) {
    if (tg.HapticFeedback) tg.HapticFeedback.impactOccurred('medium');
    document.querySelectorAll('.screen').forEach(s => s.style.display = 'none');
    document.getElementById(screenId).style.display = 'block';
    document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
    if (element) element.classList.add('active');
    if (screenId === 'events-screen') loadEvents();
}

// ИНИЦИАЛИЗАЦИЯ
window.onload = () => {
    if (window.lucide) lucide.createIcons();

    // Анимация кольца эко-статуса
    setTimeout(() => {
        const circle = document.querySelector('.circle');
        if (circle) circle.style.strokeDasharray = "92, 100";
    }, 500);

    checkTaskStatus(); // Проверяем таймер при входе
    showScreen('main-screen', document.querySelector('.main-nav'));
};

// ... функция loadEvents остается без изменений ...
