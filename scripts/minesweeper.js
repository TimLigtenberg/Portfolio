const DIFFICULTY_EASY = "easy";
const DIFFICULTY_NORMAL = "normal";
const DIFFICULTY_HARD = "hard";

const MINE = "mine";
const NUMBER = "number";
const BLANK = "blank";

const difficultyBlockRowAmount = {
    [DIFFICULTY_EASY]: 10,
    [DIFFICULTY_NORMAL]: 20,
    [DIFFICULTY_HARD]: 30
};

const difficultyMineAmount = {
    [DIFFICULTY_EASY]: 25,
    [DIFFICULTY_NORMAL]: 100,
    [DIFFICULTY_HARD]: 300
};

$(function() {
    // TODO: uiteindelijk automatisch laten setten
    let difficulty = DIFFICULTY_NORMAL;

    let blockAmount = difficultyBlockRowAmount[difficulty];
    let mineAmount = difficultyMineAmount[difficulty];
    let blocks = [];
    let numberBlocksLeft = blockAmount * blockAmount - mineAmount;
    
    initialize();
    console.log("blocks", blocks);
    
    function initialize() {
        $('#blocks-left').text(numberBlocksLeft);

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
            let row = Math.floor(Math.random() * (blocks.length -1));
            let column = Math.floor(Math.random() * (blocks[0].length -1));
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
        const colorNames = ["green", "yellow", "orange", "red", "cyan", "blue", "magenta", "purple", "pink"];

        filteredArray.forEach(block => {
            let number = countMinesAroundBlock(block);
            if(number > 0) {
                block.type = NUMBER;
                block.number = number;
                block.color = colorNames[number];
            } else {
                makeBlockBlank(block.row, block.column, block.id);
            }
        });
    }

    function displayBlocks() {
        let bord = $("#bord");

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
                content.css("color", blockObject.color);
                content.text("-");

                block.append(content);
                block.append(blockOverlay);
    
                block.on('click', function(event) {
                    if(event.button == 0) {
                        event.preventDefault();
                        clickBlock(blockObject.id, blockObject.type);
                    }
                });

                block.on('contextmenu', function(event) {
                    event.preventDefault();
                    flagBlock(blockObject.id, blockObject.type);
                });
    
                bord.append(block);
            });

            bord.append($("</br>"));
        });
    }
    
    function clickBlock(blockId, blockType) {
        let block = $(`#block${blockId}`);
        let blockOverlayId = `blockOverlay${blockId}`;
        let blockOverlay = $(`#${blockOverlayId}`);

        if(!blockIsFlagged(blockOverlayId) && blockOverlay.length > 0) {
            console.log(`Block of type ${blockType} and id ${blockId} clicked`);

            blockOverlay.remove();
            block.css("cursor", "default");

            let blockObject = getBlockObject(blockId);
            
            let blockContent = $(`#content${blockId}`);

            if(blockObject.type === NUMBER) {
                blockContent.text(blockObject.number);
                revealBlock(blockObject);
                // TODO: ook hier kijken of er een BLANK block naast zit
            } else if(blockObject.type === BLANK) {
                blockContent.css("color", "transparent");
                revealBlock(blockObject);
                blankBlockClicked(blockObject.blankGroup);
            } else if(blockObject.type === MINE) {
                // TODO: leuke game over animatie
                gameOver();
            }

            if(numberBlocksLeft === 0) {
                gameWon();
            }
        }
    }

    function blankBlockClicked(blankGroup) {
        // TODO: alle blocks rondom de blank group ook zichtbaar maken.
        blocks.forEach(row => {
            row.forEach(block => {
                if (block.blankGroup === blankGroup && block.revealed === false) {
                    $(`#block${block.id}`).css("cursor", "default");
                    $(`#blockOverlay${block.id}`).remove();
                    $(`#content${block.id}`).css("color", "transparent");
                    revealBlock(block);
                }
            });
        });
    }
    
    function flagBlock(blockId, blockType) {
        let blockOverlayId = `blockOverlay${blockId}`;
        let blockOverlay = $(`#${blockOverlayId}`);
        let flag = $(`<i id="block-flag${blockOverlayId}" class="fa-solid fa-flag flag-icon"></i>`);

        if(blockIsFlagged(blockOverlayId)) {
            $(`#block-flag${blockOverlayId}`).remove();
        } else {
            blockOverlay.append(flag);
        }
        

        console.log(`Flag block of type ${blockType} and id ${blockOverlayId}`);
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

    function gameOver() {
        let flattenedArray = [].concat(...blocks);
        let filteredArray = flattenedArray.filter(block => block.type === MINE);

        filteredArray.forEach(block => {
            $(`#block${block.id}`).css("cursor", "default");
            $(`#blockOverlay${block.id}`).remove();
            $(`#content${block.id}`).css("color", "transparent");
            $(`#content${block.id}`).empty().append('<i class="fa-solid fa-bomb bomb-icon"></i>');
        });

        setTimeout(function() {
            alert("You lost!");
        }, 0);

        setTimeout(function() {
            location.reload();
        }, 3000);
    }

    function revealBlock(block) {
        block.revealed = true;
        numberBlocksLeft--;
        $('#blocks-left').text(numberBlocksLeft);
    }

    function countMinesAroundBlock(block) {
        let count = 0;

        let blockAbove = ((block.row - 1) > 0) ? blocks[block.row - 1][block.column] : null;
        let blockRightAbove = ((block.row - 1) > 0 && (block.column + 1) < blocks.length) ? blocks[block.row - 1][block.column + 1] : null;
        let blockRight = ((block.column + 1) < blocks[0].length) ? blocks[block.row][block.column + 1] : null;
        let blockRightBelow = ((block.column + 1) < blocks[0].length && (block.row + 1) < blocks.length) ? blocks[block.row + 1][block.column + 1] : null;
        let blockBelow = ((block.row + 1) < blocks.length) ? blocks[block.row + 1][block.column] : null;
        let blockLeftBelow = ((block.row + 1) < blocks.length && (block.column - 1) > 0) ? blocks[block.row + 1][block.column - 1] : null;
        let blockLeft = ((block.column - 1) > 0) ? blocks[block.row][block.column - 1] : null;
        let blockLeftAbove = ((block.column - 1) > 0 && (block.row - 1) > 0) ? blocks[block.row - 1][block.column - 1] : null;

        if(blockAbove && blockAbove.type === MINE) count++;
        if(blockRightAbove && blockRightAbove.type === MINE) count++;
        if(blockRight && blockRight.type === MINE) count++;
        if(blockRightBelow && blockRightBelow.type === MINE) count++;
        if(blockBelow && blockBelow.type === MINE) count++;
        if(blockLeftBelow && blockLeftBelow.type === MINE) count++;
        if(blockLeft && blockLeft.type === MINE) count++;
        if(blockLeftAbove && blockLeftAbove.type === MINE) count++;

        return count;
    }

    function makeBlockBlank(row, column, group) {
        if(blocks[row][column].type === BLANK) return;

        // TODO: meerdere in een game en die mogen dus niet naast elkaar
        blocks[row][column].type = BLANK;
        blocks[row][column].blankGroup = group;

        let blockAbove = ((row - 1) > 0) ? blocks[row - 1][column] : null;
        let blockRightAbove = ((row - 1) > 0 && (column + 1) < blocks.length) ? blocks[row - 1][column + 1] : null;
        let blockRight = ((column + 1) < blocks[0].length) ? blocks[row][column + 1] : null;
        let blockRightBelow = ((column + 1) < blocks[0].length && (row + 1) < blocks.length) ? blocks[row + 1][column + 1] : null;
        let blockBelow = ((row + 1) < blocks.length) ? blocks[row + 1][column] : null;
        let blockLeftBelow = ((row + 1) < blocks.length && (column - 1) > 0) ? blocks[row + 1][column - 1] : null;
        let blockLeft = ((column - 1) > 0) ? blocks[row][column - 1] : null;
        let blockLeftAbove = ((column - 1) > 0 && (row - 1) > 0) ? blocks[row - 1][column - 1] : null;

        if(blockAbove && blockAbove.type === NUMBER && blockAbove.number === 0) {
            makeBlockBlank(blockAbove.row, blockAbove.column, group);
        }
        if(blockRightAbove && blockRightAbove.type === NUMBER && blockRightAbove.number === 0) {
            makeBlockBlank(blockRightAbove.row, blockRightAbove.column, group);
        }
        if(blockRight && blockRight.type === NUMBER && blockRight.number === 0) {
            makeBlockBlank(blockRight.row, blockRight.column, group);
        }
        if(blockRightBelow && blockRightBelow.type === NUMBER && blockRightBelow.number === 0) {
            makeBlockBlank(blockRightBelow.row, blockRightBelow.column, group);
        }
        if(blockBelow && blockBelow.type === NUMBER && blockBelow.number === 0) {
            makeBlockBlank(blockBelow.row, blockBelow.column, group);
        }
        if(blockLeftBelow && blockLeftBelow.type === NUMBER && blockLeftBelow.number === 0) {
            makeBlockBlank(blockLeftBelow.row, blockLeftBelow.column, group);
        }
        if(blockLeft && blockLeft.type === NUMBER && blockLeft.number === 0) {
            makeBlockBlank(blockLeft.row, blockLeft.column, group);
        }
        if(blockLeftAbove && blockLeftAbove.type === NUMBER && blockLeftAbove.number === 0) {
            makeBlockBlank(blockLeftAbove.row, blockLeftAbove.column, group);
        }
    }
});





/*function createBlankField(group) {
     // TODO: meerdere in een game en die mogen dus niet naast elkaar
        let amount = Math.floor(Math.random() * (50 - 31)) + 30;
    
        let currentRow = Math.floor(Math.random() * (blocks.length - 1));
        let currentCol = Math.floor(Math.random() * (blocks[0].length - 1));
        for (let i = 0; i < amount; i++) {
            let nextRow = currentRow;
            let nextCol = currentCol;
            let random = Math.floor(Math.random() * 2);
            if (random === 0) {
                nextRow = currentRow + (Math.random() < 0.5 ? -1 : 1);
            } else {
                nextCol = currentCol + (Math.random() < 0.5 ? -1 : 1);
            }

            if (nextRow > 0 && nextCol > 0 && nextRow < blocks.length && nextCol < blocks[0].length) {
                blocks[nextRow][nextCol].type = BLANK;
                blocks[nextRow][nextCol].blankGroup = group;
                currentRow = nextRow;
                currentCol = nextCol;
                console.log("Blank field:", blocks[nextRow][nextCol]);
            } else {
                amount++;
            }
        }
    }*/