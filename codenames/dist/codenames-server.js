((typeof module !== 'undefined' ? module : {}).exports = function () { var self={};
/******/ (function() { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 424:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Board = void 0;
var constants_1 = __webpack_require__(140);
var Board = /** @class */ (function () {
    function Board(entityId, ids, props) {
        this.BOARD_WIDTH = 10;
        this.BOARD_HEIGHT = 7.5;
        this.WORD_MARGIN = 0.05;
        this.WORD_ENTITY_WIDTH = this.BOARD_WIDTH / constants_1.BOARD_SIZE_X - 2 * this.WORD_MARGIN;
        this.WORD_ENTITY_HEIGHT = this.BOARD_HEIGHT / constants_1.BOARD_SIZE_Y - 2 * this.WORD_MARGIN;
        this.entityId = entityId;
        this.wordIds = [];
        for (var i = 0; i < ids.length; i++) {
            var prop = props[i];
            if (prop.parentID !== entityId) {
                continue;
            }
            if (prop.name.match(/^Text.BoardWord\[(\d+)\]$/)) {
                this.wordIds.push(ids[i]);
            }
        }
        this.clearAll();
    }
    Board.prototype.clearAll = function () {
        for (var i = 0; i < this.wordIds.length; i++) {
            Entities.deleteEntity(this.wordIds[i]);
        }
        this.wordIds = [];
    };
    Board.prototype.setFacedown = function (index, agentType) {
        var wordId = this.wordIds[index];
        if (wordId) {
            Entities.editEntity(wordId, {
                textColor: (0, constants_1.AGENT_COLOR)(agentType),
                backgroundColor: (0, constants_1.AGENT_COLOR)(agentType)
            });
        }
    };
    Board.prototype.renderBoard = function (boardItems) {
        this.clearAll();
        var startX = -this.BOARD_WIDTH / 2 + this.WORD_MARGIN * 3 + this.WORD_ENTITY_WIDTH / 2;
        var startZ = -this.BOARD_HEIGHT / 2 + this.WORD_MARGIN * 3 + this.WORD_ENTITY_HEIGHT / 2;
        for (var i = 0; i < boardItems.length; i++) {
            var item = boardItems[i];
            var col = i % constants_1.BOARD_SIZE_X;
            var row = Math.floor(i / constants_1.BOARD_SIZE_Y);
            var x = startX + col * (this.WORD_ENTITY_WIDTH + this.WORD_MARGIN);
            var z = startZ + row * (this.WORD_ENTITY_HEIGHT + this.WORD_MARGIN);
            var wordId = Entities.addEntity({
                type: 'Text',
                name: 'Text.BoardWord[' + i + ']',
                parentID: this.entityId,
                dimensions: { x: this.WORD_ENTITY_WIDTH, y: this.WORD_ENTITY_HEIGHT, z: 0.01 },
                textColor: item.facedown ? (0, constants_1.AGENT_COLOR)(item.agentType) : constants_1.COLOR.BLACK,
                backgroundColor: item.facedown ? (0, constants_1.AGENT_COLOR)(item.agentType) : constants_1.COLOR.WHITE,
                backgroundAlpha: 1,
                localPosition: { x: x, y: 0.1, z: z },
                localRotation: Quat.fromPitchYawRollDegrees(-90, 0, 0),
                alignment: 'center',
                lineHeight: 0.3,
                topMargin: 0.55,
                textEffectColor: { red: 0, green: 0, blue: 0 },
                text: item.word,
                userData: '{"grabbableKey": {"grabbable": false, "triggerable": true}}'
            });
            this.wordIds.push(wordId);
        }
    };
    return Board;
}());
exports.Board = Board;


/***/ }),

/***/ 824:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CodenamesServer = void 0;
var constants_1 = __webpack_require__(140);
var board_1 = __webpack_require__(424);
var types_1 = __webpack_require__(924);
var panel_1 = __webpack_require__(899);
var score_screen_1 = __webpack_require__(340);
var messages_1 = __webpack_require__(349);
var word_screen_1 = __webpack_require__(658);
var sound_player_1 = __webpack_require__(538);
var CodenamesServer = /** @class */ (function () {
    function CodenamesServer() {
        this.words = [];
        this.discard = [];
        this.boardItems = [];
        this.activeTeam = -1;
    }
    CodenamesServer.prototype.preload = function (entityId) {
        var _this = this;
        this.words = constants_1.CONFIG.WORDS.slice();
        this.teams = [
            { agentType: types_1.AgentType.RED, score: 0, guesses: 1, word: '' },
            { agentType: types_1.AgentType.BLUE, score: 0, guesses: 1, word: '' },
        ];
        this.entityId = entityId;
        Script.setTimeout(function () {
            _this.initLayoutEntities();
            _this.resetGameState();
        }, constants_1.CONFIG.INIT_ENTITIES_DELAY);
        this.remotelyCallable = [
            'setWord',
            'submitClue',
            'submitWord',
            'increaseGuesses',
            'decreaseGuesses',
            'onSubmitClick',
            'onCancelClick',
            'onEndTurnClick',
        ];
    };
    CodenamesServer.prototype.unload = function () { };
    CodenamesServer.prototype.submitClue = function (_id, params) {
        var teamId = params[0] === messages_1.Message.RED ? constants_1.RED_TEAM : constants_1.BLUE_TEAM;
        var team = this.teams[teamId];
        if (teamId !== this.activeTeam || this.clueSubmitted || !this.roundPending || !team.word) {
            return;
        }
        var word = team.word;
        team.word = '';
        this.clueSubmitted = true;
        this.guessesLeft = team.guesses;
        this.wordScreen.setWord(teamId, word, this.guessesLeft);
        this.panel.setTeamMessage(teamId, messages_1.Message.WAITING_FOR_VOTES);
        this.panel.setTeamWord(teamId, '');
    };
    CodenamesServer.prototype.submitWord = function (_id, params) {
        var word = params[0];
        if (!this.clueSubmitted || !this.roundPending) {
            return;
        }
        var boardItem;
        for (var i = 0; i < this.boardItems.length; i++) {
            if (this.boardItems[i].word === word) {
                boardItem = this.boardItems[i];
                break;
            }
        }
        if (boardItem === undefined) {
            return;
        }
        boardItem.facedown = true;
        var index = this.boardItems.indexOf(boardItem);
        this.board.setFacedown(index, boardItem.agentType);
        this.panel.setFacedown(index, boardItem.agentType);
        var _a = this.findTeams(this.activeTeam), team = _a.team, opponent = _a.opponent, opponentId = _a.opponentId;
        // First check if round is not over
        if (boardItem.agentType === types_1.AgentType.ASSASIN) {
            opponent.score += 1;
            var teamLabel = opponentId === constants_1.RED_TEAM ? messages_1.Message.RED : messages_1.Message.BLUE;
            this.scoreScreen.setScore(opponentId, opponent.score);
            this.showRoundOver(messages_1.Message.ROUND_OVER_ASSASIN.replace('{team}', teamLabel));
            this.soundPlayer.play(sound_player_1.SoundPlayer.ASSASIN_SOUND);
            return;
        }
        // No more agents cards left
        if (boardItem.agentType === types_1.AgentType.RED || boardItem.agentType === types_1.AgentType.BLUE) {
            var _b = this.getWordsLeft(), redLeft = _b[0], blueLeft = _b[1];
            this.scoreScreen.setWordsLeft(constants_1.RED_TEAM, redLeft);
            this.scoreScreen.setWordsLeft(constants_1.BLUE_TEAM, blueLeft);
            if (redLeft === 0) {
                this.teams[constants_1.RED_TEAM].score += 1;
                this.scoreScreen.setScore(constants_1.RED_TEAM, this.teams[constants_1.RED_TEAM].score);
                this.showRoundOver(messages_1.Message.ROUND_OVER_ALL_AGENTS.replace('{team}', messages_1.Message.RED));
                this.soundPlayer.play(sound_player_1.SoundPlayer.ROUND_OVER_SOUND);
                return;
            }
            if (blueLeft === 0) {
                this.teams[constants_1.BLUE_TEAM].score += 1;
                this.scoreScreen.setScore(constants_1.BLUE_TEAM, this.teams[constants_1.BLUE_TEAM].score);
                this.showRoundOver(messages_1.Message.ROUND_OVER_ALL_AGENTS.replace('{team}', messages_1.Message.BLUE));
                this.soundPlayer.play(sound_player_1.SoundPlayer.ROUND_OVER_SOUND);
                return;
            }
        }
        // Guessed correctly, carry on
        if (boardItem.agentType === team.agentType && this.guessesLeft > 0) {
            this.guessesLeft -= 1;
            this.wordScreen.setGuessesLeft(this.guessesLeft);
            return;
        }
        // Switch teams
        this.onEndTurnClick();
    };
    CodenamesServer.prototype.increaseGuesses = function (_id, params) {
        if (this.panel.view !== types_1.ViewType.BOARD) {
            return;
        }
        var teamId = params[0] === messages_1.Message.RED ? constants_1.RED_TEAM : constants_1.BLUE_TEAM;
        var team = this.teams[teamId];
        team.guesses = Math.min(9, team.guesses + 1);
        this.panel.setGuessValue(teamId, team.guesses);
    };
    CodenamesServer.prototype.decreaseGuesses = function (_id, params) {
        if (this.panel.view !== types_1.ViewType.BOARD) {
            return;
        }
        var teamId = params[0] === messages_1.Message.RED ? constants_1.RED_TEAM : constants_1.BLUE_TEAM;
        var team = this.teams[teamId];
        team.guesses = Math.max(0, team.guesses - 1);
        this.panel.setGuessValue(teamId, team.guesses);
    };
    CodenamesServer.prototype.setWord = function (_id, params) {
        if (this.panel.view !== types_1.ViewType.BOARD) {
            return;
        }
        var teamId = params[0] === messages_1.Message.RED ? constants_1.RED_TEAM : constants_1.BLUE_TEAM;
        var word = params[1];
        var team = this.teams[teamId];
        team.word = word;
        this.panel.setTeamWord(teamId, word);
    };
    CodenamesServer.prototype.onSubmitClick = function (_id, params) {
        var message = params[0];
        if (this.panel.view !== types_1.ViewType.MESSAGE) {
            return;
        }
        switch (message) {
            case messages_1.Message.BUTTON_START:
            case messages_1.Message.BUTTON_NEXT_ROUND:
                if (!this.roundPending) {
                    this.startNewRound();
                }
                return;
            case messages_1.Message.BUTTON_ABORT_CONFIRM:
                if (this.roundPending) {
                    this.resetGameState();
                    return;
                }
        }
    };
    CodenamesServer.prototype.onCancelClick = function (_id, params) {
        var message = params[0];
        switch (message) {
            case messages_1.Message.BUTTON_ABORT:
                if (this.roundPending) {
                    this.panel.setView(types_1.ViewType.MESSAGE);
                    this.panel.setMessage(messages_1.Message.ABORT_GAME, messages_1.Message.BUTTON_ABORT_CONFIRM, messages_1.Message.BUTTON_CANCEL);
                }
                return;
            case messages_1.Message.BUTTON_CANCEL:
                if (this.roundPending) {
                    this.panel.setView(types_1.ViewType.BOARD);
                    this.panel.setAbortButton(messages_1.Message.BUTTON_ABORT);
                }
                return;
            case messages_1.Message.BUTTON_END_GAME:
                if (!this.roundPending) {
                    this.resetGameState();
                }
                return;
        }
    };
    CodenamesServer.prototype.onEndTurnClick = function () {
        var opponentId = this.findTeams(this.activeTeam).opponentId;
        if (!this.clueSubmitted) {
            return;
        }
        this.clueSubmitted = false;
        this.panel.setTeamMessage(this.activeTeam, messages_1.Message.WAITING_OTHER_TEAM);
        this.panel.setTeamMessage(opponentId, messages_1.Message.GIVE_A_CLUE, messages_1.Message.BUTTON_SUBMIT);
        this.activeTeam = opponentId;
        var teamLabel = opponentId === constants_1.RED_TEAM ? messages_1.Message.RED : messages_1.Message.BLUE;
        var message = messages_1.Message.WAITING_FOR_SPYMASTER.replace('{color}', teamLabel);
        this.wordScreen.showMessage(message);
    };
    CodenamesServer.prototype.resetGameState = function () {
        this.words = constants_1.CONFIG.WORDS.slice();
        this.discard = [];
        this.boardItems = [];
        this.activeTeam = 0;
        this.clueSubmitted = false;
        this.roundPending = false;
        this.shuffle(this.words);
        for (var _i = 0, _a = [constants_1.RED_TEAM, constants_1.BLUE_TEAM]; _i < _a.length; _i++) {
            var id = _a[_i];
            this.teams[id].score = 0;
            this.teams[id].guesses = 1;
            this.teams[id].word = '';
            this.scoreScreen.setScore(id, 0);
            this.scoreScreen.setWordsLeft(id, 0);
            this.panel.setGuessValue(id, 1);
            this.panel.setTeamWord(id, '');
        }
        this.board.renderBoard(this.boardItems);
        this.wordScreen.showMessage(messages_1.Message.START_GAME_INFO);
        this.panel.setView(types_1.ViewType.MESSAGE);
        this.panel.setMessage(messages_1.Message.START_GAME, messages_1.Message.BUTTON_START);
    };
    CodenamesServer.prototype.initLayoutEntities = function () {
        var position = Entities.getEntityProperties(this.entityId, ['position']).position;
        var entityIds = Entities.findEntities(position, 50);
        var entities = entityIds.map(function (id) { return Entities.getEntityProperties(id, ['parentID', 'name', 'renderWithZones']); });
        this.board = new board_1.Board(this.entityId, entityIds, entities);
        this.panel = new panel_1.Panel(this.entityId, entityIds, entities);
        this.scoreScreen = new score_screen_1.ScoreScreen(this.entityId, entityIds, entities);
        this.wordScreen = new word_screen_1.WordScreen(this.entityId, entityIds, entities);
        this.soundPlayer = new sound_player_1.SoundPlayer(position);
    };
    CodenamesServer.prototype.startNewRound = function () {
        var board = this.drawNewBoard();
        this.activeTeam = this.findTeamToStartRound();
        this.boardItems = this.createBoardKey(this.activeTeam, board);
        this.board.renderBoard(this.boardItems);
        this.roundPending = true;
        this.clueSubmitted = false;
        var opponentId = this.findTeams(this.activeTeam).opponentId;
        this.panel.setView(types_1.ViewType.BOARD);
        this.panel.renderBoard(this.boardItems);
        this.panel.setAbortButton(messages_1.Message.BUTTON_ABORT);
        this.panel.setTeamMessage(this.activeTeam, messages_1.Message.GIVE_A_CLUE, messages_1.Message.BUTTON_SUBMIT);
        this.panel.setTeamMessage(opponentId, messages_1.Message.WAITING_OTHER_TEAM);
        this.scoreScreen.setWordsLeft(this.activeTeam, 9);
        this.scoreScreen.setWordsLeft(opponentId, 8);
        var teamLabel = this.activeTeam === constants_1.RED_TEAM ? messages_1.Message.RED : messages_1.Message.BLUE;
        var message = messages_1.Message.WAITING_FOR_SPYMASTER.replace('{color}', teamLabel);
        this.wordScreen.showMessage(message);
    };
    CodenamesServer.prototype.showRoundOver = function (message) {
        this.panel.setView(types_1.ViewType.MESSAGE);
        this.panel.setMessage(message, messages_1.Message.BUTTON_NEXT_ROUND, messages_1.Message.BUTTON_END_GAME);
        this.wordScreen.showMessage(message);
        this.roundPending = false;
    };
    CodenamesServer.prototype.getWordsLeft = function () {
        var redLeft = 0;
        var blueLeft = 0;
        for (var _i = 0, _a = this.boardItems; _i < _a.length; _i++) {
            var boardItem = _a[_i];
            if (boardItem.agentType === types_1.AgentType.RED && boardItem.facedown === false) {
                redLeft += 1;
            }
            if (boardItem.agentType === types_1.AgentType.BLUE && boardItem.facedown === false) {
                blueLeft += 1;
            }
        }
        return [redLeft, blueLeft];
    };
    CodenamesServer.prototype.findTeamToStartRound = function () {
        if (this.boardItems.length === 0) {
            return Math.floor(Math.random() * 2); // 0 or 1
        }
        var red = 0;
        for (var i = 0; i < constants_1.BOARD_SIZE; i++) {
            if (this.boardItems[i].agentType === types_1.AgentType.RED) {
                red += 1;
            }
        }
        return red === 9 ? constants_1.BLUE_TEAM : constants_1.RED_TEAM;
    };
    CodenamesServer.prototype.findTeams = function (teamId) {
        var team = this.teams[teamId];
        var opponentId = this.activeTeam ? constants_1.RED_TEAM : constants_1.BLUE_TEAM;
        var opponent = this.teams[opponentId];
        return { team: team, opponentId: opponentId, opponent: opponent };
    };
    CodenamesServer.prototype.createBoardKey = function (teamId, board) {
        var keys = [];
        // 8 agents of each team
        for (var i = 0; i < 8; i++) {
            keys.push(types_1.AgentType.RED);
            keys.push(types_1.AgentType.BLUE);
        }
        // one double agent
        keys.push(teamId ? types_1.AgentType.BLUE : types_1.AgentType.RED);
        // 7 innocent bystaners
        for (var i = 0; i < 7; i++) {
            keys.push(types_1.AgentType.INNOCENT);
        }
        // one assasin
        keys.push(types_1.AgentType.ASSASIN);
        this.shuffle(keys);
        return board.map(function (word, index) { return ({
            word: word,
            agentType: keys[index],
            facedown: false
        }); });
    };
    CodenamesServer.prototype.drawNewBoard = function () {
        var _a, _b;
        if (this.words.length < constants_1.BOARD_SIZE) {
            this.shuffle(this.discard);
            (_a = this.words).splice.apply(_a, __spreadArray([this.words.length, 0], this.discard, false));
            this.discard.length = 0;
        }
        var board = this.words.slice(0, constants_1.BOARD_SIZE);
        (_b = this.discard).splice.apply(_b, __spreadArray([0, 0], board, false));
        this.words.splice(0, board.length);
        return board;
    };
    CodenamesServer.prototype.shuffle = function (arr) {
        var r, tmp;
        for (var i = 0; i < arr.length; i++) {
            r = Math.floor(Math.random() * arr.length);
            tmp = arr[r];
            arr[r] = arr[i];
            arr[i] = tmp;
        }
    };
    return CodenamesServer;
}());
exports.CodenamesServer = CodenamesServer;
exports["default"] = new CodenamesServer();


/***/ }),

