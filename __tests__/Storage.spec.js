const { updateFile, getFile } = require('../src/Storage');
const fs = require('fs');
const FILENAME = 'test-file'
let dataTest = []

describe('src/Storage', () => {

  it('ensure is possible get one local file localDB/*.state by name', async () => {
    const file = await getFile(FILENAME)
    expect(file).toEqual(expect.arrayContaining(dataTest));
  });

  it('ensure empty array return when file not exists', async () => {
    const filePath = `${__dirname}/../src/localDB/${FILENAME}.state`
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }
    const file = await getFile(FILENAME)
    expect(file).toEqual(expect.arrayContaining(dataTest));
  });

  it('ensure is possible update or create one local file localDB/*.state by name and json data', async () => {
    dataTest = [{
      "host": 'http://test-host.com',
      "applicationHash": 'simpleHash',
      "lastcheck": 2212354897461
    }]

    const file = await updateFile(dataTest, FILENAME)
    expect(file).toEqual(true)
  });


})