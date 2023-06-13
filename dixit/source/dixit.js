"use strict";

/* global ArrayUtils, DixitImagesData, DixitMessages */

(function (global) {

  Script.include([
    './array-utils.js',
    './images-data.js',
    './messages.js'
  ]);

  var MAX_PLAYERS = 12;
  var MIN_PLAYERS = 3;
  var CHOOSE_TWO_CARDS_PLAYERS = 3;
  var VOTE_TWO_CARDS_PLAYERS = 7;
  var EXTRA_HAND_SIZE_PLAYERS = 3;
  var HAND_SIZE = 6;
  var WINNER_POINTS = 30;

  function Dixit() { }

  Dixit.prototype.init = function() {
    this.images = DixitImagesData.slice();
    this.players = [];
    this.narratorIndex = -1;
    this.screenImages = [];
    this.screenImagesShuffled = false;
    this.votes = [];
    this.discard = [];
    this.votesLeft = [];
    this.pointsAdded = false;
    this.confirmAbort = false;

    ArrayUtils.shuffle(this.images);
    this.renderScreen();
    this.renderPlayers();
  };

  Dixit.prototype.draw = function(n) {
    var i;
    if (this.images.length < n) {
      ArrayUtils.shuffle(this.discard);
      for (i = 0; i < this.discard.length; i++) {
        this.images.unshift(this.discard[i]);
      }
    }
    return ArrayUtils.pop(this.images, n);
  };

  Dixit.prototype.getExpectedScreenImagesCount = function () {
    return this.players.length <= CHOOSE_TWO_CARDS_PLAYERS
      ? (this.players.length - 1) * 2 + 1
      : this.players.length;
  };

  Dixit.prototype.renderPlayers = function() {
    var playerList = this.players.slice();
    playerList.sort(function(p1, p2) { return p2.points - p1.points; });

    var rows = playerList.map(function(p, index) {
      return (index + 1) + '. ' + p.name + ' - ' + p.points;
    });

    this.screen.setPlayersText(rows);
  };

  Dixit.prototype.calculatePoints = function() {
    var narrator, player, all, nobody, i, j, results, points, votes, guessed;

    narrator = this.players[this.narratorIndex];
    all = true;
    nobody = true;

    for (i = 0; i < this.votes.length; i++) {
      if (this.votes[i].screenImage.sessionId === narrator.sessionId) {
        nobody = false;
      } else {
        all = false;
      }
    }
    
    if (nobody || all) {
      for (i = 0; i < this.players.length; i++) {
        if (this.players[i].sessionId !== narrator.sessionId) {
          this.players[i].points += 2;
        }
      }

      if (nobody) {
        return DixitMessages.NO_ONE_GUESSED;
      }

      if (all) {
        return DixitMessages.EVERY_ONE_GUESSED;
      }
    }

    results = [];

    for (i = 0; i < this.players.length; i++) {
      player = this.players[i];
      points = 0;
      if (player === narrator) {
        points += 3;
      } else {

        // bonus points for players that have choosen the player's card
        for (j = 0; j < this.votes.length; j++) {
          if (this.votes[j].screenImage.sessionId === player.sessionId) {
            points += 1;
          }
        }

        points = Math.min(points, 3); // Max 3 bonus points

        // find all votes of this player
        votes = [];
        for (j = 0; j < this.votes.length; j++) {
          if (this.votes[j].sessionId === player.sessionId) {
            votes.push(this.votes[j]);
          }
        }

        // +3 points if the player guessed the storytellers card
        guessed = false;
        for (j = 0; j < votes.length; j++) {
          if (votes[j].screenImage.sessionId === narrator.sessionId) {
            guessed = true;
            points += 3;
          }
        }

        // +1 point for only one vote if guessed
        if (guessed && this.players.length >= VOTE_TWO_CARDS_PLAYERS && votes.length === 1) {
          points += 1;
        }
      }

      if (points > 0) {
        player.points += points;
        results.push({
          player: player,
          points: points
        });
      }
    }

    results.sort(function (a, b) {
      return b.points - a.points;
    });

    return results.map(function (r) {
      return r.player.name + ': ' + r.points;
    }).join(', ');
  };

  Dixit.prototype.setPlayersSubmitCount = function (n) {
    var i, player, narrator;
    narrator = this.players[this.narratorIndex];
    for (i = 0; i < this.players.length; i++) {
      player = this.players[i];
      if (player !== narrator) {
        player.submitCount = n;
        this.callClient(player.sessionId, 'setSubmitCount', n);
      }
    }
  };

  Dixit.prototype.setPlayerSubmitCount = function (player, n) {
    player.submitCount = n;
    this.callClient(player.sessionId, 'setSubmitCount', n);
  };

  Dixit.prototype.findWinners = function () {
    var i, player, points, winners;
    points = 0;
    winners = [];
    for (i = 0; i < this.players.length; i++) {
      player = this.players[i];
      if (player.points >= WINNER_POINTS) {
        if (player.points === points) {
          winners.push(player.name);
        } else if (player.points >= points) {
          points = player.points;
          winners = [player.name];
        }
      }
    }
    return winners;
  };

  Dixit.prototype.renderScreen = function() {
    var player, narrator, images, results, i;
    var description, screenButton, abortButton;

    if (this.confirmAbort) {
      description = DixitMessages.ABORT_GAME_MESSAGE;
      screenButton = DixitMessages.BUTTON_ABORT_GAME_CONFIRM;
      abortButton = DixitMessages.BUTTON_CANCEL;

      this.screen.renderScreenImages([], false);
      this.screen.setScreenText(description, screenButton, abortButton);
      return;
    }

    // Game not started
    if (this.narratorIndex === -1) {
      description = DixitMessages.WELCOME_MESSAGE;
      screenButton = this.players.length < MIN_PLAYERS ? '' : DixitMessages.BUTTON_NEW_GAME;
      abortButton = this.players.length > 0 ? DixitMessages.BUTTON_ABORT_GAME : '';
      this.screen.setScreenText(description, screenButton, abortButton);
      return;
    }

    abortButton = DixitMessages.BUTTON_ABORT_GAME;

    results = this.findWinners();
    if (results.length > 0) {
      description = DixitMessages.GAME_OVER_MESSAGE
        + (results.length === 1
          ? DixitMessages.GAME_OVER_WINNER + results[0]
          : DixitMessages.GAME_OVER_WINNERS + results.join(', '));

      screenButton = DixitMessages.BUTTON_PLAY_AGAIN;
      this.screen.renderScreenImages([], false);
      this.screen.setScreenText(description, screenButton, abortButton);
      return;
    }

    narrator = this.players[this.narratorIndex];

    // Narrator didn't choose his card
    if (this.screenImages.length === 0) {
      description = DixitMessages.NARRATOR_CHOOSE_CARD
        .replace('{name}', narrator.name);

      screenButton = '';
      this.screen.renderScreenImages(this.screenImages, false);
      this.screen.setScreenText(description, screenButton, abortButton);
      this.setPlayerSubmitCount(narrator, 1);
      return;
    }

    // Players are choosing the cards
    if (this.screenImages.length < this.getExpectedScreenImagesCount()) {
      description = DixitMessages.PLAYERS_CHOOSE_CARD
        .replace('{count}', this.screenImages.length)
        .replace('{total}', this.getExpectedScreenImagesCount());

      screenButton = '';
      this.screen.setScreenText(description, screenButton, abortButton);
      this.screen.renderScreenImages(this.screenImages, true);
      return;
    }

    // Prepare voting
    if (!this.screenImagesShuffled) {
      ArrayUtils.shuffle(this.screenImages);
      this.screenImagesShuffled = true;
      this.votesLeft = [];
      images = this.screenImages.map(function (item) { return item.image; });
      for (i = 0; i < this.players.length; i++) {
        player = this.players[i];
        if (player !== narrator) {
          this.votesLeft.push(player.sessionId);
          this.callClient(player.sessionId, 'setHandImages', images);
        }
      }
      this.setPlayersSubmitCount(this.players.length >= VOTE_TWO_CARDS_PLAYERS ? 2 : 1);
    }

    // Players are voting
    if (this.votesLeft.length > 0) {
      description = DixitMessages.PLAYERS_VOTE_CARDS
        .replace('{count}', this.players.length - this.votesLeft.length - 1)
        .replace('{total}', this.players.length - 1);

      screenButton = '';
      this.screen.setScreenText(description, screenButton, abortButton);
      this.screen.renderScreenImages(this.screenImages, false);
      return;
    }

    // Presenting voring results
    if (this.votesLeft.length === 0 && !this.pointsAdded) {
      results = this.calculatePoints();
      description = DixitMessages.VOTING_RESULTS + results;

      screenButton = DixitMessages.BUTTON_NEXT_ROUND;
      this.screen.setScreenText(description, screenButton, abortButton);
      this.screen.renderScreenImages(this.screenImages, false);
      this.renderPlayers();
      return;
    }
  };

  Dixit.prototype.applyHandCard = function(sessionId, cardIndexes) {
    var player = null, narrator = null;
    var cardIndex;
    var screenImage;
    var index;
    var cards, handImages;
    var i;
    
    // Game not started
    if (this.narratorIndex === -1) {
      return;
    }
    
    narrator = this.players[this.narratorIndex];

    // Narrator sends the first card
    if (this.screenImages.length === 0 && cardIndexes.length === 1) {
      cardIndex = cardIndexes[0];

      // Only narrator can submit a card
      if (narrator.sessionId !== sessionId) {
        return false;
      }

      cards = narrator.handImages.splice(cardIndex, 1);

      screenImage = {
        image: cards[0],
        sessionId: sessionId,
        fromNarrator: true
      };

      this.screenImages.push(screenImage);
      cards = this.draw(1);
      narrator.handImages.push(cards[0]);
      this.callClient(narrator.sessionId, 'setHandImages', narrator.handImages);
      this.setPlayersSubmitCount(this.players.length <= CHOOSE_TWO_CARDS_PLAYERS ? 2 : 1);
      this.setPlayerSubmitCount(narrator, 0);
      this.renderScreen();
      return;
    }

    // Players are sending their cards
    if (this.screenImages.length < this.getExpectedScreenImagesCount()) {
      player = ArrayUtils.findItem(this.players, 'sessionId', sessionId);
      if (player === null) {
        return;
      }

      cards = [];
      for (i = 0; i < cardIndexes.length; i++) {
        screenImage = ArrayUtils.findItem(this.screenImages, 'image', player.handImages[cardIndexes[i]]);
        // Card already selected
        if (screenImage !== null) {
          return false;
        }
        cards.push(player.handImages[cardIndexes[i]]);
      }

      for (i = 0; i < cards.length; i++) {
        cardIndex = player.handImages.indexOf(cards[i]);
        handImages = player.handImages.splice(cardIndex, 1);
        screenImage = {
          image: cards[i],
          sessionId: sessionId,
          fromNarrator: false
        };
        this.screenImages.push(screenImage);
        handImages = this.draw(1);
        player.handImages.push(handImages[0]);
      }
      this.callClient(player.sessionId, 'setHandImages', player.handImages);

      // Sending two cards is obligatory
      if (this.players.length <= CHOOSE_TWO_CARDS_PLAYERS && cardIndexes.length === 1) {
        this.setPlayerSubmitCount(player, 1);
        this.renderScreen();
        return false;
      }

      this.setPlayerSubmitCount(player, 0);
      this.renderScreen();
      return false;
    }

    if (this.votesLeft.indexOf(sessionId) !== -1) {
      player = ArrayUtils.findItem(this.players, 'sessionId', sessionId);
      index = this.votesLeft.indexOf(sessionId);

      // Not allowed to vote on your own card
      for (i = 0; i < cardIndexes.length; i++) {
        if (this.screenImages[cardIndexes[i]].sessionId === sessionId) {
          return;
        }
      }

      this.votesLeft.splice(index, 1);
      for (i = 0; i < cardIndexes.length; i++) {
        this.votes.push({
          sessionId: sessionId,
          screenImage: this.screenImages[cardIndexes[i]]
        });
      }
      this.callClient(player.sessionId, 'setHandImages', player.handImages);
      this.setPlayerSubmitCount(player, 0);
      this.renderScreen();
      return;
    }

    return;
  };
  
  Dixit.prototype.addPlayer = function(sessionId, name) {
    if (ArrayUtils.findItem(this.players, 'sessionId', sessionId)) {
      return;
    }
    if (this.players.length >= MAX_PLAYERS) {
      return;
    }
    if (this.narratorIndex !== -1) {
      return;
    }

    var player = {
      sessionId: sessionId,
      name: name,
      handImages: [],
      submitCount: 0,
      points: 0
    };

    this.players.push(player);
    this.renderPlayers();
    this.renderScreen();
  };

  Dixit.prototype.getHandImages = function(sessionId) {
    var player = ArrayUtils.findItem(this.players, 'sessionId', sessionId);
    var result, i;

    if (!player) {
      this.callClient(sessionId, 'setHandImages', null);
      return;
    }

    if (this.votesLeft.indexOf(player.sessionId) !== -1) {
      result = [];
      for (i = 0; i < this.screenImages.length; i++) {
        result.push(this.screenImages[i].image);
      }
      this.callClient(sessionId, 'setHandImages', result);
      return;
    }

    this.callClient(sessionId, 'setHandImages', player.handImages);
  };

  Dixit.prototype.getSubmitCount = function(sessionId) {
    var player = ArrayUtils.findItem(this.players, 'sessionId', sessionId);
    if (!player) {
      this.callClient(sessionId, 'setSubmitCount', 0);
      return;
    }
    this.callClient(sessionId, 'setSubmitCount', player.submitCount);
  };

  Dixit.prototype.callClient = function(sessionId, methodName, params) {
    var result = JSON.stringify(params);
    Entities.callEntityClientMethod(sessionId, this.screen.entityId, methodName, [result]);
  };

  Dixit.prototype.handleClick = function(buttonText) {
    var i, player, handSize;

    switch (buttonText) {

      case DixitMessages.BUTTON_NEW_GAME:
        if (this.players.length < MIN_PLAYERS) {
          return;
        }
        this.narratorIndex = 0;
        handSize = this.players.length <= EXTRA_HAND_SIZE_PLAYERS
          ? HAND_SIZE + 1 : HAND_SIZE;

        for (i = 0; i < this.players.length; i++) {
          player = this.players[i];
          player.handImages = this.draw(handSize);
          this.callClient(player.sessionId, 'setHandImages', player.handImages);
        }
        this.renderScreen();
        break;

      case DixitMessages.BUTTON_NEXT_ROUND:
        for (i = 0; i < this.screenImages.length; i++) {
          this.discard.push(this.screenImages[i].image);
        }
        this.screenImages = [];
        this.screenImagesShuffled = false;
        this.votes = [];
        this.votesLeft = [];
        this.pointsAdded = false;
        this.narratorIndex = (this.narratorIndex + 1) % this.players.length;
        this.renderScreen();
        break;

      case DixitMessages.BUTTON_PLAY_AGAIN:
        for (i = 0; i < this.players.length; i++) {
          this.players[i].points = 0;
        }
        for (i = 0; i < this.discard.length; i++) {
          this.images.push(this.discard[i]);
        }
        this.screenImages = [];
        this.screenImagesShuffled = false;
        this.votes = [];
        this.discard = [];
        this.votesLeft = [];
        this.pointsAdded = false;

        ArrayUtils.shuffle(this.images);
        this.renderScreen();
        this.renderPlayers();
        break;

      case DixitMessages.BUTTON_ABORT_GAME:
        if (this.players.length > 0) {
          this.confirmAbort = true;
          this.renderScreen();
        }
        break;

      case DixitMessages.BUTTON_CANCEL:
        this.confirmAbort = false;
        this.renderScreen();
        break;

      case DixitMessages.BUTTON_ABORT_GAME_CONFIRM:
        for (i = 0; i < this.players.length; i++) {
          player = this.players[i];
          this.callClient(player.sessionId, 'closePanel', null);
        }
        this.init();
        break;
    }
  };

  global.Dixit = Dixit;

}(typeof module !== 'undefined' ? module.exports : new Function('return this;')()));
