
const jwt = require('jsonwebtoken')

const authentication = (req, res, next) => {
    try {
        let token = req.headers["authorization"].split(' ')
        //console.log(token)

        let token1 = token[1]
        jwt.verify(token1, 'Project5-Group48', function (err, decode) {
            if (err) {
                return res.status(401).send({ status: false, Message: err.message })
            } else {

                req.token1Data = decode;
                next()
            }
        })
    } catch (err) {
        res.status(500).send({ status: false, Message: err.message })
    }
}

module.exports = { authentication }