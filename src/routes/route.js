const express = require('express');
const router = express.Router();
const { createUser, userLogin, getUser, updateUser } = require('../controller/userController')
const { createProduct, getProducts, getProductsById, ProductDeleteById, updateProduct } = require('../controller/productController')
const { authentication, authorization } = require('../middleware/auth')
const { createCart, updateCart, getCartById, deleteCart } = require('../controller/cartController')
const { createOrder, updateOrder } = require('../controller/orderController')

//=======================test Api=========================

router.get("/test-me", function (req, res) {
    res.send("My first ever api!")
})

//=====================User Api's================================================

router.post("/register", createUser)

router.post("/login", userLogin)

router.get("/user/:userId/profile", authentication, authorization, getUser)

router.put("/user/:userId/profile", authentication, authorization,updateUser)

//=====================Product Api's=============================================

router.post("/products", createProduct)

router.get("/products", getProducts)

router.get("/products/:productId", getProductsById)

router.put("/products/:productId", updateProduct)

router.delete("/products/:productId", ProductDeleteById)

//=====================Cart Api's=============================================

router.post("/users/:userId/cart", authentication, authorization, createCart)

router.put("/users/:userId/cart", authentication, authorization, updateCart)

router.get("/users/:userId/cart", authentication, authorization, getCartById)

router.delete("/users/:userId/cart", authentication, authorization, deleteCart)

//=====================Order Api's=============================================

router.post("/users/:userId/orders", authentication, authorization, createOrder)

router.put("/users/:userId/orders", authentication, authorization, updateOrder)

module.exports = router
