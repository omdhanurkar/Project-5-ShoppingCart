const productModel = require("../models/productModel");
const check = require("../utility/validator")
const aws = require("aws-sdk")
const ObjectId = require('mongoose').Types.ObjectId

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
            isFreeShipping, style, availableSizes, installments } = data

        const files = req.files

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

        // if (!currencyFormat) return res.status(400).send({ status: false, message: "currencyFormat is required" });
        // if (!check.isValid(currencyFormat)) return res.status(400).send({ status: false, message: "currencyFormat is not valid" });
        // if (!["₹", "$", "€"].includes(currencyId)) return res.status(400).send({ status: false, message: "currencyformat should be in ₹,$,€ format" });

        if (!["true", "false"].includes(isFreeShipping)) return res.status(400).send({ status: false, message: "isFreeShipping only in booleans" });

        if (files && files.length == 0)
            return res.status(400).send({ status: false, message: "Profile Image is required" });
        else if (!/\.(gif|jpe?g|tiff?|png|webp|bmp)$/i.test(files[0].originalname))
            return res.status(400).send({ status: false, message: "Profile Image is required as an Image format" });
        data.productImage = await uploadFile(files[0]);

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
        return res.status(500).send({ status: false, error: err })
    }
}

const getProducts = async function (req, res) {
    try {
        let queries = req.query;

        let getProducts = await productModel.find({ isDeleted: false })
        if (Object.keys(queries).length == 0) return res.status(200).send({ status: true, message: 'All available products', data: getProducts })

        if (getProducts.length == 0) {
            return res.status(404).send({ status: false, message: "No product found" })
        }

        if (queries) {
            if (queries.size && queries.name && queries.priceGreaterThan) {
                let combination = await productModel.find({ availableSizes: queries.size, title: { $regex: queries.name }, price: { $gt: queries.priceGreaterThan } })
                return combination.length == 0 ? res.status(404).send({ status: false, message: "No product found" }) : res.status(200).send({ status: true, data: combination })

            }
            if (queries.size && queries.name) {
                let combination = await productModel.find({ availableSizes: queries.size, title: { $regex: queries.name } })      //$regex is used for pattern matching of name substring
                return combination.length == 0 ? res.status(404).send({ status: false, message: "No product found" }) : res.status(200).send({ status: true, data: combination })

            }
            if (queries.size && queries.name && queries.priceLessThan) {
                let combination = await productModel.find({ availableSizes: queries.size, title: { $regex: queries.name }, price: { $lt: queries.priceLessThan } })
                return combination.length == 0 ? res.status(404).send({ status: false, message: "No product found" }) : res.status(200).send({ status: true, data: combination })

            }
            if (queries.size) {
                let getbySize = await productModel.find({ availableSizes: queries.size })
                return getbySize.length == 0 ? res.status(404).send({ status: false, message: "No product found" }) : res.status(200).send({ status: true, data: getbySize })
            }
            if (queries.name) {
                let getbyName = await productModel.find({ isDeleted: false, title: { $regex: queries.name } })
                return getbyName.length == 0 ? res.status(404).send({ status: false, message: "No product found" }) : res.status(200).send({ status: true, data: getbyName })

            }
            if (queries.priceGreaterThan) {
                let getbyPriceGt = await productModel.find({ price: { $gt: queries.priceGreaterThan } })
                return getbyPriceGt.length == 0 ? res.status(404).send({ status: false, message: "No product found" }) : res.status(200).send({ status: true, data: getbyPriceGt })

            }
            if (queries.priceLessThan) {
                let getbyPriceLt = await productModel.find({ price: { $lt: queries.priceLessThan } })
                return getbyPriceLt.length == 0 ? res.status(404).send({ status: false, message: "No product found" }) : res.status(200).send({ status: true, data: getbyPriceLt })
            }
            let priceSort = queries.priceSort
            if (priceSort) {
                let pricesort = await productModel.find({ isDeleted: false }).sort({ price: priceSort })
                return pricesort.length == 0 ? res.status(404).send({ status: false, message: "No product found" }) : res.status(200).send({ status: true, data: pricesort })
            }
        }

    } catch (error) {
        res.status(500).send({ status: false, error: error.message });
    }
}

