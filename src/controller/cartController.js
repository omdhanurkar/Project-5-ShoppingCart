const cartModel = require("../models/cartModel")
const productModel = require("../models/productModel")
const userModel = require("../models/userModel")
const check = require("../utility/validator")

//===============================================Create Cart================================================================

const createCart = async function (req, res) {
    try {
        let userId = req.params.userId

        let userCart = await cartModel.findOne({ userId: userId })
        if (!userCart) {
            let productId = req.body.productId
            if (!productId) { return res.status(400).send({ status: false, message: "Please enter product Id in request body" }) }

            if (!check.isValidObjectId(productId)) {
                return res.status(400).send({ status: false, message: "invalid product Id" })
            }

            let product = await productModel.findOne({ _id: productId, isDeleted: false })
            if (!product) return res.status(404).send({ status: false, message: "No product found" })

            let obj = {
                productId: product._id,
                quantity: 1
            }

            let createCart = await cartModel.create({ userId: userId, items: obj, totalPrice: product.price * obj.quantity, totalItems: 1 })
            return res.status(201).send({ status: true, message: "Success", data: createCart })
        }

        if (userCart) {
            let productId = req.body.productId
            if (!productId) { return res.status(400).send({ status: false, message: "Please enter product Id in request body" }) }

            if (!check.isValidObjectId(productId)) {
                return res.status(400).send({ status: false, message: "invalid product Id" })
            }

            let cartId = req.body.cartId
            if (!cartId) { return res.status(400).send({ status: false, message: "Please enter cart Id in request body" }) }

            if (!check.isValidObjectId(cartId)) {
                return res.status(400).send({ status: false, message: "invalid cart Id" })
            }

            let product = await productModel.findOne({ _id: productId, isDeleted: false })
            if (!product) return res.status(404).send({ status: false, message: "No product found" })

            let cart = await cartModel.findById({ _id: cartId })
            if (!cart) return res.status(404).send({ status: false, message: "No cart found with this ID" })

            let obj = {
                quantity: 1
            }
            let updateCart = await cartModel.findOneAndUpdate({ _id: cartId, userId: userId, "items.productId": productId },
                { $inc: { "items.$.quantity": 1, totalPrice: product.price * obj.quantity } },
                { new: true })

            if (!updateCart) {
                let id = req.body.productId
                let product = await productModel.findOne({ _id: id, isDeleted: false })
                let obj = {
                    productId: product._id,
                    quantity: 1
                }

                let updateCart = await cartModel.findOneAndUpdate(
                    { _id: req.body.cartId, userId: userId },

                    {
                        $push: { items: obj },
                        $inc: {

                            totalPrice: obj.quantity * product.price,
                            totalItems: 1
                        }
                    },
                    { new: true });
                return res.status(201).send({ status: true, message: "Success", data: updateCart })

            }
            return res.status(201).send({ status: true, message: "Success", data: updateCart })
        }

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

//===============================================Update Cart================================================================

const updateCart = async function (req, res) {
    try {
        let data = req.body
        let userId = req.params.userId
        let { cartId, productId, removeProduct } = data
        if (!check.isValidRequestBody(data)) { return res.status(400).send({ status: false, message: "Please enter data productId, cartId, and removeProduct value" }) }

        if (!check.isValidObjectId(productId)) {
            return res.status(400).send({ status: false, message: "invalid product Id" })
        }

        if (!check.isValidObjectId(cartId)) {
            return res.status(400).send({ status: false, message: "invalid cart Id" })
        }

        if (removeProduct == 1) {

            let checkCartId = await cartModel.findById({ _id: cartId })
            if (!checkCartId) return res.status(404).send({ status: false, message: "cart Id not found" })

            let checkproductId = await productModel.findOne({ _id: productId, isDeleted: false })
            if (!checkproductId) return res.status(404).send({ status: false, message: "product Id not found" })

            let cart = await cartModel.findOne({ _id: cartId, userId: userId, "items.productId": productId })
            if (!cart) return res.status(400).send({ status: false, message: "product is already deleted" })
            let array = cart.items
            let totalQuantity = 0
            for (let i = 0; i < array.length; i++) {
                if (array[i].productId == productId) {
                    totalQuantity = array[i].quantity
                }
            }

            totalQuantity = totalQuantity - 1

            if (totalQuantity == 0) {
                let product = await productModel.findOne({ _id: productId, isDeleted: false })
                if (!product) return res.status(404).send({ status: false, message: "product is not found" })

                let updatecart = await cartModel.findOneAndUpdate({ _id: cartId, userId: userId },
                    {
                        $pull: { items: { "productId": productId } },             //$pull will remove the entire object whenever condition is match
                        $inc: { totalItems: -1, totalPrice: -product.price }
                    }, { new: true })

                return res.status(200).send({ status: true, message: "Item deleted successfully", data: updatecart })

            }
            let product = await productModel.findOne({ _id: productId, isDeleted: false })
            if (!product) return res.status(404).send({ status: false, message: "product is not found" })

            let updateCart = await cartModel.findOneAndUpdate({ _id: cartId, userId: userId, "items.productId": productId },
                { $inc: { "items.$.quantity": -1, totalPrice: -product.price } },
                { new: true })

            return res.status(200).send({ status: true, message: "Success", data: updateCart })
        }

        if (removeProduct == 0) {
            let product = await productModel.findOne({ _id: productId, isDeleted: false })
            if (!product) return res.status(404).send({ status: false, message: "product is not found" })

            let checkCartId = await cartModel.findById({ _id: cartId })
            if (!checkCartId) return res.status(404).send({ status: false, message: "cart Id not found" })


            let cart = await cartModel.findOne({ _id: cartId, "items.productId": productId })
            if (!cart) return res.status(400).send({ status: false, message: "product is already deleted" })

            let productQuantity = 0
            let arr = cart.items
            for (let i = 0; i < arr.length; i++) {
                if (arr[i].productId == productId) {
                    productQuantity = arr[i].quantity
                }
            }
            let updatecart = await cartModel.findOneAndUpdate({ _id: cartId, userId: userId },
                {
                    $pull: { items: { "productId": productId } },             //$pull will remove the entire object whenever condition is match
                    $inc: { totalItems: -1, totalPrice: -product.price * productQuantity }
                }, { new: true })

            return res.status(200).send({ status: true, message: `Success`, data: updatecart })
        }
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

//==============================================Get cart by Id================================================================

const getCartById = async function (req, res) {
    try {

        let userId = req.params.userId
        // validation of Objectid in params
        if (!check.isValidObjectId(userId)) return res.status(400).send({ status: false, message: 'enter a valid objectId in params' })

        let user = await userModel.findById(userId);
        if (!user) return res.status(404).send({ status: false, message: 'no user found' })


        let cart = await cartModel.findOne({ userId: userId }, { "items._id": 0 }).select({ __v: 0 })

        // get the product document from product collection using populate
        if (!cart) return res.status(400).send({ status: false, message: 'cart is not present for this user' })
        return res.status(200).send({ status: true, message: 'Success', data: cart })

    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}

//===============================================Delete cart===============================================================

const deleteCart = async function (req, res) {
    try {
        let userId = req.params.userId
        // validation of Objectid in params
        if (!check.isValidObjectId(userId)) return res.status(400).send({ status: false, message: 'enter a valid objectId in params' })

        let user = await userModel.findById(userId);
        if (!user) return res.status(404).send({ status: false, message: 'no user found' })

        let cart = await cartModel.findOne({ userId: userId })
        if (!cart) return res.status(404).send({ status: false, message: 'cart is not present for this user' })
        if (cart.items.length == 0 && cart.totalPrice == 0 && cart.totalItems == 0) return res.status(400).send({ status: false, message: 'cart is already deleted' })

        await cartModel.findOneAndUpdate({ userId: userId }, { items: [], totalItems: 0, totalPrice: 0 }, { new: true })

        return res.status(204).send()       //204 status shows no content
    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}

module.exports = { createCart, updateCart, getCartById, deleteCart }