/***/ 140:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AGENT_COLOR = exports.COLOR = exports.BLUE_TEAM = exports.RED_TEAM = exports.BOARD_SIZE = exports.BOARD_SIZE_Y = exports.BOARD_SIZE_X = exports.CLICK_THROTTLE = exports.INIT_ENTITIES_DELAY = exports.CONFIG = void 0;
var types_1 = __webpack_require__(924);
exports.CONFIG = typeof Script !== 'undefined'
    ? Script.require('../config.js') : {};
exports.INIT_ENTITIES_DELAY = 500;
exports.CLICK_THROTTLE = 300;
exports.BOARD_SIZE_X = 5;
exports.BOARD_SIZE_Y = 5;
exports.BOARD_SIZE = exports.BOARD_SIZE_X * exports.BOARD_SIZE_Y;
exports.RED_TEAM = 0;
exports.BLUE_TEAM = 1;
exports.COLOR = {
    BLACK: { red: 0, green: 0, blue: 0 },
    RED: { red: 209, green: 53, blue: 17 },
    BLUE: { red: 7, green: 99, blue: 155 },
    YELLOW: { red: 255, green: 208, blue: 138 },
    WHITE: { red: 255, green: 255, blue: 255 },
    GRAY: { red: 192, green: 192, blue: 192 }
};
var AGENT_COLOR = function (agentType) {
    switch (agentType) {
        case types_1.AgentType.ASSASIN:
            return exports.COLOR.BLACK;
        case types_1.AgentType.INNOCENT:
            return exports.COLOR.YELLOW;
        case types_1.AgentType.RED:
            return exports.COLOR.RED;
        case types_1.AgentType.BLUE:
            return exports.COLOR.BLUE;
    }
    return exports.COLOR.WHITE;
};
exports.AGENT_COLOR = AGENT_COLOR;


