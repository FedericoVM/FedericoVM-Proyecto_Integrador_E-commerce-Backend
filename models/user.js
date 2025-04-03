const Mongoose = require("mongoose");

const UserSchema = Mongoose.Schema({
    nombre:{
        type: String,
        required: true
    },
    apellido:{
        type: String,
        required: true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    fechaDeNacimiento: {
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    role:String,
    avatar:String,
    cloudinary_id:String,
    active:{
        type:Boolean,
        default:false
    }
})

module.exports = Mongoose.model("Users", UserSchema)