const productModel = require("../models/productModel");
const check = require("../utility/validator")
const { uploadFile } = require("./awsController")
const mongoose = require("mongoose")

//==============================================Create Product========================================================================

const createProduct = async function (req, res) {
    try {
        let data = req.body

        if (!check.isValidRequestBody(data)) { return res.status(400).send({ status: false, message: "Please enter some Data" }) }

        let { title, description, price, currencyId, currencyFormat,
            isFreeShipping, style, availableSizes, installments } = data

        const image = req.files

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
        if (!["INR", "USD", "EUR"].includes(currencyId)) return res.status(400).send({ status: false, message: "currencyId should be in INR,USD or EUR format" });
        if (currencyFormat) {
            if (!currencyFormat) return res.status(400).send({ status: false, message: "currencyFormat is required" });
            if (!check.isValid(currencyFormat)) return res.status(400).send({ status: false, message: "currencyFormat is not valid" });
            if (!["₹", "$", "€"].includes(currencyFormat)) return res.status(400).send({ status: false, message: "currencyformat should be in ₹,$,€ format" });
        }

        if (isFreeShipping) {
            if (!["true", "false"].includes(isFreeShipping)) return res.status(400).send({ status: false, message: "isFreeShipping only in booleans" });
        }

        if (image && image.length == 0)
            return res.status(400).send({ status: false, message: "Profile Image is required" });
        else if (!check.isValidImage(image[0].originalname))
            return res.status(400).send({status: false, message: "Profile Image is required as an Image format"});
        else data.productImage = await uploadFile(image[0]);

        if (style) {
            if (!check.isValid(style)) return res.status(400).send({ status: false, message: "please enter valid style" });
        }
        if (availableSizes) {
            availableSizes = availableSizes.split(",").filter((size) => {
                const sizes = size.trim();
                return (check.isValid(sizes) && ["S", "XS", "M", "X", "L", "XXL", "XL"].includes(sizes))
            });
            if (availableSizes.length == 0) return res.status(400).send({ status: false, message: "available sizes should be in valid format and should be  S, XS, M, X, L, XXL, XL", });
        }
        if (installments) {
            if (!check.isvalidNumber(installments)) return res.status(400).send({ status: false, message: "installments is not a number" });
        }
        let product = {
            title, description, price, currencyId, currencyFormat,
            isFreeShipping, productImage: data.productImage, style, availableSizes, installments
        }
        const productData = await productModel.create(product);
        return res.status(201).send({ status: true, message: "Success", data: productData })

    }
    catch (err) {
        return res.status(500).send({ status: false, error: err.message })
    }
}

//==============================================Get product==========================================================

const getProducts = async function (req, res) {
    try {
        let queries = req.query;

        let getProducts = await productModel.find({ isDeleted: false })
        if (Object.keys(queries).length == 0) return res.status(200).send({ status: true, message: "enter some some data for get product" })

        if (getProducts.length == 0) {
            return res.status(404).send({ status: false, message: "No product found" })
        }

        if (queries) {
            if (queries.size && queries.name && queries.priceGreaterThan) {
                let combination = await productModel.find({ availableSizes: queries.size, title: { $regex: queries.name }, price: { $gt: queries.priceGreaterThan } })
                return combination.length == 0 ? res.status(404).send({ status: false, message: "No product found" }) : res.status(200).send({ status: true, message: "Success", data: combination })

            }
            if (queries.size && queries.name) {
                let combination = await productModel.find({ availableSizes: queries.size, title: { $regex: queries.name } })      //$regex is used for pattern matching of name substring
                return combination.length == 0 ? res.status(404).send({ status: false, message: "No product found" }) : res.status(200).send({ status: true, message: "Success", data: combination })

            }
            if (queries.size && queries.name && queries.priceLessThan) {
                let combination = await productModel.find({ availableSizes: queries.size, title: { $regex: queries.name }, price: { $lt: queries.priceLessThan } })
                return combination.length == 0 ? res.status(404).send({ status: false, message: "No product found" }) : res.status(200).send({ status: true, message: "Success", data: combination })

            }
            if (queries.size) {
                let sizes = queries.size.split(',')
                let getbySize = await productModel.find({ isDeleted: false, availableSizes: { $in: sizes } })
                return getbySize.length == 0 ? res.status(404).send({ status: false, message: "No product found" }) : res.status(200).send({ status: true, message: "Success", data: getbySize })


            }

            if (queries.name) {
                let getbyName = await productModel.find({ isDeleted: false, title: { $regex: queries.name } })
                return getbyName.length == 0 ? res.status(404).send({ status: false, message: "No product found" }) : res.status(200).send({ status: true, message: "Success", data: getbyName })

            }

            if (queries.priceGreaterThan) {
                let getbyPriceGt = await productModel.find({ price: { $gt: queries.priceGreaterThan } })
                return getbyPriceGt.length == 0 ? res.status(404).send({ status: false, message: "No product found" }) : res.status(200).send({ status: true, message: "Success", data: getbyPriceGt })

            }
            if (queries.priceLessThan) {
                let getbyPriceLt = await productModel.find({ price: { $lt: queries.priceLessThan } })
                return getbyPriceLt.length == 0 ? res.status(404).send({ status: false, message: "No product found" }) : res.status(200).send({ status: true, message: "Success", data: getbyPriceLt })
            }
            let priceSort = queries.priceSort
            if (priceSort) {
                let pricesort = await productModel.find({ isDeleted: false }).sort({ price: priceSort })
                return pricesort.length == 0 ? res.status(404).send({ status: false, message: "No product found" }) : res.status(200).send({ status: true, message: "Success", data: pricesort })
            }
        }

    } catch (error) {
        res.status(500).send({ status: false, error: error.message });
    }
}

