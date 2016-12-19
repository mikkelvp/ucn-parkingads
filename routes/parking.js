function parkingRoutes(options) {
    'use strict'

    const express = require('express')
    const redisClient = options.redisClient
    const router = express.Router()
    const parkingService = require('../services/parking')({ redisClient: redisClient })
    const emailService = require('../services/email')
    const mapService = require('../services/map')
    const adService = require('../services/ad')
    const log = require('../tools/logger.js').child({ router: 'parking' })


    router.get('/', (req, res) => {
        parkingService.getParkingLots()
            .then(parkingLots => res.json(parkingLots))
            .catch(err => log.warn({ err: err }, 'parkingService.getParkingLots %s', err))
    })

    router.post('/distance', (req, res) => {
        let userLocation = req.body.userLocation
        let maxDistance = req.body.maxDistance
        let email = req.body.email
        let options = { email }

        if (!userLocation || !maxDistance || !email) {
            res.status(500).json({ msg: 'input missing' })
        }

        let getAds = adService.get()

        parkingService.getLotsWithinDistance(userLocation, maxDistance)
            .then(parkingLots => {
                options.parkingLots = parkingLots
                options.staticMap = mapService.create({
                    userLocation: userLocation,
                    parkingLots: parkingLots
                })

                getAds.then(ads => {
                    options.ads = ads.html
                    emailService.send(options)
                    res.json({ success: true })
                }).catch(err => {
                    log.warn({ err: err }, 'adService.get %s', err)
                    emailService.send(options)
                    res.json({ success: false })
                })
            })
            .catch(err => {
                res.status(500).json({})
                log.warn({
                    err: err,
                    userLocation: userLocation,
                    maxDistance: maxDistance
                }, 'parkingService.getLotsWithinDistance %s', err)
            })
    })

    return router
}

module.exports = parkingRoutes
