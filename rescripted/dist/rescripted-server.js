((typeof module !== 'undefined' ? module : {}).exports = function () { var self={};
/******/ (function() { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 611:
/***/ (function(__unused_webpack_module, exports) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BoardRenderer = void 0;
var LAYERS_COUNT = 6;
var COLOR_TO_LAYER = {
    BASE: 0,
    R: 1,
    G: 2,
    B: 3,
    Y: 4,
    W: 5
};
var BoardRenderer = /** @class */ (function () {
    function BoardRenderer(entityId, ids, props) {
        this.boards = {};
        this.layers = [];
        this.entityId = entityId;
        for (var i = 0; i < ids.length; i++) {
            var prop = props[i];
            if (prop.parentID !== this.entityId) {
                continue;
            }
            switch (prop.name) {
                case 'Text.Rescripted.Board.Base':
                    this.boards[COLOR_TO_LAYER.BASE] = ids[i];
                    break;
                case 'Text.Rescripted.Board.R':
                    this.boards[COLOR_TO_LAYER.R] = ids[i];
                    break;
                case 'Text.Rescripted.Board.G':
                    this.boards[COLOR_TO_LAYER.G] = ids[i];
                    break;
                case 'Text.Rescripted.Board.B':
                    this.boards[COLOR_TO_LAYER.B] = ids[i];
                    break;
                case 'Text.Rescripted.Board.Y':
                    this.boards[COLOR_TO_LAYER.Y] = ids[i];
                    break;
                case 'Text.Rescripted.Board.W':
                    this.boards[COLOR_TO_LAYER.W] = ids[i];
                    break;
            }
        }
    }
    BoardRenderer.prototype.render = function (state) {
        var lines;
        var layers = this.splitColors(state);
        for (var i = 0; i < layers.length; i++) {
            lines = this.splitLines(layers[i], state.width);
            layers[i] = this.combineLines(lines, state.offsetX, state.offsetY);
            console.log(layers[i]);
        }
        for (var i = 0; i < layers.length; i++) {
            if (layers[i] !== this.layers[i]) {
                this.layers[i] = layers[i];
                Entities.editEntity(this.boards[i], { text: layers[i] });
            }
        }
    };
    BoardRenderer.prototype.splitColors = function (state) {
        var layers = [];
        var _loop_1 = function (i) {
            var layer = state.values.replace(/./g, function (match, offset) {
                var color = state.colors[offset];
                var layerId = COLOR_TO_LAYER[color] || 0;
                return layerId === i ? match : ' '; // '\u2800';
            });
            layers.push(layer);
        };
        for (var i = 0; i < LAYERS_COUNT; i++) {
            _loop_1(i);
        }
        return layers;
    };
    BoardRenderer.prototype.splitLines = function (layer, width) {
        var lines = [];
        var pos = 0;
        while (pos < layer.length) {
            lines.push(layer.substring(pos, pos + width));
            pos += width;
        }
        return lines;
    };
    BoardRenderer.prototype.combineLines = function (lines, offsetX, offsetY) {
        var offset = Array(offsetX + 1).join(' ');
        for (var i = 0; i < lines.length; i++) {
            lines[i] = lines[i].replace(/\s+$/, '');
            lines[i] = lines[i] ? offset + lines[i] : '';
        }
        for (var i = 0; i < offsetY; i++) {
            lines.unshift('');
        }
        lines.unshift('\u200C');
        return lines.join('\n').replace(/\n+$/, '');
    };
    return BoardRenderer;
}());
exports.BoardRenderer = BoardRenderer;


/***/ }),

/***/ 197:
/***/ (function(__unused_webpack_module, exports) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CONFIG = exports.MESSAGE_CHANNEL = void 0;
exports.MESSAGE_CHANNEL = 'eu.ryuu.rescripted';
exports.CONFIG = typeof Script !== 'undefined'
    ? Script.require('../config.js') : {};


/***/ }),

/***/ 635:
/***/ (function(__unused_webpack_module, exports) {


var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.ApiBuilder = exports.MAX_ACTIONS_COUNT = void 0;
exports.MAX_ACTIONS_COUNT = 1024;
var ApiBuilder = /** @class */ (function () {
    function ApiBuilder(level, ticks) {
        this.level = level;
        this.ticks = ticks;
    }
    ApiBuilder.prototype.createConsole = function () {
        var self = this; // eslint-disable-line @typescript-eslint/no-this-alias
        return {
            log: function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                self.ticks.push({ logs: __spreadArray([], args, true) });
            }
        };
    };
    ApiBuilder.prototype.createScript = function (refreshGlobalsFn) {
        var self = this; // eslint-disable-line @typescript-eslint/no-this-alias
        var globals = {};
        var playerApi = {
            move: function (x, y) {
                var level = self.level;
                level.move(level.player, x, y);
                self.tick();
            }
        };
        Object.defineProperty(playerApi, 'x', {
            get: function () {
                return self.level.player.x;
            },
            set: function (newValue) { },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(playerApi, 'y', {
            get: function () {
                return self.level.player.y;
            },
            set: function (newValue) { },
            enumerable: true,
            configurable: true
        });
        var mapApi = {
            findObject: function (value) {
                var level = self.level;
                return level.board.findValue(value);
            },
            getValue: function (x, y) {
                var level = self.level;
                var index = level.board.getIndex(x, y);
                return level.board.state.values[index];
            },
            getColor: function (x, y) {
                var level = self.level;
                var index = level.board.getIndex(x, y);
                return level.board.state.colors[index];
            },
            pathTo: function (x, y) {
                var level = self.level;
                var from = level.player;
                return level.board.findPath(from.x, from.y, x, y, level.items);
            }
        };
        var gunApi = {
            fire: function (direction) {
                var level = self.level;
                var player = level.player;
                if (!level.energy) {
                    throw new Error('No energy to fire');
                }
                level.energy -= 1;
                level.shotManager.fire(player.x, player.y, direction);
                self.tick();
            }
        };
        Object.defineProperty(gunApi, 'energy', {
            get: function () {
                return self.level.energy;
            },
            set: function (newValue) { },
            enumerable: true,
            configurable: true
        });
        return {
            include: function (path) {
                switch (path) {
                    case './api/player.js':
                        globals['player'] = playerApi;
                        refreshGlobalsFn(globals);
                        break;
                    case './api/map.js':
                        globals['map'] = mapApi;
                        refreshGlobalsFn(globals);
                        break;
                    case './api/gun.js':
                        globals['gun'] = gunApi;
                        refreshGlobalsFn(globals);
                        break;
                    case './api/level.js':
                        globals['level'] = self.level;
                        refreshGlobalsFn(globals);
                        break;
                }
            }
        };
    };
    ApiBuilder.prototype.createEntities = function () {
        var self = this; // eslint-disable-line @typescript-eslint/no-this-alias
        return {
            callEntityServerMethod: function (id, method, params) {
                var level = self.level;
                if (level.remotelyCallable.indexOf(method) === -1) {
                    throw new Error('Server method is not callable');
                }
                if (level[method](id, params)) {
                    self.tick();
                }
            }
        };
    };
    ApiBuilder.prototype.tick = function () {
        var board = this.level.board;
        this.level.tick();
        this.ticks.push({ state: board.state });
        board.state = __assign({}, board.state);
        if (this.ticks.length >= exports.MAX_ACTIONS_COUNT) {
            throw new Error('Maximum simulation time reached');
        }
    };
    return ApiBuilder;
}());
exports.ApiBuilder = ApiBuilder;


/***/ }),

/***/ 882:
/***/ (function(__unused_webpack_module, exports) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Board = void 0;
var Board = /** @class */ (function () {
    function Board() {
        this.state = {
            offsetX: 0,
            offsetY: 0,
            values: '',
            colors: '',
            width: 0
        };
    }
    Board.fromText = function (boardText, colorMap) {
        var board = new Board();
        var lines = boardText.split('\n');
        var values = [];
        var colors = [];
        var x, y, value, color, width;
        width = 0;
        for (y = 0; y < lines.length; y++) {
            width = Math.max(width, lines[y].length);
        }
        for (y = 0; y < lines.length; y++) {
            for (x = 0; x < lines[y].length; x++) {
                value = lines[y][x] || ' ';
                color = colorMap[value] || ' ';
                values.push(value);
                colors.push(color);
            }
        }
        board.state.values = values.join('');
        board.state.colors = colors.join('');
        board.state.width = width;
        return board;
    };
    Board.prototype.clear = function () {
        this.state.values = '';
        this.state.colors = '';
        this.state.width = 0;
    };
    Board.prototype.findValue = function (value) {
        var width = this.state.width;
        var index = this.state.values.indexOf(value);
        if (index === -1 || width === 0) {
            return;
        }
        var x = index % width;
        var y = Math.floor(index / width);
        return { x: x, y: y };
    };
    Board.prototype.getIndex = function (x, y) {
        return y * this.state.width + x;
    };
    Board.prototype.setValue = function (x, y, value, color) {
        if (this.state.width === 0) {
            return;
        }
        var index = this.getIndex(x, y);
        var before, after;
        if (value !== undefined) {
            before = this.state.values.substring(0, index);
            after = this.state.values.substring(index + 1, this.state.values.length);
            this.state.values = before + value + after;
        }
        if (color !== undefined) {
            before = this.state.colors.substring(0, index);
            after = this.state.colors.substring(index + 1, this.state.values.length);
            this.state.colors = before + color + after;
        }
    };
    Board.prototype.findPath = function (fromX, fromY, toX, toY, walkable) {
        var i, index, item, value, canEnter, x, y;
        if (fromX === toX && fromY === toY) {
            return;
        }
        var queue = [{ x: toX, y: toY }];
        var matrix = [];
        var moves = [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]];
        var movesLength = moves.length;
        index = this.getIndex(toX, toY);
        matrix[index] = true;
        while (queue.length) {
            item = queue.shift();
            for (i = 0; i < movesLength; i++) {
                x = item.x + moves[i][0];
                y = item.y + moves[i][1];
                index = this.getIndex(x, y);
                value = this.state.values[index];
                if (x === fromX && y === fromY) {
                    return { x: item.x - fromX, y: item.y - fromY };
                }
                canEnter = value === ' ' || walkable.indexOf(value) !== -1;
                if (!value || matrix[index] || !canEnter) {
                    continue;
                }
                matrix[index] = true;
                queue.push({ x: x, y: y });
            }
        }
    };
    return Board;
}());
exports.Board = Board;


/***/ }),

/***/ 632:
/***/ (function(__unused_webpack_module, exports) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Editor = void 0;
var Editor = /** @class */ (function () {
    function Editor() {
        this.state = {
            fileName: '',
            content: ''
        };
    }
    Editor.prototype.applyUpdate = function (action) {
        var text = this.state.content;
        if (action.remove) {
            text = text.substring(0, action.position)
                + text.substring(action.position + action.remove);
        }
        if (action.insert) {
            text = text.substring(0, action.position)
                + String(action.insert)
                + text.substring(action.position);
        }
        if (text === this.state.content) {
            return false;
        }
        this.state.content = text;
        return true;
    };
    return Editor;
}());
exports.Editor = Editor;


/***/ }),

