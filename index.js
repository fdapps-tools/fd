const Node = require('./src/Node');
const Network = require('./src/Network');

module.exports = {
  init: Node.init,
  checkNodesIsUp: Node.checkNodesIsUp,
  syncJoinRequests: Node.syncJoinRequests,
  attachRoutes: Network.attachRoutes
};