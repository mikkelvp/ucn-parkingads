'use strict'

const bunyan = require('bunyan')
const log = bunyan.createLogger({
    name: 'parkingads',
    streams: [{
        path: './logs/default.log'
    }],
    serializers: {
        req: bunyan.stdSerializers.req,
        res: bunyan.stdSerializers.res,
        err: bunyan.stdSerializers.err
    }
})

module.exports = log