/***/ 427:
/***/ (function(__unused_webpack_module, exports) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.runInContext = void 0;
function runInContext() {
    'use strict';
    /* eslint-disable @typescript-eslint/no-unused-vars */
    var require = undefined;
    var process = undefined;
    var Runner = undefined;
    var ApiBuilder = undefined;
    var runInContext = undefined;
    var __dirname = undefined;
    var __filename = undefined;
    var player;
    var map;
    var gun;
    var level;
    var console = this._vm.api.createConsole();
    var Entities = this._vm.api.createEntities();
    var Script = (function (context, apiUnlocked) {
        return context._vm.api.createScript(function (globals) {
            player = globals['player'];
            map = globals['map'];
            gun = globals['gun'];
            level = apiUnlocked ? globals['level'] : undefined;
        });
    }(this, this._vm.apiUnlocked));
    /* eslint-enable @typescript-eslint/no-unused-vars */
    delete this._vm.apiUnlocked;
    delete this._vm.api;
    this._vm.instance = eval('\'use strict\';' + String(this._vm.code))();
    if (this._vm.instance.preload) {
        this._vm.instance.preload(this._vm.fileName);
    }
    if (this._vm.instance.remotelyCallable instanceof Array
        && this._vm.instance.remotelyCallable.indexOf('run') !== -1) {
        this._vm.instance.run();
    }
}
exports.runInContext = runInContext;


/***/ }),

/***/ 487:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Runner = void 0;
var api_builder_1 = __webpack_require__(635);
var run_in_context_1 = __webpack_require__(427);
var Runner = /** @class */ (function () {
    function Runner() {
        this.tickCallback = function () { };
        this.loadTimer = undefined;
        this.runTimer = undefined;
        this.status = 'UNLOADED';
    }
    Runner.prototype.setTickCallback = function (callback) {
        this.tickCallback = callback;
    };
    Runner.prototype.prepareForExecute = function () {
        var _this = this;
        var SCRIPT_LOAD_TIMEOUT = 5000;
        this.stop();
        this.setStatus('PENDING');
        this.loadTimer = Script.setTimeout(function () {
            _this.setStatus('UNLOADED');
        }, SCRIPT_LOAD_TIMEOUT);
    };
    Runner.prototype.execute = function (simulation) {
        var ACTION_TIME = 250;
        if (this.status !== 'PENDING') {
            return;
        }
        this.setStatus('RUNNING');
        var self = this; // eslint-disable-line @typescript-eslint/no-this-alias
        function executeAction(ticks) {
            self.runTimer = Script.setTimeout(function () {
                var tick;
                do {
                    tick = ticks.shift();
                    self.tickCallback(tick);
                } while (ticks.length > 0 && !tick.state);
                if (ticks.length === 0) {
                    self.setStatus('UNLOADED');
                    return;
                }
                executeAction(ticks);
            }, ACTION_TIME);
        }
        executeAction(simulation);
    };
    Runner.prototype.stop = function () {
        if (this.runTimer) {
            Script.clearTimeout(this.runTimer);
            this.runTimer = undefined;
        }
        if (this.loadTimer) {
            Script.clearTimeout(this.loadTimer);
            this.loadTimer = undefined;
        }
        this.setStatus('UNLOADED');
    };
    Runner.prototype.simulate = function (level, apiUnlocked) {
        var ticks = [{ state: level.board.state }];
        level.board.state = __assign({}, level.board.state);
        var context = { _vm: {
                code: level.editor.state.content,
                fileName: level.editor.state.fileName,
                apiUnlocked: apiUnlocked,
                api: new api_builder_1.ApiBuilder(level, ticks)
            } };
        try {
            run_in_context_1.runInContext.call(context);
        }
        catch (error) {
            var maxLineNumber = level.editor.state.content.split('\n').length;
            var errorInfo = this.getErrorInfo(error, maxLineNumber);
            ticks.push({ state: level.board.state, error: errorInfo });
        }
        if (level.completed && ticks.length > 0) {
            ticks[ticks.length - 1].completed = true;
        }
        return ticks;
    };
    Runner.prototype.getErrorInfo = function (error, maxLineNumber) {
        var message = error.toString();
        var line;
        var col;
        if (error.stack !== undefined) {
            var match = error.stack.match(/<anonymous>:(\d+):(\d+)/);
            if (match) {
                line = parseInt(match[1], 10);
                col = parseInt(match[2], 10);
            }
        }
        else {
            var lineNumber = error.lineNumber;
            if (lineNumber !== undefined && lineNumber <= maxLineNumber) {
                line = lineNumber;
                col = 1;
            }
        }
        return { message: message, line: line, col: col };
    };
    Runner.prototype.setStatus = function (status) {
        if (this.status !== status) {
            this.status = status;
            this.tickCallback({ status: status });
        }
    };
    return Runner;
}());
exports.Runner = Runner;


/***/ }),

/***/ 45:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ServerStore = void 0;
var level_00_1 = __webpack_require__(383);
var level_01_1 = __webpack_require__(214);
var level_02_1 = __webpack_require__(302);
var level_03_1 = __webpack_require__(104);
var level_04_1 = __webpack_require__(517);
var level_05_1 = __webpack_require__(423);
var level_06_1 = __webpack_require__(375);
var level_07_1 = __webpack_require__(833);
var level_08_1 = __webpack_require__(387);
var level_09_1 = __webpack_require__(647);
var level_10_1 = __webpack_require__(786);
var ServerStore = /** @class */ (function () {
    function ServerStore() {
    }
    ServerStore.prototype.resetAll = function () {
        this.levelNo = 0;
        this.levels = [this.load(0)];
        return this.levels[0];
    };
    ServerStore.prototype.load = function (levelNo) {
        switch (levelNo) {
            case 0:
                return new level_00_1.Level_00();
            case 1:
                return new level_01_1.Level_01();
            case 2:
                return new level_02_1.Level_02();
            case 3:
                return new level_03_1.Level_03();
            case 4:
                return new level_04_1.Level_04();
            case 5:
                return new level_05_1.Level_05();
            case 6:
                return new level_06_1.Level_06();
            case 7:
                return new level_07_1.Level_07();
            case 8:
                return new level_08_1.Level_08();
            case 9:
                return new level_09_1.Level_09();
            case 10:
                return new level_10_1.Level_10();
        }
    };
    ServerStore.prototype.fromLocalStore = function (localStore) {
        this.levelNo = localStore.levelNo;
        this.levels = [];
        for (var i = 0; i < localStore.levels.length; i++) {
            var newLevel = this.load(i);
            newLevel.editor.state.content = localStore.levels[i].editor.state.content;
            newLevel.completed = localStore.levels[i].completed;
            this.levels.push(newLevel);
        }
        return this.levels[this.levelNo];
    };
    ServerStore.prototype.toLocalStore = function () {
        var store = {
            levelNo: this.levelNo,
            levels: []
        };
        for (var i = 0; i < this.levels.length; i++) {
            store.levels.push({
                editor: this.levels[i].editor,
                completed: this.levels[i].completed
            });
        }
        return store;
    };
    ServerStore.prototype.nextLevel = function () {
        var levelNo = this.levelNo + 1;
        var level = this.reloadLevel(levelNo);
        if (!level) {
            return;
        }
        this.levelNo = levelNo;
        return level;
    };
    ServerStore.prototype.prevLevel = function () {
        var levelNo = this.levelNo - 1;
        var level = this.reloadLevel(levelNo);
        if (!level) {
            return;
        }
        this.levelNo = levelNo;
        return level;
    };
    ServerStore.prototype.reloadLevel = function (levelNo) {
        if (levelNo === undefined) {
            levelNo = this.levelNo;
        }
        var newLevel = this.load(levelNo);
        if (!newLevel) {
            return;
        }
        // copy editor, keep board
        if (this.levels[levelNo]) {
            newLevel.editor = this.levels[levelNo].editor;
            newLevel.completed = this.levels[levelNo].completed;
        }
        this.levels[levelNo] = newLevel;
        return newLevel;
    };
    ServerStore.prototype.resetLevel = function () {
        var completed = this.levels[this.levelNo].completed;
        var newLevel = this.load(this.levelNo);
        newLevel.completed = completed;
        this.levels[this.levelNo] = newLevel;
        return newLevel;
    };
    ServerStore.prototype.isApiUnlocked = function (level) {
        if (level instanceof level_09_1.Level_09) {
            return true;
        }
        return this.levels.length >= 11;
    };
    return ServerStore;
}());
exports.ServerStore = ServerStore;


