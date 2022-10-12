const productModel = require("../models/productModel");
const check = require("../utility/validator")
const aws = require("aws-sdk")

//=============================================configure AWS===============================================================
aws.config.update({
    accessKeyId: "AKIAY3L35MCRUJ6WPO6J",
    secretAccessKey: "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",
    region: "ap-south-1"
});
let uploadFile = async (file) => {
    return new Promise(function (resolve, reject) {
        // this function will upload file to aws and return the link
        let s3 = new aws.S3({ apiVersion: '2006-03-01' });

        var uploadParams = {
            ACL: "public-read",
            Bucket: "classroom-training-bucket",
            Key: "abc/" + file.originalname,
            Body: file.buffer
        }
        s3.upload(uploadParams, function (err, data) {
            if (err) {
                return reject({ "error": err.message })
            }
            console.log("file uploaded succesfully")
            return resolve(data.Location)
        })
    })
}
//=======================================================================================================================================

const createProduct = async function (req, res) {
    try {
        let data = req.body
        let { title, description, price, currencyId, currencyFormat,
            isFreeShipping, style, availableSizes, installments } = req.body;

        let files = data.files

        if (!title) return res.status(400).send({ status: false, message: "title is required" })
        if (!check.isValid(title)) return res.status(400).send({ status: false, message: "title is not valid" })
        const checkUsedTitle = await productModel.findOne({ title: title });
        if (checkUsedTitle) {
            return res.status(400).send({ status: false, message: "title is already exists" });
        }
        if (!description) return res.status(400).send({ status: false, messages: "description is required" });
        if (!check.isValid(description)) {
            return res.status(400).send({ status: false, message: "please enter valid discription" });
        }
        if (!price) return res.status(400).send({ status: false, message: "price is required" });
        if (!check.isvalidNumber(price)) { return res.status(400).send({ status: false, message: "price only in Number format" }) }

        if (!currencyId) return res.status(400).send({ status: false, message: "currencyId is required" });
        if (!check.isValid(currencyId)) return res.status(400).send({ status: false, message: "currencyId is not valid" });
        if (!["INR", "USD", "EUR"].includes(currencyId)) return res.status(400).send({ status: false, message: "currencyId should be in INR,USD or EUR format" });

        if (!currencyFormat) return res.status(400).send({ status: false, message: "currencyFormat is required" });
        if (!check.isValid(currencyFormat)) return res.status(400).send({ status: false, message: "currencyFormat is not valid" });
        if (!["₹", "$", "€"].includes(currencyId)) return res.status(400).send({ status: false, message: "currencyformat should be in ₹,$,€ format" });

        if (!["true", "false"].includes(isFreeShipping)) return res.status(400).send({ status: false, message: "isFreeShipping only in booleans" });

        if (files && files.length == 0)
            return res.status(400).send({ status: false, message: "Product Image is required" });
        else if (!/\.(gif|jpe?g|tiff?|png|webp|bmp)$/i.test(files[0].originalname))
            return res.status(400).send({ status: false, message: "ProductImage is required as an jpeg,jpg or png format", });
        else data.productImage = await uploadFile(files[0]);

        if (!style) return res.status(400).send({ status: false, message: "please enter valid style" });

        if (!availableSizes) return res.status(400).send({ status: false, message: "availableSizes is required" });
        if (!check.isValid(availableSizes)) return res.status(400).send({ status: false, message: "availableSizes is not valid" });
        if (!["S", "XS", "M", "X", "L", "XXL", "XL"].includes(availableSizes)) return res.status(400).send({ status: false, message: "availableSizes from [S, XS, M, X, L, XXL, XL] only" });

        if (!check.isvalidNumber(installments)) return res.status(400).send({ status: false, message: "installments is not a number" });

        let product = {
            title, description, price, currencyId, currencyFormat,
            isFreeShipping, productImage: data.productImage, style, availableSizes, installments
        }
        const productData = await productModel.create(product);
        return res.status(201).send({ status: true, message: "product has been created", data: productData })

    }
    catch (err) {
        return res.status(500).send({ status: false, error: err.message })
    }
}

module.exports = { createProduct }