const cartModel = require("../models/cartModel")
const productModel = require("../models/productModel")
const userModel = require("../models/userModel")
const check = require("../utility/validator")

const createCart = async function (req, res) {
    try {
        let userId = req.params.userId

        if (!check.isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "invalid user Id" })
        }

        let userCart = await cartModel.findOne({ userId: userId })
        if (!userCart) {
            let productId = req.body.productId

            if (!check.isValidObjectId(productId)) {
                return res.status(400).send({ status: false, message: "invalid product Id" })
            }
            let product = await productModel.findOne({ _id: productId, isDeleted: false })
            let obj = {
                productId: product._id,
                quantity: 1
            }
            let createCart = await cartModel.create({ userId: userId, items: obj, totalPrice: product.price * obj.quantity, totalItems: 1 })
            return res.send({ status: true, data: createCart })
        }

        if (userCart) {
            let productId = req.body.productId

            if (!check.isValidObjectId(productId)) {
                return res.status(400).send({ status: false, message: " invalid product Id" })
            }

            let cartId = req.body.cartId
            if (!check.isValidObjectId(cartId)) {
                return res.status(400).send({ status: false, message: " invalid cart Id" })
            }

            let product = await productModel.findOne({ _id: productId, isDeleted: false })
            // let cart = await cartModel.findOne({ _id: cartId })
            let obj = {
                quantity: 1
            }
            let updateCart = await cartModel.findOneAndUpdate({ _id: cartId, "items.productId": productId }, { $inc: { "items.$.quantity": 1, totalPrice: product.price * obj.quantity } }, { new: true })
            // return res.send({ status: true, data: updateCart })

            if (!updateCart) {
                let id = req.body.productId
                let product = await productModel.findOne({ _id: id, isDeleted: false })
                let obj = {
                    productId: product._id,
                    quantity: 1
                }

                let updateCart = await cartModel.findOneAndUpdate(
                    { _id: req.body.cartId },
                    {
                        $push: { items: obj },
                        $inc: {

                            totalPrice: obj.quantity * product.price,
                            totalItems: 1
                        }
                    },
                    { new: true });
                return res.status(200).send({ status: true, message: "product added push successfully!", data: updateCart })

            }
            return res.send({ status: true, data: updateCart })
        }




        // let userExist = await userModel.findById({ _id: userId })
        // if (!userExist) return res.status(400).send({ status: false, message: "user not Exist" })

        // let data = req.body

        // let { productId, cartId, quantity } = data

        // // if (!check.isValidRequestBody(data)) { return res.status(400).send({ status: false, message: "Please enter data to create Cart" }) }

        // if (!productId) { return res.status(400).send({ status: false, message: "Product Id is mandatory" }) }



        // let productExist = await productModel.findOne({ _id: productId, isDeleted: false })
        // if (!productExist) return res.status(400).send({ status: false, message: "product not Exist" })

        // // if (!cartId) { return res.status(400).send({ status: false, message: "Cart Id is mandatory" }) }



        // let cartExist = await cartModel.findById({ _id: cartId })
        // if (!cartExist) return res.status(400).send({ status: false, message: "cart not Exist" })

        // // if (!quantity)  { return res.status(400).send({ status: false, message: "quantity is mandatory" }) }
        // if (quantity) {
        //     if (!check.isvalidNumber(quantity) && quantity < 1) {
        //          return res.status(400).send({ status: false, message: "quantity must be minimum 1" }) 
        //     }
        //     else {
        //         data.quantity = 1
        //     }
        // }


    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}


module.exports = { createCart }