/***/ }),

/***/ 349:
/***/ (function(__unused_webpack_module, exports) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Message = void 0;
var Message;
(function (Message) {
    Message["START_GAME"] = "Click the button to start the game.";
    Message["WAITING_OTHER_TEAM"] = "Waiting for the other team";
    Message["WAITING_FOR_VOTES"] = "Waiting for votes";
    Message["WAITING_FOR_SPYMASTER"] = "Waiting for a clue from\nthe {color} spymaster";
    Message["ABORT_GAME"] = "Abort current game?";
    Message["BUTTON_ABORT_CONFIRM"] = "Yes, abort the game";
    Message["GIVE_A_CLUE"] = "Give a clue to your team";
    Message["BUTTON_SUBMIT"] = "Submit";
    Message["BUTTON_ABORT"] = "Abort Game";
    Message["BUTTON_START"] = "Start Game";
    Message["BUTTON_CANCEL"] = "Cancel";
    Message["BUTTON_NEXT_ROUND"] = "Next Round";
    Message["BUTTON_END_GAME"] = "End Game";
    Message["ENTER_CLUE"] = "Enter your clue";
    Message["ROUND_OVER_ASSASIN"] = "Team {team} has won the round,\nbecause the Assasin card was selected.";
    Message["ROUND_OVER_ALL_AGENTS"] = "Team {team} has won the round,\nbecause they uncovered all agents.";
    Message["START_GAME_INFO"] = "Click the button on the panel\nto start the game.";
    Message["INPUT_LABEL"] = "Click to enter a word";
    Message["BLUE"] = "Blue";
    Message["RED"] = "Red";
})(Message = exports.Message || (exports.Message = {}));


/***/ }),

