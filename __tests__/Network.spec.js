const { attachRoutes, get } = require('../src/Network')

describe('src/Network', () => {

  it(`ensure that correct routes can be attached on express router`, async () => {
    const expectedRoutes = ['/stats', '/nodes', '/join-request', '/update-node-info']
    const routerMock = {
      routes: [],
      get: (name, callback) => routerMock.routes.push(name),
      post: (name, callback) => routerMock.routes.push(name),
    }
    attachRoutes(routerMock)
    expect(routerMock.routes).toEqual(expectedRoutes)
  })

  it('ensure get method has config and headers attributes', async () => {
    const getReturn = await get(`http://google.com`, {})
    expect(getReturn).toHaveProperty(['config', 'headers'])
  });

})