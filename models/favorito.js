const Mongoose = require("mongoose");

const FavoritoSchema = Mongoose.Schema({

    email_usuario: {
        type: String,
        required: true,
    },

    productos: {
        type: String,
        requeride: true
    }

}) 

module.exports = Mongoose.model("Favoritos", FavoritoSchema)