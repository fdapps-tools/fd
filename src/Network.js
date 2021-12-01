const REQUEST_LIST_FILENAME = process.env.REQUEST_LIST_FILENAME || 'request-list'
const NODE_LIST_FILENAME = process.env.NODE_LIST_FILENAME || 'node-list'

const axios = require('axios');
const { getFile, updateFile } = require('./Storage');
const express = require('express');

const instance = () => {
  return axios.create({
    timeout: 5000,
    headers: {
      'Bypass-Tunnel-Reminder': 'true',
      'Content-Type': 'application/json',
      'hash-code': ''
    }
  })
}

const joinRequest = async (request) => {
  console.log(`Request to Join: ${request}`)
  const requesteds = await getFile(REQUEST_LIST_FILENAME) || []
  requesteds.push(request)
  updateFile(requesteds, REQUEST_LIST_FILENAME)
}

const receiveBroadCast = async (filename, data) => {
  console.log('receiveBroadCast', filename, data)
  updateFile(data, process.env[filename])
}

module.exports = {

  /**
   * attachRoutes
   * @todo: think if is good idea keep routes injection in this file
   * @todo: prepare for multiple routers engine
   */
  attachRoutes(router) {

    // support just express route instance for now
    if (!Object.getPrototypeOf(router) == express.Router) {
      return console.error('log', 'attachRoutes: router is not express.Router')
    }

    router.get('/stats', (req, res, next) => res.send({ url: process.env.TUNNEL_URL }));

    router.get('/nodes', async (req, res) => {

      try {
        const list = await getFile(NODE_LIST_FILENAME)
        res.setHeader('Access-Control-Allow-Origin', '*');
        return res.json(list)
      } catch (error) {
        console.log('ERROR', error)
        return res.status(500).send({ error: 'Something failed!' })
      }

    })

    router.post('/join-request', async (req, res) => {
      try {
        await joinRequest(req.body)
        return res.json({ status: 'PENDING' })
      }
      catch (error) {
        console.log('ERROR', error)
        return res.status(500).send({ error: 'Something failed!' })
      }
    })

    router.post('/update-node-info', (req, res) => {
      console.log('post: updateNodeInfo')
      const { filename, file } = req.body
      receiveBroadCast(filename, file)
      return res.json(true)
    })

  },

  post(url, data) {
    return instance().post(url, data)
  },

  get(url, data) {
    return instance().get(url, data)
  },

}