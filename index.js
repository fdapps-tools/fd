const Node = require('./src/Node');
const Network = require('./src/Network');
const Tunnel = require('./src/Tunnel');

module.exports = {
  init: Node.init,
  checkNodesIsUp: Node.checkNodesIsUp,
  syncJoinRequests: Node.syncJoinRequests,
  attachRoutes: Network.attachRoutes,
  startTunnel: Tunnel.startTunnel,
};