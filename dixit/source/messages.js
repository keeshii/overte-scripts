"use strict";

(function (global) {

  var DixitMessages = {
    NO_ONE_GUESSED: 'No one guessed the storyteller\'s card.\n'
                + ' Everyone except the storyteller receives 2 points.',

    EVERY_ONE_GUESSED: 'All players guessed the storyteller\'s card.\n'
                + ' Everyone except the storyteller receives 2 points.',

    WELCOME_MESSAGE: 'This is the Dixit game implementation.\n\n'
                + 'Open the panel to join the game.\n\n'
                + 'Three players are needed to start the game.',

    BUTTON_NEW_GAME: 'New Game',

    ABORT_GAME_MESSAGE: 'Abort the game?',

    BUTTON_ABORT_GAME_CONFIRM: 'Yes, abort the game',

    BUTTON_CANCEL: 'Cancel',

    BUTTON_ABORT_GAME: 'Abort game',

    GAME_OVER_MESSAGE: 'Game finished.\n\n',

    GAME_OVER_WINNER: 'Winner: ',

    GAME_OVER_WINNERS: 'Winners: ',

    BUTTON_PLAY_AGAIN: 'Play again',

    NARRATOR_CHOOSE_CARD: '{name} is now the storyteller.\n\n'
                + 'Waiting for the storyteller to choose a card.',

    PLAYERS_CHOOSE_CARD: 'Waiting for other players to choose a card.\n\n'
                + 'Cards received ({count} of {total}).',

    PLAYERS_VOTE_CARDS: 'Waiting to vote for the storyteller\'s card.\n\n'
                + 'Votes received ({count} of {total}).',

    VOTING_RESULTS: 'Voting results:.\n\n',

    BUTTON_NEXT_ROUND: 'Next Round'
  };

  global.DixitMessages = DixitMessages;

}(typeof module !== 'undefined' ? module.exports : new Function('return this;')()));
