// Инициализация Telegram Web App
const tg = window.Telegram.WebApp;
tg.expand();

// Данные для советов (тестовые)
const tipsData = {
    "Как сортировать пластик?": "На пластиковых изделиях ищите треугольник с цифрой. 1 и 2 принимают почти везде, а 3 и 7 — почти нигде. Перед сдачей обязательно сполосните тару!",
    "Зачем сдавать батарейки?": "Одна батарейка загрязняет 20 квадратных метров земли тяжелыми металлами. Сдавайте их в специальные боксы в магазинах!"
};

// 1. ФУНКЦИЯ ПЕРЕКЛЮЧЕНИЯ ЭКРАНОВ
function showScreen(screenId, element) {
    // Тактильный отклик (Haptic Feedback) [web:18]
    if (tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('medium');
    }

    // Скрываем все экраны
    document.querySelectorAll('.screen').forEach(s => s.style.display = 'none');

    // Показываем нужный
    const target = document.getElementById(screenId);
    if (target) {
        target.style.display = 'block';
    }

    // Управление активным состоянием кнопок в таб-баре
    document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
    if (element) {
        element.classList.add('active');
    }

    // Логика загрузки для конкретных разделов
    if (screenId === 'events-screen') loadEvents();
}

// 2. ЛОГИКА ЗАДАНИЯ И ЗАЩИТА ОТ ДЮПА (Таймер до полуночи)
function completeTask() {
    if (tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');

    // Показываем нативную кнопку Telegram
    tg.MainButton.setText("Задание принято! 🎉");
    tg.MainButton.show();
    setTimeout(() => tg.MainButton.hide(), 3000);

    // Скрываем кнопку в приложении и показываем таймер
    const btn = document.querySelector('.main-action');
    const timerDisplay = document.getElementById('task-timer');

    if (btn) btn.style.display = 'none';
    if (timerDisplay) {
        timerDisplay.style.display = 'block';
        startMidnightTimer(); // Запускаем обратный отсчет [web:42]
    }

    alert("Отлично! Баллы будут начислены после проверки. Следующее задание будет доступно в полночь.");
}

function startMidnightTimer() {
    const timerElement = document.getElementById('task-timer');

    function updateTimer() {
        const now = new Date();
        const midnight = new Date();
        midnight.setHours(24, 0, 0, 0); // Устанавливаем следующую полночь

        const diff = midnight - now;

        if (diff <= 0) {
            location.reload(); // Перезагружаем страницу в полночь для обновления задания
            return;
        }

        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);

        timerElement.innerText = `До завтра: ${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
    }

    updateTimer();
    setInterval(updateTimer, 1000);
}

// 3. ФУНКЦИИ МОДАЛЬНОГО ОКНА
function openFullTip() {
    const title = document.getElementById('random-tip-title').innerText;
    const modal = document.getElementById('tip-modal');
    if (modal) {
        document.getElementById('modal-title').innerText = title;
        document.getElementById('modal-body').innerText = tipsData[title] || "Подробности скоро появятся...";
        modal.style.display = 'flex';
    }
}

function closeFullTip() {
    document.getElementById('tip-modal').style.display = 'none';
}

// 4. ЗАГРУЗКА МЕРОПРИЯТИЙ (GLASS DESIGN)
async function loadEvents() {
    const listContainer = document.getElementById('events-list');
    if (!listContainer) return;

    listContainer.innerHTML = '<div class="glass-card"><p>Ищем события...</p></div>';

    try {
        const response = await fetch('events.json?v=' + Math.random());
        const events = await response.json();
        listContainer.innerHTML = '';

        if (events.length === 0) {
            listContainer.innerHTML = '<div class="glass-card"><p>Событий пока нет.</p></div>';
            return;
        }

        events.forEach(event => {
            const card = document.createElement('a');
            card.href = event.link;
            card.target = "_blank";
            card.className = 'glass-card';
            card.style.display = 'block';
            card.style.textDecoration = 'none';
            card.style.color = 'inherit';

            card.innerHTML = `
                <h3 style="margin: 0; font-size: 18px; color: var(--mint);">${event.title}</h3>
                <p style="margin: 12px 0 0; font-size: 14px; opacity: 0.8;">
                    📍 ${event.city} <br> ⏰ ${event.time}
                </p>
            `;
            listContainer.appendChild(card);
        });
    } catch (e) {
        listContainer.innerHTML = '<div class="glass-card"><p>Ошибка загрузки.</p></div>';
    }
}

// ИНИЦИАЛИЗАЦИЯ ПРИ ЗАПУСКЕ
window.onload = () => {
    if (window.lucide) {
        window.lucide.createIcons();
    }

    // Показываем главный экран и анимированную кнопку (main-nav)
    const homeBtn = document.querySelector('.main-nav');
    showScreen('main-screen', homeBtn);
};
