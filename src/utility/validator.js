const mongoose=require("mongoose")

const isValid = function (value) {
    if (typeof value === "undefined" || value === null) return false;
    if (typeof value === "string" && value.trim().length === 0) return false;
    return true;
};


const isValidObjectId = function (ObjectId) {
    return mongoose.Types.ObjectId.isValid(ObjectId)
}


//------------------------------- password regex ------------------------------------------//

const isValidPassword = function (password) {
    return (/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,15}$/.test(password))
}

//------------------------------- email regex --------------------------------------------//

const isVAlidEmail = function (email) {
    return (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/).test(email)
}

//------------------------------- phone regex --------------------------------------------//

const isValidPhone = function (phone) {
    return (/^[6789]\d{9}$/).test(phone)

}