/***/ 899:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Panel = void 0;
var constants_1 = __webpack_require__(140);
var messages_1 = __webpack_require__(349);
var types_1 = __webpack_require__(924);
var Panel = /** @class */ (function () {
    function Panel(entityId, ids, props) {
        this.BOARD_WIDTH = 2.7;
        this.BOARD_HEIGHT = 1.8;
        this.WORD_MARGIN = 0.01;
        this.WORD_ENTITY_WIDTH = this.BOARD_WIDTH / constants_1.BOARD_SIZE_X - 2 * this.WORD_MARGIN;
        this.WORD_ENTITY_HEIGHT = this.BOARD_HEIGHT / constants_1.BOARD_SIZE_Y - 2 * this.WORD_MARGIN;
        this.WORD_TOP_OFFSET = -0.13;
        this.entityId = entityId;
        this.teamMessageIds = [];
        this.teamSubmitIds = [];
        this.teamGuessIds = [];
        this.wordIds = [];
        this.boardViewIds = [];
        this.messageViewIds = [];
        this.teamWordIds = [];
        this.teamSubmitText = [];
        for (var i = 0; i < ids.length; i++) {
            if (props[i].parentID === entityId && props[i].name === 'Plane.Panel') {
                this.panelEntityId = ids[i];
                break;
            }
        }
        if (!this.panelEntityId) {
            return;
        }
        for (var i = 0; i < ids.length; i++) {
            var prop = props[i];
            if (prop.parentID !== entityId && prop.parentID !== this.panelEntityId) {
                continue;
            }
            if (prop.name.match(/^Text.Panel.Word\[(\d+)\]$/)) {
                this.wordIds.push(ids[i]);
                this.boardViewIds.push(ids[i]);
                continue;
            }
            if (prop.renderWithZones.length >= 1) {
                this.renderZoneId = prop.renderWithZones[0];
            }
            switch (prop.name) {
                case 'Text.Panel.RedGuesses':
                    this.teamGuessIds[constants_1.RED_TEAM] = ids[i];
                    this.boardViewIds.push(ids[i]);
                    break;
                case 'Text.Panel.BlueGuesses':
                    this.teamGuessIds[constants_1.BLUE_TEAM] = ids[i];
                    this.boardViewIds.push(ids[i]);
                    break;
                case 'Text.Panel.RedSubmit':
                    this.teamSubmitIds[constants_1.RED_TEAM] = ids[i];
                    break;
                case 'Text.Panel.BlueSubmit':
                    this.teamSubmitIds[constants_1.BLUE_TEAM] = ids[i];
                    break;
                case 'Text.Panel.RedMessage':
                    this.teamMessageIds[constants_1.RED_TEAM] = ids[i];
                    this.boardViewIds.push(ids[i]);
                    break;
                case 'Text.Panel.BlueMessage':
                    this.teamMessageIds[constants_1.BLUE_TEAM] = ids[i];
                    this.boardViewIds.push(ids[i]);
                    break;
                case 'Text.Panel.RedWord':
                    this.teamWordIds[constants_1.RED_TEAM] = ids[i];
                    this.boardViewIds.push(ids[i]);
                    break;
                case 'Text.Panel.BlueWord':
                    this.teamWordIds[constants_1.BLUE_TEAM] = ids[i];
                    this.boardViewIds.push(ids[i]);
                    break;
                case 'Text.Panel.Abort':
                    this.abortButtonId = ids[i];
                    break;
                case 'Text.Panel.Start':
                    this.submitButtonId = ids[i];
                    this.messageViewIds.push(ids[i]);
                    break;
                case 'Text.Panel.Message':
                    this.messageId = ids[i];
                    this.messageViewIds.push(ids[i]);
                    break;
                case 'Text.Panel.RedTitle':
                case 'Text.Panel.BlueTitle':
                case 'Text.Panel.RedPlus':
                case 'Text.Panel.RedMinus':
                case 'Text.Panel.BluePlus':
                case 'Text.Panel.BlueMinus':
                case 'Plane.Panel.Board':
                    this.boardViewIds.push(ids[i]);
            }
        }
        this.clearBoard();
    }
    Panel.prototype.setView = function (view) {
        this.view = view;
        for (var _i = 0, _a = this.boardViewIds; _i < _a.length; _i++) {
            var id = _a[_i];
            Entities.editEntity(id, { visible: view === types_1.ViewType.BOARD });
        }
        for (var _b = 0, _c = this.wordIds; _b < _c.length; _b++) {
            var id = _c[_b];
            Entities.editEntity(id, { visible: view === types_1.ViewType.BOARD });
        }
        for (var _d = 0, _e = this.messageViewIds; _d < _e.length; _d++) {
            var id = _e[_d];
            Entities.editEntity(id, { visible: view === types_1.ViewType.MESSAGE });
        }
        for (var _f = 0, _g = [constants_1.RED_TEAM, constants_1.BLUE_TEAM]; _f < _g.length; _f++) {
            var i = _g[_f];
            var id = this.teamSubmitIds[i];
            var visible = this.teamSubmitText[i] && view === types_1.ViewType.BOARD;
            Entities.editEntity(id, { visible: visible });
        }
    };
    Panel.prototype.setFacedown = function (index, agentType) {
        var wordId = this.wordIds[index];
        if (wordId) {
            Entities.editEntity(wordId, {
                textColor: (0, constants_1.AGENT_COLOR)(agentType),
                backgroundColor: (0, constants_1.AGENT_COLOR)(agentType)
            });
        }
    };
    Panel.prototype.renderBoard = function (boardItems) {
        this.clearBoard();
        if (!this.panelEntityId) {
            return;
        }
        var startX = -this.BOARD_WIDTH / 2 + this.WORD_MARGIN * 3 + this.WORD_ENTITY_WIDTH / 2;
        var startZ = this.WORD_TOP_OFFSET - this.BOARD_HEIGHT / 2 + this.WORD_MARGIN * 3 + this.WORD_ENTITY_HEIGHT / 2;
        for (var i = 0; i < boardItems.length; i++) {
            var item = boardItems[i];
            var col = i % constants_1.BOARD_SIZE_X;
            var row = Math.floor(i / constants_1.BOARD_SIZE_Y);
            var x = startX + col * (this.WORD_ENTITY_WIDTH + this.WORD_MARGIN);
            var z = startZ + row * (this.WORD_ENTITY_HEIGHT + this.WORD_MARGIN);
            var textColor = item.agentType === types_1.AgentType.INNOCENT ? constants_1.COLOR.BLACK : constants_1.COLOR.WHITE;
            var wordId = Entities.addEntity({
                type: 'Text',
                name: 'Text.Panel.Word[' + i + ']',
                parentID: this.panelEntityId,
                dimensions: { x: this.WORD_ENTITY_WIDTH, y: this.WORD_ENTITY_HEIGHT, z: 0.01 },
                textColor: item.facedown ? (0, constants_1.AGENT_COLOR)(item.agentType) : textColor,
                backgroundColor: (0, constants_1.AGENT_COLOR)(item.agentType),
                backgroundAlpha: 1,
                localPosition: { x: x, y: 0.02, z: z },
                localRotation: Quat.fromPitchYawRollDegrees(-90, 0, 0),
                alignment: 'center',
                lineHeight: 0.08,
                topMargin: 0.13,
                textEffectColor: { red: 0, green: 0, blue: 0 },
                text: item.word,
                renderWithZones: this.renderZoneId ? [this.renderZoneId] : [],
                userData: '{"grabbableKey": {"grabbable": false, "triggerable": true}}'
            });
            this.wordIds.push(wordId);
        }
    };
    Panel.prototype.setMessage = function (message, submitButton, abortButton) {
        if (this.messageId) {
            Entities.editEntity(this.messageId, { text: message });
        }
        if (this.submitButtonId) {
            var text = submitButton || '';
            var visible = submitButton ? true : false;
            Entities.editEntity(this.submitButtonId, { text: text, visible: visible });
        }
        if (this.abortButtonId) {
            var text = abortButton || '';
            var visible = abortButton ? true : false;
            Entities.editEntity(this.abortButtonId, { text: text, visible: visible });
        }
    };
    Panel.prototype.setAbortButton = function (abortButton) {
        if (this.abortButtonId) {
            var text = abortButton || '';
            var visible = abortButton ? true : false;
            Entities.editEntity(this.abortButtonId, { text: text, visible: visible });
        }
    };
    Panel.prototype.setTeamMessage = function (team, message, submitButton) {
        if (this.teamMessageIds[team]) {
            Entities.editEntity(this.teamMessageIds[team], { text: message });
        }
        if (this.teamSubmitIds[team]) {
            var text = submitButton || '';
            var visible = submitButton ? true : false;
            this.teamSubmitText[team] = text;
            Entities.editEntity(this.teamSubmitIds[team], { text: text, visible: visible });
        }
    };
    Panel.prototype.setTeamWord = function (team, message) {
        if (this.teamWordIds[team]) {
            var text = message || messages_1.Message.INPUT_LABEL;
            var textColor = message ? constants_1.COLOR.WHITE : constants_1.COLOR.GRAY;
            Entities.editEntity(this.teamWordIds[team], { text: text, textColor: textColor });
        }
    };
    Panel.prototype.setGuessValue = function (team, value) {
        if (this.teamGuessIds[team]) {
            Entities.editEntity(this.teamGuessIds[team], { text: String(value) });
        }
    };
    Panel.prototype.clearBoard = function () {
        for (var i = 0; i < this.wordIds.length; i++) {
            Entities.deleteEntity(this.wordIds[i]);
        }
        this.wordIds = [];
    };
    return Panel;
}());
exports.Panel = Panel;


