const Mongoose = require("mongoose")

const CarritoSchema = Mongoose.Schema({

    email_usuario: {
        type: String,
        required: true,
    },

    productos: {
        type: String,
        requeride: true
    }


    ,
    cantidad: {
        type: Number,
        default: 0
    }


})

module.exports = Mongoose.model("Carrito", CarritoSchema)