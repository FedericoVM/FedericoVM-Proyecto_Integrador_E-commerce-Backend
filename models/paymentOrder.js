const Mongoose = require("mongoose");

const paymentOrderSchema = Mongoose.Schema({
    usuarioEmail:{
        type: String,
        required: true
    },
    idDePago:{
        type: Number,
        required: true
    },
    carrito:{
        type: Boolean,
        required:true,
        default: false
    },
    paymentOrder:{
        type: String,
        required: true,
        unique: true
    },
    totalDeProductos:
    {
        type: Number,
        required: true,
        default: 1
    },
    totalDeProductos:
    {
        type: Number,
        required: true,
        default: 1
    },
    paymentStatus: {
        type: String,
        required: true,
        default: 'Incompleto'
    },
    productos:{
        type: Array,
        required: true
    },
    costoTotal:{
        type: Number,
        default: 0
    },
    emisorTarjeta:{
        type: String
    },
    tipoDeTarjeta:{
        type: String
    },
    ultimos4DigitosTarjeta:{
        type: Number
    }
})

module.exports = Mongoose.model("PaymentOrder", paymentOrderSchema)