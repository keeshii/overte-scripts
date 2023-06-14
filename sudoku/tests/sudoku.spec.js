describe("Sudoku", () => {

    var sudoku;
    var emptyState;

    beforeEach(() => {
      global.Script = { include: () => {} };
      global.STATE_LENGTH = 81;
      global.EMPTY = '.';
      global.DIGITS = '123456789';
      global.BOARD_SIZE = 9;
      global.BOX_SIZE = 3;

      const Sudoku = require('../source/sudoku.js').Sudoku;
      sudoku = new Sudoku();

      emptyState = Array(STATE_LENGTH + 1).join('.');
    });

    it("Should solve an empty", () => {
        // given
        const state = emptyState;
        // when
        const result = sudoku.solve(state);
        // then
        expect(result).toEqual({
          solution: '123456789456789123789123456231674895875912364694538217317265948542897631968341572',
          unique: false
        });
    });

    it("Should return invalid", () => {
        // given
        const state = '1..1..1..........................................................................';
        // when
        const result = sudoku.solve(state);
        // then
        expect(result).toEqual({ invalid: true });
    });

    it("Should return no solutions", () => {
        // given
        const state = '123.........4...........4........................................................';
        // when
        const result = sudoku.solve(state);
        // then
        expect(result).toEqual({ solution: false });
    });
    
});
