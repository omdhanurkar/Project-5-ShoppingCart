const orderModel = require("../models/orderModel")
const cartModel = require("../models/cartModel")
const check = require("../utility/validator")
const userModel = require("../models/userModel")

//===============================================Create Order================================================================

const createOrder = async function (req, res) {
    try {
        let data = req.body;

        const userId = req.params.userId

        const { cartId, cancellable, status } = data

        if (Object.keys(data).length == 0) {
            return res.status(400).send({ status: false, message: 'Please provide some details' });
        }

        if (!check.isValidObjectId(cartId)) {
            return res.status(400).send({ status: false, message: 'Please provide a valid cart Id' })
        }

        const cart = await cartModel.findOne({ _id: cartId, userId: userId })
        if (!cart) {
            return res.status(404).send({ status: false, message: 'cart not found by this user' })
        }
        if (cart._id != cartId) {
            return res.status(400).send({ status: false, message: 'user  not belong this cart' })
        }

        if (cancellable) {
            if (!["true", "false"].includes(cancellable)) {
                return res.status(400).send({ status: false, message: 'Please enter only Boolean (T/F)' })
            }
        }

        if (status) {
            if (status !== 'pending') {
                return res.status(400).send({ status: true, message: 'status will be pending while you order' })
            }
        }

        let { items, totalPrice, totalItems } = cart

        let totalQuantity = 0;

        items.map(item => totalQuantity += item.quantity)

        const Obj = { userId, items, totalPrice, totalItems, totalQuantity, cancellable }

        if (cart.items.length == 0) {
            return res.status(200).send({ status: true, message: 'Order is already created' })
        }

        const createFinal = await orderModel.create(Obj)

        await cartModel.updateOne({ userId }, { items: [], totalPrice: 0, totalItems: 0 })

        return res.status(201).send({ status: true, message: 'Success', data: createFinal })

    } catch (error) {
        res.status(500).send({ status: false, message: error.message })
    }
}

//===============================================Update Order================================================================

// const updateOrder = async function (req, res) {
//     try {
//         const userId = req.params.userId

//         const data = req.body

//         let { orderId, cartId, status } = data

//         if (Object.keys(data).length == 0) {
//             return res.status(400).send({ status: false, message: 'Please provide orderId and status to update order' })
//         }

//         if (!check.isValidObjectId(orderId)) {
//             return res.status(400).send({ status: false, message: 'Please provide valid orderId.' })
//         }

//         if (!check.isValid(status)) {
//             return res.status(400).send({ status: false, message: 'Status is required' })
//         }

//         if (!["completed", "cancelled"].includes(status)) {
//             return res.status(400).send({ status: false, message: 'Status should be only "completed" or "cancelled"' })
//         }

//         // cartId = await cartModel.findOne({ _id: cartId, userId: userId })
//         // if (!cartId) {
//         //     return res.status(404).send({ status: false, message: `Cart does not exist for this Id ${userId}` })
//         // }

//         const userOrder = await orderModel.findOne({ _id: orderId})
//         if (!userOrder) {
//             return res.status(404).send({ status: false, message: `Order does not exist for this Id ${userId}` })     //here using template literal
//         }

//         // if (userOrder.status == 'completed' || userOrder.status == 'cancelled') {
//         //     return res.status(200).send({ status: false, message: "The status is already updated." })
//         // }

//         if (status == "cancelled") {
//             if (userOrder.cancellable == false) {
//                 return res.status(400).send({ status: false, message: "This order can't be cancelled because it is already ordered" })
//             }
//         }

//         const updateOrder = await orderModel.findOneAndUpdate({ _id: orderId, userId }, { status }, { new: true })
//         return res.status(200).send({ status: true, message: "Success", data: updateOrder })

//     } catch (error) {
//         res.status(500).send({ status: false, message: error.message })
//     }
// }


const updateOrder = async function (req, res) {
    try {
        userId = req.params.userId;

        if (!check.isValidRequestBody(req.body))
            return res.status(400).send({ status: false, message: "Please enter valid input" });

        let { orderId, status } = req.body;

        if (!check.isValid(orderId))
            return res.status(400).send({ status: false, message: "Please enter orderId" });

        if (!check.isValidObjectId(orderId))
            return res.status(400).send({ status: false, message: "Please enter valid orderId" });

        if (!["completed", "cancelled"].includes(status))
            return res.status(400).send({
                status: false, message: "Status can only be updated to cancelled or completed",
            });

        let Order = await orderModel.findOne({ _id: orderId, isDeleted: false, status: "pending", });
        if (!Order)
            return res.status(404).send({ status: false, message: "Order not found or is deleted or is not pending", });

        if (Order.userId != userId)
            return res.status(403).send({ status: false, message: "User is not authorized to update this order", });

        if (Order.cancellable == false && status == "cancelled") return res.status(400).send({ status: false, message: "This order can not be cancelled" });

        let updatedOrder = await orderModel.findOneAndUpdate({ _id: orderId }, { status: status }, { new: true });

        return res.status(200).send({ status: true, message: "Success", data: updatedOrder });
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
};
module.exports = { createOrder, updateOrder }
