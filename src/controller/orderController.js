const orderModel = require("../models/orderModel")
const cartModel = require("../models/cartModel")
const check = require("../utility/validator")

const createOrder = async function (req, res) {
    try {
        let data = req.body;

        const userId = req.params.userId

        const { cartId, cancellable, status } = data

        if (Object.keys(data).length == 0) {
            return res.status(400).send({ status: false, Message: 'Please provide some details' });
        }

        if (!check.isValidObjectId(cartId)) {
            return res.status(400).send({ status: false, Message: 'Please provide a valid cart Id' })
        }

        const cart = await cartModel.findOne({ userId })
        if (!cart) {
            return res.status(404).send({ status: false, Message: 'cart not found by this user' })
        }
        if (cart._id != cartId) {
            return res.status(400).send({ status: false, Message: 'user  not belong this cart' })
        }

        if (cancellable) {
            if (!["true", "false"].includes(cancellable)) {
                return res.status(400).send({ status: false, Message: 'Please enter only Boolean (T/F)' })
            }
        }

        if (status) {
            if (status !== 'pending') {
                return res.status(400).send({ status: true, Message: 'status will be pending while you order' })
            }
        }

        let { items, totalPrice, totalItems } = cart

        let totalQuantity = 0;

        items.map(item => totalQuantity += item.quantity)

        const Obj = { userId, items, totalPrice, totalItems, totalQuantity, cancellable }

        if (cart.items.length == 0) {
            return res.status(200).send({ status: true, Message: 'ORDER ALREADY CREATED' })
        }

        const createFinal = await orderModel.create(Obj)

        await cartModel.updateOne({ userId }, { items: [], totalPrice: 0, totalItems: 0 })

        return res.status(201).send({ status: true, Message: 'ORDER SUCCESSFULLY CREATED', data: createFinal })

    } catch (error) {
        res.status(500).send({ status: false, Message: error.message })
    }
}

const updateOrder = async function (req, res) {
    try {
        const userId = req.params.userId

        const data = req.body

        let { orderId, status } = data

        if (Object.keys(data).length == 0) {
            return res.status(400).send({ status: false, message: 'Please provide orderId and status to update order' })
        }

        if (!check.isValidObjectId(orderId)) {
            return res.status(400).send({ status: false, message: 'Please provide valid orderId.' })
        }

        if (!check.isValid(status)) {
            return res.status(400).send({ status: false, message: 'Status is required' })
        }

        if (!["completed", "cancelled"].includes(status)) {
            return res.status(400).send({ status: false, message: 'Status should be only "completed" or "cancelled"' })
        }

        const cartId = await cartModel.findOne({ userId })
        if (!cartId) {
            return res.status(404).send({ status: false, message: `Cart does not exist for this Id ${userId}` })
        }

        const userOrder = await orderModel.findOne({ _id: orderId, userId })
        if (!userOrder) {
            return res.status(404).send({ status: false, message: `Order does not exist for this Id ${userId}` })     //here using template literal
        }

        if (userOrder.status == 'completed' || userOrder.status == 'cancelled') {
            return res.status(200).send({ status: false, message: "The status is already updated." })
        }

        if (status == "cancelled") {
            if (userOrder.cancellable == false) {
                return res.status(400).send({ status: false, message: "This order can't be cancelled because it is already ordered" })
            }
        }

        const updateOrder = await orderModel.findOneAndUpdate({ _id: orderId, userId }, { status }, { new: true })
        return res.status(200).send({ status: true, message: "Order updated successfully", data: updateOrder })

    } catch (error) {
        res.status(500).send({ status: false, Message: error.message })
    }
}

module.exports = { createOrder, updateOrder }