/***/ }),

/***/ 784:
/***/ (function(__unused_webpack_module, exports) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ShotManager = void 0;
var ShotManager = /** @class */ (function () {
    function ShotManager(board, shotCollisionFn) {
        this.board = board;
        this.shotCollisionFn = shotCollisionFn;
        this.shots = [];
    }
    ShotManager.prototype.tick = function () {
        var shot;
        // Move shots
        for (var i = 0; i < this.shots.length; i++) {
            shot = this.shots[i];
            var _a = this.shots[i], x = _a.x, y = _a.y, dx = _a.dx, dy = _a.dy;
            var targetIndex = this.board.getIndex(x + dx, y + dy);
            var targetValue = this.board.state.values[targetIndex];
            // no collision
            if (targetValue === ' ') {
                if (shot.value) {
                    this.board.setValue(x, y, ' ', ' ');
                }
                shot.value = dx ? '-' : '|';
                this.board.setValue(x + dx, y + dy, shot.value, 'Y');
                this.shots[i].x = x + dx;
                this.shots[i].y = y + dy;
                continue;
            }
            // collsion, remove shot
            this.markToRemove(x, y);
            if (!this.markToRemove(x + dx, y + dy) && targetValue) {
                this.shotCollisionFn(targetValue, x + dx, y + dy);
            }
        }
        this.removeMarked();
    };
    ShotManager.prototype.move = function (position, dx, dy) {
        var x = position.x;
        var y = position.y;
        var sourceIndex = this.board.getIndex(x, y);
        var sourceValue = this.board.state.values[sourceIndex];
        if (!sourceValue) {
            throw new Error('Move outside the board');
        }
        if (this.markToRemove(x + dx, y + dy)) {
            this.shotCollisionFn(sourceValue, x, y);
        }
        this.removeMarked();
    };
    ShotManager.prototype.fire = function (x, y, direction) {
        var shot = { x: x, y: y, dx: 0, dy: 0, value: '' };
        switch (direction) {
            case 'right':
                shot.dx = 1;
                break;
            case 'left':
                shot.dx = -1;
                break;
            case 'top':
                shot.dy = -1;
                break;
            case 'bottom':
                shot.dy = 1;
                break;
            default:
                throw new Error('Invalid direction');
        }
        this.shots.push(shot);
    };
    ShotManager.prototype.markToRemove = function (x, y) {
        var i, shot, result;
        result = false;
        for (i = 0; i < this.shots.length; i++) {
            shot = this.shots[i];
            if (shot.x === x && shot.y === y) {
                if (shot.value) {
                    this.board.setValue(shot.x, shot.y, ' ', ' ');
                }
                shot.deleted = true;
                result = true;
            }
        }
        return result;
    };
    ShotManager.prototype.removeMarked = function () {
        var i, shot;
        for (i = this.shots.length - 1; i >= 0; i--) {
            shot = this.shots[i];
            if (shot.deleted) {
                this.shots.splice(i, 1);
            }
        }
    };
    return ShotManager;
}());
exports.ShotManager = ShotManager;


/***/ }),

/***/ 383:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Level_00 = void 0;
var level_base_1 = __webpack_require__(358);
var CONTENT = "\n/*\n * Rescripted -or- The mission of the Dr Eval.\n *\n * Help Dr Eval to complete levels by writing the code that solves\n * variety of algorithmic problems in JavaScript.\n *\n * Your code will be executed with the eval function in your interface app.\n *\n * Controls:\n * - save - saves the game state in your interface app\n * - run - executes the code (even if not saved),\n * - reload - restores the game state,\n * - reset level - reverts all changes in the currently displayed level,\n * - back/next - navigate through levels\n *\n * Good luck hero,\n * The fate of Dr Eval lies in your hands.\n */\n(function () { return this; });\n";
var BOARD_TEXT = '    Press Next button    \n'
    + 'to enter the first level.\n';
var Level_00 = /** @class */ (function (_super) {
    __extends(Level_00, _super);
    function Level_00() {
        var _this = _super.call(this, CONTENT, BOARD_TEXT) || this;
        _this.editor.state.fileName = 'tmp://level-00.js';
        _this.board.state.offsetX = 6;
        _this.board.state.offsetY = 5;
        _this.completed = true;
        return _this;
    }
    return Level_00;
}(level_base_1.LevelBase));
exports.Level_00 = Level_00;


/***/ }),

/***/ 214:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Level_01 = void 0;
var level_base_1 = __webpack_require__(358);
var CONTENT = "\n\"use strict\";\n\n/*\n  Chapter 1 - baby steps\n\n  Basically in every level our goal is the same - reach the exit.\n  Move the player using the following function:\n\n  player.move(x, y) -> moves by x, and y squares,\n                       x and y must be an integer between -1 and 1.\n*/\n\n(function () {\n\n  Script.include('./api/player.js');\n\n  function Level() {\n    this.remotelyCallable = ['run'];\n  }\n\n  Level.prototype.run = function(_id, params) {\n    // ----- EDIT CODE HERE ------\n    var i;\n    for (i = 0; i < 3; i++) {\n      player.move(0, 1);\n      player.move(0, -1);\n    }\n    // ---------------------------\n  };\n\n  Level.prototype.preload = function(_id) { };\n\n  return new Level();\n});\n";
var BOARD_TEXT = '################\n'
    + '# @  #         #\n'
    + '#    #    #    #\n'
    + '#    #    #    #\n'
    + '#         #  X #\n'
    + '################\n';
var Level_01 = /** @class */ (function (_super) {
    __extends(Level_01, _super);
    function Level_01() {
        var _this = _super.call(this, CONTENT, BOARD_TEXT) || this;
        _this.editor.state.fileName = 'tmp://level-01.js';
        _this.board.state.offsetX = 10;
        _this.board.state.offsetY = 3;
        return _this;
    }
    return Level_01;
}(level_base_1.LevelBase));
exports.Level_01 = Level_01;


/***/ }),

/***/ 302:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Level_02 = void 0;
var level_base_1 = __webpack_require__(358);
var maze_1 = __webpack_require__(940);
var CONTENT = "\n\"use strict\";\n\n/*\n  Chapter 2 - path finding\n\n  Things are getting complicated. The floor layout seems to change\n  after each execution.\n\n  Fortunately I know the functions, which makes the problem easier:\n  \n  Use following API:\n  - player.x, player.y  -> returns player coordinates,\n  - map.findObject('X') -> returns absolute position of the given object (x, y),\n  - map.pathTo(x, y)    -> returns relative position (x, y) to the nearest\n                           square on the path to given coordinates.\n                           Or undefined if the destination is not reachable.\n*/\n\n(function () {\n\n  Script.include('./api/player.js');\n  Script.include('./api/map.js');\n\n  function Level() {\n    this.remotelyCallable = ['run'];\n  }\n\n  Level.prototype.run = function(_id, params) {\n    var exit, path;\n\n    exit = map.findObject('X');\n\n    while ((path = map.pathTo(exit.x, exit.y))) {\n      player.move(path.x, path.y);\n    }\n  };\n\n  Level.prototype.preload = function(_id) { };\n\n  return new Level();\n});\n";
var BOARD_TEXT = '####################   \n'
    + '#k                 #   \n'
    + '#                  #   \n'
    + '#                  #   \n'
    + '#                  ####\n'
    + '#                  | X#\n'
    + '#                  ####\n'
    + '#@                 #   \n'
    + '####################   \n';
