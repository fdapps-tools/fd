const { instance } = require('../src/Network')

describe('libs/node-request', () => {

  it('ensure node-request instance has bypass custom header', async () => {
    const { headers } = instance().defaults
    
    expect(headers).toHaveProperty('Bypass-Tunnel-Reminder')
  });

})