const User = require('../model/user.model');

module.exports = class UserServices {
    // ADD USER
    addNewUser = async(body) => {
        return await User.create(body);
    };
    
    // GET USER
    getUser = async(body) => {
        return await User.findOne(body);
    }

    // GET SPECIFIC USER
    getSpecificUser = async(id) => {
        return await User.findById(id);
    }
};