/***/ }),

/***/ 340:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ScoreScreen = void 0;
var constants_1 = __webpack_require__(140);
var ScoreScreen = /** @class */ (function () {
    function ScoreScreen(entityId, ids, props) {
        this.IMAGE_WIDTH = 225;
        this.IMAGE_HEIGHT = 500;
        this.CARDS_WIDTH = 1.4;
        this.entityId = entityId;
        this.scoreIds = [];
        this.wordsLeftIds = [];
        for (var i = 0; i < ids.length; i++) {
            var prop = props[i];
            if (prop.parentID !== this.entityId) {
                continue;
            }
            switch (prop.name) {
                case 'Image.Wall.RedCards':
                    this.wordsLeftIds[constants_1.RED_TEAM] = ids[i];
                    break;
                case 'Image.Wall.BlueCards':
                    this.wordsLeftIds[constants_1.BLUE_TEAM] = ids[i];
                    break;
                case 'Text.Wall.RedScore':
                    this.scoreIds[constants_1.RED_TEAM] = ids[i];
                    break;
                case 'Text.Wall.BlueScore':
                    this.scoreIds[constants_1.BLUE_TEAM] = ids[i];
                    break;
            }
        }
    }
    ScoreScreen.prototype.setScore = function (team, value) {
        if (this.scoreIds[team]) {
            Entities.editEntity(this.scoreIds[team], { text: String(value) });
        }
    };
    ScoreScreen.prototype.setWordsLeft = function (team, value) {
        if (!this.wordsLeftIds[team]) {
            return;
        }
        if (value === 0) {
            Entities.editEntity(this.wordsLeftIds[team], { visible: false });
            return;
        }
        var subImage = {};
        subImage.width = this.IMAGE_WIDTH;
        subImage.height = Math.ceil(value / 2) * this.IMAGE_HEIGHT / 5;
        subImage.x = 0;
        subImage.y = value % 2 ? this.IMAGE_HEIGHT - subImage.height : 0;
        var x = this.CARDS_WIDTH;
        var y = subImage.height * this.CARDS_WIDTH / subImage.width;
        Entities.editEntity(this.wordsLeftIds[team], {
            dimensions: { x: x, y: y, z: 0.01 },
            subImage: subImage,
            visible: true
        });
    };
    return ScoreScreen;
}());
exports.ScoreScreen = ScoreScreen;