//===============================================Get product by ID================================================================

const getProductsById = async function (req, res) {
    try {
        let productId = req.params.productId
        if (!check.isValidObjectId(productId)) {
            return res.status(400).send({ status: false, message: "Please enter valid ID" });
        }
        let allProduct = await productModel.findById({ _id: productId })
        if (!allProduct)
            return res.status(404).send({ status: false, message: "product not found with this Id" })

        if (allProduct.isDeleted == true)
            return res.status(400).send({ status: false, message: "Sorry !! At this time , this product is not available" })

        res.status(200).send({ status: true, message: 'Success', data: allProduct })
    }
    catch (err) {
        res.status(500).send({ status: false, error: err.message });
    }
}

//========================================Update Product========================================================

const updateProduct = async function (req, res) {
    try {
        let productId = req.params.productId
        if (!check.isValidObjectId(productId)) {
            return res.status(400).send({ status: false, message: "invalid Product Id" })
        }

        let products = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!products) { return res.status(404).send({ status: false, message: "No product Found" }) }

        let data = req.body
        let { title, description, price, currencyId, currencyFormat, isFreeShipping, productImage, style, availableSizes, installments } = data

        let files = req.files
        let obj = {}

        if ((Object.keys(data).length == 0) && files == undefined) { return res.status(400).send({ status: false, message: "please enter some data to update" }) }

        if (files && files.length > 0) {
            if (!check.isValidImage(files[0].originalname)) return res.status(400).send({ status: false, message: "Profile Image is required only in Image format", });
            let url = await uploadFile(files[0])
            obj["productImage"] = url
        }

        if (title) {
            if (!check.isValid(title)) return res.status(400).send({ status: false, message: "please write title in correct way" })
            let titleInfo = await productModel.findOne({ title: title })
            if (titleInfo) {
                return res.status(400).send({ status: false, message: "title already used" })
            }
            obj.title = title
        }

        if (Object.values(req.body).includes(description)) {
            if (!check.isValid(description)) return res.status(400).send({ status: false, message: "please write description in correct way" })
            obj.description = description
        }

        if (price) {
            if (!check.isvalidNumber(price)) return res.status(400).send({ status: false, message: "please put price" })
            if (price <= 0) return res.status(400).send({ status: false, message: "pricemust be greater than 0" })
            obj.price = price
        }

        if (currencyId) {
            if (!check.isValid(currencyId)) return res.status(400).send({ status: false, message: "please write currencyId in correct way" })
            if (currencyId != "INR") return res.status(400).send({ status: false, message: "currencyId is invalid it should be in INR" })
            obj.currencyId = currencyId
        }

        if (currencyFormat) {
            if (!check.isValid(currencyFormat)) return res.status(400).send({ Status: false, message: "currencyFormat is not valid" })
            if (currencyFormat != "₹") return res.status(400).send({ Status: false, message: "currencyFormat is not valid It should be ₹" })
            obj.currencyFormat = currencyFormat
        }

        if (isFreeShipping) {
            if (isFreeShipping != "true" && isFreeShipping != "false") return res.status(400).send({ status: false, message: 'invalid parameter in isFreeShipping' })
            obj.isFreeShipping = isFreeShipping
        }

        if (style) {
            if (!check.isValid(style)) return res.status(400).send({ status: false, message: "please put style" })
            obj.style = style
        }

        if (availableSizes) {
            availableSizes = availableSizes.split(",").filter((size) => {
                const sizes = size.trim();
                return (check.isValid(sizes) && ["S", "XS", "M", "X", "L", "XXL", "XL"].includes(sizes))
            });
            if (availableSizes.length == 0) return res.status(400).send({ status: false, message: "available sizes should be in valid format and should be  S, XS, M, X, L, XXL, XL", });
            obj.availableSizes = availableSizes
        }

        if (installments) {
            if (!check.isvalidNumber(installments)) return res.status(400).send({ status: false, message: "please put installments" })
            if (installments <= 0) return res.status(400).send({ status: false, message: "please suitable installments " })
            obj.installments = installments
        }

        let updatedProduct = await productModel.findOneAndUpdate({ _id: productId, isDeleted: false },
            obj,
            { new: true })
        return res.status(200).send({ status: true, message: 'Success', data: updatedProduct })

    } catch (error) {
        return res.status(500).send({ status: false, error: error.message })
    }
}

//=============================================Delete ptoduct====================================================================

const ProductDeleteById = async function (req, res) {
    try {
        let ProductDeleteById = req.params.productId
        if (!check.isValidObjectId(ProductDeleteById)) {
            return res.status(400).send({ status: false, message: "Please enter valid ID" });
        }

        let allProduct = await productModel.findById({ _id: ProductDeleteById })
        if (!allProduct)
            return res.status(404).send({ status: false, message: "products not found with this Id" })

        let checkProduct = await productModel.findById({ _id: ProductDeleteById })
        if (checkProduct.isDeleted == true)
            return res.status(400).send({ status: false, message: "product is already deleted" })

        let checkData = await productModel.findByIdAndUpdate({ _id: ProductDeleteById }, { $set: { isDeleted: true, deletedAt: Date.now() } }, { new: true });
        return res.status(200).send({ status: true, message: "product deleted Successfully" });

    } catch (err) {
        return res.status(500).send({ status: false, error: err.message })
    }
}

module.exports = { createProduct, getProducts, getProductsById, updateProduct, ProductDeleteById }