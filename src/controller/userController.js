const userModel = require("../models/userModel") 
const mongoose = require("mongoose")
const bcrypt = require("bcrypt")




//========================Create user======================
const createUser = async function (req, res) {
    try {
        const data = req.body;
        let{fname,lname,email,photoimage,phone,password,address}=data
       

        if (Object.keys(data).length == 0) {
            return res.status(400).send({ status: false, message: "Body should not be empty" })
        }

        
        if (!isValid(fname)) return res.status(400).send({ status: false, message: "name is mandatory in the request" })
        if (!nameData.match(/^(?![\. ])[a-zA-Z\. ]+(?<! )$/)) return res.status(400).send({ status: false, message: "name should be in alphabets" })

       
        if (!isValid(lname)) return res.status(400).send({ status: false, message: "name is mandatory in the request" })
        if (!nameData.match(/^(?![\. ])[a-zA-Z\. ]+(?<! )$/)) return res.status(400).send({ status: false, message: "name should be in alphabets" })

        
        if (!isValid(phone)) return res.status(400).send({ status: false, message: "phone number is mandatory in the request" })
        if (!phone.match(/^((0091)|(\+91)|0?)[6789]{1}\d{9}$/)) return res.status(400).send({ status: false, message: "phone number should be of 10 digits" })

    
        if (!isValid(email)) return res.status(400).send({ status: false, message: "email is mandatory in the request" })
        if (!emailData.match(/^([a-zA-Z0-9_.]+@[a-z]+\.[a-z]{2,3})?$/)) return res.send({ status: false, message: "email is not valid" });
        
        let uniquePhone = await userModel.findOne({ phone: phone })
        if (uniquePhone) return res.status(400).send({ status: false, message: "phone no. Already Exists." })
        
        let uniqueEmail = await userModel.findOne({ email: emailData })
        if (uniqueEmail) return res.status(400).send({ status: false, message: "email Id Already Exists." })


        const passwordData = data.password;
        if (!isValid(passwordData)) return res.status(400).send({ status: false, message: "password is mandatory in the request" })
    
        if (!isValidPassword(passwordData)) return res.status(406).send({status: false, message: "enter valid password"})
        let uniquePassword = await userModel.findOne({ password: passwordData })
        if (uniquePassword) return res.status(400).send({ status: false, message: "password Already Exists." })


        address = data.addres
            if (Object.keys(address).length == 0) {
                return res.status(400).send({ status: false, message: "Address should not be empty" })
            }
    
    

            if (!isValid(address.street)) return res.status(400).send({ status: false, message: "please enter street " })
            if (!isValid(address.city)) return res.status(400).send({ status: false, message: "please enter city" })
            if (!isValid(address.pincode)) return res.status(400).send({ status: false, message: "please enter pincode" })
            if (address.pincode) {

                if (!(/^[1-9][0-9]{5}$/).test(address.pincode)) return res.status(400).send({ status: false, message: "please enter valied pincode " })
            }

           

        let savedData = await userModel.create(data);

        res.status(201).send({ status: true, message: "Success", data: savedData })

    } catch (error) {
        console.log(error); res.status(500).send({ status: false, message: error.message });

    }
}
