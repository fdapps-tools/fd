const nodeManager = require('../src')

describe('libs/node-request', () => {

  it('ensure node-request instance has bypass custom header', async () => {
    const { headers } = nodeManager.instance().defaults
    
    expect(headers).toHaveProperty('Bypass-Tunnel-Reminder')
  });

})