var Level_02 = /** @class */ (function (_super) {
    __extends(Level_02, _super);
    function Level_02() {
        var _this = _super.call(this, CONTENT, BOARD_TEXT, { '|': 'Y', 'k': 'Y' }) || this;
        _this.editor.state.fileName = 'tmp://level-02.js';
        _this.board.state.offsetX = 8;
        _this.board.state.offsetY = 2;
        _this.items.push('k');
        _this.hasKey = false;
        _this.createMaze();
        return _this;
    }
    Level_02.prototype.createMaze = function () {
        var _this = this;
        var maze = new maze_1.Maze(20, 9);
        maze.create(function (x, y, solid) {
            if (solid) {
                var index = _this.board.getIndex(x, y);
                var value = _this.board.state.values[index];
                if (value === ' ') {
                    _this.board.setValue(x, y, '#');
                }
            }
        });
    };
    Level_02.prototype.collision = function (source, target, x, y) {
        _super.prototype.collision.call(this, source, target, x, y);
        if (source === '@' && target === 'k') {
            this.hasKey = true;
        }
        if (!this.hasKey && source === '@' && target === '|') {
            throw new Error('Collision with door');
        }
    };
    return Level_02;
}(level_base_1.LevelBase));
exports.Level_02 = Level_02;


/***/ }),

/***/ 104:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Level_03 = void 0;
var level_base_1 = __webpack_require__(358);
var array_utils_1 = __webpack_require__(919);
var CONTENT = "\n\"use strict\";\n\n/*\n  Chapter 3 - map awarness\n\n  They know we are after them and activated the security protocols.\n  We must avoid the lasers. In this level the timing is crusial.\n\n  Use following functions:\n  - map.getValue(x, y) -> returns map value at x, y,\n  - map.getColor(x, y) -> returns map color at x, y\n\n  Hint:\n  - use player.move(0, 0) -> to wait without moving.\n*/\n\n(function () {\n\n  Script.include('./api/player.js');\n  Script.include('./api/map.js');\n\n  function Level() {\n    this.remotelyCallable = ['run'];\n  }\n\n  Level.prototype.run = function(_id, params) {\n    // ----- EDIT CODE HERE ------\n    var i;\n    for (i = 0; i < 16; i++) {\n      player.move(1, 0);\n    }\n    // ---------------------------\n  };\n\n  Level.prototype.preload = function(_id) { };\n\n  return new Level();\n});\n";
var BOARD_TEXT = '#####################\n'
    + '#                   #\n'
    + '#                   #\n'
    + '# @               X #\n'
    + '#                   #\n'
    + '#                   #\n'
    + '#####################\n';
var Level_03 = /** @class */ (function (_super) {
    __extends(Level_03, _super);
    function Level_03() {
        var _this = _super.call(this, CONTENT, BOARD_TEXT) || this;
        _this.editor.state.fileName = 'tmp://level-03.js';
        _this.lasers = (0, array_utils_1.shuffle)([5, 10, 15]);
        _this.board.state.offsetX = 8;
        _this.board.state.offsetY = 3;
        _this.tickNo += _this.lasers.length;
        _this.tick();
        _this.tickNo = Math.floor(Math.random() * 10);
        return _this;
    }
    Level_03.prototype.tick = function () {
        _super.prototype.tick.call(this);
        var i, y, index, collision;
        this.tickNo += 1;
        collision = false;
        for (i = 0; i < this.lasers.length; i++) {
            for (y = 1; y < 6; y++) {
                index = this.board.getIndex(this.lasers[i], y);
                if ([2 * i, 2 * i + 1].indexOf(this.tickNo % 6) !== -1) {
                    if (this.board.state.values[index] === '|') {
                        this.board.setValue(this.lasers[i], y, ' ', ' ');
                    }
                }
                else {
                    if (this.board.state.values[index] === '@') {
                        collision = true;
                    }
                    else {
                        this.board.setValue(this.lasers[i], y, '|', 'R');
                    }
                }
            }
        }
        if (collision) {
            this.collision('@', '|', this.lasers[i], y);
        }
    };
    Level_03.prototype.collision = function (source, target, x, y) {
        _super.prototype.collision.call(this, source, target, x, y);
        if (source === '@' && target === '|') {
            throw new Error('Collision with laser');
        }
    };
    return Level_03;
}(level_base_1.LevelBase));
exports.Level_03 = Level_03;


/***/ }),

/***/ 517:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Level_04 = void 0;
var level_base_1 = __webpack_require__(358);
var array_utils_1 = __webpack_require__(919);
var CONTENT = "\n\"use strict\";\n\n/*\n  Chapter 4 - first contact\n\n  Oh no, there is a security drone. It will chase you as soon\n  as you enter its teritory. Be careful.\n*/\n\n(function () {\n\n  Script.include('./api/player.js');\n  Script.include('./api/map.js');\n\n  function Level() {\n    this.remotelyCallable = ['run'];\n  }\n\n  Level.prototype.run = function(_id, params) {\n    // ----- EDIT CODE HERE ------\n    var i;\n    for (i = 0; i < 20; i++) {\n        player.move(0, 0);\n    }\n    // ---------------------------\n  };\n\n  Level.prototype.preload = function(_id) { };\n\n  return new Level();\n});\n";
var BOARD_TEXT = '  ############  \n'
    + '  #          #  \n'
    + '  #  ### ### #  \n'
    + '  #  #     # #  \n'
    + '###  #     # ###\n'
    + '#@            X#\n'
    + '###  #     # ###\n'
    + '  #  #     # #  \n'
    + '  #  ### ### #  \n'
    + '  #          #  \n'
    + '  ############  \n';
var Level_04 = /** @class */ (function (_super) {
    __extends(Level_04, _super);
    function Level_04() {
        var _this = _super.call(this, CONTENT, BOARD_TEXT) || this;
        _this.editor.state.fileName = 'tmp://level-04.js';
        _this.drone = { x: 8, y: 1 + Math.floor(Math.random() * 9) };
        _this.droneTargets = (0, array_utils_1.shuffle)([{ x: 8, y: 1 }, { x: 8, y: 9 }]);
        _this.board.state.offsetX = 10;
        _this.board.state.offsetY = 1;
        _this.items.push('d');
        _this.board.setValue(_this.drone.x, _this.drone.y, 'd', 'R');
        return _this;
    }
    Level_04.prototype.tick = function () {
        _super.prototype.tick.call(this);
        var player = this.player;
        var drone = this.drone;
        var target = this.droneTargets[0];
        if (player.x <= 2 || player.x >= 12) {
            if (drone.x === target.x && drone.y === target.y) {
                this.droneTargets.reverse();
                target = this.droneTargets[0];
            }
        }
        else {
            target = player;
        }
        var path = this.board.findPath(drone.x, drone.y, target.x, target.y, this.items);
        if (path !== undefined) {
            this.move(drone, path.x, path.y);
        }
    };
    Level_04.prototype.collision = function (source, target, x, y) {
        _super.prototype.collision.call(this, source, target, x, y);
        if (source === '@' && target === 'd' || source === 'd' && target === '@') {
            throw new Error('Intercepted by drone');
        }
    };
    return Level_04;
}(level_base_1.LevelBase));
exports.Level_04 = Level_04;


/***/ }),

/***/ 423:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Level_05 = void 0;
var level_base_1 = __webpack_require__(358);
var CONTENT = "\n\"use strict\";\n\n/*\n  Chapter 5 - switches\n\n  The security is getting stronger. All switches on the floor must be\n  turned on, in order to deactivate the laser beam.\n*/\n\n(function () {\n\n  Script.include('./api/player.js');\n  Script.include('./api/map.js');\n\n  function Level() {\n    this.remotelyCallable = ['run'];\n  }\n\n  Level.prototype.run = function(_id, params) {\n    // ----- EDIT CODE HERE ------\n    var i;\n    for (i = 0; i < 12; i++) {\n        player.move(1, 0);\n    }\n    // ---------------------------\n  };\n\n  Level.prototype.preload = function(_id) { };\n\n  return new Level();\n});\n";
var BOARD_TEXT = '#################\n'
    + '#           |   #\n'
    + '# @         | X #\n'
    + '#           |   #\n'
    + '#################\n';
