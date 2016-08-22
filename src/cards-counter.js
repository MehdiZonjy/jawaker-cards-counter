
var $ = require('jquery');
const events = require('./events');
console.log("cards-counter script added");


(function () {
    //holds played cards history
    var cardsHistory;

    bootstrap();

    /**
     * bootstraps cards counting functionality 
     * 
     * @returns
     */
    function bootstrap() {
        //Jawaker places all played cards inside #table-stack tag
        const tableStack = $("#table-stack");

        //if no table stack tag exsits, then most likely this code was injected into the wrong 
        //tab, or iFrame.
        if (!tableStack || tableStack.length == 0) {
            console.log("no table stack found");
            return;
        }

        console.log("found table stack");
        //clears up cardsHistory storage
        initCardsHistory();
        //register events handler for chrome-extension popup
        registerExtensionEventListener();
        //watch for cards inserted into #table-stack
        watchCardChanges();

    }

    /**
     * registers events handler for messages coming from the popup extension 
     */
    function registerExtensionEventListener() {
        console.log('registering extension event listener');
        //register events handler
        chrome.runtime.onMessage.addListener(
            function eventsHandler(request, sender, sendResponse) {
                console.log("cards-watcher event recieved");
                if (!validateRequest(request))
                    return;
                switch (request.action) {
                    //returned currently counted cards
                    case events.getCards: {
                        console.log(cardsHistory);
                        sendResponse({ spade: cardsHistory.spade.slice(0), diamond: cardsHistory.diamond.slice(0), club: cardsHistory.club.slice(0), heart: cardsHistory.heart.slice(0) });
                        break;
                    }
                    //clear cards history
                    case events.clearCards: {
                        initCardsHistory();
                        sendResponse({ spade: cardsHistory.spade.slice(0), diamond: cardsHistory.diamond.slice(0), club: cardsHistory.club.slice(0), heart: cardsHistory.heart.slice(0) });
                        break;
                    }
                    //used to check if the injected code is still listening to events
                    case events.echo: {
                        sendResponse({ message: 'i hear you' });
                        break;
                    }
                    //remove message events handler
                    case events.remove: {
                        sendResponse({ message: 'removed' });
                        chrome.runtime.onMessage.removeListener(eventsHandler);
                        break;
                    }
                    case events.cardsInHand: {
                        sendResponse(getCardsInHand());
                        break;
                    }
                }
            });
    }
    /**
     * inits cards storage 
     */
    function initCardsHistory() {
        cardsHistory = {
            spade: [],
            diamond: [],
            club: [],
            heart: []
        };
    }
    /**
     *watches for any changes to the #table-stack tag 
     and counts any cards inserted into the stack 
     */
    function watchCardChanges() {
        //inform us of any changes to the #table-stack DOM
        $('#table-stack').bind("DOMSubtreeModified", function () {

            //if the number of cards being held by all players is 51 or 52
            //then we are begining a new game and we should clean up the cards storage history 
            const cardsInHands = $('.hand .card').length;
            if (cardsInHands == 52 || cardsInHands == 51)
                initCardsHistory();

            //there are no new cards to play
            if ($("#table-stack .card").length <= 0)
                return;

            //foreach card in #table-stack
            $("#table-stack .card").each((key, cardDom) => {
                //extract card type and value
                const classes = $(cardDom).attr('class');
                var card = extractCardType(classes, 'diamond') || extractCardType(classes, 'club') || extractCardType(classes, 'heart') || extractCardType(classes, 'spade');
                var cardType = card.split('-')[0];
                //if the card hasn't been counted yet, then add it'
                if (cardsHistory[cardType].indexOf(card) < 0)
                    cardsHistory[cardType].push(card);
            });

        });

    }
    /**
     * extracts card value from cardClasses 
     * example : cardClasses= diamond-6 , type="diamond" should return 6
     * exampl2:  cardClasses= diamond-6 , type="club" should return null
     * @param {string} cardClasses
     * @param {string} type
     * @returns
     */

    function extractCardType(cardClasses, type) {
        var cardType = cardClasses.match(new RegExp(`${type}-([0-9]+|[JQKA])`));
        return cardType != null ? cardType[0] : null;
    }

    /**
     * 
     * make sure the request was sent from cards-counter popup 
     * @param {any} request
     * @returns
     */
    function validateRequest(request) {
        return request && request.origin == 'cards-counter' && request.action;
    }
    /**
     * gets the cards player holding in hand 
     * 
     * @returns
     */
    function getCardsInHand() {
        const cardsInHand = {
            spade: [],
            diamond: [],
            club: [],
            heart: []
        };
        $(".hand.rotate-bottom.ui-droppable .card.face-up").each((key, cardDOM) => {
            const classes = $(cardDOM).attr('class');
            var card = extractCardType(classes, 'diamond') || extractCardType(classes, 'club') || extractCardType(classes, 'heart') || extractCardType(classes, 'spade');
            var cardType = card.split('-')[0];
            if (cardsInHand[cardType].indexOf(card) < 0)
                cardsInHand[cardType].push(card);
        });
        console.log('cards in hand');
        console.log(cardsInHand);
        return cardsInHand;
    }

})();