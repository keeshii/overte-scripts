"use strict";

/* global BOARD_SIZE, PLAYERS, Script, PIECE */

(function (global) {

  Script.include('./config.js');

  function Chess() {
    this.selectionChanged = function () {};
    this.stateChanged = function () {};
    this.clearBoard();
  }

  Chess.prototype.valueToPlayer = function (value) {
    return value & 0x08;
  };

  Chess.prototype.valueToPiece = function (value) {
    return value & 0x07;
  };

  Chess.prototype.clearBoard = function () {
    var i;
    this.state = [];
    for (i = 0; i < BOARD_SIZE; i++) {
      this.state.push(0);
    }
    this.activePlayer = PLAYERS.WHITE;
    this.enPassant = -1;
    this.pendingPromotion = -1;
    this.selected = -1;
    this.gameOver = true;
    this.winner = -1;
    this.lastMove = -1;
    this.stateChanged(this.state);
    this.selectionChanged(-1);
  };

  Chess.prototype.startNewGame = function () {
    this.state = [
      2, 3, 4, 6, 5, 4, 3, 2,
      1, 1, 1, 1, 1, 1, 1, 1,
      0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0,
      9, 9, 9, 9, 9, 9, 9, 9,
      10, 11, 12, 14, 13, 12, 11, 10
    ];

    this.activePlayer = PLAYERS.WHITE;
    this.enPassant = -1;
    this.pendingPromotion = -1;
    this.selected = -1;
    this.gameOver = false;
    this.winner = -1;
    this.lastMove = -1;
    this.stateChanged(this.state);
    this.selectionChanged(-1);
  };

  Chess.prototype.getMovesList = function () {
    var self, piece,
            board, moves, forced, move_base, move_promo,
            i, ip, x, xp, xpp, y, yp, ypp, o, d, t, ep, epv;

    var EMPTY = 0;
    var PLAYER = 1;
    var OPPONENT = 2;

    // var opponent = player === PLAYER.WHITE ? PLAYER.BLACK : PLAYER.WHITE;
    self = this;

    //-- Board of the opponents
    board = new Array(BOARD_SIZE);
    for (i = 0; i < BOARD_SIZE; i++) {
      o = this.valueToPlayer(this.state[i]);
      if (this.state[i] === PIECE.NONE) {
        board[i] = EMPTY; // No player
      } else if (o === this.activePlayer) {
        board[i] = PLAYER; // Player
      } else {
        board[i] = OPPONENT; // Opponent
      }
    }

    moves = [];
    forced = false;
    ep = this.enPassant >= 0;
    epv = ep ? board[this.enPassant] : EMPTY;

    function saveMove(pX, pY, pI, pPawn) {
      var take = (board[pI] === OPPONENT);
      if (take && !forced) {
        moves.length = 0;
        forced = true;
      }
      if (!forced || take) {
        if (pPawn && (pY === 0 || pY === 7)) {
          move_promo = move_base + 10 * pY + pX;
          moves.push(move_promo + 10000 * PIECE.QUEEN);
          moves.push(move_promo + 10000 * PIECE.ROOK);
          moves.push(move_promo + 10000 * PIECE.KNIGHT);
          moves.push(move_promo + 10000 * PIECE.BISHOP);
          moves.push(move_promo + 10000 * PIECE.KING);
        } else {
          moves.push(move_base + pY * 10 + pX);
        }
      }
      return take;
    }

    //-- Scans every position
    for (i = 0; i < BOARD_SIZE; i++) {

      //- Checks if the cell is relevant
      if (board[i] !== PLAYER) {
        continue;
      }

      //- Conversion
      x = i % 8;
      y = Math.floor(i / 8);
      move_base = y * 1000 + x * 100;

      //- Processing of the piece
      piece = this.valueToPiece(this.state[i]);
      switch (piece) {
        case PIECE.PAWN:

          // En passant is only relevant for the pawns
          if (ep) {
            board[this.enPassant] = OPPONENT;
          }
          if (this.activePlayer === PLAYERS.BLACK) {
            // Move
            if ((y > 0) && (board[i - 8] === EMPTY)) {
              saveMove(x, y - 1, i - 8, true);
              if ((y === 6) && (board[i - 16] === EMPTY)) {
                saveMove(x, y - 2, i - 16, true);
              }
            }
            // Take the opponent
            if ((x > 0) && (board[i - 9] === OPPONENT)) {
              saveMove(x - 1, y - 1, i - 9, true);
            }
            if ((x < 7) && (board[i - 7] === OPPONENT)) {
              saveMove(x + 1, y - 1, i - 7, true);
            }
          } else {
            // Move
            if ((y < 7) && (board[i + 8] === EMPTY)) {
              saveMove(x, y + 1, i + 8, true);
              if ((y === 1) && (board[i + 16] === EMPTY)) {
                saveMove(x, y + 2, i + 16, true);
              }
            }
            // Take the opponent
            if ((x > 0) && (board[i + 7] === OPPONENT)) {
              saveMove(x - 1, y + 1, i + 7, true);
            }
            if ((x < 7) && (board[i + 9] === OPPONENT)) {
              saveMove(x + 1, y + 1, i + 9, true);
            }
          }
          if (ep) {
            board[this.enPassant] = epv;
          }
          break;
        case PIECE.QUEEN:
        case PIECE.ROOK:
          if (x > 0) { // West
            ip = i;
            for (xp = x - 1; xp >= 0; xp--) {
              ip--;
              if (board[ip] === PLAYER || saveMove(xp, y, ip, false)) {
                break;
              }
            }
          }
          if (x < 7) { // East
            ip = i;
            for (xp = x + 1; xp <= 7; xp++) {
              ip++;
              if (board[ip] === PLAYER || saveMove(xp, y, ip, false)) {
                break;
              }
            }
          }
          if (y > 0) { // North
            ip = i;
            for (yp = y - 1; yp >= 0; yp--) {
              ip -= 8;
              if (board[ip] === PLAYER || saveMove(x, yp, ip, false)) {
                break;
              }
            }
          }
          if (y < 7) { // South
            ip = i;
            for (yp = y + 1; yp <= 7; yp++) {
              ip += 8;
              if (board[ip] === PLAYER || saveMove(x, yp, ip, false)) {
                break;
              }
            }
          }
          if (piece === PIECE.ROOK) { // Queen = Rook + Bishop
            break;
          }
          //else no break, yes !

        case PIECE.BISHOP:
          // North-West
          d = Math.min(x, y);
          if (d > 0) {
            ip = i;
            xp = x;
            yp = y;
            for (; d > 0; d--) {
              ip -= 9;
              xp--;
              yp--;
              if (board[ip] === PLAYER || saveMove(xp, yp, ip, false)) {
                break;
              }
            }
          }
          // North-East
          d = Math.min(7 - x, y);
          if (d > 0) {
            ip = i;
            xp = x;
            yp = y;
            for (; d > 0; d--) {
              ip -= 7;
              xp++;
              yp--;
              if (board[ip] === PLAYER || saveMove(xp, yp, ip, false)) {
                break;
              }
            }
          }
          // South-West
          d = Math.min(x, 7 - y);
          if (d > 0) {
            ip = i;
            xp = x;
            yp = y;
            for (; d > 0; d--) {
              ip += 7;
              xp--;
              yp++;
              if (board[ip] === PLAYER || saveMove(xp, yp, ip, false)) {
                break;
              }
            }
          }
          // South-East
          d = Math.min(7 - x, 7 - y);
          if (d > 0) {
            ip = i;
            xp = x;
            yp = y;
            for (; d > 0; d--) {
              ip += 9;
              xp++;
              yp++;
              if (board[ip] === PLAYER || saveMove(xp, yp, ip, false)) {
                break;
              }
            }
          }
          break;

        case PIECE.KNIGHT:
          if (y >= 2) {
            if ((x >= 1) && (board[i - 17] !== PLAYER)) {
              saveMove(x - 1, y - 2, i - 17, false);
            }
            if ((x <= 6) && (board[i - 15] !== PLAYER)) {
              saveMove(x + 1, y - 2, i - 15, false);
            }
          }
          if (y <= 5) {
            if ((x >= 1) && (board[i + 15] !== PLAYER)) {
              saveMove(x - 1, y + 2, i + 15, false);
            }
            if ((x <= 6) && (board[i + 17] !== PLAYER)) {
              saveMove(x + 1, y + 2, i + 17, false);
            }
          }
          if (y >= 1) {
            if ((x >= 2) && (board[i - 10] !== PLAYER)) {
              saveMove(x - 2, y - 1, i - 10, false);
            }
            if ((x <= 5) && (board[i - 6] !== PLAYER)) {
              saveMove(x + 2, y - 1, i - 6, false);
            }
          }
          if (y <= 6) {
            if ((x >= 2) && (board[i + 6] !== PLAYER)) {
              saveMove(x - 2, y + 1, i + 6, false);
            }
            if ((x <= 5) && (board[i + 10] !== PLAYER)) {
              saveMove(x + 2, y + 1, i + 10, false);
            }
          }
          break;

        case PIECE.KING:
          for (xp = -1; xp <= 1; xp++) {
            xpp = x + xp;
            if ((xpp < 0) || (xpp > 7)) {
              continue;
            }
            for (yp = -1; yp <= 1; yp += (xp === 0 ? 2 : 1)) {
              ypp = y + yp;
              ip = 8 * ypp + xpp;
              if ((ypp < 0) || (ypp > 7) || (board[ip] === PLAYER)) {
                continue;
              }
              saveMove(xpp, ypp, ip, false);
            }
          }
          break;
      }
    }
    return moves;
  };

  Chess.prototype.handleEnPassant = function (value, fromIndex, toIndex) {
    var index, piece = this.valueToPiece(value);
    if (this.enPassant >= 0 && piece === PIECE.PAWN && toIndex === this.enPassant) {
      index = fromIndex < toIndex ? toIndex - 8 : toIndex + 8;
      this.state[index] = 0;
    }

    index = -1;
    if (piece === PIECE.PAWN && Math.abs(fromIndex - toIndex) === 16) {
      index = Math.floor((fromIndex + toIndex) / 2);
    }

    this.enPassant = index;
  };

  Chess.prototype.clickSquare = function (index) {
    var selected = this.selected;
    var fromValue = this.state[selected] || 0;
    var fromPlayer = this.valueToPlayer(fromValue);
    var toValue = this.state[index] || 0;
    var toPlayer = this.valueToPlayer(toValue);
    var i, move, moves, valid;

    if (this.gameOver) {
      return 'GAME_OVER';
    }

    if (this.pendingPromotion !== -1) {
      if (index === this.pendingPromotion) {
        return 'SHOW_PROMOTION';
      }
      return false;
    }

    // Deselect piece
    if (selected === index) {
      this.selected = -1;
      this.selectionChanged(-1);
      return false;
    }

    // Piece not selected, change selection
    if (fromValue === 0 || fromPlayer !== this.activePlayer
            || (toValue !== 0 && toPlayer === this.activePlayer)) {
      this.selected = index;
      this.selectionChanged(index);
      return false;
    }

    move = (index % 8)
            + 10 * Math.floor(index / 8)
            + 100 * (selected % 8)
            + 1000 * Math.floor(selected / 8);
    valid = false;
    moves = this.getMovesList();
    // console.log('----------');
    // console.log('MOVE:', move);
    for (i = 0; i < moves.length; i++) {
      // console.log('MOVES[' +i+']:', moves[i]);
      if (move === (moves[i] % 10000)) {
        valid = true;
        break;
      }
    }

    if (valid) {
      this.state[index] = this.state[selected];
      this.state[selected] = 0;
      this.handleEnPassant(fromValue, selected, index);
      this.lastMove = move;

      this.winner = this.checkWinner();
      if (this.winner !== -1) {
        this.gameOver = true;
        this.stateChanged(this.state);
        this.selected = -1;
        this.selectionChanged(-1);
        return 'GAME_OVER';
      }

      this.activePlayer = this.activePlayer ? PLAYERS.WHITE : PLAYERS.BLACK;
      if (this.getMovesList().length === 0) {
        this.winner = this.activePlayer;
        this.gameOver = true;
        this.stateChanged(this.state);
        this.selected = -1;
        this.selectionChanged(-1);
        return 'GAME_OVER';
      }

      if (moves[i] >= 10000) {
        this.activePlayer = this.activePlayer ? PLAYERS.WHITE : PLAYERS.BLACK;
        this.pendingPromotion = index;
      }

      this.stateChanged(this.state);
      this.selected = index;
      this.selectionChanged(index);

      if (moves[i] >= 10000) {
        return 'SHOW_PROMOTION';
      }

      return false;
    }

    this.selected = index;
    this.selectionChanged(index);
    return 'INVALID_MOVE';
  };


  Chess.prototype.promote = function (value) {
    if (this.pendingPromotion === -1) {
      return 'NO_PROMOTION';
    }

    var player = this.valueToPlayer(value);
    var piece = this.valueToPiece(value);

    if (player !== this.activePlayer || piece <= PIECE.PAWN || piece > PIECE.KING) {
      return 'INVALID_MOVE';
    }

    this.lastMove = 10000 * value;
    this.state[this.pendingPromotion] = value;
    this.pendingPromotion = -1;
    this.activePlayer = this.activePlayer ? PLAYERS.WHITE : PLAYERS.BLACK;
    this.stateChanged(this.state);
    return false;
  };


  Chess.prototype.valueExists = function (min, max) {
    var i;
    for (i = 0; i < BOARD_SIZE; i++) {
      if (this.state[i] >= min && this.state[i] <= max) {
        return true;
      }
    }
    return false;
  };

  Chess.prototype.checkWinner = function () {
    var white = PLAYERS.WHITE;
    var black = PLAYERS.BLACK;
    var hasWhite, hasBlack;

    hasWhite = this.valueExists(white + PIECE.PAWN, white + PIECE.KING);
    hasBlack = this.valueExists(black + PIECE.PAWN, black + PIECE.KING);

    if (hasWhite && !hasBlack) {
      return PLAYERS.BLACK;
    }

    if (!hasWhite && hasBlack) {
      return PLAYERS.WHITE;
    }

    return -1;
  };


  global.Chess = Chess;

}(typeof module !== 'undefined' ? module.exports : new Function('return this;')()));
