const create = require('../source/dixit-client.js');

describe("DixitClient", () => {

    let dixitClient;

    beforeEach(() => {
      global.Script = { include: () => {} };
      global.Entities = { };
      global.MyAvatar = { };
      global.DixitPanel = function () {};

      dixitClient = create();
    });

    it("Should create", () => {
        expect(dixitClient).toBeTruthy();
        expect(dixitClient.remotelyCallable).toEqual([
          'setHandImages',
          'setSubmitCount',
          'closePanel'
        ]);
    });

    it("Should call server", () => {
        Entities.callEntityServerMethod = jasmine.createSpy('callEntityServerMethod');
        MyAvatar.sessionUUID = '{1234567890}';

        dixitClient.entityId = '{abcd}';
        dixitClient.callServer('methodName', 'value');

        expect(Entities.callEntityServerMethod).toHaveBeenCalledWith(
            dixitClient.entityId,
            'methodName',
            [ '{1234567890}', 'value' ]
        );
    });

});
