const wonGamesKey = btoa('wonGamesMastermind');

const DIFFICULTY_EASY = "Easy";
const DIFFICULTY_NORMAL = "Normal";
const DIFFICULTY_HARD = "Hard";
const DIFFICULTIES = [DIFFICULTY_EASY, DIFFICULTY_NORMAL, DIFFICULTY_HARD];

let numberTriesLeft = 10;
let startTime;
let timerInterval;
let code = [];
let guessCode = [];

$(function() {
    $(window).on('beforeunload', function(){
        if (startTime) {
            return 'Are you sure you want to leave this page? Your current game will not be saved';
        }
    });

    $('#showGamesBtn').click(function() {
        let gamesListDiv = $('#leaderboard');
    
        if (gamesListDiv.is(':visible')) {
            gamesListDiv.hide();
        } else {
            gamesListDiv.show();
        }
    });
    
    $('.pin').on('dragstart', function(e) {
        e.originalEvent.dataTransfer.setData('text/plain', this.id);
    });

    $('.dropzone').on('dragover', function(e) {
        e.preventDefault();
    });

    $('.dropzone').on('drop', function(e) {
        e.preventDefault();
        if (e.target.hasChildNodes()) {
            return;
        }

        var id = e.originalEvent.dataTransfer.getData('text/plain');
        var item = $('#' + id);
        $(this).append(item.clone());

        checkCode();
    });

    initialize();
    setLeaderboard();
    $('#leaderboard').hide();
});

function initialize() {
    $(".dropzone").each(function() {
        $(this).empty();
    });

    $("#result").empty();

    generateCode();
}

function generateCode() {
    let availableNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

    // Shuffle the list (using Fisher-Yates algorithm)
    for (var i = availableNumbers.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = availableNumbers[i];
        availableNumbers[i] = availableNumbers[j];
        availableNumbers[j] = temp;
    }

    code = availableNumbers.slice(0, 4);

    console.log("code", code);
}

function checkCode() {
    if ($(".dropzone").children().length < 4) return;

    $(".dropzone").each(function(index) {
        let pin = $(this).children().first();
        let pinId = pin.attr('data-pinId');
        guessCode[index] = parseInt(pinId);
    });

    let correct = 0;
    let misplaced = 0;
    for (let i = 0; i < guessCode.length; i++) {
        if (guessCode[i] === code[i]) {
            correct++;
        } else if (code.includes(guessCode[i])) {
            misplaced++;
        }
    }

    if (correct == 4) {
        gameWon();
        return;
    }

    let result = $("#result");
    for (let i = 0; i < correct; i++) {
        result.append($('<div class="correct"></div>'));
    }
    for (let i = 0; i < misplaced; i++) {
        result.append($('<div class="misplaced"></div>'));
    }
}

function saveGame() {
    let gamesArray = localStorage.getItem(wonGamesKey) ? JSON.parse(localStorage.getItem(wonGamesKey)) : [];
    let difficulty = $('#difficulty').val();
    let time = $('#timer').text();
    let day = new Date().toLocaleDateString();

    gamesArray.push({difficulty, time, day});
    localStorage.setItem(wonGamesKey, JSON.stringify(gamesArray));
}

function gameWon() {
    saveGame();
    alert('You won!');
    initialize();
}

function setLeaderboard() {
    $("#games-won").text(localStorage.getItem(wonGamesKey) ? JSON.parse(localStorage.getItem(wonGamesKey)).length : 0);

    let storedGames = localStorage.getItem(wonGamesKey);
    let gamesListDiv = $('#leaderboard');
    if (storedGames) {
        DIFFICULTIES.forEach(difficulty => {
            let gamesArray = JSON.parse(storedGames);
            gamesArray = gamesArray.filter(game => game.difficulty === difficulty);
            gamesArray = gamesArray.sort((a, b) => a.time.localeCompare(b.time));

            let gamesListHTML = '<ol>';
            gamesListHTML += `<h3>Difficulty ${difficulty}</h3>`;
            gamesArray.forEach(function(game){
                gamesListHTML += `<li>Time: ${game.time}, On: ${game.day}</li>`;
            });
            gamesListHTML += '</ol>';
            gamesListDiv.append(gamesListHTML);
        });
    } else {
        gamesListDiv.append('<p>No games won yet.</p>').show();
    }
}