import { CodenamesClient } from '../source/codenames-client';

describe('CodenamesClient', () => {

  let client: CodenamesClient;

  beforeEach(() => {
    global.Entities = {} as any;
    global.MyAvatar = {} as any;
    client = new CodenamesClient();
  });

  it('Should create', () => {
    expect(client).toBeTruthy();
  });

  it('Should register mousePressOnEntity event listener', () => {
    (Entities as any).mousePressOnEntity = { connect: jasmine.createSpy('mousePressOnEntity') };
    // when
    client.preload('{abcd}');
    // then
    expect(Entities.mousePressOnEntity.connect).toHaveBeenCalled();
  });


});
