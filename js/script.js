document.addEventListener('DOMContentLoaded', async function(event) {
    await fetchQuestions();
    renderScores();
})

const API_KEY = 'iqB75S1KcXfaNerXhlO0dVzFyXzpA4yeT8t8RawT';
var questions = [];
var currentQuestionIndex = 0;
let currentScore = 0;
let currentSec = 50;

async function fetchQuestions(){
    fetch(`https://quizapi.io/api/v1/questions?limit=10&category=Code&tags=JavaScript&apiKey=${API_KEY}`, {
        method: 'GET'
      })
      .then(response => response.json())
      .then(data => {
        questions = data;  
      })
      .catch(error => {
        console.log(error);
      });

      $startButton = document.getElementById('start-button');
      $startButton.style.display = 'inline';
}

function onStartQuizClick() {
    // start timer
    startTimer();
    // hide start page container
    document.getElementById('start-page').style.display = 'none';
    // show question container
    document.getElementById('question-container').style.display = 'block';

    // set question text, answer buttons
    showNextQuestion();
}

function subtractTime(){
    if (currentSec > 5) {
        currentSec -= 5;
    }
}

function handleAnswerClick(event) {
    let buttonClicked = event.target;
    let isCorrect = buttonClicked.dataset.correct === 'true';
    let $result = document.getElementById('result');
    let $results = document.getElementById('results');
    $results.style.display = 'inline';
    $result.innerText = isCorrect ? 'Correct!' : 'Wrong! Subtracting 5 seconds.';
    $result.className = isCorrect ? 'correct-answer' : 'wrong-answer';
    if (isCorrect){
        currentScore++;
    }
    else {
        subtractTime();
    }
    showNextQuestion();
}

function submitScore(){
    let scores = JSON.parse(localStorage.getItem('scores')) || [];
    let $nameInput = document.getElementById('player-name');
    let score = $nameInput.dataset.score;
    let name = $nameInput.value || "Anonymous";
    let date =  new Date().toLocaleDateString();

    let scoreObj = {"score": score, "name": name, "date": date};
    scores.push(scoreObj);

    localStorage.setItem('scores', JSON.stringify(scores));
    renderScores();
}

function renderScores(){
    let scores = JSON.parse(localStorage.getItem('scores')) || [];
    scores.sort((a, b) => b.score - a.score);
    let $scoresList = document.getElementById('high-scores');
    $scoresList.innerHTML = '';
    scores.map((score) => {
        let  $listItem = document.createElement('li');
        $listItem.textContent = `${score.name}: ${score.score} - ${score.date}`;
        $scoresList.appendChild($listItem);
    });
}

function renderFinishedPage(){
    let timeLeft = currentSec;
    // hide results of last question
    let $results = document.getElementById('results');
    $results.style.display = 'none';

    // hide timer
    let $timer = document.getElementById('timer');
    $timer.style.display = 'none';
    let scoreNumber = currentScore > 0 ? ((currentScore * 5) + timeLeft) : -1 * timeLeft;
    let score = `You got ${currentScore} correct, with ${timeLeft} seconds left, for a total score of ${scoreNumber}`;
    let $score = document.createElement('h1');
    $score.innerText = score;

    let $nameInput = document.createElement('input');
    $nameInput.setAttribute('type','text');
    $nameInput.setAttribute('data-score',scoreNumber);
    $nameInput.placeholder = 'Enter your name...';
    $nameInput.id ='player-name';

    let $btnDiv = document.createElement('div');
    let $submitScoreButton = document.createElement('button');
    $submitScoreButton.innerText='Submit Score!';
    $submitScoreButton.className='submit-btn';
    $submitScoreButton.addEventListener('click', submitScore);
    $btnDiv.appendChild($submitScoreButton)

    let $questionContainer = document.getElementById('question-container');
    $questionContainer.innerHTML = null;
    $questionContainer.appendChild($score);
    $questionContainer.appendChild($nameInput);
    $questionContainer.appendChild($btnDiv);

    return;
}

function showNextQuestion(){
    if (currentQuestionIndex === -1){
        renderFinishedPage();
        return;
    }

    let questionJson = questions[currentQuestionIndex];

    let $question = document.getElementById('question');
    let $buttonsContainer = document.getElementById('answer-buttons');
    $buttonsContainer.innerHTML = '';

    $question.innerHTML = questionJson.question;

    Object.keys(questionJson.answers).map((answerName) => {
        let answerAnswer = questionJson.answers[answerName];
        
        if (answerAnswer === null) {
            return;
        }
        else {
            let li = document.createElement('li');

            let button = document.createElement('button');
            button.id = answerName;
            button.textContent = answerAnswer;
            button.classList.add('button');
            button.setAttribute('type', 'button');
            button.setAttribute('data-correct', questionJson.correct_answers[`${answerName}_correct`]);
            button.addEventListener('click', handleAnswerClick);

            li.appendChild(button);

            $buttonsContainer.appendChild(li);
        }
    });

    if (currentQuestionIndex == questions.length -1) {
        currentQuestionIndex = -1;
    }
    else {
        currentQuestionIndex++;
    }    
}

function startTimer(){
    let timer = setInterval(function() {
        document.getElementById('timer').innerHTML='Time: ' + currentSec;
        currentSec--;
        if (currentSec < 0){
            clearInterval(timer);
        }
    }, 1000);
}