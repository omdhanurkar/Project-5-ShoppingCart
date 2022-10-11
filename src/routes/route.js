const express = require('express');
const router = express.Router();
const userController = require('../controller/userController')
const auth=require('../middleware/auth')


//=======================test Api=========================

router.get("/test-me", function (req, res) {
    res.send("My first ever api!")
})

//=================================userApi=================
router.post("/register", userController.createUser)

router.post("/login", userController.userLogin)

router.get("/user/:userId/profile", auth.authentication,userController.getUser)

module.exports = router














module.exports = router;