/***/ }),

/***/ 538:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SoundPlayer = void 0;
var constants_1 = __webpack_require__(140);
var SoundPlayer = exports.SoundPlayer = /** @class */ (function () {
    function SoundPlayer(position) {
        this.position = position;
        this.ROUND_OVER_SOUND_FILE_NAME = '/325112__fisch12345__success.wav';
        this.ASSASIN_SOUND_FILE_NAME = '/456963__funwithsound__failure-drum-sound-effect-2.wav';
        this.SOUND_VOLUMES = [1, 1];
        var assetsPath = Script.resolvePath('../assets');
        this.sounds = [
            SoundCache.getSound(assetsPath + this.ROUND_OVER_SOUND_FILE_NAME),
            SoundCache.getSound(assetsPath + this.ASSASIN_SOUND_FILE_NAME),
        ];
    }
    SoundPlayer.prototype.play = function (soundIndex) {
        if (!this.sounds[soundIndex]) {
            return;
        }
        if (constants_1.CONFIG.CLIENT_SIDE_ONLY) {
            return this.playLocal(soundIndex);
        }
        var injectorOptions = {
            position: this.position,
            volume: this.SOUND_VOLUMES[soundIndex]
        };
        Audio.playSound(this.sounds[soundIndex], injectorOptions);
    };
    SoundPlayer.prototype.playLocal = function (soundIndex) {
        var injectorOptions = {
            position: MyAvatar.position,
            volume: this.SOUND_VOLUMES[soundIndex] / 5,
            localOnly: true
        };
        Audio.playSound(this.sounds[soundIndex], injectorOptions);
    };
    SoundPlayer.ROUND_OVER_SOUND = 0;
    SoundPlayer.ASSASIN_SOUND = 1;
    return SoundPlayer;
}());


