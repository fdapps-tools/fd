const { hashElement } = require('folder-hash');
const nodeManager = require('../src')

describe('libs/hash', () => {

  it('ensure baseFolderHash return correct hash from backend root folder', async () => {
    const options = {
      folders: { exclude: ['.*', 'node_modules', 'test_coverage', 'localDB'] },
      files: { include: ['*.js', '*.json'] },
    };

    const { hash } = await hashElement('.', options)
    const hashFromLib = await nodeManager.baseFolderHash()

    expect(hash).toEqual(hashFromLib)
  });

})