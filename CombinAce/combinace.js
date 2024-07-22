const TYPE_HEARTS = "hearts";
const TYPE_SPADES = "spades";
const TYPE_DIAMONDS = "diamonds";
const TYPE_CLOVER = "clover";
const TYPES = [TYPE_HEARTS, TYPE_SPADES, TYPE_DIAMONDS, TYPE_CLOVER];

const JOKER = "joker";

const type_icon = {
    [TYPE_HEARTS]: "♥",
    [TYPE_SPADES]: "♠",
    [TYPE_DIAMONDS]: "♦",
    [TYPE_CLOVER]: "♣"
};

// HTML Elements
let handCardsDiv;
let handCardsDivBot1;
let handCardsDivBot2;
let cardPileDiv;
let combinationDiv;
let playCombinationBtn;
let drawCardBtn;

// { amount(int), dice(bool) }
let drawCards = null;

let luckyNumber;
// cards in hand
let cards = [];
let cardsBot1 = [];
let cardsBot2 = [];
let deck = [];
let combinationCards = [];
// placed cards
let cardPile = [];
// who's turn it is. 1 means it's your turn. 2 and 3 are the bots
let playerTurn = 1;

$(function() {
    // TODO: dobbelstenen totaal aantal laten zien. Misschien met dobbelsteen groot weergeven wat die heeft gegooid en uiteindelijk de som groot weerwGEVEN
    // TODO: duidelijker weergeven de totale punten van de combinatie
    // TODO: duidelijker weergeven dat de A helemaal naar rechts gesleept moet worden om er 12 punten van te maken
    // TODO: mooie dobbelstenen zelf maken
    // TODO: alle kaarten in hand laten zien zonder te hoeven scrollen
    // TODO: winnen
    // TODO: comments allemaal engels maken

    handCardsDiv = $('#hand-cards');//.sortable();
    handCardsDivBot1 = $('#hand-cards-bot1');
    handCardsDivBot2 = $('#hand-cards-bot2');
    cardPileDiv = $('#card-pile');
    combinationDiv = $('#combination');
    playCombinationBtn = $("#play-combination-btn");
    drawCardBtn = $("#draw-card-btn");
    $("#player-turn").html("It's your turn");

    //$("#menu").draggable();
    //$("#lucky-number-container").draggable();
    //$("#rules-object-container").draggable();

    $('#lucky-number-btn').on('click', function(event) {
        if(event.button == 0) {
            event.preventDefault();
            initialize();
        }
    });

    function initialize() {
        getLuckyNumber();
        $("#draw-buttons").css("display", "flex");
        $("#lucky-number").clone().appendTo("#menu");
        $("#lucky-number-container").remove();
        setCards(2);
        dealCards(15);
        dealCardsBots(8); // TODO: 15
    }

    drawCardBtn.on('click', function(event) {
        if(playerTurn !== 1) {
            showFeedback("It's not your turn.", "error");
            return;
        }
        if(drawCards === null && event.button == 0) {
            event.preventDefault();
            dealCards(1);
            nextPlayerTurn();
            //TODO: clearCombination();
        } else {
            if(drawCards.dice) {
                rollDiceToDraw(drawCards.amount);
            } else {
                dealCards(drawCards.amount);
            }

            drawCards = null;
        }

        $(this).html("Draw card");
        $(this).removeClass("wiebel invert");
    });

    playCombinationBtn.on('click', function(event) {
        if(drawCards === null && event.button == 0) {
            event.preventDefault();
            playCombination();
        }
    });
});

function getLuckyNumber() {
    luckyNumber = Math.floor(Math.random() * (36 - 3 + 1)) + 3;
    $('#lucky-number-btn').remove();
    $('#lucky-number').text(luckyNumber);
}

function rollDiceToDraw(number) {
    let element = document.getElementById('bord');
    rollADie({ element, numberOfDice: number, callback: rollDiceResult, delay: 6000});
}

function rollDiceResult(res) {
    let amount = res.reduce(function(a, b){
        return a + b;
    }, 0);

    console.log("aantal pakken:", amount);
    dealCards(amount);
}

function setCards(packs) {
    // for the amount of decks
    for(let i = 1; i <= packs; i++) {
        // for every type: spades, hearts...
        TYPES.forEach(type => {
            // for every card: A, 2, 3, ..., king, ...
            for(let j = 1; j <= 13; j++) {
                let card = {
                    id: `card-${i}-${j}-${type}`,
                    cardNumber: j,
                    deck: i,
                    type: type,
                    points: getCardPoints(j),
                    value: getCardValue(j),
                }

                deck.push(card);
            }
        });

        deck.push({ id: `card-${i}-${1}-joker`, type: JOKER, points: null, value: JOKER.toUpperCase(), cardNumber: 99 });
        deck.push({ id: `card-${i}-${2}-joker`, type: JOKER, points: null, value: JOKER.toUpperCase(), cardNumber: 99 });
    }

    console.log("alle kaarten: ", deck);
}

