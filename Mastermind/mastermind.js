const DIFFICULTY_EASY = "Easy";
const DIFFICULTY_NORMAL = "Normal";
const DIFFICULTY_HARD = "Hard";

const DIFFICULTIES = [DIFFICULTY_EASY, DIFFICULTY_NORMAL, DIFFICULTY_HARD];

const difficultyTriesAmount = {
    [DIFFICULTY_EASY]: 15,
    [DIFFICULTY_NORMAL]: 10,
    [DIFFICULTY_HARD]: 8
};

const wonGamesKey = btoa('wonGamesMastermind');

let difficulty;
let numberTriesLeft;
let startTime;
let timerInterval;

$(function() {
    $(window).on('beforeunload', function(){
        if (startTime) {
            return 'Are you sure you want to leave this page? Your current game will not be saved';
        }
    });

    let selectElement = $("#difficultySelect");
    DIFFICULTIES.forEach(difficultyI => {
        const option = $('<option>');
        option.text(difficultyI);
        option.val(difficultyI);
        let savedDifficulty = localStorage.getItem('difficultyMastermind');
        if((savedDifficulty && savedDifficulty === difficultyI)) {
            option.prop('selected', true);
            difficulty = difficultyI;
        } else if(!savedDifficulty) {
            if (difficultyI === DIFFICULTIES[0]) {
                option.prop('selected', true);
                difficulty = difficultyI;
            }
        }
        selectElement.append(option);
    });

    $('#showGamesBtn').click(function() {
        let gamesListDiv = $('#leaderboard');
    
        if (gamesListDiv.is(':visible')) {
            gamesListDiv.hide();
        } else {
            gamesListDiv.show();
        }
    });

    $("#difficultySelect").on("change", function() {
        difficulty = this.value;
        triesAmount = difficultyTriesAmount[difficulty];
        numberTriesLeft = triesAmount;
        localStorage.setItem('difficultyMastermind', difficulty);
    
        initialize();
    });
    
    $('.pin').on('dragstart', function(e) {
        e.originalEvent.dataTransfer.setData('text/plain', this.id);
    });

    $('#dropzone').on('dragover', function(e) {
        e.preventDefault();
    });

    $('#dropzone').on('drop', function(e) {
        e.preventDefault();
        var id = e.originalEvent.dataTransfer.getData('text/plain');
        var item = $('#' + id);
        alert('#' + id);
        $(this).append(item);
    });

    initialize();
    setLeaderboard();
    $('#leaderboard').hide();
});

function initialize() {
    numberTriesLeft = difficultyTriesAmount[difficulty];
    $('#tries-left').text(numberTriesLeft);
    clearInterval(timerInterval);
    $('#timer').text("00:00:00");
}

function updateTimer() {
    var elapsedTime = Date.now() - startTime;
    var hours = Math.floor(elapsedTime / (1000 * 60 * 60));
    var minutes = Math.floor((elapsedTime % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((elapsedTime % (1000 * 60)) / 1000);
    var formattedTime = padNumber(hours) + ':' + padNumber(minutes) + ':' + padNumber(seconds);
    $('#timer').text(formattedTime);
}
function padNumber(number) {
    return (number < 10 ? '0' : '') + number;
}

function isTimerLower(timer1, timer2) {
    var [hours1, minutes1, seconds1] = timer1.split(':').map(Number);
    var [hours2, minutes2, seconds2] = timer2.split(':').map(Number);

    if (hours1 < hours2) {
        return true;
    } else if (hours1 === hours2 && minutes1 < minutes2) {
        return true;
    } else if (hours1 === hours2 && minutes1 === minutes2 && seconds1 < seconds2) {
        return true;
    } else {
        return false;
    }
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