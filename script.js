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

    // ДОБАВЛЕНО: Если перешли на экран карты - запускаем Яндекс.Карты
    if (screenId === 'map-screen') {
        setTimeout(initYandexMap, 400);
    }
}

// 3. Отрисовка мероприятий
function renderEvents() {
    const container = document.getElementById('events-list');
    if (!container) {
        console.error("Контейнер events-list не найден!");
        return;
    }

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
            location.reload(); // Перезагружаем для сброса задания
            return;
        }
        const h = Math.floor(diff / 3600000).toString().padStart(2, '0');
        const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
        const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
        timerDisplay.textContent = `${h}:${m}:${s}`;
    }, 1000);
}

// 5. ГЛАВНАЯ ИНИЦИАЛИЗАЦИЯ (Решает проблему пустого экрана)
document.addEventListener('DOMContentLoaded', () => {
    // Сообщаем Telegram, что мы готовы
    if (window.Telegram?.WebApp) {
        Telegram.WebApp.ready();
        Telegram.WebApp.expand(); // Разворачиваем на весь экран
    }

    // Проверяем статус задания
    const savedExpiry = localStorage.getItem('task_expiry');
    if (savedExpiry) updateTaskUI(parseInt(savedExpiry));

    // Инициализируем иконки Lucide
    if (window.lucide) lucide.createIcons();

    // ПОКАЗЫВАЕМ ПЕРВЫЙ ЭКРАН
    showScreen('main-screen');
});

// ДОБАВЛЕНО: Функции для работы с картой
let ymap;

function initYandexMap() {
    if (ymap || typeof ymaps === 'undefined') return;

    ymap = new ymaps.Map('map-container', {
        center: [55.7913, 37.3662], // Куркино
        zoom: 14,
        controls: []
    });

    // АВТОМАТИЧЕСКИЙ ПОИСК ПУНКТОВ ПЕРЕРАБОТКИ
    ymap.search('пункт приема вторсырья Куркино', {
        results: 25, // 25 ближайших точек
        type: 'biz', // Только бизнесы и организации
        boundedBy: [[55.78, 37.35], [55.80, 37.38]] // Ограничение районом Куркино
    }).done(function (searchResults) {
        searchResults.geoObjects.options.set('preset', 'islands#greenIcon');
        searchResults.geoObjects.each(function (geoObject) {
            ymap.geoObjects.add(geoObject);
        });

        console.log('Найдено пунктов переработки:', searchResults.geoObjects.getLength());
    }).fail(function (error) {
        console.error('Ошибка поиска:', error);
        // Fallback — статические точки
        addStaticPoints();
    });
}

// Резервные статические точки (если поиск не сработал)
function addStaticPoints() {
    const fallbackPoints = [
        [55.7932, 37.3681, "ЭкоПост", "Пластик, стекло"],
        [55.7891, 37.3645, "Зеленый двор", "Бумага, металл"]
    ];

    fallbackPoints.forEach(([lat, lng, title, desc]) => {
        ymap.geoObjects.add(new ymaps.Placemark([lat, lng], {
            hintContent: title,
            balloonContent: `<b>${title}</b><br>${desc}`
        }, { preset: 'islands#greenIcon' }));
    });
}


function locateMe() {
    if (!ymap) initYandexMap();

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            pos => {
                const coords = [pos.coords.latitude, pos.coords.longitude];
                ymap.setCenter(coords, 16);
                ymap.setZoom(16);

                // Удаляем старые метки пользователя
                ymap.geoObjects.each(geo => {
                    if (geo.options.get('preset') === 'islands#blueCircleDotIcon') {
                        ymap.geoObjects.remove(geo);
                    }
                });

                // Новая метка пользователя
                const userMarker = new ymaps.Placemark(coords, {
                    hintContent: 'Ты здесь',
                    balloonContent: 'Твоё местоположение'
                }, {
                    preset: 'islands#blueCircleDotIcon',
                    iconColor: '#00bfff'
                });
                ymap.geoObjects.add(userMarker);

                Telegram.WebApp.HapticFeedback.impactOccurred('medium');
            },
            () => {
                Telegram.WebApp.showAlert('Центрируем на Куркино');
                ymap.setCenter([55.7913, 37.3662], 14);
            }
        );
    }
}