var Level_05 = /** @class */ (function (_super) {
    __extends(Level_05, _super);
    function Level_05() {
        var _this = _super.call(this, CONTENT, BOARD_TEXT, { '|': 'R' }) || this;
        _this.editor.state.fileName = 'tmp://level-05.js';
        _this.board.state.offsetX = 8;
        _this.board.state.offsetY = 4;
        _this.items.push('+');
        _this.switches = [];
        _this.createDominata();
        return _this;
    }
    Level_05.prototype.move = function (position, dx, dy) {
        var oldX, oldY;
        if (position) {
            oldX = position.x;
            oldY = position.y;
        }
        _super.prototype.move.call(this, position, dx, dy);
        this.redrawSwitch(oldX, oldY);
    };
    Level_05.prototype.collision = function (source, target, x, y) {
        _super.prototype.collision.call(this, source, target, x, y);
        if (source === '@' && target === '|') {
            throw new Error('Collision with laser');
        }
        if (source === '@' && target === '-') {
            this.switchItem(x, y, '+');
        }
        if (source === '@' && target === '+') {
            this.switchItem(x, y, '-');
        }
    };
    Level_05.prototype.createDominata = function () {
        var x, y, r;
        for (y = 1; y < 4; y++) {
            for (x = 4; x < 11; x++) {
                r = Math.floor(Math.random() * 2);
                switch (r) {
                    case 0:
                        this.switches.push({ x: x, y: y, value: '+' });
                        this.board.setValue(x, y, '+', 'G');
                        break;
                    case 1:
                        this.switches.push({ x: x, y: y, value: '-' });
                        this.board.setValue(x, y, '-', 'B');
                        break;
                }
            }
        }
    };
    Level_05.prototype.disableLaser = function () {
        var pos = this.board.findValue('|');
        while (pos) {
            this.board.setValue(pos.x, pos.y, ' ');
            pos = this.board.findValue('|');
        }
    };
    Level_05.prototype.switchItem = function (x, y, value) {
        var item, i;
        for (i = 0; i < this.switches.length; i++) {
            item = this.switches[i];
            if (item.x === x && item.y === y) {
                item.value = value;
                item.color = value === '+' ? 'G' : 'B';
                break;
            }
        }
        for (i = 0; i < this.switches.length; i++) {
            if (this.switches[i].value === '-') {
                return;
            }
        }
        this.disableLaser();
    };
    Level_05.prototype.redrawSwitch = function (x, y) {
        var item, i;
        for (i = 0; i < this.switches.length; i++) {
            item = this.switches[i];
            if (item.x === x && item.y === y) {
                this.board.setValue(item.x, item.y, item.value, item.color);
                break;
            }
        }
    };
    return Level_05;
}(level_base_1.LevelBase));
exports.Level_05 = Level_05;


/***/ }),

/***/ 375:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Level_06 = void 0;
var level_base_1 = __webpack_require__(358);
var array_utils_1 = __webpack_require__(919);
var CONTENT = "\n\"use strict\";\n\n/*\n  Chapter 6 - barrier\n\n  The way is blocked by a 4 layer barrier. You can open it by entering\n  the correct code. The code is 4 digit with numbers between 1 and 5.\n\n  Each color has assigned a different number. The layer disappears,\n  if the digit in your code matches the color of the layer.\n\n  Each 3-5 ticks, the barrier is renewed.\n\n  To submit a code, you need to invoke the server method \"submitCode\",\n  while standing next to the panel:\n\n  Entities.callEntityServerMethod(this.id, 'submitCode', ['1111']);\n\n  Just try not to make too many mistakes...\n*/\n\n(function () {\n\n  Script.include('./api/player.js');\n  Script.include('./api/map.js');\n\n  function Level() {\n    this.remotelyCallable = ['run'];\n  }\n\n  Level.prototype.run = function(_id, params) {\n    // ----- EDIT CODE HERE ------\n    var panel, path;\n\n    panel = map.findObject('P');\n\n    while ((path = map.pathTo(panel.x, panel.y - 1))) {\n      player.move(path.x, path.y);\n    }\n\n    Entities.callEntityServerMethod(this.id, 'submitCode', ['1111']);\n    // ---------------------------\n  };\n\n  Level.prototype.preload = function(_id) {\n    this.id = _id;\n  };\n\n  return new Level();\n});\n";
var BOARD_TEXT = '#################\n'
    + '#             @ #\n'
    + '#               #\n'
    + '#               #\n'
    + '###P#      ######\n'
    + '    #      #     \n'
    + '    #      #     \n'
    + '    #      #     \n'
    + '    #      #     \n'
    + '#####      ######\n'
    + '#               #\n'
    + '# X             #\n'
    + '#################\n';
var Level_06 = /** @class */ (function (_super) {
    __extends(Level_06, _super);
    function Level_06() {
        var _this = _super.call(this, CONTENT, BOARD_TEXT, { 'P': 'W' }) || this;
        _this.editor.state.fileName = 'tmp://level-06.js';
        _this.board.state.offsetX = 10;
        _this.board.state.offsetY = 0;
        _this.items.push('<', '>', 'd');
        _this.assignment = (0, array_utils_1.shuffle)(['R', 'G', 'B', 'Y', 'W']);
        _this.ticksToRenew = 0;
        _this.barrier = [];
        _this.invalidSubmitted = false;
        _this.unlocked = false;
        _this.drone = null;
        _this.remotelyCallable = ['submitCode'];
        _this.renewBarrier();
        return _this;
    }
    Level_06.prototype.drawLayer = function (i, enabled) {
        var value = i % 2 ? '>' : '<';
        var color = this.barrier[i];
        for (var x = 5; x < 11; x++) {
            this.board.setValue(x, i + 5, enabled ? value : ' ', color);
        }
    };
    Level_06.prototype.renewBarrier = function () {
        var i;
        if (this.unlocked) {
            return;
        }
        if (this.ticksToRenew) {
            this.ticksToRenew--;
            return;
        }
        this.ticksToRenew = 3 + Math.floor(Math.random() * 3);
        for (i = 0; i < 4; i++) {
            this.barrier[i] = (0, array_utils_1.randomValue)(this.assignment);
            this.drawLayer(i, true);
        }
    };
    Level_06.prototype.submitCode = function (id, params) {
        var i, color, invalidCode;
        if (!params || !(params instanceof Array) || params.length !== 1) {
            throw new Error('Invalid params');
        }
        var code = params[0];
        if (typeof code !== 'string' || !code.match(/^[1-5]{4}$/)) {
            throw new Error('Invalid code');
        }
        var panel = this.board.findValue('P');
        if (Math.abs(panel.x - this.player.x) > 1 || Math.abs(panel.y - this.player.y) > 1) {
            throw new Error('Must stand next to panel' + JSON.stringify([panel, this.player]));
        }
        if (this.unlocked) {
            return;
        }
        invalidCode = false;
        for (i = 0; i < 4; i++) {
            color = this.assignment[parseInt(code[i], 10) - 1];
            if (this.barrier[i] === color) {
                this.drawLayer(i, false);
            }
            else {
                this.drawLayer(i, true);
                this.invalidSubmitted = true;
                invalidCode = true;
            }
        }
        if (!invalidCode) {
            this.unlocked = true;
        }
        return true; // make a tick
    };
    Level_06.prototype.tick = function () {
        _super.prototype.tick.call(this);
        var player = this.player;
        var drone = this.drone;
        var droneSpawn = { x: 15, y: 1 };
        var target = player.y < 7 ? player : droneSpawn;
        this.renewBarrier();
        if (!this.invalidSubmitted) {
            return;
        }
        if (!drone) {
            this.drone = droneSpawn;
            this.board.setValue(this.drone.x, this.drone.y, 'd', 'R');
            return;
        }
        var path = this.board.findPath(drone.x, drone.y, target.x, target.y, this.items);
        if (path !== undefined) {
            this.move(drone, path.x, path.y);
        }
    };
    Level_06.prototype.collision = function (source, target, x, y) {
        _super.prototype.collision.call(this, source, target, x, y);
        if (source === '@' && target === '<' || source === '@' && target === '>') {
            throw new Error('Collision with barrier');
        }
        if (source === '@' && target === 'd' || source === 'd' && target === '@') {
            throw new Error('Intercepted by drone');
        }
    };
    return Level_06;
}(level_base_1.LevelBase));
exports.Level_06 = Level_06;


/***/ }),

/***/ 833:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Level_07 = void 0;
var level_base_1 = __webpack_require__(358);
var array_utils_1 = __webpack_require__(919);
var CONTENT = "\n\"use strict\";\n\n/*\n  Chapter 7 - shooter\n\n  You did it! We have broken through the security and now we are in the\n  protected area.\n\n  For now on, you are allowed to use the 'gun' API:\n  - gun.fire('right')  -> fires a laser beam in given direction.\n                          Direction can be 'right', 'left', 'top' or 'bottom'.\n\n  The gun is powered by the energy. After you pick the yellow 'E', you\n  will have 3 shots. Then your gun needs to be recharged again.\n\n  - gun.energy         -> returns current amount of energy\n\n  Show them who they are up against.\n*/\n\n(function () {\n\n  Script.include('./api/player.js');\n  Script.include('./api/map.js');\n  Script.include('./api/gun.js');\n\n  function Level() {\n    this.remotelyCallable = ['run'];\n  }\n\n  Level.prototype.run = function(_id, params) {\n    // ----- EDIT CODE HERE ------\n    var target, path, i;\n\n    target = map.findObject('E');\n    while ((path = map.pathTo(target.x, target.y))) {\n      player.move(path.x, path.y);\n    }\n\n    gun.fire('top');\n    for (i = 0; i < 10; i++) {\n        player.move(0, 0);\n    }\n    // ---------------------------\n  };\n\n  Level.prototype.preload = function(_id) {\n    this.id = _id;\n  };\n\n  return new Level();\n});\n";
var BOARD_TEXT = '    ##########################\n'
    + '#####                    #   #\n'
    + '#                        |   #\n'
    + '#   #                    | X #\n'
    + '#   #                    #   #\n'
    + '#   ##########################\n'
    + '#   #                         \n'
    + '#   #####                     \n'
    + '#   @   #                     \n'
    + '#       #                     \n'
    + '# E E E #                     \n'
    + '#########                     \n';
