const Mongoose = require("mongoose")

const CarritoSchema = Mongoose.Schema({

    email_usuario: {
        type: String,
        required: true,
    },
    idProducto: {
        type: String,
        requeride: true
    },
    cantidad: {
        type: Number,
        default: 1
    }
})

module.exports = Mongoose.model("Carrito", CarritoSchema)