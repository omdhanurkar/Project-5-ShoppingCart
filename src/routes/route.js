const express = require('express');
const router = express.Router();
const { createUser, userLogin, getUser, updateUser } = require('../controller/userController')
const{createProduct, getProducts, getProductsById, ProductDeleteById, updateProduct}=require('../controller/productController')
const { authentication, authorization } = require('../middleware/auth')


//=======================test Api=========================

router.get("/test-me", function (req, res) {
    res.send("My first ever api!")
})

//=====================userApi=================================================
router.post("/register", createUser)

router.post("/login", userLogin)

router.get("/user/:userId/profile", authentication, getUser)

router.put("/user/:userId/profile"/*,authentication,authorization*/ ,updateUser)

//=====================productApis=============================================

router.post("/products", createProduct)

router.get("/products", getProducts)

router.get("/products/:productId", getProductsById) 

router.put("/products/:productId", updateProduct)

router.delete("/products/:productId", ProductDeleteById) 

module.exports = router

