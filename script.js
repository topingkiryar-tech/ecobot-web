// Функция для переключения экранов
function showScreen(screenId) {
    // Прячем все экраны
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => {
        screen.style.display = 'none';
    });

    // Показываем нужный экран
    const activeScreen = document.getElementById(screenId + '-screen');
    if (activeScreen) {
        activeScreen.style.display = 'block';
    }
}

// Инициализация Telegram Web App
const tg = window.Telegram.WebApp;
tg.expand(); // Расширяем на весь экран