var Level_07 = /** @class */ (function (_super) {
    __extends(Level_07, _super);
    function Level_07() {
        var _this = _super.call(this, CONTENT, BOARD_TEXT, { 'E': 'Y', '|': 'R' }) || this;
        _this.editor.state.fileName = 'tmp://level-07.js';
        _this.board.state.offsetX = 4;
        _this.board.state.offsetY = 0;
        _this.items.push('E', 'd');
        _this.drones = [];
        _this.droneTargets = [];
        _this.createWalls();
        _this.createDrones();
        return _this;
    }
    Level_07.prototype.createWalls = function () {
        var i, x;
        var y = [1, 2, 3, 4];
        for (i = 0; i < 4; i++) {
            x = 8 + i * 4;
            (0, array_utils_1.shuffle)(y);
            this.board.setValue(x, y[0], '#', ' ');
            this.board.setValue(x, y[1], '#', ' ');
            this.board.setValue(x, y[2], '#', ' ');
        }
    };
    Level_07.prototype.createDrones = function () {
        var i, x, y;
        for (i = 0; i < 5; i++) {
            x = 6 + i * 4;
            y = 1 + Math.floor(Math.random() * 3);
            this.board.setValue(x, y, 'd', 'R');
            this.drones.push({ x: x, y: y });
            this.droneTargets.push({ x: x, y: i % 2 ? 1 : 3 });
        }
    };
    Level_07.prototype.disableLaser = function () {
        var pos = this.board.findValue('|');
        while (pos) {
            this.board.setValue(pos.x, pos.y, ' ');
            pos = this.board.findValue('|');
        }
    };
    Level_07.prototype.tick = function () {
        _super.prototype.tick.call(this);
        var i, drone, target, index;
        var player = this.player;
        // simulate drones
        for (i = 0; i < this.drones.length; i++) {
            drone = this.drones[i];
            target = this.droneTargets[i];
            if (drone.x === target.x && drone.y === target.y) {
                target.y = drone.y === 1 ? 4 : 1;
            }
            if (player.x > target.x - 6 && player.y < 6) {
                target = player;
            }
            var path = this.board.findPath(drone.x, drone.y, target.x, target.y, this.items);
            if (path === undefined) {
                continue;
            }
            index = this.board.getIndex(drone.x + path.x, drone.y + path.y);
            if (this.board.state.values[index] !== 'd') {
                this.move(drone, path.x, path.y);
            }
        }
    };
    Level_07.prototype.collision = function (source, target, x, y) {
        _super.prototype.collision.call(this, source, target, x, y);
        if (source === '@' && target === '|') {
            throw new Error('Collision with laser');
        }
        if (source === '@' && target === 'd' || source === 'd' && target === '@') {
            throw new Error('Intercepted by drone');
        }
    };
    Level_07.prototype.shotCollision = function (target, x, y) {
        _super.prototype.shotCollision.call(this, target, x, y);
        var i, drone;
        if (target === 'd') {
            for (i = 0; i < this.drones.length; i++) {
                drone = this.drones[i];
                if (drone.x === x && drone.y === y) {
                    this.drones.splice(i, 1);
                    this.droneTargets.splice(i, 1);
                    this.board.setValue(drone.x, drone.y, ' ', ' ');
                    break;
                }
            }
            if (this.drones.length === 0) {
                this.disableLaser();
            }
        }
    };
    return Level_07;
}(level_base_1.LevelBase));
exports.Level_07 = Level_07;


/***/ }),

/***/ 387:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Level_08 = void 0;
var level_base_1 = __webpack_require__(358);
var CONTENT = "\n\"use strict\";\n\n/*\n  Chapter 7 - boss\n\n  Finally, we're arrived to the CORE. The drones were expecting us, and worse,\n  they copied my gun's code. We must defeat them with our wits.\n  Use all the API calls you discovered so far.\n\n  If we succeed, we will regain full control of the grid.\n  I belive in you.\n*/\n\n(function () {\n\n  Script.include('./api/player.js');\n  Script.include('./api/map.js');\n  Script.include('./api/gun.js');\n\n  function Level() {\n    this.remotelyCallable = ['run'];\n  }\n\n  Level.prototype.run = function(_id, params) {\n    // ----- EDIT CODE HERE ------\n    var i;\n    for (i = 0; i < 20; i++) {\n        player.move(0, 0);\n    }\n    // ---------------------------\n  };\n\n  Level.prototype.preload = function(_id) {\n    this.id = _id;\n  };\n\n  return new Level();\n});\n";
var BOARD_TEXT = '  ###########\n'
    + '  #        X#\n'
    + '  #    D    #\n'
    + '  #=========#\n'
    + '  #         #\n'
    + '  #         #\n'
    + '  #         #\n'
    + '  #         #\n'
    + '  #         #\n'
    + '  #         #\n'
    + '######   ####\n'
    + '#@          #\n'
    + '#E E E   E E#\n'
    + '#############\n';
var Level_08 = /** @class */ (function (_super) {
    __extends(Level_08, _super);
    function Level_08() {
        var _this = _super.call(this, CONTENT, BOARD_TEXT, { 'E': 'Y', '=': 'B', 'D': 'R' }) || this;
        _this.editor.state.fileName = 'tmp://level-08.js';
        _this.board.state.offsetX = 11;
        _this.board.state.offsetY = 0;
        _this.items.push('E', 'd', 'D');
        _this.drones = [];
        _this.droneReloads = [];
        _this.boss = _this.board.findValue('D');
        _this.bossTarget = { x: 5, y: 2 };
        _this.bossReload = 0;
        _this.createDrones();
        return _this;
    }
    Level_08.prototype.createDrones = function () {
        var i, x, y;
        for (i = 0; i < 9; i++) {
            x = 3 + i;
            y = 4;
            this.board.setValue(x, y, 'd', 'R');
            this.drones.push({ x: x, y: y });
            this.droneReloads.push(Math.floor(Math.random() * 6));
        }
    };
    Level_08.prototype.disableLaser = function () {
        for (var i = 0; i < 9; i++) {
            this.board.setValue(3 + i, 3, ' ');
            this.board.setValue(3 + i, 4, ' ');
        }
    };
    Level_08.prototype.tick = function () {
        _super.prototype.tick.call(this);
        var i, target;
        // Shooting drones
        for (i = 0; i < this.drones.length; i++) {
            if (this.droneReloads[i] > 0) {
                this.droneReloads[i]--;
                continue;
            }
            this.shotManager.fire(this.drones[i].x, this.drones[i].y, 'bottom');
            this.droneReloads[i] = 3 + Math.floor(Math.random() * 3);
        }
        // Boss when drones on the map
        var boss = this.boss;
        if (!boss) {
            return;
        }
        if (this.drones.length > 0) {
            target = this.bossTarget;
            if (boss.x === target.x) {
                target.x = boss.x === 5 ? 9 : 5;
            }
            var path = this.board.findPath(boss.x, boss.y, target.x, target.y, this.items);
            if (path) {
                this.move(boss, path.x, path.y);
            }
        }
        else {
            target = { x: Math.max(3, this.player.x), y: boss.y };
            var path = this.board.findPath(boss.x, boss.y, target.x, target.y, this.items);
            if (path) {
                this.move(boss, path.x, path.y);
            }
            if (this.bossReload === 0) {
                this.bossReload = 10;
            }
            else {
                this.bossReload--;
                if (boss.x === this.player.x && this.bossReload > 1) {
                    this.shotManager.fire(boss.x, boss.y, 'bottom');
                }
            }
        }
    };
    Level_08.prototype.collision = function (source, target, x, y) {
        _super.prototype.collision.call(this, source, target, x, y);
        if (source === '@' && target === '=') {
            throw new Error('Collision with force field');
        }
        if (source === '@' && target === 'd' || source === 'd' && target === '@') {
            throw new Error('Intercepted by drone');
        }
        if (source === '@' && target === 'D' || source === 'D' && target === '@') {
            throw new Error('Intercepted by drone');
        }
    };
    Level_08.prototype.shotCollision = function (target, x, y) {
        _super.prototype.shotCollision.call(this, target, x, y);
        var i, drone;
        if (target === 'd') {
            for (i = 0; i < this.drones.length; i++) {
                drone = this.drones[i];
                if (drone.x === x && drone.y === y) {
                    this.drones.splice(i, 1);
                    this.droneReloads.splice(i, 1);
                    this.board.setValue(drone.x, drone.y, '=', 'B');
                    break;
                }
            }
            if (this.drones.length === 0) {
                this.disableLaser();
            }
        }
        if (target === 'D') {
            this.board.setValue(this.boss.x, this.boss.y, ' ');
            this.boss = null;
        }
    };
    return Level_08;
}(level_base_1.LevelBase));
exports.Level_08 = Level_08;


/***/ }),

