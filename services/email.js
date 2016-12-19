'use strict'

const nodemailer = require('nodemailer')
const sgTransport = require('nodemailer-sendgrid-transport')
const apiKey = require('../settings').SENDGRID_API_KEY
const options = {
    auth: {
        api_key: apiKey
    }
}
const mailer = nodemailer.createTransport(sgTransport(options));
const log = require('../tools/logger.js').child({ service: 'email' })
const juice = require('juice')
const fs = require('fs')
const pug = require('pug')
const compileTemplate = pug.compileFile('templates/email.pug')
const style = fs.readFileSync('templates/email.css')

function send(options) {
    var email = {
        to: [options.email],
        from: 'parking@ucn.dk',
        subject: 'Nearby parking lots',
        text: '',
        html: render(options)
    }

    mailer.sendMail(email, (err, res) => {
        if (err) {
            log.warn({ err: err }, 'sendMail %s', err)
        }
    })
}

function render(options) {
    options.css = style
    let compiled = compileTemplate(options)
    return juice(compiled)
}

module.exports = {
    send: send,
    html: render
}
