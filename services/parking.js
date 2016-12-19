function parkingService(options) {
    'use strict'

    const rp = require('request-promise-native')
    const url = 'http://ucn-parking.herokuapp.com/places.json'
    const redisClient = options.redisClient
    const log = require('../tools/logger.js').child({ service: 'parking' })
    const turf = {
        point: require('turf-point'),
        distance: require('turf-distance')
    }


    var parkingService = {}

    function reqOptions(method) {
        var opt = {
            uri: url,
            json: true
        }

        if (method) {
            opt.method = method
        }

        return opt
    }

    function getParkingLots() {
        var promise = new Promise((resolve, reject) => {
            redisClient.get('parkinglots', (err, res) => {
                if (res) {
                    resolve(JSON.parse(res))
                } else {
                    rp.get(reqOptions())
                        .then(lots => {
                            redisClient.set('parkinglots', JSON.stringify(lots))
                            redisClient.expire('parkinglots', 10)
                            resolve(lots)
                        })
                        .catch(err => {
                            log.fatal({ err: err }, 'failed to fetch parkinglots %s', err)
                            reject({ status: 500 })
                        })
                }
                if (err) {
                    log.fatal({ err: err }, 'redisClient.get parkinglots %s', err)
                    reject({ status: 500 })
                }
            })
        })
        return promise
    }

    function getLotsWithinDistance(location, maxDistance) {
        var promise = new Promise((resolve, reject) => {
            getParkingLots()
                .then(lots => {
                    let userPos = turf.point(location) // ["9.927242", "57.043110"]
                    let within = []

                    for (let lot of lots) {
                        let lotPos = turf.point([lot.longitude, lot.latitude])
                        let distance = turf.distance(userPos, lotPos, 'kilometers')
                        if (distance <= maxDistance) {
                            lot.distance = distance
                            within.push(lot)
                        }
                    }

                    // sort by distance
                    let sorted = within.sort((a, b) => {
                        if (a.distance > b.distance) {
                            return 1
                        }
                        if (a.distance < b.distance) {
                            return -1
                        }
                        return 0
                    })

                    resolve(sorted)
                })
                .catch(err => reject(err))
        })
        return promise
    }

    parkingService.getParkingLots = getParkingLots
    parkingService.getLotsWithinDistance = getLotsWithinDistance

    return parkingService
}

module.exports = parkingService
