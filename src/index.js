const { baseFolderHash } = require('../libs/hash')
const { getFile, updateFile } = require('../libs/file')
const nodeRequest = require('../libs/node-request')

const NODE_LIST_FILENAME = process.env.NODE_LIST_FILENAME || 'node-list'
const REQUEST_LIST_FILENAME = process.env.REQUEST_LIST_FILENAME || 'request-list'

class nodeManager {

  getNodeList() {
    return getFile(NODE_LIST_FILENAME)
  }

  async insertNode(node) {

    const nodes = await getFile(NODE_LIST_FILENAME) || []
    nodes.push(node)

    return updateFile(nodes, NODE_LIST_FILENAME)
  }

  async joinRequest(request) {
    console.log(`Request to Join: ${request}`)
    const requesteds = await getFile(REQUEST_LIST_FILENAME) || []
    requesteds.push(request)
    updateFile(requesteds, REQUEST_LIST_FILENAME)
  }

  // este método esta fazendo muita coisa, verificando qual esta ativo, atualizando o arquivo e ainda servido para trazer os atualizados em tempo real, isso precisa ser melhor, process.env.TUNNEL_URL)
  async checkNodesIsUp(filename = NODE_LIST_FILENAME) {
    console.log('synchronizing nodes')
    const lastcheck = Date.now()
    const hosts = await getFile(filename)

    await Promise.allSettled(hosts.map(host => this.checkHostIsUp(host, lastcheck)))

    const onlineNodes = hosts.filter(host => host.lastcheck == lastcheck || host.host == process.env.TUNNEL_URL)

    await updateFile(onlineNodes, filename)

    return getFile(filename)
  }

  async checkHostIsUp(node, lastcheck = Date.now()) {
    return new Promise((resolve, reject) => {
      nodeRequest.get(`${node.host}/stats`)
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
   * Esta função verifica a lista de nós pendentes de serem confirmados
   * Para que tenha uma analise concensual, a verificação inicial trata de inputar uma aprovação unica 
   * Cada nó da rede terá que verificar e quando o último verificar, ele deverá remover da lista de requests e incluir na de nós confirmados
   * 
   * Em tempo de desenvolvimento isso está extremamente complicado pois quando você altera o código o hash muda
   * @todo: Melhorar o esquema de assincronia e simplificar esse método, está muito complexo
   */
  async syncJoinRequests() {

    console.log('syncJoinRequests', process.env.TUNNEL_URL)
    const requesteds = await this.checkNodesIsUp(REQUEST_LIST_FILENAME)
    const nodes = await this.getNodeList()

    for (let index = 0; index < requesteds.length; index++) {
      const host = requesteds[index];

      const validation = { createdAt: Date.now(), host: process.env.TUNNEL_URL }
      await this.setApprovalOrInapproval(host, validation)

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
    await this.broadcastFile('REQUEST_LIST_FILENAME')
    await this.broadcastFile('NODE_LIST_FILENAME')

    console.log('syncJoinRequests finishing', requesteds)
  }

  // @todo: isso esta bem feio, tem que refatorar
  async setApprovalOrInapproval(host, validation) {
    // se o hash no host for igual ao do nó
    // @todo: talvez a verificação possa ser apenas do hash deste arquivo?
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

  /**
   * Esta função faz a verificação se o host fará parte de uma rede existente ou criará uma nova
   * A validaçãoo de confiança esta sendo realizada pelo hash do diretório raiz
   */
  async initNode() {

    const hash = await baseFolderHash()

    if (process.env.NETWORK_NODE_URL) {
      console.log(`trying join to network from ${process.env.NETWORK_NODE_URL} ...`)

      try {

        const node = { host: process.env.TUNNEL_URL, requested: Date.now(), applicationHash: hash }
        const response = await nodeRequest.post(`${process.env.NETWORK_NODE_URL}/join-request`, node)

        console.log('network response: ', response.data)

      } catch (error) {
        console.log('error', error)
        console.log('error: this network node is not available, change NETWORK_NODE_URL or starting as first node')
        process.exit();
      }

    } else {

      await this.insertNode({ host: process.env.TUNNEL_URL, lastcheck: Date.now(), applicationHash: hash })
      console.log(`dont did set network node, started as new network.`)

    }
  }

  async broadcastFile(file_attr) {
    const filename = process.env[file_attr]
    
    const nodes = await this.getNodeList()
    const file = await getFile(filename)

    const promises = nodes.map(node => {
      console.log(`broadcasting to ${node.host} about ${file_attr}`)
      if (node.host !== process.env.TUNNEL_URL) {
        return nodeRequest.post(`${node.host}/update-node-info`, { filename: file_attr, file })
      }
    })
    await Promise.allSettled(promises)
  }

  async receiveBroadCast(filename, data) {
    console.log('receiveBroadCast', filename, data)
    updateFile(data, process.env[filename])
  }

}

module.exports = new nodeManager();