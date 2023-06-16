const create = require('../source/sudoku-client.js');

describe("SudokuClient", () => {

    let sudokuClient;

    beforeEach(() => {
      global.Script = { include: () => {} };
      global.Entities = { };
      global.MyAvatar = { };
      global.Sudoku = function () {};
      global.SudokuOverlay = function () {};

      sudokuClient = create();
    });

    it("Should create", () => {
        expect(sudokuClient).toBeTruthy();
        expect(sudokuClient.remotelyCallable).toEqual([
          'showDigitOverlay',
          'showSolved',
          'giveHint'
        ]);
    });

    it("Should call server", () => {
        Entities.callEntityServerMethod = jasmine.createSpy('callEntityServerMethod');
        MyAvatar.sessionUUID = '{1234567890}';

        sudokuClient.entityId = '{abcd}';
        sudokuClient.callServer('methodName', ['value']);

        expect(Entities.callEntityServerMethod).toHaveBeenCalledWith(
            sudokuClient.entityId,
            'methodName',
            [ '{1234567890}', 'value' ]
        );
    });

});
