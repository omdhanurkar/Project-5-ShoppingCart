
const jwt = require('jsonwebtoken')
const mongoose = require("mongoose");
//const userModel = require("../models/userModel")

const authentication = (req, res, next) => {
    try {
        let token = req.headers["authorization"].split(' ')

        token = token[1]
        jwt.verify(token, 'Project5-Group48', function (err, decode) {
            if (err) {
                return res.status(401).send({ status: false, message: err.message })
            } else {

                req.decodedToken = decode;
                next()
            }
        })
    } catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}

const authorization = async function (req, res, next) {
    try {
        let userId = req.params.userId
        if (!mongoose.isValidObjectId(userId)) {
            return res.status(400).send({ status: false, msg: 'Please enter correct userId Id' })
        }
        let userLoggedIn = req.decodedToken.userId
        if (userId != userLoggedIn) {
            return res.status(403).send({ status: false, message: "you are not authorized" })
        }
        next()
    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}



module.exports = { authentication, authorization }