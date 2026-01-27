async function loadRealEvents() {
    const list = document.getElementById('events-list');
    if (!list) return;

    try {
        // Пробуем прочитать файл от парсера
        const response = await fetch('web/events.json');
        if (!response.ok) throw new Error("Файл не найден");

        const data = await response.json();
        list.innerHTML = ''; // Очищаем список перед загрузкой

        data.forEach(item => {
            const card = `
                <div class="event-card" onclick="window.open('${item.link}', '_blank')">
                    <div class="event-badge">ЭКО-СОБЫТИЕ</div>
                    <h3>${item.title}</h3>
                    <div class="event-footer">
                        <span>📍 ${item.location}</span>
                        <span>📅 ${item.date}</span>
                    </div>
                </div>`;
            list.insertAdjacentHTML('beforeend', card);
        });
    } catch (e) {
        // Если файла нет, НЕ рисуем те две карточки, а пишем инструкцию
        console.log("Ошибка:", e);
        list.innerHTML = '<p style="text-align:center; opacity:0.5; padding:20px;">Пока событий нет. Запустите parser.py, чтобы они появились!</p>';
    }
}



// 2. Управление экранами (ИСПРАВЛЕНО: добавлена поддержка старых аргументов)
function showScreen(screenId, element) {
    const screens = document.querySelectorAll('.screen');
    const tabs = document.querySelectorAll('.tab');

    // Скрываем экраны
    screens.forEach(s => s.style.display = 'none');

    // Снимаем активный класс со всех вкладок
    tabs.forEach(t => t.classList.remove('active'));

    const target = document.getElementById(screenId);
    if (target) {
        target.style.display = 'block';
    }

    // Если функция вызвана из HTML с аргументом 'this', или просто ищем по селектору
    if (element) {
        element.classList.add('active');
    } else {
        const activeTab = document.querySelector(`[onclick*="${screenId}"]`);
        if (activeTab) activeTab.classList.add('active');
    }

    if (window.Telegram?.WebApp?.HapticFeedback) {
        Telegram.WebApp.HapticFeedback.impactOccurred('light');
    }

    // Отрисовка мероприятий
    if (screenId === 'events-screen') {
        renderEvents();
    }

    // Запуск карты
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
        if (timerDisplay) timerDisplay.textContent = `${h}:${m}:${s}`;
    }, 1000);
}

// 5. Инициализация
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

// --- КАРТА ---
let ymap;

function initYandexMap() {
    if (ymap || typeof ymaps === 'undefined') return;
    ymap = new ymaps.Map('map-container', { center: [55.7913, 37.3662], zoom: 14, controls: [] });

    // Ищем и настраиваем точки
    ymaps.search('пункт приема вторсырья', { boundedBy: ymap.getBounds(), results: 20 }).done(res => {
        res.geoObjects.each(geo => {
            geo.options.set({
                preset: 'islands#greenIcon',
                openBalloonOnClick: true // ОБЯЗАТЕЛЬНО: разрешаем клик и открытие описания
            });
            ymap.geoObjects.add(geo);
        });
    });
}

function locateMe() {
    if (!ymap) initYandexMap();
    navigator.geolocation.getCurrentPosition(pos => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        ymap.setCenter(coords, 14);

        // Добавляем метку пользователя
        ymap.geoObjects.add(new ymaps.Placemark(coords, {}, {preset: 'islands#blueCircleDotIcon'}));

        // Ищем точки вокруг нового места и активируем их
        ymaps.search('пункт приема вторсырья', { boundedBy: ymap.getBounds(), results: 20 }).done(res => {
            res.geoObjects.each(geo => {
                geo.options.set({
                    preset: 'islands#greenIcon',
                    openBalloonOnClick: true // ОБЯЗАТЕЛЬНО: разрешаем клик
                });
                ymap.geoObjects.add(geo);
            });
        });
    }, () => { alert('Гео недоступна'); });
}

// ФУНКЦИЯ АВТООПРЕДЕЛЕНИЯ ГОРОДА
async function updateUserCity() {
    const cityEl = document.getElementById('current-city');
    const container = document.getElementById('location-container');
    const MY_KEY = "464d9fee-fc26-4b36-8cc1-883b10336451";

    if (!cityEl || !container) return;

    // 1. Пытаемся взять из памяти, если уже заходили сегодня
    const cachedCity = localStorage.getItem('user_city_name');
    if (cachedCity) {
        cityEl.textContent = cachedCity;
        container.classList.add('loaded');
        updateEcoStatus(cachedCity);
    }

    try {
        // 2. Получаем координаты устройства
        const pos = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
        });

        const { latitude, longitude } = pos.coords;

        // 3. Запрос к Яндексу (Геокодер)
        const response = await fetch(`https://geocode-maps.yandex.ru/1.x/?apikey=${MY_KEY}&geocode=${longitude},${latitude}&format=json&kind=locality&results=1`);
        const data = await response.json();

        // Достаем название города из сложного ответа Яндекса
        const cityName = data.response.GeoObjectCollection.featureMember[0]?.GeoObject.name || "Москва";

        // 4. Выводим результат и сохраняем
        cityEl.textContent = cityName;
        localStorage.setItem('user_city_name', cityName);
        container.classList.add('loaded');
        updateEcoStatus(cityName);

    } catch (err) {
        console.log("Ошибка гео: ", err);
        cityEl.textContent = cachedCity || "Москва"; // Если ошибка, ставим Москву
        container.classList.add('loaded');
        updateEcoStatus(finalCity);
    }
}

// Запускаем проверку при каждой загрузке страницы
document.addEventListener('DOMContentLoaded', updateUserCity);

function updateEcoStatus(city) {
    const valueElem = document.getElementById('eco-value');
    const statusElem = document.getElementById('eco-status');
    const cardElem = document.getElementById('eco-card-main');

    // Имитируем получение данных AQI (индекс качества воздуха)
    // В Куркино и Химках воздух обычно лучше (15-35), в центре — хуже (40-75)
    let aqi = (city.includes('Куркино') || city.includes('Химки'))
        ? Math.floor(Math.random() * 20 + 15)
        : Math.floor(Math.random() * 35 + 40);

    valueElem.innerText = aqi;

    // Сбрасываем старые классы и ставим новый
    cardElem.classList.remove('good', 'moderate', 'poor');

    if (aqi < 40) {
        statusElem.innerText = 'Прекрасно';
        cardElem.classList.add('good');
        statusElem.style.color = '#a3ff12'; // Твой зеленый
    } else if (aqi < 80) {
        statusElem.innerText = 'Умеренно';
        cardElem.classList.add('moderate');
        statusElem.style.color = '#ffeb3b'; // Желтый
    } else {
        statusElem.innerText = 'Плохо';
        cardElem.classList.add('poor');
        statusElem.style.color = '#ff5252'; // Красный
    }
}