/***/ 647:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Level_09 = void 0;
var level_base_1 = __webpack_require__(358);
var array_utils_1 = __webpack_require__(919);
var CONTENT = "\n\"use strict\";\n\n/*\n  Chapter 9 - limitless\n\n  You were amazing. Now we have full controll over the game state.\n\n  Check the new API:\n  level.board.setValue(x, y, value, color) -> Changes the board squere\n*/\n\n(function () {\n\n  Script.include('./api/player.js');\n  Script.include('./api/map.js');\n  Script.include('./api/level.js');\n\n  function Level() {\n    this.remotelyCallable = ['run'];\n  }\n\n  Level.prototype.run = function(_id, params) {\n    // ----- EDIT CODE HERE ------\n    var drone;\n\n    player.move(0, 0);\n    player.move(0, 0);\n\n    level.drones = []; // drones are no more\n    while (drone = map.findObject('d')) {\n      level.board.setValue(drone.x, drone.y, ' ');\n    }\n\n    player.move(0, 0);\n    // ---------------------------\n  };\n\n  Level.prototype.preload = function(_id) {\n    this.id = _id;\n  };\n\n  return new Level();\n});\n";
var BOARD_TEXT = ' ############# \n'
    + '##           ##\n'
    + '#             #\n'
    + '#             #\n'
    + '#             #\n'
    + '#      @      #\n'
    + '#             #\n'
    + '#             #\n'
    + '#             #\n'
    + '##           ##\n'
    + ' ############# \n';
var Level_09 = /** @class */ (function (_super) {
    __extends(Level_09, _super);
    function Level_09() {
        var _this = _super.call(this, CONTENT, BOARD_TEXT) || this;
        _this.editor.state.fileName = 'tmp://level-09.js';
        _this.board.state.offsetX = 11;
        _this.board.state.offsetY = 1;
        _this.items.push('d');
        _this.drones = [];
        _this.createDrones();
        return _this;
    }
    Level_09.prototype.createDrones = function () {
        var i;
        var slots = [];
        for (i = 2; i < 13; i++) {
            slots.push({ x: i, y: 1 });
            slots.push({ x: i, y: 9 });
        }
        for (i = 2; i < 9; i++) {
            slots.push({ x: 1, y: i });
            slots.push({ x: 13, y: i });
        }
        (0, array_utils_1.shuffle)(slots);
        for (i = 0; i < 10; i++) {
            this.drones.push(slots[i]);
            this.board.setValue(slots[i].x, slots[i].y, 'd', 'R');
        }
    };
    Level_09.prototype.tick = function () {
        _super.prototype.tick.call(this);
        var i, index, drone, target;
        // Simulate drones
        for (i = 0; i < this.drones.length; i++) {
            drone = this.drones[i];
            target = this.player;
            var path = this.board.findPath(drone.x, drone.y, target.x, target.y, this.items);
            if (path === undefined) {
                continue;
            }
            index = this.board.getIndex(drone.x + path.x, drone.y + path.y);
            if (this.board.state.values[index] !== 'd') {
                this.move(drone, path.x, path.y);
            }
        }
    };
    Level_09.prototype.collision = function (source, target, x, y) {
        _super.prototype.collision.call(this, source, target, x, y);
        if (source === '@' && target === 'd' || source === 'd' && target === '@') {
            throw new Error('Intercepted by drone');
        }
    };
    return Level_09;
}(level_base_1.LevelBase));
exports.Level_09 = Level_09;


/***/ }),

/***/ 786:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Level_10 = void 0;
var level_base_1 = __webpack_require__(358);
var CONTENT = "\n\"use strict\";\n\n/*\n  Chapter 9 - the end\n\n  Congratulations. Dr Eval escaped, the world is saved, etc.\n\n  Hope you liked the game. As the reward, the level API is\n  now unlocked in all levels.\n*/\n(function () { return this; });\n";
var BOARD_TEXT = 'The end.\n';
var Level_10 = /** @class */ (function (_super) {
    __extends(Level_10, _super);
    function Level_10() {
        var _this = _super.call(this, CONTENT, BOARD_TEXT) || this;
        _this.editor.state.fileName = 'tmp://level-10.js';
        _this.board.state.offsetX = 4;
        _this.board.state.offsetY = 2;
        _this.completed = false;
        return _this;
    }
    return Level_10;
}(level_base_1.LevelBase));
exports.Level_10 = Level_10;


/***/ }),

/***/ 358:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LevelBase = void 0;
var board_1 = __webpack_require__(882);
var editor_1 = __webpack_require__(632);
var shot_manager_1 = __webpack_require__(784);
var COLOR_MAP = {
    '@': 'B',
    'X': 'W'
};
var LevelBase = /** @class */ (function () {
    function LevelBase(content, boardText, colorMap) {
        var _this = this;
        this.remotelyCallable = [];
        colorMap = __assign(__assign({}, COLOR_MAP), colorMap);
        this.board = board_1.Board.fromText(boardText, colorMap);
        this.editor = new editor_1.Editor();
        this.editor.state.content = content;
        this.items = ['@', 'X', '-', '|'];
        this.completed = false;
        this.player = this.board.findValue('@');
        this.exit = this.board.findValue('X');
        this.shotManager = new shot_manager_1.ShotManager(this.board, function (value, x, y) { return _this.shotCollision(value, x, y); });
        this.energy = 0;
    }
    LevelBase.prototype.tick = function () {
        this.shotManager.tick();
    };
    LevelBase.prototype.move = function (position, dx, dy) {
        if (dx === 0 && dy === 0) {
            return;
        }
        if ([-1, 0, 1].indexOf(dx) === -1 || [-1, 0, 1].indexOf(dy) === -1) {
            throw new Error('Invalid move (' + dx + ', ' + dy + ')');
        }
        if (!position) {
            throw new Error('Invalid position');
        }
        var x = position.x, y = position.y;
        // handle moving into shots
        this.shotManager.move(position, dx, dy);
        var sourceIndex = this.board.getIndex(x, y);
        var targetIndex = this.board.getIndex(x + dx, y + dy);
        var sourceColor = this.board.state.colors[sourceIndex];
        var sourceValue = this.board.state.values[sourceIndex];
        var targetValue = this.board.state.values[targetIndex];
        if (!sourceValue || !targetValue) {
            throw new Error('Move outside the board');
        }
        if (targetValue !== ' ' && this.items.indexOf(targetValue) === -1) {
            throw new Error('Cannot move to a non-empty square');
        }
        position.x = x + dx;
        position.y = y + dy;
        this.board.setValue(x + dx, y + dy, sourceValue, sourceColor);
        this.board.setValue(x, y, ' ');
        if (this.items.indexOf(targetValue) !== -1) {
            this.collision(sourceValue, targetValue, x + dx, y + dy);
        }
    };
    LevelBase.prototype.collision = function (source, target, x, y) {
        if (source === '@' && target === 'X') {
            this.completed = true;
            throw new Error('Level completed');
        }
        if (source === '@' && target === 'E') {
            this.energy = 3;
        }
    };
    LevelBase.prototype.shotCollision = function (target, x, y) {
        if (target === '@') {
            throw new Error('Player hit by laser');
        }
    };
    return LevelBase;
}());
exports.LevelBase = LevelBase;


/***/ }),

/***/ 919:
/***/ (function(__unused_webpack_module, exports) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.randomValue = exports.shuffle = void 0;
function shuffle(arr) {
    var i, r, tmp;
    for (i = 0; i < arr.length; i++) {
        r = Math.floor(Math.random() * arr.length);
        tmp = arr[r];
        arr[r] = arr[i];
        arr[i] = tmp;
    }
    return arr;
}
exports.shuffle = shuffle;
function randomValue(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}
exports.randomValue = randomValue;


/***/ }),

/***/ 940:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Maze = void 0;
var array_utils_1 = __webpack_require__(919);
/**
 * @class Recursively divided maze, http://en.wikipedia.org/wiki/Maze_generation_algorithm#Recursive_division_method
 */
