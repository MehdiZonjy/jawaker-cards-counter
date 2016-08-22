const angular = require('angular');
const events = require('./events');
//checks

/**
 * returns the index of an object inside array which holds property equals to value
 * 
 * @param {array} array
 * @param {any} prop
 * @param {any} value
 * @returns
 */
function findObjectIndexWithProperty(array, prop, value) {
    for (let i = 0, l = array.length; i < l; i++)
        if (array[i][prop] == value)
            return i;
    return -1;
}
/**
 * 
 * returns card JSON 
 * @param {any} name
 * @returns
 */
function createCardJSON(name) {
    return {
        name: name,
        played: false,
        inHand: false
    };
}

/**
 * generate a complete set of cards of {type} 
 * @param {any} type : {club},{spade},{heart},{diamond}
 * @returns
 */
function generateCards(type) {
    const cards = [];
    for (let i = 2; i < 11; i++)
        cards.push(createCardJSON(`${type}-${i}`));

    cards.push(createCardJSON(`${type}-J`));
    cards.push(createCardJSON(`${type}-Q`));
    cards.push(createCardJSON(`${type}-K`));
    cards.push(createCardJSON(`${type}-A`));
    return cards;
}
/**
 * given a set1 of cards and a set2 of played cards, updates which cards has been played
 * given
 * @param {any} cards
 * @param {any} playedCards
 * @returns
 */
function updatePlayedCards(cards, playedCards) {

    playedCards.forEach((v) => {
        const index = findObjectIndexWithProperty(cards, 'name', v);
        if (index > -1) {
            cards[index].played = true;
            cards[index].inHand = false;

        }
    });
    return cards;
}


/**
 * given a set1 of cards and a set2 of cards in hand, updates which cards the player is holding in hand
 * given
 * @param {any} cards
 * @param {any} playedCards
 * @returns
 */
function updateCardsInHand(cards, cardsInHand) {

    cardsInHand.forEach((v) => {
        const index = findObjectIndexWithProperty(cards, 'name', v);
        if (index > -1) {
            cards[index].inHand = true;
            cards[index].played = false;
        }
    });
    return cards;
}

/**
 * returns a valid request message 
 * 
 * @param {any} action
 * @param {any} extra
 * @returns
 */
function createRequest(action, extra) {
    return {
        origin: 'cards-counter',
        action: action,
        extra: extra
    };

}

angular.module('CardsCounter', []).controller('MainController', function ($scope) {
    var self = this;

    //sends message to the injected  cards-counter code
    var sendMessage = (message, callback) => {

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, message, callback);
        });
    };

    //generates a complete deck of cards
    self.initCards = () => {

        self.cards = {
            spade: generateCards('spade'),
            heart: generateCards('heart'),
            club: generateCards('club'),
            diamond: generateCards('diamond')
        };

    };
    //updats which cards have been played 
    self.updateUnplayedCards = (playedCards) => {
        if (!playedCards) return;
        self.cards.spade = updatePlayedCards(self.cards.spade, playedCards.spade);
        self.cards.heart = updatePlayedCards(self.cards.heart, playedCards.heart);
        self.cards.club = updatePlayedCards(self.cards.club, playedCards.club);
        self.cards.diamond = updatePlayedCards(self.cards.diamond, playedCards.diamond);
        $scope.$apply();
    };


    //updats which cards have been played 
    self.updateCardsInHand = (cardsInHand) => {
        if (!cardsInHand) return;
        self.cards.spade = updateCardsInHand(self.cards.spade, cardsInHand.spade);
        self.cards.heart = updateCardsInHand(self.cards.heart, cardsInHand.heart);
        self.cards.club = updateCardsInHand(self.cards.club, cardsInHand.club);
        self.cards.diamond = updateCardsInHand(self.cards.diamond, cardsInHand.diamond);
        $scope.$apply();
    };



    //clears played cards and reset counted-cards inside the injected code 
    self.clearCards = () => {
        self.initCards();
        sendMessage(createRequest(events.clearCards), self.updateUnplayedCards);
    }

    //injects cards-watcher script into the currently active tab
    self.injectCardsCounter = () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.executeScript(tabs[0].ib, {
                file: './dist/cards-counter.js',
                allFrames: true
            });
        });
        setTimeout(verifyCodeInjected, 500);
    }


    //removes injected cards-counter script
    self.deleteCardsWatcher = () => {
        sendMessage(createRequest(events.remove), (response) => {
            if (!response) return;
            verifyCodeInjected();
        });

    };

    //checks if the cards-counter script has been injected
    function verifyCodeInjected() {
        sendMessage(createRequest(events.echo), (response) => {
            self.codeInjected = false;
            if (!response) return;
            console.log('echo recieved');
            self.codeInjected = true;
            $scope.$apply();
        });
    }

    self.codeInjected = false;
    verifyCodeInjected();
    self.initCards();
    sendMessage(createRequest(events.getCards), self.updateUnplayedCards);
    sendMessage(createRequest(events.cardsInHand), self.updateCardsInHand);

})

    // used to beautify card value 
    .filter('clearCard', function () {

        return function (cardName) {
            return cardName.split('-')[1];
        };
    });;

