#!/usr/bin/env node

'use strict'

const prod = process.env.PROD || false
const express = require('express')
const redisClient = prod ? require('redis').createClient({ host: 'redis' }) : require('redis').createClient({ host: 'localhost' })
const parkingRouter = require('./routes/parking')({ redisClient: redisClient })
const bodyParser = require('body-parser')
const PORT = process.env.PORT || 9000
const app = express()
const RateLimit = require('express-rate-limit')
const RedisStore = require('rate-limit-redis')
const log = require('./tools/logger.js')
if (prod) {
    // datadog monitoring
    const dogstatsd = require('node-dogstatsd').StatsD
    const ddOptions = {
        dogstatsd: new dogstatsd('datadog', 8125),
        response_code: true,
        tags: ['app:ucn_parkingads']
    }
    const connectDatadog = require('connect-datadog')(ddOptions)
    app.use(connectDatadog)
    console.log('Datadog monitoring enabled')
}

const apiLimiter = new RateLimit({
    store: new RedisStore({
        client: redisClient
    }),
    max: 1, // limit each IP to 1 requests per windowMs
    delayMs: 10000, // disable delaying - full speed until the max limit is reached
    message: 'api request are limited to 1 per minute',
    keyGenerator: req => {
        return req.ip
    }
})

app.use(bodyParser.json())
app.use(express.static('app'))

// set routes
app.use('/api/parking', parkingRouter)

// apply limiter to all api requests
app.use('/api/', apiLimiter)

app.listen(PORT)
log.info('Running on port: ' + PORT)
console.log('Running on port:', PORT)

// try to shutdown gracefully
process.on('SIGINT', () => {
    redisClient.quit()
    log.fatal('SIGINT recieved')
})