var Maze = /** @class */ (function () {
    function Maze(width, height) {
        this._width = width;
        this._height = height;
    }
    Maze.prototype.create = function (callback) {
        var w = this._width;
        var h = this._height;
        this._map = [];
        for (var i = 0; i < w; i++) {
            this._map.push([]);
            for (var j = 0; j < h; j++) {
                var border = (i === 0 || j === 0 || i + 1 === w || j + 1 === h);
                this._map[i].push(border ? 1 : 0);
            }
        }
        this._stack = [
            [1, 1, w - 2, h - 2]
        ];
        this._process();
        for (var i = 0; i < w; i++) {
            for (var j = 0; j < h; j++) {
                callback(i, j, this._map[i][j]);
            }
        }
        this._map = null;
        return this;
    };
    Maze.prototype._process = function () {
        while (this._stack.length) {
            var room = this._stack.shift(); /* [left, top, right, bottom] */
            this._partitionRoom(room);
        }
    };
    Maze.prototype._partitionRoom = function (room) {
        var availX = [];
        var availY = [];
        for (var i = room[0] + 1; i < room[2]; i++) {
            var top = this._map[i][room[1] - 1];
            var bottom = this._map[i][room[3] + 1];
            if (top && bottom && !(i % 2)) {
                availX.push(i);
            }
        }
        for (var j = room[1] + 1; j < room[3]; j++) {
            var left = this._map[room[0] - 1][j];
            var right = this._map[room[2] + 1][j];
            if (left && right && !(j % 2)) {
                availY.push(j);
            }
        }
        if (!availX.length || !availY.length) {
            return;
        }
        var x = (0, array_utils_1.randomValue)(availX);
        var y = (0, array_utils_1.randomValue)(availY);
        this._map[x][y] = 1;
        var walls = [];
        var w = [];
        walls.push(w); /* left part */
        for (var i = room[0]; i < x; i++) {
            this._map[i][y] = 1;
            w.push([i, y]);
        }
        w = [];
        walls.push(w); /* right part */
        for (var i = x + 1; i <= room[2]; i++) {
            this._map[i][y] = 1;
            w.push([i, y]);
        }
        w = [];
        walls.push(w); /* top part */
        for (var j = room[1]; j < y; j++) {
            this._map[x][j] = 1;
            w.push([x, j]);
        }
        w = [];
        walls.push(w); /* bottom part */
        for (var j = y + 1; j <= room[3]; j++) {
            this._map[x][j] = 1;
            w.push([x, j]);
        }
        var solid = (0, array_utils_1.randomValue)(walls);
        for (var i = 0; i < walls.length; i++) {
            w = walls[i];
            if (w === solid) {
                continue;
            }
            var hole = (0, array_utils_1.randomValue)(w);
            this._map[hole[0]][hole[1]] = 0;
        }
        this._stack.push([room[0], room[1], x - 1, y - 1]); /* left top */
        this._stack.push([x + 1, room[1], room[2], y - 1]); /* right top */
        this._stack.push([room[0], y + 1, x - 1, room[3]]); /* left bottom */
        this._stack.push([x + 1, y + 1, room[2], room[3]]); /* right bottom */
    };
    return Maze;
}());
exports.Maze = Maze;


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
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
!function() {
var exports = __webpack_exports__;

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RescriptedServer = void 0;
var board_renderer_1 = __webpack_require__(611);
var constants_1 = __webpack_require__(197);
var runner_1 = __webpack_require__(487);
var server_store_1 = __webpack_require__(45);
var RescriptedServer = /** @class */ (function () {
    function RescriptedServer() {
        this.runner = new runner_1.Runner();
        this.serverStore = new server_store_1.ServerStore();
        this.level = this.serverStore.resetAll();
    }
    RescriptedServer.prototype.preload = function (entityId) {
        var _this = this;
        this.entityId = entityId;
        Script.setTimeout(function () {
            _this.initLayoutEntities();
            _this.resetGame(entityId, []);
            _this.runner.setTickCallback(function (tick) { return _this.handleRunnerTick(tick); });
        }, constants_1.CONFIG.INIT_ENTITIES_DELAY);
        this.remotelyCallable = [
            'resetGame',
            'resetLevel',
            'showPreviousLevel',
            'showNextLevel',
            'initialize',
            'update',
            'saveGameState',
            'loadGameState',
            'runScript',
            'runSimulation',
            'stopScript'
        ];
    };
    RescriptedServer.prototype.unload = function () { };
    RescriptedServer.prototype.resetGame = function (_id, params) {
        this.runner.stop();
        this.level = this.serverStore.resetAll();
        var _a = this.level.editor.state, content = _a.content, fileName = _a.fileName;
        var board = this.level.board;
        this.sendToAll({ type: 'SET_STATE', content: content, fileName: fileName });
        this.boardRenderer.render(board.state);
    };
    RescriptedServer.prototype.resetLevel = function (_id, params) {
        this.runner.stop();
        this.level = this.serverStore.resetLevel();
        var _a = this.level.editor.state, content = _a.content, fileName = _a.fileName;
        var board = this.level.board;
        this.sendToAll({ type: 'SET_STATE', content: content, fileName: fileName });
        this.boardRenderer.render(board.state);
    };
    RescriptedServer.prototype.showPreviousLevel = function (_id, params) {
        if (this.serverStore.levelNo === 0) {
            return;
        }
        var level = this.serverStore.prevLevel();
        if (level === undefined) {
            return;
        }
        this.runner.stop();
        this.level = level;
        var _a = this.level.editor.state, content = _a.content, fileName = _a.fileName;
        var board = this.level.board;
        this.sendToAll({ type: 'SET_STATE', content: content, fileName: fileName });
        this.boardRenderer.render(board.state);
    };
    RescriptedServer.prototype.showNextLevel = function (_id, params) {
        if (!this.level.completed) {
            return;
        }
        var level = this.serverStore.nextLevel();
        if (level === undefined) {
            return;
        }
        this.runner.stop();
        this.level = level;
        var _a = this.level.editor.state, content = _a.content, fileName = _a.fileName;
        var board = this.level.board;
        this.sendToAll({ type: 'SET_STATE', content: content, fileName: fileName });
        this.boardRenderer.render(board.state);
    };
    RescriptedServer.prototype.initialize = function (_id, params) {
        var clientId = params[0];
        var status = this.runner.status;
        var _a = this.level.editor.state, content = _a.content, fileName = _a.fileName;
        this.sendToClient(clientId, { type: 'SET_STATE', content: content, fileName: fileName, status: status });
    };
    RescriptedServer.prototype.update = function (_id, params) {
        var action;
        try {
            action = JSON.parse(params[1]);
        }
        catch (e) {
            return;
        }
        if (this.level.editor.applyUpdate(action)) {
            this.sendToAll(action);
        }
    };
    RescriptedServer.prototype.saveGameState = function (_id, params) {
        var clientId = params[0];
        var gameState = this.serverStore.toLocalStore();
        this.callClient(clientId, 'persistGameState', [JSON.stringify(gameState)]);
    };
    RescriptedServer.prototype.loadGameState = function (_id, params) {
        var clientId = params[0];
        var gameState;
        try {
            gameState = JSON.parse(params[1]);
        }
        catch (e) {
            return;
        }
        this.runner.stop();
        this.level = this.serverStore.fromLocalStore(gameState);
        var _a = this.level.editor.state, content = _a.content, fileName = _a.fileName;
        var status = this.runner.status;
        this.sendToAll({ type: 'SET_STATE', content: content, fileName: fileName, status: status });
        this.boardRenderer.render(this.level.board.state);
        this.sendToClient(clientId, { type: 'SHOW_MESSAGE', message: 'Game loaded' });
    };
    RescriptedServer.prototype.runScript = function (_id, params) {
        var clientId = params[0];
        var apiUnlocked = this.serverStore.isApiUnlocked(this.level);
        var levelNo = this.serverStore.levelNo;
        var content = this.level.editor.state.content;
        this.runner.prepareForExecute();
        this.callClient(clientId, 'createSimulation', [
            String(levelNo),
            content,
            apiUnlocked ? 'true' : 'false'
        ]);
    };
    RescriptedServer.prototype.runSimulation = function (_id, params) {
        var simulation;
        try {
            simulation = JSON.parse(params[1]);
        }
        catch (e) {
            return;
        }
        this.runner.execute(simulation);
    };
    RescriptedServer.prototype.stopScript = function (_id, params) {
        this.runner.stop();
    };
    RescriptedServer.prototype.handleRunnerTick = function (tick) {
        if (tick.logs) {
            this.sendToAll({ type: 'LOG_INFO', items: tick.logs });
        }
        if (tick.error) {
            var error = tick.error.message;
            var line = tick.error.line;
            var col = tick.error.col;
            this.runner.status = tick.error.message;
            this.sendToAll({ type: 'LOG_ERROR', error: error, line: line, col: col });
        }
        if (tick.status) {
            this.sendToAll({ type: 'SET_STATUS', status: tick.status });
        }
        if (tick.state) {
            this.level.board.state = tick.state;
            this.boardRenderer.render(tick.state);
        }
        if (tick.completed) {
            this.level.completed = tick.completed;
        }
    };
    RescriptedServer.prototype.initLayoutEntities = function () {
        var position = Entities.getEntityProperties(this.entityId, ['position']).position;
        var entityIds = Entities.findEntities(position, 50);
        var entities = entityIds.map(function (id) { return Entities.getEntityProperties(id, ['parentID', 'name']); });
        this.boardRenderer = new board_renderer_1.BoardRenderer(this.entityId, entityIds, entities);
    };
    RescriptedServer.prototype.callClient = function (clientId, methodName, params) {
        if (this.client) {
            this.client[methodName](this.entityId, params);
            return;
        }
        Entities.callEntityClientMethod(clientId, this.entityId, methodName, params);
    };
    RescriptedServer.prototype.sendToClient = function (clientId, action) {
        this.callClient(clientId, 'emitWebEvent', [JSON.stringify(action)]);
    };
    RescriptedServer.prototype.sendToAll = function (action) {
        Messages.sendMessage(constants_1.MESSAGE_CHANNEL, JSON.stringify(action));
    };
    return RescriptedServer;
}());
exports.RescriptedServer = RescriptedServer;
exports["default"] = new RescriptedServer();

}();
var __webpack_export_target__ = self;
for(var i in __webpack_exports__) __webpack_export_target__[i] = __webpack_exports__[i];
if(__webpack_exports__.__esModule) Object.defineProperty(__webpack_export_target__, "__esModule", { value: true });
/******/ })()
;
return self["default"];})