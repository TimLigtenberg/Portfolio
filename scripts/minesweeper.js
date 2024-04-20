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
    [DIFFICULTY_EASY]: 12,
    [DIFFICULTY_NORMAL]: 60,
    [DIFFICULTY_HARD]: 120
};

$(function() {
    // TODO: uiteindelijk automatisch laten setten
    let difficulty = DIFFICULTY_HARD;

    let blockAmount = difficultyBlockRowAmount[difficulty];
    let mineAmount = difficultyMineAmount[difficulty];
    let blocks = []; 
    
    initialize();
    displayBlocks();
    
    function initialize() {
        for(let i = 1; i <= blockAmount; i++) {
            let row = [];
            for(let j = 1; j <= blockAmount; j++) {
                let number = {
                    type: NUMBER,
                    row: j,
                    column: i,
                    id: `${j}-${i}`,
                    number: Math.floor(Math.random() * 5) + 1,
                    color: "red"
                };

                row.push(number);
            }

            blocks.push(row);
        }
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
            blockContent.text(blockObject.number);
        }
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
});