function getCardPoints(num) {
    if(num === 1)
        return null;
    else if(num === 11 || num === 12 || num === 13)
        return 11;
    else if(num > 13)
        return null;
    else return num;
}

function getCardValue(num) {
    if(num === 1)
        return "A";
    else if(num === 11)
        return "J";
    else if(num === 12)
        return "Q";
    else if(num === 13)
        return "K";
    else return num;
}

function dealCards(amount) {
    for (let i = 0; i < amount; i++) {
        if(deck.length === 0) {
            showFeedback("There are no more cards to draw.", "error");
            break;
        }

        const randomIndex = Math.floor(Math.random() * deck.length);
        const dealtCard = deck.splice(randomIndex, 1)[0];
        cards.push(dealtCard);
        handCardsDiv.append(getCardView(dealtCard));
    }
}

function getCardView(card) {
    let cardView = $('<div>');
    cardView.addClass(`cardd card-${card.value}`);
    cardView.attr("id", card.id);

    if(card.type === JOKER) {
        let cardValue = $(`<span class="card-value card-value-${card.value}">${card.value}</span>`);
        cardView.append(cardValue);
    } else {
        let iconCornerTopLeft = $(`<span class="top-left card-icon card-icon-${card.type}">${type_icon[card.type]}</span>`);
        let iconCornerBottomRight = $(`<span class="bottom-right card-icon card-icon-${card.type}">${type_icon[card.type]}</span>`);
        let cardValue = $(`<span class="card-value card-value-${card.type}">${card.value}</span>`);
        if(card.value === 'A') {
            cardValue.removeClass().addClass("card-value card-value-A");
        }
    
        cardView.append(iconCornerTopLeft);
        cardView.append(iconCornerBottomRight);
        cardView.append(cardValue);
    }
    
    // left mouse button click
    cardView.on('click', function(event) {
        if(event.button == 0) {
            event.preventDefault();
            playcard(card);
            //clearCombination();
        }
    });
    // right mouse button click
    cardView.on('contextmenu', function(event) {
        event.preventDefault();
        addToCombination(card);
    });

    cardView.on('mousemove', function(e) {
        const boundingRect = $(this)[0].getBoundingClientRect();
        const offsetX = e.clientX - boundingRect.left - boundingRect.width / 2;
        const offsetY = e.clientY - boundingRect.top - boundingRect.height / 2;
        
        const rotateX = offsetY / 10;
        const rotateY = offsetX / 10;
    
        $(this).css('transform', `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`);
    });
    
    cardView.on('mouseleave', function() {
        $(this).css('transform', 'perspective(1000px) rotateY(0deg)');
    });

    cardView.css("cursor", "pointer");

    return cardView;
}

function playcard(card, combination = false) {
    if(playerTurn !== 1) {
        showFeedback("It's not your turn.", "error");
        return;
    }
    if(!combination && !validCard(card)) {
        showFeedback("You can't play this card.", "error");
        return;
    }

    cardPile.push(card);
    cards = cards.filter(item => item !== card);

    if(combination) {
        if(drawCards) {
            drawCards.amount++;
        } else {
            drawCards = { amount: 1, dice: true };
        }
        drawCardBtn.html(`Draw ${drawCards.amount} cards! <i class='fa-solid fa-dice'></i>`);
        drawCardBtn.addClass("wiebel invert");
    }
    else if(card.type === JOKER || card.value === "A") {
        if(drawCards) {
            drawCards.amount += 3;
            drawCards.dice = false;
        } else {
            drawCards = { amount: 3, dice: false };
        }
        
        drawCardBtn.html(`Draw ${drawCards.amount} cards!`);
        drawCardBtn.addClass("wiebel invert");
    }
    

    let cardView = $(`#${card.id}`);
    const title = card.type !== JOKER ? `${type_icon[card.type]} ${card.value}` : card.value;
    cardView.attr('title', title);
    cardView.css({
        'position': 'absolute',
        'margin-left': Math.random() * 30,
        'margin-top': Math.random() * 30,
        'cursor': 'default'
    });

    cardView.remove().appendTo(cardPileDiv);
    nextPlayerTurn();
}