const getProductsById = async function (req, res) {
    try {
        let productId = req.params.productId
        if (!ObjectId.isValid(productId)) return res.status(400).send({ status: false, msg: "Please give a Valid productId " })

        let allProduct = await productModel.findById({ _id: productId }).lean()
        if (!allProduct)
            return res.status(404).send({ status: false, msg: "products not found with this Id" })

        if (allProduct.isDeleted == true)
            return res.status(404).send({ status: false, msg: "product deleted" })

        res.status(200).send({ status: true, data: allProduct })
    }
    catch (err) {
        res.status(500).send({ status: "error", error: err.message })
    }
}

const updateProduct = async function (req, res) {
    try {
        let data = req.body

        let productId = req.params.productId

        let products = await productModel.findOne({ _id: productId, isDeleted: false })

        if (!products) { return res.status(404).send({ status: false, message: "No product Found" }) }

        let { title, description, price, currencyId, currencyFormat, isFreeShipping, productImage, style, availableSizes, installments } = data

        if (!Object.keys(data).length) return res.status(400).send({ status: false, message: "Body should not be empty" })

        if (!check.isValid(title)) return res.status(400).send({ status: false, message: "please write title in correct way" })
        let titleInfo = await productModel.findOne({ title: title })
        if (titleInfo) {
            return res.status(400).send({ status: false, message: "title already used" })
        }

        if (description) {
            if (!check.isValid(description)) return res.status(400).send({ status: false, message: "please write description in correct way" })
        }

        if (price) {
            if (!check.isvalidNumber(price)) return res.status(400).send({ status: false, message: "please put price" })
        }

        if (currencyId) {
            if (!check.isValid(currencyId)) return res.status(400).send({ status: false, message: "please write currencyId in correct way" })
        }
        let currencyFormatInfo = await productModel.findOne({ currencyFormat: currencyFormat })
        if (currencyFormatInfo) {
            return res.status(400).send({ status: false, message: "currencyFormat already used" })
        }
        if (productImage) {
            if (!check.isValid(productImage)) return res.status(400).send({ status: false, message: "please put productImage  in correct format" })
        }
        if (style) {
            if (!check.isValid(style)) return res.status(400).send({ status: false, message: "please put style" })
        }


        let availableSizesinfo = await productModel.findOne({ availableSizes: availableSizes })
        if (availableSizesinfo) return res.status(400).send({ status: false, message: "available sizes already used" })

        if (installments) {
            if (!check.isvalidNumber(installments)) return res.status(400).send({ status: false, message: "please put installments" })
        }
        // isValidDate = moment(releasedAt, 'YYYY-MM-DD', true).isValid()
        //if (!isValidDate) return res.status(400).send({ status: false, message: "please write correct Date, and format of date  - YYYY-MM-DD" })



        const updatedproduct = await productModel.findOneAndUpdate({ _id: productId, isDeleted: false }, data, { new: true });

        return res.status(200).send({ status: true, message: "success", data: updatedproduct });
    }
    catch (error) {
        res.status(500).send({ status: false, error: error.message })
    }
}

const ProductDeleteById = async function (req, res) {
    try {
        let ProductDeleteById = req.params.productId
        if (!ObjectId.isValid(ProductDeleteById)) return res.status(400).send({ status: false, msg: "Please give a Valid productId " })

        let isdelete = await productModel.findById({ _id: ProductDeleteById })
        if (isdelete.isDeleted == true)
            return res.status(404).send({ status: false, msg: "product is already deleted" })
        let checkData = await productModel.findByIdAndUpdate({ _id: ProductDeleteById }, { $set: { isDeleted: true, deletedAt: Date.now() } }, { new: true });
        res.status(200).send({ status: true, msg: "product deleted Successfully" });

        if (!checkData) return res.status(404).send({ status: false, msg: "NO product found" })
    }
    catch (err) {
        res.status(500).send({ msg: err.message });
    }
}

module.exports = { createProduct, getProducts, getProductsById, updateProduct, ProductDeleteById }