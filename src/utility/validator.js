const mongoose = require("mongoose")

const isValid = function (value) {
    if (typeof value === "undefined" || value === null) return false;
    if (typeof value === "string" && value.trim().length === 0) return false;
    if (!value) return false
    return true;
};

//------------------------------- requestBody validation --------------------------------------------//

const isValidRequestBody = function (body) {
    return Object.keys(body).length>0
}

//------------------------------- ObjectId validation --------------------------------------------//

const isValidObjectId = function (ObjectId) {
    return mongoose.Types.ObjectId.isValid(ObjectId);

}

//------------------------------- keys values validation --------------------------------------------//

const isValidValues = function (data) {
    if (!data) return false;
    if (Object.values(data).length == 0) return false;
    if (Object.values(data).length > 0) {
        const checkData = Object.values(data).filter((value) => value);
        if (checkData.length == 0) return false;
    }
    return true;
};

//------------------------------- name regex --------------------------------------------//

const isValidname = function (name) {
    return /^[a-z ,.'-]+$/i.test(name);
};
//------------------------------- email regex --------------------------------------------//

const isVAlidEmail = function (email) {
    return (/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    ).test(email)
}
//------------------------------- password regex --------------------------------------------//


const isValidPassword = function (pass) {
    return /^.{8,15}$/.test(pass);
};

//------------------------------- phone regex --------------------------------------------//

const isValidPhone = function (phone) {
    return (/^[6789]\d{9}$/).test(phone)

}
//------------------------------- street regex --------------------------------------------//

const isValidStreet = function (value) {
    return /^[a-zA-Z0-9 -.,]{2,30}$/.test(value);
};
//------------------------------- pincode regex --------------------------------------------//

const isValidPincode = function (num) {
    return /^[1-9][0-9]{5}$/.test(num);
};
//------------------------------- Image regex --------------------------------------------//

const isValidImage = function (value) {
    const r = /\.(gif|jpe?g|tiff?|png|webp|temp)$/
    return r.test(value)
}

//------------------------------- Number regex --------------------------------------------//

const isvalidNumber = function (value) {
    return /^(?:0|[1-9]\d*)(?:\.(?!.*000)\d+)?$/.test(value);
}

module.exports = {
    isValid,
    isValidname,
    isValidStreet,
    isValidPassword,
    isVAlidEmail,
    isValidPhone,
    isValidPincode,
    isValidRequestBody,
    isValidObjectId,
    isValidImage,
    isvalidNumber,
    isValidValues
}