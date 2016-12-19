'use strict'

const prod = process.env.PROD || false
const rp = require('request-promise-native')
const url = prod ? 'http://adservice_server/api/top' : 'http://localhost:9100/api/top'

function get() {
    return rp.get({ uri: url, json: true })
}

module.exports = {
    get: get
}
