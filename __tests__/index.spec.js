const NodeManager = require('../index')

describe('index', () => {

  it('ensure correct export of modules used by the backend service', async () => {
    expect(NodeManager).toHaveProperty('init', 'checkNodesIsUp', 'syncJoinRequests', 'attachRoutes', 'startTunnel')
  });

})
