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

let cards = [];
let deck = [];
let placedCards = [];

$(function() {
    initialize();

    $('#hand-cards').append(getCardView(deck[0]));

    function initialize() {
        setCards(1); // TODO: 2 decks
        dealCards(15);
    }
});

function setCards(packs) {
    // for the amount of decks
    for(let i = 1; i <= packs; i++) {
        // for every type: spades, hearts...
        TYPES.forEach(type => {
            // for every card: 2, king ...
            for(let j = 2; j <= 14; j++) {
                let card = {
                    deck: i,
                    type: type,
                    value: j
                }

                cards.push(card);
            }
        });

        cards.push({ type: JOKER });
        cards.push({ type: JOKER });
    }
}

function dealCards(amount) {
    for (let i = 0; i < amount; i++) {
        const randomIndex = Math.floor(Math.random() * cards.length);
        const dealtCard = cards.splice(randomIndex, 1)[0];
        deck.push(dealtCard);
    }
}

function getCardView(card) {
    let cardView = $('<div>');
    cardView.addClass('cardd');

    let iconCornerTopLeft = $(`<span class="top-left card-icon card-icon-${card.type}">${type_icon[card.type]}</span>`);
    let iconCornerBottomRight = $(`<span class="bottom-right card-icon card-icon-${card.type}">${type_icon[card.type]}</span>`);
    let cardValue = $(`<span class="card-value card-value-${card.type}">${card.value}</span>`);

    cardView.append(iconCornerTopLeft);
    cardView.append(iconCornerBottomRight);
    cardView.append(cardValue);

    return cardView;
}