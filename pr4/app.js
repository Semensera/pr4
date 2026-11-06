/**
 * Практична робота №4
 * Динамічна взаємодія з користувачем: DOM, BOM та Події
 */

// --- 1. Вибірка елементів DOM (querySelector / querySelectorAll) ---
const commentForm = document.querySelector('#commentForm');
const authorInput = document.querySelector('#authorInput');
const textInput = document.querySelector('#textInput');
const charCountSpan = document.querySelector('#charCount');
const authorError = document.querySelector('#authorError');
const textError = document.querySelector('#textError');
const commentsContainer = document.querySelector('#commentsContainer');
const totalCommentsCount = document.querySelector('#totalCommentsCount');
const themeToggleBtn = document.querySelector('#themeToggleBtn');
const resetBtn = document.querySelector('#resetBtn');
const windowWidthVal = document.querySelector('#windowWidthVal');
const scrollProgress = document.querySelector('#scrollProgress');

// Початковий масив коментарів
let commentsList = [
    { id: 1, author: 'Олексій', text: 'Чудовий інтерфейс! Все працює плавно та швидко.', likes: 3, liked: false, date: '10:15' },
    { id: 2, author: 'Марія', text: 'Дуже зручна форма відправки.', likes: 5, liked: true, date: '11:40' }
];

// --- 2. Робота з BOM (Browser Object Model) ---
function updateWindowMetrics() {
    // Використання BOM-властивості window.innerWidth
    windowWidthVal.textContent = window.innerWidth;
}

function handleWindowScroll() {
    // Відстеження прокручування сторінки через window.scrollY та documentElement.scrollHeight
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrolledPercent = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    
    scrollProgress.style.width = `${scrolledPercent}%`;
}

// Події BOM (window)
window.addEventListener('resize', updateWindowMetrics);
window.addEventListener('scroll', handleWindowScroll);

// --- 3. Функції маніпуляції з DOM та classList ---
function renderComments() {
    commentsContainer.innerHTML = ''; // Очищення контейнера

    commentsList.forEach(comment => {
        // Створення елементів DOM
        const card = document.createElement('article');
        card.classList.add('comment-card'); // Використання classList.add
        card.dataset.id = comment.id;

        card.innerHTML = `
            <div class="comment-header">
                <span class="comment-author"></span>
                <span class="comment-date">${comment.date}</span>
            </div>
            <p class="comment-text"></p>
            <div class="comment-footer">
                <button class="like-btn ${comment.liked ? 'liked' : ''}" data-action="like">
                    ❤️ <span class="like-count">${comment.likes}</span>
                </button>
                <button class="delete-btn" data-action="delete">Видалити</button>
            </div>
        `;

        // Безпечне встановлення тексту (захист від XSS через textContent)
        card.querySelector('.comment-author').textContent = comment.author;
        card.querySelector('.comment-text').textContent = comment.text;

        commentsContainer.appendChild(card);
    });

    // Оновлення лічильника
    totalCommentsCount.textContent = commentsList.length;
}

// --- 4. Обробка подій введення (input, focus, blur) ---
textInput.addEventListener('input', (event) => {
    const currentLength = event.target.value.length;
    charCountSpan.textContent = currentLength;

    if (currentLength > 0) {
        textInput.classList.remove('invalid'); // classList.remove
        textError.textContent = '';
    }
});

authorInput.addEventListener('focus', () => {
    authorInput.style.borderColor = 'var(--primary-color)';
});

authorInput.addEventListener('blur', () => {
    authorInput.style.borderColor = '';
    if (!authorInput.value.trim()) {
        authorInput.classList.add('invalid');
    } else {
        authorInput.classList.remove('invalid');
        authorError.textContent = '';
    }
});

// --- 5. Обробка події форми (submit + event.preventDefault()) ---
commentForm.addEventListener('submit', (event) => {
    event.preventDefault(); // Запобігання перезавантаженню сторінки

    const author = authorInput.value.trim();
    const text = textInput.value.trim();
    let isValid = true;

    // Перевірка полів
    if (!author) {
        authorInput.classList.add('invalid');
        authorError.textContent = "Будь ласка, вкажіть ім'я";
        isValid = false;
    }

    if (!text) {
        textInput.classList.add('invalid');
        textError.textContent = 'Текст відгуку не може бути порожнім';
        isValid = false;
    }

    if (!isValid) return;

    // Створення нового об'єкта коментаря
    const now = new Date();
    const newComment = {
        id: Date.now(),
        author: author,
        text: text,
        likes: 0,
        liked: false,
        date: `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
    };

    commentsList.unshift(newComment);
    renderComments();

    // Скидання форми
    commentForm.reset();
    charCountSpan.textContent = '0';

    // Повідомлення BOM (alert)
    window.alert('Ваш відгук успішно додано!');
});

// --- 6. Обробка подій миші (click, делегування подій) ---
commentsContainer.addEventListener('click', (event) => {
    const target = event.target;
    const actionBtn = target.closest('[data-action]');
    if (!actionBtn) return;

    const card = target.closest('.comment-card');
    const commentId = Number(card.dataset.id);
    const action = actionBtn.dataset.action;

    const comment = commentsList.find(c => c.id === commentId);

    if (action === 'like') {
        if (comment.liked) {
            comment.likes -= 1;
            comment.liked = false;
        } else {
            comment.likes += 1;
            comment.liked = true;
        }
        renderComments();
    }

    if (action === 'delete') {
        // Використання BOM-діалогу confirm
        const confirmDelete = window.confirm('Ви дійсно бажаєте видалити цей відгук?');
        if (confirmDelete) {
            commentsList = commentsList.filter(c => c.id !== commentId);
            renderComments();
        }
    }
});

// Перемикач теми через classList.toggle
themeToggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    const isDark = document.body.classList.contains('dark-theme');
    themeToggleBtn.innerHTML = isDark ? '☀️ Світла тема' : '🌙 Темна тема';
});

// Кнопка очищення форми
resetBtn.addEventListener('click', () => {
    commentForm.reset();
    charCountSpan.textContent = '0';
    authorInput.classList.remove('invalid');
    textInput.classList.remove('invalid');
    authorError.textContent = '';
    textError.textContent = '';
});

// --- 7. Обробка подій клавіатури (keydown) ---
document.addEventListener('keydown', (event) => {
    // Натискання клавіші Escape очищає форму
    if (event.key === 'Escape') {
        resetBtn.click();
    }
});

// --- Початкова ініціалізація ---
updateWindowMetrics();
renderComments();