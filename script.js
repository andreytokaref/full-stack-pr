// Данные авторизации
const ADMIN_CREDENTIALS = {
    login: 'admin',
    password: 'admin123'
};

// Состояние приложения
let currentUser = null;
let activeChatId = null;
let chats = [];
let messages = {};

// DOM элементы
const authOverlay = document.getElementById('authOverlay');
const adminPanel = document.getElementById('adminPanel');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const loginInput = document.getElementById('loginInput');
const passwordInput = document.getElementById('passwordInput');
const chatList = document.getElementById('chatList');
const messageHistory = document.getElementById('messageHistory');
const replyBox = document.getElementById('replyBox');
const chatHeader = document.getElementById('chatHeader');
const replyMessage = document.getElementById('replyMessage');
const sendReplyBtn = document.getElementById('sendReplyBtn');
const searchChats = document.getElementById('searchChats');
const adminName = document.getElementById('adminName');

// Инициализация демо-данных
function initDemoData() {
    // Список чатов
    chats = [
        { id: 1, name: 'Иван Петров', avatar: 'ИП', lastMessage: 'Здравствуйте, когда будет доставка?', time: '10:42', unread: 2, online: true },
        { id: 2, name: 'Елена Соколова', avatar: 'ЕС', lastMessage: 'Спасибо за помощь!', time: '09:15', unread: 0, online: false },
        { id: 3, name: 'Михаил Козлов', avatar: 'МК', lastMessage: 'Не могу войти в личный кабинет', time: 'Вчера', unread: 1, online: true },
        { id: 4, name: 'Ольга Смирнова', avatar: 'ОС', lastMessage: 'Когда будут акции?', time: 'Вчера', unread: 0, online: false },
        { id: 5, name: 'Дмитрий Волков', avatar: 'ДВ', lastMessage: 'Заказ №12345 оплачен', time: '21 мар', unread: 0, online: true },
        { id: 6, name: 'Анна Мороз', avatar: 'АМ', lastMessage: 'Есть вопрос по гарантии', time: '20 мар', unread: 3, online: false }
    ];

    // Сообщения для каждого чата
    messages = {
        1: [
            { id: 101, chatId: 1, text: 'Здравствуйте, когда будет доставка заказа №54321?', time: '10:30', type: 'incoming' },
            { id: 102, chatId: 1, text: 'Добрый день! Сейчас проверю статус.', time: '10:35', type: 'outgoing' },
            { id: 103, chatId: 1, text: 'Ожидаем поступление на склад завтра. Отправим в этот же день', time: '10:36', type: 'outgoing' },
            { id: 104, chatId: 1, text: 'Спасибо, буду ждать!', time: '10:42', type: 'incoming' }
        ],
        2: [
            { id: 201, chatId: 2, text: 'Здравствуйте, помогите настроить приложение', time: '08:45', type: 'incoming' },
            { id: 202, chatId: 2, text: 'Доброе утро! Что именно не работает?', time: '08:50', type: 'outgoing' },
            { id: 203, chatId: 2, text: 'Всё настроил, разобрался. Спасибо за помощь!', time: '09:15', type: 'incoming' }
        ],
        3: [
            { id: 301, chatId: 3, text: 'Не могу войти в личный кабинет, пишет "неверный пароль"', time: '23:10', type: 'incoming' },
            { id: 302, chatId: 3, text: 'Попробуйте восстановить пароль по ссылке "Забыли пароль?"', time: '23:15', type: 'outgoing' },
            { id: 303, chatId: 3, text: 'Не приходит письмо для сброса', time: '23:20', type: 'incoming' }
        ],
        4: [
            { id: 401, chatId: 4, text: 'Здравствуйте! Планируются ли майские акции?', time: '15:30', type: 'incoming' },
            { id: 402, chatId: 4, text: 'Добрый день! Да, с 25 апреля стартует распродажа', time: '15:45', type: 'outgoing' }
        ],
        5: [
            { id: 501, chatId: 5, text: 'Оплатил заказ через сайт, когда придет подтверждение?', time: '19:20', type: 'incoming' },
            { id: 502, chatId: 5, text: 'Платёж прошёл, заказ в обработке. Спасибо!', time: '19:25', type: 'outgoing' }
        ],
        6: [
            { id: 601, chatId: 6, text: 'Здравствуйте, у меня сломался товар на гарантии', time: '11:05', type: 'incoming' },
            { id: 602, chatId: 6, text: 'Здравствуйте, оформите заявку в разделе "Гарантия"', time: '11:10', type: 'outgoing' },
            { id: 603, chatId: 6, text: 'Оформил, но никто не отвечает 3 дня', time: '11:12', type: 'incoming' },
            { id: 604, chatId: 6, text: 'Проверю ваш запрос и ускорю обработку', time: '11:15', type: 'outgoing' },
            { id: 605, chatId: 6, text: 'Когда будет ответ?', time: '11:20', type: 'incoming' },
            { id: 606, chatId: 6, text: 'Уже ответили?', time: '11:25', type: 'incoming' }
        ]
    };
}

