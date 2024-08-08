/* Idee: Andere bord vormen
Variable Board Shapes: Move away from the traditional square grid and experiment with hexagons, triangles, or even irregular shapes.
*/
/* Idee: 3D bord
3D bord, dus i.p.v. 10*10 blocks, 10*10*10. Dit bestaat al
*/

const DIFFICULTY_EASY = "Easy";
const DIFFICULTY_NORMAL = "Normal";
const DIFFICULTY_HARD = "Hard";

const DIFFICULTIES = [DIFFICULTY_EASY, DIFFICULTY_NORMAL, DIFFICULTY_HARD];

const THEME_NORMAL = "Old school";
const THEME_SPACE = "Space";
const THEME_BINARY = "Binary";
const THEME_SUDOKU = "Sweepudoku";

const THEMES = [THEME_NORMAL, THEME_SPACE, THEME_BINARY]; // THEME_SUDOKU
const SPECIAL_THEMES = [THEME_BINARY, THEME_SUDOKU];

const MINE = "mine";
const NUMBER = "number";
const BLANK = "blank";

const difficultyBlockRowAmount = {
    [DIFFICULTY_EASY]: 10,
    [DIFFICULTY_NORMAL]: 15,
    [DIFFICULTY_HARD]: 30
};

const difficultyMineAmount = {
    [DIFFICULTY_EASY]: 1,
    [DIFFICULTY_NORMAL]: 40,
    [DIFFICULTY_HARD]: 120
};

const wonGamesKey = btoa('wonGames');

let blocks = [];
let difficulty;
let theme;
let blockAmount;
let mineAmount;
let numberBlocksLeft;
let numberMinesLeft;
let startTime;
let timerInterval;

$(function() {
    // TODO: Sudoku minesweeper mix
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
        let savedDifficulty = localStorage.getItem('difficulty');
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

    let selectthemeElement = $("#themeSelect");
    THEMES.forEach(themeI => {
        const option = $('<option>');
        option.text(themeI);
        option.val(themeI);
        let savedTheme = localStorage.getItem('theme');
        if((savedTheme && savedTheme === themeI)) {
            option.prop('selected', true);
            theme = themeI;
        } else if(!savedTheme) {
            if (themeI === THEMES[0]) {
                option.prop('selected', true);
                theme = themeI;
            }
        }
        selectthemeElement.append(option);
    });

    $('#showGamesBtn').click(function() {
        let gamesListDiv = $('#leaderboard');
    
        if (gamesListDiv.is(':visible')) {
            gamesListDiv.hide();
        } else {
            gamesListDiv.show();
        }
    });

    $(document).mouseup(function() {
        $('.overlay').removeClass('active');
    });

    $("#difficultySelect").on("change", function() {
        difficulty = this.value;
        blockAmount = difficultyBlockRowAmount[difficulty];
        mineAmount = difficultyMineAmount[difficulty];
        numberBlocksLeft = blockAmount * blockAmount - mineAmount;
        localStorage.setItem('difficulty', difficulty);
    
        initialize();
    });

    $("#themeSelect").on("change", function() {
        localStorage.setItem('theme', this.value);
        if(SPECIAL_THEMES.includes(theme) || SPECIAL_THEMES.includes(this.value)) {
            location.reload();
        } else {
            theme = this.value;
            applyTheme();
        }
    });

    initialize();
    setLeaderboard();
    $('#leaderboard').hide();
});

function initialize() {
    if (theme === THEME_SUDOKU) {
        blockAmount = difficultyBlockRowAmount[difficulty];
        mineAmount = blockAmount;
    } else {
        blockAmount = difficultyBlockRowAmount[difficulty];
        mineAmount = difficultyMineAmount[difficulty];
    }

    numberBlocksLeft = blockAmount * blockAmount - mineAmount;
    numberMinesLeft = mineAmount;
    
    $('#mines-left').text(numberMinesLeft);
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

    // fill the board with blocks. When the first block gets clicked, the mines will be placed. This because I don't want the first block clicked to be a mine.
    displayBlocks();
}

