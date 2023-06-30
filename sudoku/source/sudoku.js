"use strict";

/* global STATE_LENGTH, EMPTY, EMPTY_STATE, DIGITS, BOARD_SIZE, BOX_SIZE */

(function (global) {

  Script.include('./config.js');

  function Sudoku() {}

  Sudoku.prototype.solve = function(state) {
    if (this.validate(state) === false) {
      return { invalid: true };
    }
    return this._backtrace(state, this.getCandidates(state));
  };

  Sudoku.prototype.generate = function(minFilledSquares) {
    var state, newState, candidates, result, i, order, filled;

    state = EMPTY_STATE;
    candidates = this.getCandidates(state);

    order = [];
    for (i = 0; i < STATE_LENGTH; i++) {
      candidates[i] = this._shuffleString(candidates[i]);
      order.push(i);
    }

    state = this._backtrace(state, candidates).solution;

    this._shuffle(order);
    filled = STATE_LENGTH;
    i = 0;

    while (i < STATE_LENGTH && filled >= minFilledSquares) {
      newState = this.setValue(state, order[i], EMPTY);
      result = this._backtrace(newState, this.getCandidates(newState));
      if (result.unique === true) {
        filled--;
        state = newState;
      }
      i++;
    }

    return state;
  };

  Sudoku.prototype.getCandidates = function(state) {
    var i, result;

    result = [];
    for (i = 0; i < STATE_LENGTH; i++) {
      result.push(DIGITS);
    }

    for (i = 0; i < STATE_LENGTH; i++) {
      if (state[i] !== EMPTY) {
        this._reduceCandidates(result, i, state[i]);
        result[i] = '';
      }
    }

    return result;
  };

  Sudoku.prototype.validate = function(state) {
    var index, tmp, i, j, value, row, col, boxRow, boxCol;

    for (index = 0; index < STATE_LENGTH; index++) {

      row = Math.floor(index / BOARD_SIZE);
      col = index % BOARD_SIZE;

      value = state[index];

      if (value === EMPTY) {
        continue;
      }

      for (i = 0; i < BOARD_SIZE; i++) {
        tmp = row * BOARD_SIZE + i;
        if (tmp !== index && state[tmp] === value) {
          return false;
        }
        tmp = col + i * BOARD_SIZE;
        if (tmp !== index && state[tmp] === value) {
          return false;
        }
      }

      boxRow = Math.floor(row / BOX_SIZE) * BOX_SIZE;
      boxCol = Math.floor(col / BOX_SIZE) * BOX_SIZE;

      for (i = boxRow; i < boxRow + BOX_SIZE; i++) {
        for (j = boxCol; j < boxCol + BOX_SIZE; j++) {
          tmp = i * BOARD_SIZE + j;
          if (tmp !== index && state[tmp] === value) {
            return false;
          }
        }
      }
    }
 
    return true;
  };

  Sudoku.prototype.setValue = function(state, index, value) {
    var before = state.substring(0, index);
    var after = state.substring(index + 1, STATE_LENGTH);
    return before + value + after;
  };

  Sudoku.prototype._reduceCandidates = function(candidates, index, value) {
    var tmp, i, j, row, col, boxRow, boxCol;

    row = Math.floor(index / BOARD_SIZE);
    col = index % BOARD_SIZE;

    for (i = 0; i < BOARD_SIZE; i++) {
      tmp = row * BOARD_SIZE + i;
      candidates[tmp] = candidates[tmp].replace(value, '');

      tmp = col + i * BOARD_SIZE;
      candidates[tmp] = candidates[tmp].replace(value, '');
    }

    boxRow = Math.floor(row / BOX_SIZE) * BOX_SIZE;
    boxCol = Math.floor(col / BOX_SIZE) * BOX_SIZE;

    for (i = boxRow; i < boxRow + BOX_SIZE; i++) {
      for (j = boxCol; j < boxCol + BOX_SIZE; j++) {
        if (i !== row && j !== col) {
          tmp = i * BOARD_SIZE + j;
          candidates[tmp] = candidates[tmp].replace(value, '');
        }
      }
    }
  };

  Sudoku.prototype._reduceUniqueFor = function(candidates, indexes) {
    var i, j, c, value, index, unique;
    for (i = 0; i < BOARD_SIZE; i++) {
      index = indexes[i];
      if (candidates[index].length <= 1) {
        continue;
      }
      for (c = 0; c < candidates[index].length; c++) {
        value = candidates[index][c];
        unique = true;
        for (j = 0; j < BOARD_SIZE; j++) {
          if (i !== j && candidates[indexes[j]].indexOf(value) !== -1) {
            unique = false;
            break;
          }
        }
        if (unique) {
          candidates[index] = value;
          break;
        }
      }
    }
  };

  Sudoku.prototype._reduceUnique = function(candidates, index) {
    var i, j, row, col, boxRow, boxCol;
    var rowIndexes, colIndexes, boxIndexes;

    row = Math.floor(index / BOARD_SIZE);
    col = index % BOARD_SIZE;

    rowIndexes = [];
    colIndexes = [];
    for (i = 0; i < BOARD_SIZE; i++) {
      rowIndexes.push(row * BOARD_SIZE + i);
      colIndexes.push(col + i * BOARD_SIZE);
    }
    this._reduceUniqueFor(candidates, rowIndexes);
    this._reduceUniqueFor(candidates, colIndexes);

    boxRow = Math.floor(row / BOX_SIZE) * BOX_SIZE;
    boxCol = Math.floor(col / BOX_SIZE) * BOX_SIZE;

    boxIndexes = [];
    for (i = boxRow; i < boxRow + BOX_SIZE; i++) {
      for (j = boxCol; j < boxCol + BOX_SIZE; j++) {
        boxIndexes.push(i * BOARD_SIZE + j);
      }
    }
    this._reduceUniqueFor(candidates, boxIndexes);
  };

  Sudoku.prototype._backtrace = function(state, candidates) {
    var steps, step, newStep, solutions, index, value;

    solutions = [];
    step = { state: state, index: 0, candidates: candidates };
    for (index = 0; index < STATE_LENGTH; index++) {
      if (state[index] === EMPTY) {
        this._reduceUnique(candidates, index);
      }
    }

    step.order = this._orderCandidates(candidates);

    steps = [step];

    while (steps.length > 0) {
      step = steps[steps.length - 1];
      index = step.order[step.index];

      if (step.state[index] !== EMPTY) {
        step.index++;
        if (step.index === STATE_LENGTH) {
          solutions.push(step.state);
          if (solutions.length === 2) {
            return { solution: solutions[0], unique: false };
          }
          steps.pop();
        }
        continue;
      }

      if (step.candidates[index].length === 0) {
        steps.pop();
        continue;
      }

      value = step.candidates[index][0];
      step.candidates[index] = step.candidates[index].substring(1);

      newStep = { index: 0, empty: step.empty - 1 };
      newStep.candidates = step.candidates.slice();
      newStep.state = this.setValue(step.state, index, value);
      this._reduceCandidates(newStep.candidates, index, value);
      this._reduceUnique(newStep.candidates, index);
      newStep.order = this._orderCandidates(newStep.candidates);
      steps.push(newStep);
    }

    if (solutions.length === 1) {
      return { solution: solutions[0], unique: true };
    }

    return { solution: false };
  };

  Sudoku.prototype._orderCandidates = function(candidates) {
    var i, order;

    order = [];
    for (i = 0; i < STATE_LENGTH; i++) {
      order.push(i);
    }

    order.sort(function(a, b) {
      return candidates[a].length - candidates[b].length;
    });

    return order;
  };

  Sudoku.prototype._shuffle = function(arr) {
    var i, r, tmp;

    for (i = 0; i < arr.length; i++) {
      r = Math.floor(Math.random() * arr.length);
      tmp = arr[r];
      arr[r] = arr[i];
      arr[i] = tmp;
    }
  };

  Sudoku.prototype._shuffleString = function(str) {
    var arr = str.split('');
    this._shuffle(arr);
    return arr.join('');
  };

  global.Sudoku = Sudoku;

}(typeof module !== 'undefined' ? module.exports : new Function('return this;')()));
