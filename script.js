// Инициализация Telegram Web App
const tg = window.Telegram.WebApp;
tg.expand(); // Развернуть на весь экран

function showScreen(screenId) {
    // 1. Скрываем все экраны
    const screens = document.querySelectorAll('.screen');
    screens.forEach(s => {
        s.style.display = 'none';
    });

    // 2. Показываем нужный экран
    const target = document.getElementById(screenId);
    if (target) {
        target.style.display = 'block';
    } else {
        console.error("Экран не найден:", screenId);
    }

    // 3. Если это экран событий, загружаем данные
    if (screenId === 'events-screen') {
        loadEvents();
    }
}

async function loadEvents() {
    const listContainer = document.getElementById('events-list');
    if (!listContainer) return;

    listContainer.innerHTML = '<p>Загрузка...</p>';

    try {
        // Добавляем случайное число в конце, чтобы файл не кэшировался
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
        listContainer.innerHTML = '<p>Ошибка: убедитесь, что файл events.json загружен на GitHub.</p>';
        console.error("Ошибка загрузки событий:", e);
    }
}

// Показываем главный экран при загрузке страницы
window.onload = () => {
    showScreen('main-screen');
};
