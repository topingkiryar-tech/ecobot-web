// Инициализация Telegram Web App
const tg = window.Telegram.WebApp;
tg.expand();

// Данные для советов (тестовые)
const tipsData = {
    "Как сортировать пластик?": "На пластиковых изделиях ищите треугольник с цифрой. 1 и 2 принимают почти везде, а 3 и 7 — почти нигде. Перед сдачей обязательно сполосните тару!",
    "Зачем сдавать батарейки?": "Одна батарейка загрязняет 20 квадратных метров земли тяжелыми металлами. Сдавайте их в специальные боксы в магазинах!"
};

// 1. ФУНКЦИЯ ПЕРЕКЛЮЧЕНИЯ ЭКРАНОВ
function showScreen(screenId) {
    const screens = document.querySelectorAll('.screen');
    screens.forEach(s => s.style.display = 'none');

    const target = document.getElementById(screenId);
    if (target) {
        target.style.display = 'block';
    }

    if (screenId === 'events-screen') {
        loadEvents();
    }
}

// 2. ФУНКЦИИ ДЛЯ ГЛАВНОЙ СТРАНИЦЫ
function openFullTip() {
    const title = document.getElementById('random-tip-title').innerText;
    document.getElementById('modal-title').innerText = title;
    document.getElementById('modal-body').innerText = tipsData[title] || "Подробности скоро появятся...";
    document.getElementById('tip-modal').style.display = 'block';
}

function closeFullTip() {
    document.getElementById('tip-modal').style.display = 'none';
}

function completeTask() {
    tg.MainButton.setText("Задание выполнено! 🎉");
    tg.MainButton.show();
    setTimeout(() => tg.MainButton.hide(), 3000);
    alert("Отлично! Вы стали чуточку экологичнее. +5 к настроению 🌿");
}

// 3. ФУНКЦИЯ ЗАГРУЗКИ СОБЫТИЙ (МЕРОПРИЯТИЙ)
async function loadEvents() {
    const listContainer = document.getElementById('events-list');
    if (!listContainer) return;

    listContainer.innerHTML = '<p>Загрузка...</p>';

    try {
        const response = await fetch('events.json?v=' + Math.random());
        if (!response.ok) throw new Error('Файл не найден');

        const events = await response.json();
        listContainer.innerHTML = '';

        if (events.length === 0) {
            listContainer.innerHTML = '<p>Событий пока нет.</p>';
            return;
        }

        events.forEach(event => {
            const card = document.createElement('a');
            card.href = event.link;
            card.target = "_blank";
            card.style.textDecoration = 'none';

            card.innerHTML = `
                <div style="background: #a9a9a9; border-radius: 15px; padding: 15px; margin: 15px 0; color: black; border: 1px solid #888;">
                    <h3 style="margin: 0; font-size: 18px;">${event.title}</h3>
                    <p style="margin: 8px 0 0; font-size: 14px;">📍 ${event.city} | ⏰ ${event.time}</p>
                </div>
            `;
            listContainer.appendChild(card);
        });
    } catch (e) {
        listContainer.innerHTML = '<p>Ошибка загрузки событий.</p>';
        console.error(e);
    }
}

// Запуск при старте
window.onload = () => {
    showScreen('main-screen');
};
