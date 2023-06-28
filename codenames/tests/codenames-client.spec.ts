import { CodenamesClient } from '../source/codenames-client';

describe('CodenamesClient', () => {
  
  let client: CodenamesClient;
  
  beforeEach(() => {
    client = new CodenamesClient();
  });
  
  it('Should create', () => {
    expect(client).toBeTruthy();
  });

});