/***/ }),

/***/ 924:
/***/ (function(__unused_webpack_module, exports) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ViewType = exports.AgentType = void 0;
var AgentType;
(function (AgentType) {
    AgentType["RED"] = "red";
    AgentType["BLUE"] = "blue";
    AgentType["INNOCENT"] = "innocent";
    AgentType["ASSASIN"] = "assasin";
})(AgentType = exports.AgentType || (exports.AgentType = {}));
var ViewType;
(function (ViewType) {
    ViewType["MESSAGE"] = "message";
    ViewType["BOARD"] = "board";
})(ViewType = exports.ViewType || (exports.ViewType = {}));


/***/ }),

/***/ 658:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.WordScreen = void 0;
var constants_1 = __webpack_require__(140);
var WordScreen = /** @class */ (function () {
    function WordScreen(entityId, ids, props) {
        this.IMAGE_WIDTH = 1000;
        this.IMAGE_HEIGHT = 75;
        this.GUESSES_HEIGHT = 0.2;
        this.entityId = entityId;
        for (var i = 0; i < ids.length; i++) {
            var prop = props[i];
            if (prop.parentID !== entityId) {
                continue;
            }
            switch (prop.name) {
                case 'Text.Wall.Word':
                    this.wordId = ids[i];
                    break;
                case 'Image.Wall.Guesses':
                    this.guessesId = ids[i];
                    break;
                case 'Text.Wall.EndTurn':
                    this.endTurnId = ids[i];
                    break;
            }
        }
    }
    WordScreen.prototype.showMessage = function (text) {
        if (this.wordId) {
            var textColor = constants_1.COLOR.WHITE;
            Entities.editEntity(this.wordId, { text: text, textColor: textColor, lineHeight: 0.2 });
        }
        if (this.endTurnId) {
            Entities.editEntity(this.endTurnId, { visible: false });
        }
        this.setGuessesLeft(0);
    };
    WordScreen.prototype.setWord = function (team, word, guesses) {
        if (this.wordId) {
            var text = word + ': ' + String(guesses);
            var textColor = team === constants_1.RED_TEAM ? constants_1.COLOR.RED : constants_1.COLOR.BLUE;
            Entities.editEntity(this.wordId, { text: text, textColor: textColor, lineHeight: 0.4 });
        }
        if (this.endTurnId) {
            Entities.editEntity(this.endTurnId, { visible: true });
        }
        this.setGuessesLeft(guesses);
    };
    WordScreen.prototype.setGuessesLeft = function (guesses) {
        if (!this.guessesId) {
            return;
        }
        if (guesses === 0) {
            Entities.editEntity(this.guessesId, { visible: false });
            return;
        }
        var subImage = {
            x: 0,
            y: 0,
            width: (this.IMAGE_WIDTH / 10) * guesses,
            height: this.IMAGE_HEIGHT
        };
        var x = subImage.width * this.GUESSES_HEIGHT / subImage.height;
        var y = this.GUESSES_HEIGHT;
        Entities.editEntity(this.guessesId, {
            dimensions: { x: x, y: y, z: 0.01 },
            subImage: subImage,
            visible: true
        });
    };
    return WordScreen;
}());
exports.WordScreen = WordScreen;


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__(824);
/******/ 	var __webpack_export_target__ = self;
/******/ 	for(var i in __webpack_exports__) __webpack_export_target__[i] = __webpack_exports__[i];
/******/ 	if(__webpack_exports__.__esModule) Object.defineProperty(__webpack_export_target__, "__esModule", { value: true });
/******/ 	
/******/ })()
;
return self["default"];})