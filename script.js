// Функция для переключения вкладок (экранов)
function showScreen(screenId) {
    // Прячем все экраны
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    // Показываем нужный
    document.getElementById(screenId).classList.add('active');

    // Если открыли экран событий — загружаем их из файла
    if (screenId === 'events-screen') {
        loadEvents();
    }
}

// ФУНКЦИЯ ЗАГРУЗКИ МЕРОПРИЯТИЙ (Тот самый функционал)
async function loadEvents() {
    const container = document.getElementById('events-screen');
    
    try {
        // 1. Пытаемся взять файл events.json с GitHub
        const response = await fetch('events.json');
        const events = await response.json();
        
        // Очищаем экран и добавляем заголовок
        container.innerHTML = '<h1>Мероприятия 📅</h1>';
        
        // 2. Создаем плашки для каждого мероприятия
        events.forEach(event => {
            const card = document.createElement('a');
            card.href = event.link; // Ссылка на сайт
            card.target = "_blank"; // Открыть в новом окне
            card.className = 'event-card'; // Класс для стиля (плашки)
            
            // Как выглядит карточка внутри
            card.innerHTML = `
                <div style="background: #e0e0e0; padding: 15px; margin: 10px; border-radius: 12px; color: black; text-decoration: none;">
                    <h3 style="margin: 0; font-size: 18px;">${event.title}</h3>
                    <p style="margin: 5px 0 0;">${event.city} | <b>${event.time}</b></p>
                </div>
            `;
            container.appendChild(card);
        });
    } catch (error) {
        container.innerHTML = '<h1>Мероприятия 📅</h1><p>Ой, не удалось загрузить данные...</p>';
        console.error("Ошибка загрузки:", error);
    }
}
