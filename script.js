// Инициализация Telegram Web App
const tg = window.Telegram.WebApp;
tg.expand();

// Данные для советов (тестовые)
const tipsData = {
    "Как сортировать пластик?": "На пластиковых изделиях ищите треугольник с цифрой. 1 и 2 принимают почти везде, а 3 и 7 — почти нигде. Перед сдачей обязательно сполосните тару!",
    "Зачем сдавать батарейки?": "Одна батарейка загрязняет 20 квадратных метров земли тяжелыми металлами. Сдавайте их в специальные боксы в магазинах!"
};

// 1. УЛУЧШЕННАЯ ФУНКЦИЯ ПЕРЕКЛЮЧЕНИЯ ЭКРАНОВ
function showScreen(screenId, element) {
    // Тактильный отклик (Haptic Feedback) — эффект "дорогого" приложения [web:18]
    if (tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('medium');
    }

    // Скрываем все экраны
    const screens = document.querySelectorAll('.screen');
    screens.forEach(s => s.style.display = 'none');

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

    // Если это экран событий, загружаем данные
    if (screenId === 'events-screen') {
        loadEvents();
    }
}

// 2. ФУНКЦИИ ДЛЯ ГЛАВНОЙ СТРАНИЦЫ
function openFullTip() {
    const title = document.getElementById('random-tip-title').innerText;
    const modal = document.getElementById('tip-modal');
    if (modal) {
        document.getElementById('modal-title').innerText = title;
        document.getElementById('modal-body').innerText = tipsData[title] || "Подробности скоро появятся...";
        modal.style.display = 'flex'; // Используем flex для центрирования
    }
}

function closeFullTip() {
    document.getElementById('tip-modal').style.display = 'none';
}

function completeTask() {
    // Взаимодействие с главной кнопкой Telegram
    tg.MainButton.setText("Задание выполнено! 🎉");
    tg.MainButton.show();
    if (tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');

    setTimeout(() => tg.MainButton.hide(), 3000);
    alert("Отлично! Вы стали чуточку экологичнее. +5 к настроению 🌿");
}

// 3. ФУНКЦИЯ ЗАГРУЗКИ СОБЫТИЙ (С ТВОИМ ДИЗАЙНОМ ИСПРАВЛЕННЫМ ПОД GLASS)
async function loadEvents() {
    const listContainer = document.getElementById('events-list');
    if (!listContainer) return;

    listContainer.innerHTML = '<div class="glass-card"><p>Загрузка событий...</p></div>';

    try {
        const response = await fetch('events.json?v=' + Math.random());
        if (!response.ok) throw new Error('Файл не найден');

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
            card.className = 'glass-card'; // Используем новый класс дизайна
            card.style.display = 'block';
            card.style.textDecoration = 'none';
            card.style.color = 'inherit';

            card.innerHTML = `
                <h3 style="margin: 0; font-size: 18px; color: var(--mint);">${event.title}</h3>
                <p style="margin: 12px 0 0; font-size: 14px; opacity: 0.8;">
                    📍 ${event.city} <br> ⏰ ${event.time}
                </p>
                <div style="margin-top: 15px; font-size: 12px; color: var(--mint); opacity: 0.6;">Подробнее →</div>
            `;
            listContainer.appendChild(card);
        });
    } catch (e) {
        listContainer.innerHTML = '<div class="glass-card"><p>Ошибка загрузки событий.</p></div>';
        console.error("Ошибка загрузки событий:", e);
    }
}

// ЗАПУСК ПРИ СТАРТЕ
window.onload = () => {
    // Инициализация иконок Lucide [web:78]
    if (window.lucide) {
        window.lucide.createIcons();
    }

    // Показываем главный экран и помечаем первую кнопку как активную
    const homeBtn = document.querySelector('.nav-item');
    showScreen('main-screen', homeBtn);
};