// Рендер списка чатов
function renderChats(searchTerm = '') {
    const filteredChats = chats.filter(chat => 
        chat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    chatList.innerHTML = filteredChats.map(chat => `
        <li class="chat-item ${activeChatId === chat.id ? 'active' : ''}" data-chat-id="${chat.id}">
            <div class="avatar">${chat.avatar}</div>
            <div class="chat-info">
                <h4>
                    ${chat.name}
                    ${chat.online ? '<i class="fas fa-circle" style="color: #2ecc71; font-size: 10px;"></i>' : ''}
                </h4>
                <div class="last-msg">${chat.lastMessage}</div>
            </div>
            <div style="text-align: right;">
                <div class="time-stamp">${chat.time}</div>
                ${chat.unread > 0 ? `<span class="badge-unread">${chat.unread}</span>` : ''}
            </div>
        </li>
    `).join('');

    // Добавляем обработчики на чаты
    document.querySelectorAll('.chat-item').forEach(item => {
        item.addEventListener('click', () => {
            const chatId = parseInt(item.dataset.chatId);
            selectChat(chatId);
        });
    });
}

// Выбор чата
function selectChat(chatId) {
    activeChatId = chatId;
    const chat = chats.find(c => c.id === chatId);
    
    // Обновляем заголовок
    chatHeader.innerHTML = `
        <h2>Чат с ${chat.name}</h2>
        <p><i class="far fa-clock"></i> Последнее сообщение: ${chat.time}</p>
    `;
    
    // Показываем блок ответа
    replyBox.style.display = 'block';
    
    // Рендерим сообщения
    renderMessages(chatId);
    
    // Обновляем список чатов (для подсветки активного)
    renderChats(searchChats.value);
    
    // Сбрасываем непрочитанные
    chat.unread = 0;
}

// Рендер сообщений
function renderMessages(chatId) {
    const chatMessages = messages[chatId] || [];
    
    messageHistory.innerHTML = chatMessages.map(msg => `
        <div class="message ${msg.type}">
            <div class="msg-bubble">
                <div class="msg-text">${msg.text}</div>
                <div class="msg-time">${msg.time}</div>
            </div>
        </div>
    `).join('');
    
    // Скролл вниз
    messageHistory.scrollTop = messageHistory.scrollHeight;
}

// Отправка сообщения
function sendMessage() {
    if (!activeChatId) {
        showNotification('Сначала выберите чат', 'warning');
        return;
    }
    
    const text = replyMessage.value.trim();
    if (!text) return;
    
    // Получаем текущее время
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    // Создаем новое сообщение
    const newMessage = {
        id: Date.now(),
        chatId: activeChatId,
        text: text,
        time: time,
        type: 'outgoing'
    };
    
    // Добавляем в хранилище
    if (!messages[activeChatId]) {
        messages[activeChatId] = [];
    }
    messages[activeChatId].push(newMessage);
    
    // Обновляем последнее сообщение в чате
    const chat = chats.find(c => c.id === activeChatId);
    chat.lastMessage = text;
    chat.time = time;
    
    // Рендерим сообщения
    renderMessages(activeChatId);
    
    // Очищаем поле ввода
    replyMessage.value = '';
    
    // Показываем уведомление
    showNotification('Ответ отправлен пользователю');
    
    // Обновляем список чатов
    renderChats(searchChats.value);
}

// Показать уведомление
function showNotification(text, type = 'success') {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        ${text}
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Авторизация
function login() {
    const login = loginInput.value;
    const password = passwordInput.value;
    
    if (login === ADMIN_CREDENTIALS.login && password === ADMIN_CREDENTIALS.password) {
        currentUser = login;
        adminName.textContent = 'Администратор';
        
        // Прячем окно авторизации
        authOverlay.style.display = 'none';
        
        // Показываем админ-панель
        adminPanel.style.display = 'flex';
        
        // Инициализируем данные
        initDemoData();
        
        // Рендерим чаты
        renderChats();
        
        // Автоматически выбираем первый чат
        if (chats.length > 0) {
            selectChat(chats[0].id);
        }
        
        showNotification('Добро пожаловать в админ-панель!');
    } else {
        showNotification('Неверный логин или пароль', 'warning');
    }
}

// Выход
function logout() {
    currentUser = null;
    activeChatId = null;
    
    // Прячем админ-панель
    adminPanel.style.display = 'none';
    
    // Показываем окно авторизации
    authOverlay.style.display = 'flex';
    
    // Очищаем поля
    loginInput.value = 'admin';
    passwordInput.value = 'admin123';
    
    // Очищаем сообщения
    messageHistory.innerHTML = '';
    replyBox.style.display = 'none';
    
    showNotification('Вы вышли из системы');
}

// Обработчики событий
loginBtn.addEventListener('click', login);

logoutBtn.addEventListener('click', logout);

// Отправка сообщения по кнопке
sendReplyBtn.addEventListener('click', sendMessage);

// Отправка по Enter (но не с Shift)
replyMessage.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// Поиск по чатам
searchChats.addEventListener('input', (e) => {
    renderChats(e.target.value);
});

// Вход по Enter в полях
loginInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') login();
});

passwordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') login();
});

// Проверяем, может уже залогинены (для демо оставляем окно авторизации)
// В реальном проекте здесь была бы проверка сессии

// Для демонстрации можно автоматически войти (раскомментируйте если нужно)
// setTimeout(login, 500);
