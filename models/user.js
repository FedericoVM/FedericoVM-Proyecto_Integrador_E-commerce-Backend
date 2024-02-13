const Mongoose = require("mongoose");

const UserSchema = Mongoose.Schema({
    nombre:String,
    apellido:String,
    email:{
        type:String,
        required:true,
        unique:true
    },
    edad:Number,
    password:String,
    role:String,
    avatar:String,
    cloudinary_id:String,
    active:{
        type:Boolean,
        default:false
    }
})

module.exports = Mongoose.model("Users", UserSchema)