function getCombinationPoints() {
    let points = 0;

    const containsJoker = combinationCards.some(card => {
        if (card.type === JOKER) {
            return true;
        } else {
            points += card.points;
            return false;
        }
    });

    if (containsJoker) {
        return "??";
    }

    return points;
}

function addToCombination(card) {
    if(drawCards !== null) return;
    if(card.type === JOKER && combinationCards.find(card => card.type === "JOKER")) {
        showFeedback("You can't use more than one joker in a combination", "error");
        return;
    }

    let cardView = $(`#${card.id}`);

    if (card.value === "A") {
        card.points = 1;
        card.cardNumber = 1;
        cardView.remove().prependTo(combinationDiv);
    } else {
        cardView.remove().appendTo(combinationDiv);
    }
    
    combinationCards.push(card);
    combinationDiv.css("display", "flex");
    combinationDiv.attr('title', getCombinationPoints());
    playCombinationBtn.css("display", "inline-block");

    cardView.addClass('combinationCard');
    cardView.on('contextmenu', function(event) {
        event.preventDefault();
        removeFromCombination(card);
    });

    // A mag alleen helemaal vooraan of helemaal achteraan staan. vooraan is points = 1 en cardNumber = 1. Achteraan is points = 12 en cardNumber = 14
    if (!$(combinationDiv).data('uiSortable')) {
        $(combinationDiv).sortable({
            stop: function(event, ui) {
                let movedCardDiv = ui.item;
                let movedCard = combinationCards.filter(card => card.id === movedCardDiv[0].id)[0];
                
                if (movedCard.value === "A") {
                    if (movedCardDiv.index() === 0) {
                        movedCard.points = 1;
                        movedCard.cardNumber = 1;
                    } else if (movedCardDiv.index() === movedCardDiv.parent().children().length - 1) {
                        movedCard.points = 12;
                        movedCard.cardNumber = 14;
                    }

                    combinationDiv.attr('title', getCombinationPoints());
                }
            }
        });
    };
}

function removeFromCombination(card) {
    let cardView = $(`#${card.id}`);
    combinationCards = combinationCards.filter(item => item !== card);

    cardView.remove().appendTo(handCardsDiv);
    combinationDiv.attr('title', getCombinationPoints());
    if(combinationDiv.children().length === 0) {
        playCombinationBtn.css("display", "none");
        combinationDiv.css("display", "none");
    }

    cardView.removeClass('draggable');
    cardView.on('contextmenu', function(event) {
        event.preventDefault();
        addToCombination(card);
    });
    cardView.on('click', function(event) {
        if(event.button == 0) {
            event.preventDefault();
            playcard(card);
        }
    });
}

function clearCombination() {
    if (combinationCards.length > 0) {
        let combinationDivChildren = combinationDiv.children().clone();
        combinationDivChildren.removeClass('draggable');
        combinationDivChildren.each(function() {
            $(this).on('contextmenu', function(event) {
                event.preventDefault();
                addToCombination($(this));
            }).on('click', function(event) {
                if (event.button == 0) {
                    event.preventDefault();
                    playcard($(this));
                }
            });
        });
        combinationDivChildren.appendTo(handCardsDiv);
        combinationDiv.empty();
        combinationDiv.css("display", "none");
        playCombinationBtn.css("display", "none");
        combinationCards = [];
    }
}

function playCombination() {
    if(playerTurn !== 1) {
        showFeedback("It's not your turn.", "error");
        return;
    }

    if(drawCards === null || drawCards.dice === true) {
        if(validCombination()) {
            combinationCards.forEach(card => {
                playcard(card, true);
            });
    
            clearCombination();
            nextPlayerTurn();
        } else {
            showFeedback("This is not a valid combination.", "error");
        }
    }
}

function validCard(card) {
    if(drawCards !== null && !drawCards.dice && (card.type === JOKER || card.value === "A" || card.value === 2)) {
        return true;
    } else if(drawCards !== null) {
        return false;
    }

    let lastCard = cardPile[cardPile.length - 1];

    return (!lastCard || lastCard.type === card.type || lastCard.value === card.value || card.type === JOKER || card.value === "A");
}

function validCombination() {
    // user already decided value of A if it's included
    return (validStraatje() || validxOfaKind());
}

function nextPlayerTurn() {
    console.log(playerTurn);
    playerTurn = (playerTurn % 3) + 1;

    if(playerTurn === 1) $("#player-turn").html("It's your turn");
    else if(playerTurn === 2) $("#player-turn").html("It's bot1's turn");
    else if(playerTurn === 3) $("#player-turn").html("It's bot2's turn");

    if(playerTurn === 2 || playerTurn === 3) {
        botsTurn();
    }
}

