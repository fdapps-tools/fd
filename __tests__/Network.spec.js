const { instance } = require('../src/Network')

describe('src/Network', () => {

  it('ensure node-request instance has bypass custom header', async () => {
    const { headers } = instance().defaults
    
    expect(headers).toHaveProperty('Bypass-Tunnel-Reminder')
  });

})