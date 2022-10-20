const mongoose = require("mongoose")
const ObjectId = mongoose.Schema.Types.ObjectId

const cartSchema = new mongoose.Schema({
   userId: {
      type: ObjectId,
      ref: "user",
      required: true,
      unique: true
   },
   items: [{
      _id: false,
      productId: {
         type: ObjectId,
         ref: "Product",
         required: true
      },
      quantity: {
         type: Number,
         required: true
      }
   }],
   totalPrice: {
      type: Number,
      required: true
   },
   totalItems: {
      type: Number,
      required: true
   }

}, { timestamps: true })

module.exports = mongoose.model("cart", cartSchema)
