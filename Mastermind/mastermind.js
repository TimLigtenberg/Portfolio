const wonGamesKey = btoa('wonGamesMastermind');

let numberTriesLeft = 10;
let startTime;
let timerInterval;

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

    $('#dropzone').on('dragover', function(e) {
        e.preventDefault();
    });

    $('#dropzone').on('drop', function(e) {
        e.preventDefault();
        var id = e.originalEvent.dataTransfer.getData('text/plain');
        var item = $('#' + id);
        $(this).append(item);
    });

    initialize();
    setLeaderboard();
    $('#leaderboard').hide();
});

function initialize() {
    // TODO: weghalen omdat je dit zelf kunt zien
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