function placeMines(blockId) {
    let minesToPlace = mineAmount;

    if(theme === THEME_SUDOKU) {
        // every row should have one mine and never on the same column
        let columnsWithoutBomb = [];
        for (let i = 0; i < minesToPlace; i++) {
            let row = Math.floor(Math.random() * (blocks.length));
            let column = Math.floor(Math.random() * (blocks[0].length));
            let block = blocks[row][column];
            if(block.type !== MINE && block.id !== blockId && !columnsWithoutBomb.includes(column)) {
                block.type = MINE;
                columnsWithoutBomb.push(column);
            } else {
                minesToPlace++;
            }
        }
    } else {
        for (let i = 0; i < minesToPlace; i++) {
            let row = Math.floor(Math.random() * (blocks.length));
            let column = Math.floor(Math.random() * (blocks[0].length));
            let block = blocks[row][column];
            if(block.type !== MINE && block.id !== blockId) {
                block.type = MINE;
            } else {
                minesToPlace++;
            }
        }
        // setting the numbers of the other blocks. If block is not surrounded by a mine, turn into a BLANK block
        setBlockNumbers();
    }
}

function setBlockNumbers() {
    let flattenedArray = [].concat(...blocks);
    let filteredArray = flattenedArray.filter(block => block.type !== MINE);
    let colorNames = ["green", "#5dc729", "orange", "red", "blue", "magenta", "purple", "pink"];
    if(theme === THEME_SPACE) {
        colorNames = ["#000080", "#4682B4", "#483D8B", "purple", "#9805ce", "#800080", "#8A2BE2", "#9932CC"];
    }

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
            let block = $("<div class='block'></div>");
            let blockId = `block${blockObject.id}`;
            block.attr("id", blockId);
            block.css("cursor", "pointer");

            let blockOverlay = $("<div class='overlay'></div>");
            let blockOverlayId = `blockOverlay${blockObject.id}`;
            blockOverlay.attr("id", blockOverlayId);

            let content = $("<span class='content'></span>");
            let contentId = `content${blockObject.id}`;
            content.attr("id", contentId);
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

            block.on("mousedown", function(event) {
                if (event.which === 1) {
                    blockOverlay.addClass('active');
                    if(blockObject.revealed === true) {
                        showNeighborClocks(blockObject);
                    }
                }
            });
            
            document.addEventListener("mouseup", function() {
                blockOverlay.removeClass('active');
            });

            bord.append(block);
        });

        bord.append($("</br>"));
    });

    applyTheme();
}

function clickBlock(blockId) {
    let blockElement = $(`#block${blockId}`);
    let blockOverlayId = `blockOverlay${blockId}`;
    let blockOverlayElement = $(`#${blockOverlayId}`);
    let block = getBlockObject(blockId);

    if(!blockIsFlagged(blockOverlayId)) {
        if(!block.revealed) {
            blockOverlayElement.remove();
            blockElement.css("cursor", "default");

            let blockContent = $(`#content${blockId}`);

            // if it's the first block you click, start the timer
            let startblockAmount = blockAmount * blockAmount - mineAmount;
            if(numberBlocksLeft === startblockAmount) {
                // setting mines at random places
                placeMines(blockId);
                startTime = Date.now();
                timerInterval = setInterval(updateTimer, 100);
            }

            if(block.type === NUMBER) {
                blockContent.text(block.number);
                blockContent.css("color", block.color);

                if(theme === THEME_BINARY) {
                    blockContent.text(block.number % 2);
                    blockContent.css("color", (block.number % 2 === 0 ? "black" : "white"));
                }
                revealBlock(block);
            } else if(block.type === BLANK) {
                blockContent.css("color", "transparent");
                blankBlockClicked(block.blankGroup);
            } else if(block.type === MINE) {
                gameOver();
            }

            if(numberBlocksLeft === 0) {
                gameWon();
            }
        } else {
            // clicked on a number block that's not flagged and already revealed
            if(block.type === NUMBER) {
                // amount of mines next to block is equal to amount of flagged (marked as mine) blocks next to block
                let flagged = countFlagsAroundBlock(block);
                if(block.number === flagged) {
                    // reveal all blocks that are not marked as mine
                    let surroundingBlocks = getSurroundingBlocks(block.row, block.column);
                    for (let key in surroundingBlocks) {
                        let surroundingBlock = surroundingBlocks[key];
                        if(surroundingBlock && !surroundingBlock.revealed) {
                            clickBlock(surroundingBlock.id);
                        }
                    }
                }
            }
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

        if(theme === THEME_BINARY) {
            $(`#content${block.id}`).text("0");
            $(`#content${block.id}`).css("color", "black");
        }
        
        revealBlock(block);

        let surroundingBlocks = getSurroundingBlocks(block.row, block.column);
        for (let key in surroundingBlocks) {
            let block = surroundingBlocks[key];
            if (block && block.type === NUMBER && block.revealed === false) {
                $(`#block${block.id}`).css("cursor", "default");
                $(`#blockOverlay${block.id}`).remove();
                $(`#content${block.id}`).text(block.number).css("color", block.color);
                if(theme === THEME_BINARY) {
                    $(`#content${block.id}`).text(block.number % 2).css("color", (block.number % 2 === 0 ? "black" : "white"));
                }
                revealBlock(block);
            }
        }
    });
}

