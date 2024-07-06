document.addEventListener('DOMContentLoaded', () => {
    const categories = [
        { name: 'Mathematics', image: 'images/download.png' },
        { name: 'Science', image: 'images/images.png' },
        { name: 'History', image: 'images/download (1).jpeg' },
        { name: 'Polity', image: './images/download.jpeg' }
    ];
    const categoriesContainer = document.getElementById('categories');

    categories.forEach(category => {
        const card = document.createElement('div');
        card.className = 'category-card';
        card.innerHTML = `
            <img src="${category.image}" alt="${category.name}">
            <button>${category.name}</button>
        `;
        card.querySelector('button').addEventListener('click', () => {
            startQuiz(category.name);
        });
        categoriesContainer.appendChild(card);
    });
});

let currentQuestionIndex = 0;
let score = 0;
let quizQuestions = [];
let timerInterval;

async function startQuiz(category) {
    console.log(`Starting quiz in category: ${category}`);
    currentQuestionIndex = 0;
    score = 0;

    const response = await fetch('questions.json');
    const questions = await response.json();
    quizQuestions = questions[category];

    displayQuestion(quizQuestions[currentQuestionIndex]);
    startTimer();
}

function displayQuestion(question) {
    const quizContainer = document.getElementById('quiz-container');
    quizContainer.style.display = 'block';
    quizContainer.innerHTML = `
        <h2>${question.question}</h2>
        <div id="timer">
    <i class="fas fa-clock"></i> Time left: <span id="time">10</span> seconds
</div>
        <form id="quiz-form">
            <ul id="options">
                ${question.options.map(option => `
                    <li>
                        <input type="checkbox" id="${option}" name="option" value="${option}">
                        <label for="${option}">${option}</label>
                    </li>`).join('')}
            </ul>
        </form>
        <p>Question ${currentQuestionIndex + 1} of ${quizQuestions.length}</p>
        ${currentQuestionIndex < quizQuestions.length - 1 ? 
            '<button id="next-button" onclick="handleAnswer()" style="margin-top: 20px;">Next</button>' : 
            '<button id="submit-button" onclick="handleAnswer(true)" style="margin-top: 20px;">Submit</button>'
        }
    `;
}

function startTimer() {
    let timeLeft = 10;
    const timerElement = document.getElementById('time');
    
    clearInterval(timerInterval); // Clear any existing interval
    timerInterval = setInterval(() => {
        timeLeft--;
        timerElement.textContent = timeLeft;
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            handleAnswer(); // Automatically handle answer if time runs out
        }
    }, 1000);
}

function handleAnswer(isFinal = false) {
    const form = document.getElementById('quiz-form');
    const selectedOptions = Array.from(form.elements['option']).filter(input => input.checked).map(input => input.value);
    
    const currentQuestion = quizQuestions[currentQuestionIndex];
    const isCorrect = selectedOptions.every(option => currentQuestion.answer.includes(option)) && selectedOptions.length === currentQuestion.answer.length;

    if (isCorrect) {
        score++;
    }

    if (isFinal) {
        showResults();
    } else {
        nextQuestion();
    }
}

function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < quizQuestions.length) {
        displayQuestion(quizQuestions[currentQuestionIndex]);
        startTimer();
    } else {
        showResults();
    }
}

function showResults() {
    clearInterval(timerInterval);
    const quizContainer = document.getElementById('quiz-container');
    const percentage = ((score / quizQuestions.length) * 100).toFixed(2);
    const totalScore = score;

    quizContainer.innerHTML = `
        <h2>Quiz Completed!</h2>
        <p>Your Score: ${totalScore} / ${quizQuestions.length}</p>
        <p>Percentage: ${percentage}%</p>
        <button onclick="restartQuiz()">Retry Quiz</button>
    `;
}

function restartQuiz() {
    location.reload();
}
