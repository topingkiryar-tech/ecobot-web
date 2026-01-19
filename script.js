function showScreen(screenId) {
    // Прячем вообще все блоки, у которых есть класс screen
    const screens = document.querySelectorAll('.screen');
    screens.forEach(s => s.style.display = 'none');

    // Показываем тот блок, на который нажали
    const activeScreen = document.getElementById(screenId);
    if (activeScreen) {
        activeScreen.style.display = 'block';
    }

    // Если открыли события — загружаем их
    if (screenId === 'events-screen') {
        loadEvents();
    }
}

async function loadEvents() {
    const listContainer = document.getElementById('events-list');
    if (!listContainer) return;

    try {
        const response = await fetch('events.json');
        const events = await response.json();
        listContainer.innerHTML = ''; 

        events.forEach(event => {
            const card = document.createElement('a');
            card.href = event.link;
            card.target = "_blank";
            card.style.textDecoration = 'none'; // Убираем синее подчеркивание
            
            card.innerHTML = `
                <div style="background: #a9a9a9; border-radius: 15px; padding: 20px; margin: 15px 0; color: black;">
                    <h3 style="margin: 0;">${event.title}</h3>
                    <p style="margin: 10px 0 0;"><b>${event.city} ${event.time}</b></p>
                </div>
            `;
            listContainer.appendChild(card);
        });
    } catch (e) {
        listContainer.innerHTML = '<p>События пока не загружены. Убедитесь, что файл events.json есть на GitHub.</p>';
    }
}
