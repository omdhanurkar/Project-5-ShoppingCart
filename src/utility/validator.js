const mongoose = require("mongoose")

const isValid = function (value) {
    if (typeof value === "undefined" || value === null) return false;
    if (typeof value === "string" && value.trim().length === 0) return false;
    if (!value) return false
    return true;
};

const isValidreqbody = function (body) {
    return Object.keys(body).length > 0
}

const isValidObjectId = function (ObjectId) {
    return mongoose.Types.ObjectId.isValid(ObjectId);
}

//------------------------------- name regex --------------------------------------------//

const isValidname = function (name) {
    return /^[A-Za-z]{1,35}/.test(name);
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

const isValidImage = function (files) {
    return /\.(gif|jpe?g|tiff?|png|webp|bmp)$/i.test(files[0])

}
module.exports = {
    isValid,
    isValidname,
    isValidStreet,
    isValidPassword,
    isVAlidEmail,
    isValidPhone,
    isValidPincode,
    isValidreqbody,
    isValidObjectId,
    isValidImage

}