function flagBlock(blockId) {
    let blockOverlayId = `blockOverlay${blockId}`;
    let blockOverlay = $(`#${blockOverlayId}`);
    if(blockOverlay.length) {
        let flag = $(`<i id="block-flag${blockOverlayId}" class="fa-solid block-flag-icon fa-flag flag-icon"></i>`);
        if(theme === THEME_BINARY) {
            flag = $(`<i id="block-flag${blockOverlayId}" class="fa-solid block-flag-icon fa-code code-icon"></i>`);
        } else if (theme === THEME_SPACE) {
            flag = $(`<i id="block-flag${blockOverlayId}" class="fa-solid block-flag-icon fa-flag-usa flag-usa-icon"></i>`);
        }
    
        if(blockIsFlagged(blockOverlayId)) {
            $(`#block-flag${blockOverlayId}`).remove();
            numberMinesLeft++;
        } else {
            blockOverlay.append(flag);
            numberMinesLeft--;
        }
    
        $('#mines-left').text(numberMinesLeft);
    }
}

function showNeighborClocks(block) {
    let surroundingBlocks = getSurroundingBlocks(block.row, block.column);
    for (let key in surroundingBlocks) {
        let surroundingBlock = surroundingBlocks[key];
        if(surroundingBlock && surroundingBlock.revealed === false && !blockIsFlagged(`blockOverlay${surroundingBlock.id}`)) {
            $(`#blockOverlay${surroundingBlock.id}`).addClass('active');
        }
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
        if(theme === THEME_BINARY) {
            $(`#content${block.id}`).empty().append('<i class="fa-solid fa-bug bug-icon"></i>');
        } else if(theme === THEME_SPACE) {
            $(`#content${block.id}`).empty().append('<i class="fa-solid fa-spaghetti-monster-flying monster-icon"></i>');
        }
        
    });

    $("#bord").off("click").find("*").off("click");

    setTimeout(function() {
        startTime = null;
        location.reload();
    }, 2000);
}

function gameWon() {
    clearInterval(timerInterval);
    let alertText = "You won! Time: " + $('#timer').text();
    let storeGame = {
        difficulty: difficulty,
        time: $('#timer').text(),
        day: new Date().toLocaleString()
    };
    let storedGames = localStorage.getItem(wonGamesKey);
    if (storedGames) {
        let gamesArray = JSON.parse(storedGames);
        let gamesOfDifficulty = gamesArray.filter(game => game.difficulty === difficulty);
        
        let fastestRecord = gamesOfDifficulty.sort((a, b) => a.time.localeCompare(b.time))[0];
        if(!fastestRecord || isTimerLower(storeGame.time, fastestRecord.time)) {
            alertText += ". It's a new personal record!";
        }

        gamesArray.push(storeGame);
        localStorage.setItem(wonGamesKey, JSON.stringify(gamesArray));
    } else {
        alertText += ". It's a new personal record!";
        localStorage.setItem(wonGamesKey, JSON.stringify([storeGame]));
    }

    $("#bord").off("click").find("*").off("click");
    $("body").addClass("game-won");
    
    setTimeout(function() {
        startTime = null;
        alert(alertText + "\nClick OK to restart.");
        location.reload();
    }, 3000);
}

function revealBlock(block) {
    block.revealed = true;
    numberBlocksLeft--;
}

function applyTheme() {
    let className = theme.replace(/\s+/g, '').toLowerCase()
    $('.block').removeClass().addClass('block').addClass(className);
    let flagNormalClass = 'fa-solid block-flag-icon fa-flag flag-icon';
    let flagSpaceClass = 'fa-solid block-flag-icon fa-flag-usa flag-usa-icon';
    if(theme === THEME_NORMAL) {
        $('.block-flag-icon').removeClass().addClass(flagNormalClass);
    } else {
        $('.block-flag-icon').removeClass().addClass(flagSpaceClass);
    }
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

function countFlagsAroundBlock(block) {
    let count = 0;

    let surroundingBlocks = getSurroundingBlocks(block.row, block.column);

    for (let key in surroundingBlocks) {
        let surroundingBlock = surroundingBlocks[key];
        if(surroundingBlock) {
            let blockOverlayId = `blockOverlay${surroundingBlock.id}`;
            if(blockIsFlagged(blockOverlayId)) {
                count++;
            }
        }
    }

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