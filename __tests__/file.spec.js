const nodeManager = require('../src')
const FILENAME = 'test-file'
let dataTest = []

describe('libs/files', () => {

  it('ensure is possible update or create one local file localDB/*.state by name and json data', async () => {
    dataTest = [{
      "host": 'http://test-host.com',
      "applicationHash": 'simpleHash',
      "lastcheck": 2212354897461
    }]

    const file = await nodeManager.updateFile(dataTest, FILENAME)
    expect(file).toEqual(true)
  });

  it('ensure is possible get one local file localDB/*.state by name', async () => {
    const file = await nodeManager.getFile(FILENAME)
    expect(file).toEqual(expect.arrayContaining(dataTest));
  });

})