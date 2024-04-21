const DIFFICULTY_EASY = "easy";
const DIFFICULTY_NORMAL = "normal";
const DIFFICULTY_HARD = "hard";

const DIFFICULTIES = [DIFFICULTY_EASY, DIFFICULTY_NORMAL, DIFFICULTY_HARD];

const MINE = "mine";
const NUMBER = "number";
const BLANK = "blank";

const difficultyBlockRowAmount = {
    [DIFFICULTY_EASY]: 10,
    [DIFFICULTY_NORMAL]: 15,
    [DIFFICULTY_HARD]: 30
};

const difficultyMineAmount = {
    [DIFFICULTY_EASY]: 12,
    [DIFFICULTY_NORMAL]: 60,
    [DIFFICULTY_HARD]: 140
};

$(function() {
    let blocks = [];
    
    let selectElement = document.getElementById("difficultySelect");
    DIFFICULTIES.forEach(difficulty => {
        const option = document.createElement("option");
        option.text = difficulty;
        option.value = difficulty;
        let savedDifficulty = localStorage.getItem('difficulty');
        if((savedDifficulty && savedDifficulty === difficulty)) {
            option.selected = true;
        } else {
            if (difficulty === DIFFICULTIES[0]) {
                option.selected = true;
            }
        }
        selectElement.add(option);
    });
    selectElement.addEventListener("change", function() {
        difficulty = this.value;
        blockAmount = difficultyBlockRowAmount[difficulty];
        mineAmount = difficultyMineAmount[difficulty];
        numberBlocksLeft = blockAmount * blockAmount - mineAmount;
        localStorage.setItem('difficulty', difficulty);

        initialize();
    });
    
    let difficulty = selectElement.options[selectElement.selectedIndex].value;
    let blockAmount = difficultyBlockRowAmount[difficulty];
    let mineAmount = difficultyMineAmount[difficulty];
    let numberBlocksLeft = blockAmount * blockAmount - mineAmount;
    let startTime;
    let timerInterval;
    
    initialize();
    
    console.log("blocks", blocks);
    
    function initialize() {
        $('#blocks-left').text(numberBlocksLeft);
        setLeaderboard();
        clearInterval(timerInterval);
        $('#timer').text("00:00:00");

        blocks = [];

        for(let i = 0; i < blockAmount; i++) {
            let row = [];
            for(let j = 0; j < blockAmount; j++) {
                let number = {
                    type: null,
                    blankGroup: null,
                    number: null,
                    color: null,
                    row: i,
                    column: j,
                    id: `${i}-${j}`,
                    revealed: false
                };

                row.push(number);
            }

            blocks.push(row);
        }

        // setting mineAmount of mines at random places
        placeMines();
        // setting the numbers of the other blocks. If block is not surrounded by a mine, turn into a BLANK block
        setBlockNumbers();
        displayBlocks();
    }

    function placeMines() {
        let minesToPlace = mineAmount;
        
        for (let i = 0; i < minesToPlace; i++) {
            let row = Math.floor(Math.random() * (blocks.length));
            let column = Math.floor(Math.random() * (blocks[0].length));
            let block = blocks[row][column];
            if(block.type !== MINE) {
                block.type = MINE;
            } else {
                minesToPlace++;
            }
        }
    }

    function setBlockNumbers() {
        let flattenedArray = [].concat(...blocks);
        let filteredArray = flattenedArray.filter(block => block.type !== MINE);
        const colorNames = ["green", "yellow", "orange", "red", "blue", "magenta", "purple", "pink"];

        filteredArray.forEach(block => {
            let number = countMinesAroundBlock(block);
            if(number > 0) {
                block.type = NUMBER;
                block.number = number;
                block.color = colorNames[number-1];
            }
        });

        filteredArray = filteredArray.filter(block => block.type === null);
        filteredArray.forEach(block => {
            makeBlockBlank(block.row, block.column, block.id);
        });
    }

    function displayBlocks() {
        let bord = $("#bord");
        bord.empty();

        blocks.forEach(blockRow => {
            blockRow.forEach(blockObject => {
                let block = $("<div class='block hidden-block'></div>");
                let blockId = `block${blockObject.id}`;
                block.attr("id", blockId);
                block.css("cursor", "pointer");
    
                let blockOverlay = $("<div class='overlay'></div>");
                let blockOverlayId = `blockOverlay${blockObject.id}`;
                blockOverlay.attr("id", blockOverlayId);

                let content = $("<span class='content'></span>");
                let contentId = `content${blockObject.id}`;
                content.attr("id", contentId);
                // TODO: ""
                content.text("-");

                block.append(content);
                block.append(blockOverlay);
    
                block.on('click', function(event) {
                    if(event.button == 0) {
                        event.preventDefault();
                        clickBlock(blockObject.id);
                    }
                });

                block.on('contextmenu', function(event) {
                    event.preventDefault();
                    flagBlock(blockObject.id);
                });
    
                bord.append(block);
            });

            bord.append($("</br>"));
        });
    }
    
    function clickBlock(blockId) {
        let block = $(`#block${blockId}`);
        let blockOverlayId = `blockOverlay${blockId}`;
        let blockOverlay = $(`#${blockOverlayId}`);

        if(!blockIsFlagged(blockOverlayId) && blockOverlay.length > 0) {
            blockOverlay.remove();
            block.css("cursor", "default");

            let blockObject = getBlockObject(blockId);
            let blockContent = $(`#content${blockId}`);

            // if it's the first block you click, start the timer
            let startblockAmount = blockAmount * blockAmount - mineAmount;
            if(numberBlocksLeft === startblockAmount) {
                startTime = Date.now();
                timerInterval = setInterval(updateTimer, 100);
            }

            if(blockObject.type === NUMBER) {
                blockContent.text(blockObject.number);
                blockContent.css("color", blockObject.color);
                revealBlock(blockObject);
            } else if(blockObject.type === BLANK) {
                blockContent.css("color", "transparent");
                blankBlockClicked(blockObject.blankGroup);
            } else if(blockObject.type === MINE) {
                gameOver();
            }

            if(numberBlocksLeft === 0) {
                gameWon();
            }
        }
    }

    function blankBlockClicked(blankGroup) {
        let flattenedArray = [].concat(...blocks);
        let filteredArray = flattenedArray.filter(block => block.blankGroup === blankGroup && block.revealed === false);

        filteredArray.forEach(block => {
            $(`#block${block.id}`).css("cursor", "default");
            $(`#blockOverlay${block.id}`).remove();
            $(`#content${block.id}`).css("color", "transparent");
            revealBlock(block);

            let surroundingBlocks = getSurroundingBlocks(block.row, block.column);
            for (let key in surroundingBlocks) {
                let block = surroundingBlocks[key];
                if (block && block.type === NUMBER && block.revealed === false) {
                    $(`#block${block.id}`).css("cursor", "default");
                    $(`#blockOverlay${block.id}`).remove();
                    $(`#content${block.id}`).text(block.number).css("color", block.color);
                    revealBlock(block);
                }
            }
        });
    }
    
    function flagBlock(blockId) {
        let blockOverlayId = `blockOverlay${blockId}`;
        let blockOverlay = $(`#${blockOverlayId}`);
        let flag = $(`<i id="block-flag${blockOverlayId}" class="fa-solid fa-flag flag-icon"></i>`);

        if(blockIsFlagged(blockOverlayId)) {
            $(`#block-flag${blockOverlayId}`).remove();
        } else {
            blockOverlay.append(flag);
        }
    }

    function blockIsFlagged(blockOverlayId) {
        let blockOverlay = $(`#${blockOverlayId}`);
        return blockOverlay.find(`#block-flag${blockOverlayId}`).length > 0;
    }

    function getBlockObject(id) {
        for (let row of blocks) {
            let block = row.find(block => block.id === id);
            if (block) return block;
        }

        return null;
    }

    function getSurroundingBlocks(row, column) {
        let blockAbove = ((row - 1) >= 0) ? blocks[row - 1][column] : null;
        let blockRightAbove = ((row - 1) >= 0 && (column + 1) < blocks.length) ? blocks[row - 1][column + 1] : null;
        let blockRight = ((column + 1) < blocks[0].length) ? blocks[row][column + 1] : null;
        let blockRightBelow = ((column + 1) < blocks[0].length && (row + 1) < blocks.length) ? blocks[row + 1][column + 1] : null;
        let blockBelow = ((row + 1) < blocks.length) ? blocks[row + 1][column] : null;
        let blockLeftBelow = ((row + 1) < blocks.length && (column - 1) >= 0) ? blocks[row + 1][column - 1] : null;
        let blockLeft = ((column - 1) >= 0) ? blocks[row][column - 1] : null;
        let blockLeftAbove = ((column - 1) >= 0 && (row - 1) >= 0) ? blocks[row - 1][column - 1] : null;

        return {
            "blockAbove": blockAbove,
            "blockRightAbove": blockRightAbove,
            "blockRight": blockRight,
            "blockRightBelow": blockRightBelow,
            "blockBelow": blockBelow,
            "blockLeftBelow": blockLeftBelow,
            "blockLeft": blockLeft,
            "blockLeftAbove": blockLeftAbove,
        };
    }

    function gameOver() {
        clearInterval(timerInterval);
        let flattenedArray = [].concat(...blocks);
        let filteredArray = flattenedArray.filter(block => block.type === MINE);

        filteredArray.forEach(block => {
            $(`#block${block.id}`).css("cursor", "default");
            $(`#blockOverlay${block.id}`).remove();
            $(`#content${block.id}`).css("color", "transparent");
            $(`#content${block.id}`).empty().append('<i class="fa-solid fa-bomb bomb-icon"></i>');
        });

        $("#bord").off("click").find("*").off("click");

        setTimeout(function() {
            location.reload();
        }, 3000);
    }

    function gameWon() {
        clearInterval(timerInterval);
        let alertText = "You won! Time: " + $('#timer').text();
        // TODO: wonGames encrypten zodat niet makkelijk aanpasbaar is
        let storeGame = {
            difficulty: difficulty,
            time: $('#timer').text(),
            day: new Date().toLocaleString()
        };
        let storedGames = localStorage.getItem('wonGames');
        if (storedGames) {
            let gamesArray = JSON.parse(storedGames);
            gamesArray = gamesArray.filter(game => game.difficulty === difficulty);
            
            let fastestRecord = gamesArray.sort((a, b) => a.time.localeCompare(b.time))[0];
            if(isTimerLower(storeGame.time, fastestRecord.time)) {
                alertText += ". It's a new personal record!";
            }

            gamesArray.push(storeGame);
            localStorage.setItem('wonGames', JSON.stringify(gamesArray));
        } else {
            alertText += ". It's a new personal record!";
            localStorage.setItem('wonGames', JSON.stringify([storeGame]));
        }

        $("#bord").off("click").find("*").off("click");
        
        
        setTimeout(function() {
            alert(alertText);
            location.reload();
        }, 1000);
    }

    function revealBlock(block) {
        block.revealed = true;
        numberBlocksLeft--;
        $('#blocks-left').text(numberBlocksLeft);
    }

    function countMinesAroundBlock(block) {
        let count = 0;

        let surroundingBlocks = getSurroundingBlocks(block.row, block.column);
        
        if(surroundingBlocks["blockAbove"] && surroundingBlocks["blockAbove"].type === MINE) count++;
        if(surroundingBlocks["blockRightAbove"] && surroundingBlocks["blockRightAbove"].type === MINE) count++;
        if(surroundingBlocks["blockRight"] && surroundingBlocks["blockRight"].type === MINE) count++;
        if(surroundingBlocks["blockRightBelow"] && surroundingBlocks["blockRightBelow"].type === MINE) count++;
        if(surroundingBlocks["blockBelow"] && surroundingBlocks["blockBelow"].type === MINE) count++;
        if(surroundingBlocks["blockLeftBelow"] && surroundingBlocks["blockLeftBelow"].type === MINE) count++;
        if(surroundingBlocks["blockLeft"] && surroundingBlocks["blockLeft"].type === MINE) count++;
        if(surroundingBlocks["blockLeftAbove"] && surroundingBlocks["blockLeftAbove"].type === MINE) count++;

        return count;
    }

    function makeBlockBlank(row, column, group) {
        if(blocks[row][column].type !== null) return;

        blocks[row][column].type = BLANK;
        blocks[row][column].blankGroup = group;

        let surroundingBlocks = getSurroundingBlocks(row, column);

        let blockAbove = surroundingBlocks["blockAbove"];
        let blockRightAbove = surroundingBlocks["blockRightAbove"];
        let blockRight = surroundingBlocks["blockRight"];
        let blockRightBelow = surroundingBlocks["blockRightBelow"];
        let blockBelow = surroundingBlocks["blockBelow"];
        let blockLeftBelow = surroundingBlocks["blockLeftBelow"];
        let blockLeft = surroundingBlocks["blockLeft"];
        let blockLeftAbove = surroundingBlocks["blockLeftAbove"];

        if(blockAbove && blockAbove.type === null && blockAbove.number === null) {
            makeBlockBlank(blockAbove.row, blockAbove.column, group);
        }
        if(blockRightAbove && blockRightAbove.type === null && blockRightAbove.number === null) {
            makeBlockBlank(blockRightAbove.row, blockRightAbove.column, group);
        }
        if(blockRight && blockRight.type === null && blockRight.number === null) {
            makeBlockBlank(blockRight.row, blockRight.column, group);
        }
        if(blockRightBelow && blockRightBelow.type === null && blockRightBelow.number === null) {
            makeBlockBlank(blockRightBelow.row, blockRightBelow.column, group);
        }
        if(blockBelow && blockBelow.type === null && blockBelow.number === null) {
            makeBlockBlank(blockBelow.row, blockBelow.column, group);
        }
        if(blockLeftBelow && blockLeftBelow.type === null && blockLeftBelow.number === null) {
            makeBlockBlank(blockLeftBelow.row, blockLeftBelow.column, group);
        }
        if(blockLeft && blockLeft.type === null && blockLeft.number === null) {
            makeBlockBlank(blockLeft.row, blockLeft.column, group);
        }
        if(blockLeftAbove && blockLeftAbove.null && blockLeftAbove.number === null) {
            makeBlockBlank(blockLeftAbove.row, blockLeftAbove.column, group);
        }
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
        $("#games-won").text(localStorage.getItem('wonGames') ? JSON.parse(localStorage.getItem('wonGames')).length : 0);

        let storedGames = localStorage.getItem('wonGames');
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

    $('#showGamesBtn').click(function() {
        let gamesListDiv = $('#leaderboard');

        if (gamesListDiv.is(':visible')) {
            gamesListDiv.hide();
        } else {
            gamesListDiv.show();
        }
    });
});