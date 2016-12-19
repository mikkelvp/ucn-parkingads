#!/usr/bin/env node

'use strict'

const prod = process.env.PROD
const url = 'https://www.coolshop.dk'
const uri = '/s%C3%B8g/+/vis+kun=in-stock/?sort=sales_rank+asc'
const express = require('express')
const PORT = process.env.PORT || 9100
const app = express()
const apiRouter = express.Router()
const redisClient = prod ? require('redis').createClient({ host: 'redis' }) : require('redis').createClient({ host: 'localhost' })
const rp = require('request-promise-native')
const cheerio = require('cheerio')
const juice = require('juice')
const fs = require('fs')
const pug = require('pug')
const compileTemplate = pug.compileFile('template.pug')
const style = fs.readFileSync('style.css')

function render(products) {
    let p = products
    let productPairs = []
    let compiled
    // split products up so no more than 2 are displayed on the same line
    while (p.length) {
        productPairs.push(p.splice(0, 2))
    }
    compiled = compileTemplate({ productPairs: productPairs, css: style })
    
    return juice(compiled)
}

function fetch(res) {
    rp.get({ uri: url + uri, json: true })
        .then(data => {
            let urls = []
            let promises = []
            let $ = cheerio.load(data)
            let products = $('.productitem a', '#search-products').slice(0, 4)

            products.each((i, a) => {
                urls.push(url + a.attribs.href + '.json')
            })

            for (let productUrl of urls) {
                promises.push(rp.get({ uri: productUrl, json: true }))
            }

            Promise.all(promises).then(products => {
                let html = render(products)
                res.json({ html: html })
                redisClient.set('ads', html)
                redisClient.expire('ads', 60000)
            })
        })
}

apiRouter.get('/top', (req, res) => {
    redisClient.get('ads', (err, ads) => {
        if (ads) {
            res.json({ html: ads })
        } else {
            fetch(res)
        }
        if (err) {
            fetch(res)
        }
    })
})

// For development use
apiRouter.get('/html', (req, res) => {
    redisClient.del('ads')

    var cb = function(obj) {
        res.send(obj.html)
    }

    fetch({ json: cb })
})

app.use('/api/', apiRouter)

app.listen(PORT);
console.log('Running on http://localhost:' + PORT)
