const Mongoose = require("mongoose");

const TokenSchema = Mongoose.Schema({
    usuarioId:{
        type:Mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"Users",
        unique:true
    },
    token:{
        type:String,
        requeride:true
    },
    created_ad:{
        type:Date,
        default:Date.now,
        expires:3000
    }
})
module.exports = Mongoose.model("Tokens", TokenSchema)