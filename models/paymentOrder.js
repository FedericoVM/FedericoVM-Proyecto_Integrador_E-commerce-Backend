const Mongoose = require("mongoose");

const paymentOrderSchema = Mongoose.Schema({
    usuarioEmail:{
        type: String,
        required: true
    },
    carrito:{
        type: Boolean,
        required:true
    },
    paymentOrder:{
        type: String,
        required: true,
        unique: true
    },
    data_id:{
        type: String,
        default: "data"
    },
    redirectUrl: {
        type: String,
        required: true,
        unique: true
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