function validStraatje() {
    // TODO: van K naar A mogelijk maken
    if (!combinationCards || combinationCards.length < 3) return false;

    let nonSpecialCards = combinationCards.filter(card => card.type !== "JOKER" && card.value !== "A");
    nonSpecialCards.sort((a, b) => a.cardNumber - b.cardNumber);

    // sorteren op kaarnumber klein naar groot
    combinationCards.sort((a, b) => a.cardNumber - b.cardNumber);
    const normalLowestCard = nonSpecialCards[0];
    const normalHighestCard = nonSpecialCards[nonSpecialCards.length - 1];
    // alle kaarten zijn A's, of alleen A's en een joker
    if(!normalLowestCard) return false;
    let totalPoints = combinationCards.find(card => card.value !== "A").points;

    let sameType = true;
    combinationCards.forEach(card => {
        if (card.type !== normalLowestCard.type && card.value !== "A") sameType = false;
    });
    if (!sameType) {
        return false;
    }

    let i = 1;
    while (i < combinationCards.length) {
        let nextCard = combinationCards[i];
        let currentCard = combinationCards[i - 1];
        // als er geen volgende kaart meer is.
        if (typeof nextCard === 'undefined') {
            break;
        }
        // als volgende kaart niet opeenvolgend is met huidige kaart
        else if (nextCard.cardNumber !== currentCard.cardNumber + 1) {
            // als de eerste kaart een A is, dan achteraan zetten
            if (i === 1 && currentCard.value === "A") {
                combinationCards.push(combinationCards.shift());
                i = 1; continue;
            // als de volgende kaart een A is, dan de toegekende punten meetellen
            } else if(nextCard.value === "A") {
                totalPoints += nextCard.points;
                i++;
            // als het een joker is (is altijd de laatste kaart. Er is maar max één joker in een combinatie)
            } else if(nextCard.type === JOKER) {
                let pointsLowest = getCardPoints(normalLowestCard.cardNumber-1);
                let pointsHighest = getCardPoints(normalHighestCard.cardNumber+1);
                if(pointsLowest !== null && totalPoints + pointsLowest === luckyNumber) {
                    return true;
                } else if (pointsHighest !== null && totalPoints + pointsHighest === luckyNumber) {
                    return true;
                } else {
                    return false;
                }
            // als het geen geldig straatje is
            } else {
                return false;
            }
        // als volgende kaart wel opeenvolgend is met huidige kaart
        } else {
            totalPoints += nextCard.points;
            i++;
        }
    }

    return totalPoints === luckyNumber;
}

function validxOfaKind() {
    if(combinationCards.length < 3) return false;

    let nonSpecialCards = combinationCards.filter(card => card.type !== "JOKER" && card.value !== "A");
    // TODO: je mag nu niet een combinatie hebben van alleen maar As (en een joker). moet wel kunnen
    if(nonSpecialCards.length === 0) return false;

    let pastTypes = [];
    let sameValue = nonSpecialCards[0].value;
    let cardPoints = nonSpecialCards[0].points;
    let totalPoints = 0;
    let xOfaKind = 0;
    
    combinationCards.forEach(card => {
        if (card.value !== sameValue && card.type !== JOKER && card.value !== "A") {
            alert("geen 1");
            return false;
        } else if (pastTypes.includes(card.type) || xOfaKind > 4) {
            alert("geen 2");
            return false;
        } else if(card.type === JOKER && xOfaKind <= 3) {
            totalPoints += cardPoints;
            xOfaKind++;
        } else if(card.value === "A") {
            totalPoints += card.points;
        } else {
            pastTypes.push(card.type);
            totalPoints += cardPoints;
            xOfaKind++;
        }
    });

    return totalPoints === luckyNumber;
}

// BOT FUNCTIONALITIES

function dealCardsBots(amount) {
    for (let i = 0; i < amount; i++) {
        if(deck.length === 0) { break; }
        const randomIndex = Math.floor(Math.random() * deck.length);
        const dealtCard = deck.splice(randomIndex, 1)[0];
        cardsBot1.push(dealtCard);
        handCardsDivBot1.append(getCardViewHidden(dealtCard));
    }
    for (let i = 0; i < amount; i++) {
        if(deck.length === 0) { break; }
        const randomIndex = Math.floor(Math.random() * deck.length);
        const dealtCard = deck.splice(randomIndex, 1)[0];
        cardsBot2.push(dealtCard);
        handCardsDivBot2.append(getCardViewHidden(dealtCard));
    }
}

