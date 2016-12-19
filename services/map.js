'use strict'

const GoogleMapsAPI = require('googlemaps')
const apiKey = require('../settings').GOOGLEMAPS_API_KEY
const publicConfig = {
    key: apiKey,
    stagger_time: 1000,
    encode_polylines: false,
    secure: true
}
const gmAPI = new GoogleMapsAPI(publicConfig)

function create(options) {
    let markers = []
    let userMarker = {
        size: 'mid',
        color: 'blue',
        location: `${options.userLocation[1]},${options.userLocation[0]}`
    }

    markers.push(userMarker)

    for (const [i, parkinglot] of options.parkingLots.entries()) {
        let marker = {
            location: `${parkinglot.latitude},${parkinglot.longitude}`,
            label: String.fromCharCode(65 + i)
        }
        markers.push(marker)
    }

    let params = {
        center: `${options.userLocation[1]},${options.userLocation[0]}`,
        zoom: 14,
        size: '500x400',
        maptype: 'roadmap',
        markers: markers
    }
    let map = gmAPI.staticMap(params) // static map URL

    return map;
}

module.exports = {
    create: create
}
