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
let cardPile;
let combinationDiv;
let combinationPointsText;

let luckyNumber;
let cards = [];
let deck = [];
let placedCards = [];
let combinationCards = [];

$(function() {
    handCardsDiv = $('#hand-cards');
    cardPile = $('#card-pile');
    combinationDiv = $('#combination');
    combinationPointsText = $('#combination-points');

    //rollDice(3);

    $('#lucky-number-btn').on('click', function(event) {
        if(event.button == 0) {
            event.preventDefault();
            initialize();
        }
    });

    function initialize() {
        getLuckyNumber();
        setCards(1); // TODO: 2 decks
        dealCards(15);
    }

    $(".draggable").draggable({
        containment: combinationDiv,
        cursor: "move",
        snap: combinationDiv,
        snapMode: "inner",
        snapTolerance: 20
    });
    combinationDiv.on('click', '.draggable', function() {
        // Your onclick event handler code here
        console.log("a");
    });
});

function getLuckyNumber() {
    luckyNumber = Math.floor(Math.random() * (36 - 3 + 1)) + 3;
    $('#lucky-number-btn').remove();
    $('#lucky-number').text(luckyNumber);
}

function rollDice(number) {
    let element = document.getElementById('bord');
    rollADie({ element, numberOfDice: number, callback: rollDiceResult, delay: 6000});
}

function rollDiceResult(res) {
    console.log("res", res);
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
                    points: getPoints(j),
                    value: getValue(j),
                }

                cards.push(card);
            }
        });

        cards.push({ id: `card-${i}-${1}-joker`, type: JOKER, points: null, value: JOKER.toUpperCase() });
        cards.push({ id: `card-${i}-${2}-joker`, type: JOKER, points: null, value: JOKER.toUpperCase() });
    }

    function getPoints(num) {
        if(num === 1)
            return null;
        else if(num === 11 || num === 12 || num === 13)
            return 11;
        else return num;
    }

    function getValue(num) {
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

    console.log("alle kaarten: ", cards);
}

function dealCards(amount) {
    for (let i = 0; i < amount; i++) {
        const randomIndex = Math.floor(Math.random() * cards.length);
        const dealtCard = cards.splice(randomIndex, 1)[0];
        deck.push(dealtCard);
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
        }
    });
    // right mouse button click
    cardView.on('contextmenu', function(event) {
        event.preventDefault();
        addToCombination(card);
    });
    cardView.css("cursor", "pointer");

    return cardView;
}

function playcard(card) { console.log("play card: ", card);
    cards = cards.filter(item => item !== card);

    let cardView = $(`#${card.id}`);
    
    let randomTop = Math.floor(Math.random() * (cardPile.height() - cardView.height()));
    let randomLeft = Math.floor(Math.random() * (cardPile.width() - cardView.width()));
    cardView.css({
        'position': 'absolute',
        'top': randomTop + 'px',
        'left': randomLeft + 'px',
        'cursor': 'default'
    });

    cardView.remove().appendTo(cardPile);
}

function addToCombination(card) {
    // TODO: als card een A is, kiezen welke waarde en die als card.value setten
    let cardView = $(`#${card.id}`);
    console.log("card added to combination: ", card);
    combinationCards.push(card);

    cardView.remove().appendTo(combinationDiv);
    combinationDiv.css("display", "flex");

    cardView.addClass('draggable');
    cardView.on('contextmenu', function(event) {
        event.preventDefault();
        removeFromCombination(card);
    });
}

function removeFromCombination(card) {
    let cardView = $(`#${card.id}`);
    combinationCards = combinationCards.filter(item => item !== card);

    cardView.remove().appendTo(handCardsDiv);
    if(combinationDiv.children().length === 0) {
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
        let combinationDivChildren = combinationDiv.children();
        combinationDivChildren.removeClass('draggable');
        combinationDivChildren.appendTo(handCardsDiv);
        combinationDivChildren.each(function() {
            $(this).on('contextmenu', function(event) {
                event.preventDefault();
                playcard($(this));
            }).on('click', function(event) {
                if (event.button == 0) {
                    event.preventDefault();
                    addToCombination($(this));
                }
            });
        });
        combinationDiv.empty();
        combinationDiv.css("display", "none");
        combinationCards = [];
    }
}

function playCombination() {
    if(validCombination()) {
        // clearCombination();
    } else {
        // TODO: melding ongeldige combinatie
    }
}

function validCombination() {
    // user already decided value of A if it's included
    if(combinationCards.length < 3) return false;

    if(validStraatje()) {
        alert("Straatje goed!");
    }
    if(validxOfaKind()) {
        alert("3/4 of a kind goed!");
    }

    return (validStraatje() || validxOfaKind());
}

function validStraatje(combinationCards, luckyNumber) {
    if (!combinationCards || combinationCards.length < 3) return false;

    combinationCards.sort((a, b) => a.cardNumber - b.cardNumber);
    const type = combinationCards[0].type;
    let totalPoints = combinationCards[0].points;

    let sameType = true;
    combinationCards.forEach(card => {
        if (card.type !== type) sameType = false;
    });
    if (!sameType) return false;

    let i = 1;
    while (i < combinationCards.length) {
        if (combinationCards[i].cardNumber !== combinationCards[i - 1].cardNumber + 1) {
            if (i === 1 && combinationCards[0].value === "A") {
                combinationCards.push(combinationCards.shift());
                i = 0;
            } else if (i !== 1 && combinationCards[i - 1].cardNumber === 13 && combinationCards[i].cardNumber === 1) {
                i++;
            } else {
                return false;
            }
        }
        totalPoints += combinationCards[i].points;
        i++;
    }

    return totalPoints === luckyNumber;
}

function validxOfaKind() {
    if(combinationCards.length < 3) return false;
}