function dealCardsBot(amount) {
    for (let i = 0; i < amount; i++) {
        if(deck.length === 0) { break; }
        const randomIndex = Math.floor(Math.random() * deck.length);
        const dealtCard = deck.splice(randomIndex, 1)[0];
        if(playerTurn === 2) {
            cardsBot1.push(dealtCard);
            handCardsDivBot1.append(getCardViewHidden(dealtCard));
        }
        else if (playerTurn === 3) { 
            cardsBot2.push(dealtCard);
            handCardsDivBot2.append(getCardViewHidden(dealtCard));
        }
    }
}

function getCardViewHidden() {
    let cardView = $('<div>');
    cardView.addClass('cardd');
    cardView.css("cursor", "pointer");
    return cardView;
}

function getCardViewBot(card) {
    let cardView = $('<div>');
    cardView.addClass(`cardd card-${card.value}`);
    cardView.attr("id", card.id);

    if(card.type === JOKER) {
        let cardValue = $(`<span class="card-value card-value-${card.value}">${card.value}</span>`);
        cardView.append(cardValue);
    } else {
        let iconCornerTopLeft = $(`<span class="top-left card-icon card-icon-${card.type}">${type_icon[card.type]}</span>`);
        let iconCornerBottomRight = $(`<span class="bottom-right card-icon card-icon-${card.type}">${type_icon[card.type]}</span>`);
        let cardValue = $(`<span class="card-value card-value-${card.type}">${card.value}</span>`);
        if(card.value === 'A') {
            cardValue.removeClass().addClass("card-value card-value-A");
        }
    
        cardView.append(iconCornerTopLeft);
        cardView.append(iconCornerBottomRight);
        cardView.append(cardValue);
    }
    
    cardView.css("cursor", "pointer");

    return cardView;
}

function botsTurn() {
    if(drawCards !== null) {
        setTimeout(function() {
            if(drawCards.dice) {
                rollDiceToDrawBot(drawCards.amount);
            } else {
                dealCardsBot(drawCards.amount);
            }

            drawCards = null;
        }, 1000);
    }
    
    setTimeout(function() {
        if(playerTurn === 2) {
            let cardPlayed = botPlayCardIfPossible(cardsBot1);
            
            if(!cardPlayed) {
                drawCardBot();
            }
        }
        else if (playerTurn === 3) {
            let cardPlayed = botPlayCardIfPossible(cardsBot2);
            
            if(!cardPlayed) {
                drawCardBot();
            }
        }
    }, 1000);
}

function botPlayCardIfPossible(hand) {
    for (let card of hand) {
        if(validCard(card)) {
            playCardBot(card);
            return true;
        }
    };

    return false;
}

function playCardBot(card) {
    cardPile.push(card);

    if(playerTurn === 2) {
        cardsBot1 = cardsBot1.filter(item => item !== card);
    } else if (playerTurn === 3) {
        cardsBot2 = cardsBot2.filter(item => item !== card);
    }

    if(card.type === JOKER || card.value === "A") {
        if(drawCards) {
            drawCards.amount += 3;
            drawCards.dice = false;
        } else {
            drawCards = { amount: 3, dice: false };
        }
        
        drawCardBtn.html(`Draw ${drawCards.amount} cards!`);
        drawCardBtn.addClass("wiebel invert");
    }
    
    let cardView = getCardViewBot(card);
    const title = card.type !== JOKER ? `${type_icon[card.type]} ${card.value}` : card.value;
    cardView.attr('title', title);
    cardView.css({
        'position': 'absolute',
        'margin-left': Math.random() * 30,
        'margin-top': Math.random() * 30,
        'cursor': 'default'
    });

    if(playerTurn === 2) {
        $('#hand-cards-bot1 > :last-child').remove();
    } else if (playerTurn === 3) {
        $('#hand-cards-bot2 > :last-child').remove();
    }
    
    cardView.appendTo(cardPileDiv);
    nextPlayerTurn();
}

function drawCardBot() {
    dealCardsBot(1);
    nextPlayerTurn();

    $(this).html("Draw card");
    $(this).removeClass("wiebel invert");
}

function rollDiceToDrawBot(number) {
    let element = document.getElementById('bord');
    rollADie({ element, numberOfDice: number, callback: rollDiceResultBot, delay: 6000});
}

function rollDiceResultBot(res) {
    let amount = res.reduce(function(a, b){
        return a + b;
    }, 0);

    dealCardsBot(amount);
}