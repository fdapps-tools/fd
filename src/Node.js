const NODE_LIST_FILENAME = process.env.NODE_LIST_FILENAME || 'node-list'
const REQUEST_LIST_FILENAME = process.env.REQUEST_LIST_FILENAME || 'request-list'
const { baseFolderHash } = require('./Hash');
const { getFile, updateFile } = require('./Storage');
const { post, get } = require('./Network');

/**
 * @class Node
 * @description Main class for the Node Management
 * 
 * @todo: improve module organization and responsibilities
 * @todo: add unit tests
 * @todo: check correct methods need be exported
 */
module.exports = (() => {

  /**
   * Main function to initialize the node, new node or join node to network
   */
  async function init() {

    // @todo: check if baseFolderHash is valid after modules are loaded
    const hash = await baseFolderHash()

    if (process.env.NETWORK_NODE_URL) {
      console.log(`trying join to network from ${process.env.NETWORK_NODE_URL} ...`)

      try {

        const node = { host: process.env.TUNNEL_URL, requested: Date.now(), applicationHash: hash }
        const response = await post(`${process.env.NETWORK_NODE_URL}/join-request`, node)

        console.log('network response: ', response.data)

      } catch (error) {
        console.log('error', error)
        console.log('error: this network node is not available, change NETWORK_NODE_URL or starting as first node')
        process.exit();
      }

    } else {

      await insertNode({ host: process.env.TUNNEL_URL, lastcheck: Date.now(), applicationHash: hash })
      console.log(`dont did set network node, started as new network.`)

    }
  }

  function getNodeList() {
    return getFile(NODE_LIST_FILENAME)
  }

  async function insertNode(node) {

    const nodes = await getFile(NODE_LIST_FILENAME) || []
    nodes.push(node)

    return updateFile(nodes, NODE_LIST_FILENAME)
  }

  // @todo: simplify this - many functions in some file
  async function checkNodesIsUp(filename = NODE_LIST_FILENAME) {
    console.log('synchronizing nodes')
    const lastcheck = Date.now()
    const hosts = await getFile(filename)

    await Promise.allSettled(hosts.map(host => checkHostIsUp(host, lastcheck)))

    const onlineNodes = hosts.filter(host => host.lastcheck == lastcheck || host.host == process.env.TUNNEL_URL)

    await updateFile(onlineNodes, filename)

    return getFile(filename)
  }

  async function checkHostIsUp(node, lastcheck = Date.now()) {
    return new Promise((resolve, reject) => {
      get(`${node.host}/stats`)
        .then(response => {
          if (response.data.url === node.host) {
            node.lastcheck = lastcheck
            resolve(true)
          } else {
            reject(false)
          }
        })
        .catch(error => {
          console.log(node.host, error.response.status)
          reject(false)
        })
    })
  }

  /**
   * Consensous algorithm check approvations/unnaprovations nodes
   * Check fully approved or unnaprovated nodes and remove them from the request list
   * 
   * @todo: how to simplify this?
   */
  async function syncJoinRequests() {

    console.log('syncJoinRequests', process.env.TUNNEL_URL)
    const requesteds = await checkNodesIsUp(REQUEST_LIST_FILENAME)
    const nodes = await getNodeList()

    for (let index = 0; index < requesteds.length; index++) {
      const host = requesteds[index];

      const validation = { createdAt: Date.now(), host: process.env.TUNNEL_URL }
      await setApprovalOrInapproval(host, validation)

      // se todos os nós já tiverem aprovado
      if (host.approvations?.length >= nodes.length) {
        // remover dessa lista
        requesteds.splice(index, 1)

        // incluir na lista de hosts
        nodes.push(host)

        continue
      }

      if (host.unnaprovations?.length >= nodes.length) {
        // remover dessa lista
        requesteds.splice(index, 1)
      }
    }

    // atualiza o arquivo de requests
    await updateFile(requesteds, REQUEST_LIST_FILENAME)

    // atualiza o arquivo de nós
    await updateFile(nodes, NODE_LIST_FILENAME)

    // informa sobre as mudanças
    await broadcastFile('REQUEST_LIST_FILENAME')
    await broadcastFile('NODE_LIST_FILENAME')

    console.log('syncJoinRequests finishing', requesteds)
  }

  // @todo: this is a ugly function, refactor
  async function setApprovalOrInapproval(host, validation) {
    // se o hash no host for igual ao do nó
    if (host.applicationHash === await baseFolderHash()) {
      console.log(`approving: ${host.host}`)
      if (host.approvations) {
        // evita que seja aprovado duas vezes
        if (!host.approvations.find(approval => approval.host === process.env.TUNNEL_URL)) {
          host.approvations.push(validation)
        }
      } else {
        host.approvations = [validation]
      }
    } else {
      console.log(`unnapproving: ${host.host}`)
      if (host.unnaprovations) {
        // evita que seja desaprovado duas vezes
        if (!host.unnaprovations.find(approval => approval.host === process.env.TUNNEL_URL)) {
          host.unnaprovations.push(validation)
        }
      } else {
        host.unnaprovations = [validation]
      }
    }
    console.log('exiting setApprovalOrInapproval')
  }

  async function broadcastFile(file_attr) {
    const filename = process.env[file_attr]

    const nodes = await getNodeList()
    const file = await getFile(filename)

    const promises = nodes.map(node => {
      console.log(`broadcasting to ${node.host} about ${file_attr}`)
      if (node.host !== process.env.TUNNEL_URL) {
        return post(`${node.host}/update-node-info`, { filename: file_attr, file })
      }
    })
    await Promise.allSettled(promises)
  }

  return {
    init,
    checkNodesIsUp,
    syncJoinRequests
  }

})()