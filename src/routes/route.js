const express = require('express');
const router = express.Router();
const { createUser, userLogin, getUser, updateUser } = require('../controller/userController')
const { createProduct, getProducts, getProductsById, ProductDeleteById, updateProduct } = require('../controller/productController')
const { authentication, authorization } = require('../middleware/auth')
const { createCart } = require('../controller/cartController')

//=======================test Api=========================

router.get("/test-me", function (req, res) {
    res.send("My first ever api!")
})

//=====================user Api's=================================================

router.post("/register", createUser)

router.post("/login", userLogin)

router.get("/user/:userId/profile", authentication, authorization, getUser)

router.put("/user/:userId/profile", authentication, authorization, updateUser)

//=====================product Api's=============================================

router.post("/products", createProduct)

router.get("/products", getProducts)

router.get("/products/:productId", getProductsById)

router.put("/products/:productId", updateProduct)

router.delete("/products/:productId", ProductDeleteById)

//=====================cart Api's=============================================

router.post("/users/:userId/cart",  createCart)

module.exports = router